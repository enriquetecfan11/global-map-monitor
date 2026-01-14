# News Feed Ingestion

## Descripción

Sistema de ingesta de noticias globales mediante feeds RSS de Google News, diseñado para **monitoreo de situación** (situation monitoring), no para consumo editorial clásico.

Todos los feeds provienen de fuentes reales definidas en `docs/reference/RssFeedsStrategy.md`. **No se utilizan placeholders, mock data, o contenido sintético**.

---

## Objetivos

- Proporcionar **señales en tiempo real** de eventos globales relevantes
- Agregar noticias por temática estratégica (geopolítica, tecnología, finanzas)
- Derivar alertas automáticamente desde items de alta prioridad
- Mantener **integridad de datos**: solo contenido real, nunca inventado

---

## Fuente de Verdad

**`docs/reference/RssFeedsStrategy.md`** es la única fuente de verdad para:
- URLs de feeds RSS
- Categorías y queries
- Reglas editoriales
- Configuración de idioma y región

Cualquier cambio en la estrategia de feeds debe documentarse primero en ese archivo.

---

## Arquitectura

### Componentes Principales

1. **`rssService.ts`**: Servicio para fetch y parse de feeds RSS
   - Manejo de CORS y timeouts
   - Cache en memoria por sesión
   - Parse de XML a objetos `FeedItem`

2. **`feedStore.ts`**: Store de Zustand para gestión de estado
   - Estado de feeds por categoría
   - Derivación automática de alerts
   - Acciones: `fetchAllFeeds()`, `refreshFeed()`

3. **`FeedCard.tsx`**: Componente unificado de card
   - **Único componente** para todas las categorías
   - Sin variaciones visuales entre categorías
   - Diseño: fondo oscuro, texto claro, tag ALERT opcional

4. **`FeedsSection.tsx`**: Sección principal de feeds
   - Layout de columnas (World/Geopolitical, Technology/AI, Finance, Alerts)
   - Agrupación de categorías según diseño
   - Manejo de estados: loading, empty, error

### Flujo de Datos

```
RssFeedsStrategy.md → rssService.ts → feedStore.ts → FeedsSection → FeedCard
```

1. `FeedsSection` monta → llama `feedStore.fetchAllFeeds()`
2. `feedStore` itera sobre URLs de `RssFeedsStrategy.md`
3. `rssService.fetchRssFeed()` obtiene cada feed
4. Parse a `FeedItem[]` y almacenar en store
5. Derivar Alerts de items de alta prioridad
6. `FeedsSection` renderiza grupos con `FeedCard` unificado

---

## Categorías y Agrupaciones

### Categorías RSS (según RssFeedsStrategy.md)

- **World**: Cobertura global de eventos relevantes
- **Geopolitical**: Conflictos, diplomacia, tensiones internacionales
- **Technology**: Tecnología general, industria, infraestructura
- **AI**: Inteligencia artificial, modelos, regulación
- **Finance**: Mercados, macroeconomía, bancos centrales

### Agrupaciones UI

Las categorías se agrupan visualmente en columnas:

- **WORLD / GEOPOLITICAL**: Combina `world` + `geopolitical`
- **TECHNOLOGY / AI**: Combina `technology` + `ai`
- **FINANCIAL**: Solo `finance`
- **ALERTS**: Derivado automáticamente de todas las categorías

---

## Componente FeedCard Unificado

### Principio de Diseño

**Un solo componente para todas las categorías**. No hay variaciones visuales, layouts especiales, o "cards especiales" por categoría.

### Estructura Visual

Cada `FeedCard` contiene:

1. **Source**: Nombre de la fuente en mayúsculas (ej: "BBC WORLD", "CNBC")
2. **Alert Tag** (opcional): Tag amarillo/naranja con texto "ALERT" si `isAlert === true`
3. **Headline**: Título de la noticia
4. **Timestamp**: Tiempo relativo (ej: "11h", "1d", "53m")

### Props

```typescript
interface FeedCardProps {
  item: FeedItem;
}
```

### Estilo

- Fondo oscuro (`bg-gray-900`)
- Texto claro (`text-gray-100`, `text-gray-300`)
- Tag ALERT: fondo amarillo (`bg-yellow-500`), texto negro
- Timestamp relativo formateado automáticamente

---

## Derivación de Alerts

Los alerts se derivan automáticamente desde todas las categorías, no provienen de un feed RSS separado.

### Criterios de Alerta

Un item se marca como alert si cumple **al menos uno** de estos criterios:

1. **Keywords de alta prioridad** en el título:
   - alert, breaking, crisis, conflict, emergency, urgent, critical
   - attack, strike, sanctions, war, military action

2. **Timestamp reciente**: Items publicados hace menos de 2 horas

### Implementación

La lógica está en `feedStore.ts`:

```typescript
const isAlertItem = (item: FeedItem): boolean => {
  // Verificar keywords
  // Verificar timestamp reciente
};
```

Los alerts se ordenan por fecha (más recientes primero) y se limitan a los 20 más relevantes.

---

## Manejo de Errores

### Principios

- **No bloquear UI**: Si un feed falla, las demás categorías siguen funcionando
- **Estados vacíos explícitos**: Mostrar "No items available" en lugar de inventar contenido
- **Errores silenciosos**: Logs en consola, pero no excepciones al usuario

### Casos Específicos

1. **CORS bloqueado**: Google News RSS puede tener restricciones CORS
   - Comportamiento: Retornar array vacío, mostrar estado vacío
   - No inventar datos

2. **Timeout**: Request excede 10 segundos
   - Comportamiento: Abortar request, retornar array vacío

3. **Parse error**: XML malformado o inesperado
   - Comportamiento: Log warning, retornar array vacío

4. **Network error**: Sin conexión o servidor inaccesible
   - Comportamiento: Log error, retornar array vacío

### Estados Visuales

- **Loading**: "Loading feeds..."
- **Empty**: "No items available" (por categoría)
- **Error global**: "Unable to load feeds" (si todos fallan)

---

## Cache

### Estrategia

Cache en memoria por sesión (similar a `weatherService.ts`).

- **Clave**: URL del feed RSS
- **Duración**: Hasta que se recargue la página
- **Scope**: Solo durante la sesión del navegador

### Implementación

El cache está en `rssService.ts`:

```typescript
const rssCache = new Map<string, FeedItem[]>();
```

---

## Integridad de Datos

### Reglas Críticas

1. **Nunca inventar contenido**: Si un feed falla, mostrar estado vacío
2. **Solo datos reales**: Todos los items provienen de feeds RSS reales
3. **Sin placeholders**: Eliminados todos los `placeholderFeeds`
4. **Sin mock data**: No usar datos sintéticos para desarrollo

### Validación

- ✅ Todos los feeds provienen de URLs en `RssFeedsStrategy.md`
- ✅ No hay placeholders, mock data, o contenido sintético
- ✅ Estados vacíos manejados explícitamente
- ✅ Errores no bloquean otras categorías

---

## Extensibilidad Futura

### Próximas Extensiones (según RssFeedsStrategy.md)

- RSS por país (geo-fencing)
- RSS por empresa / keyword
- RSS por evento activo (conflictos, crisis)

**Nota**: Estas extensiones deben documentarse primero en `RssFeedsStrategy.md` antes de implementarse.

---

## Referencias

- **Estrategia RSS**: `docs/reference/RssFeedsStrategy.md`
- **Tipos**: `src/types/feed.types.ts`
- **Servicio**: `src/utils/rssService.ts`
- **Store**: `src/stores/feedStore.ts`
- **Componentes**: `src/components/Feeds/`

