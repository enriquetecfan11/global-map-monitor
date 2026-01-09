# Monitors

## Descripción

`Monitors` es la feature que permite al usuario crear **vigilancias personalizadas** basadas en **keywords** y, opcionalmente, en **ubicación geográfica**.

Un monitor actúa como un **sensor lógico** dentro del sistema: observa múltiples fuentes de datos, detecta coincidencias relevantes y las proyecta tanto en el mapa como en los paneles informativos.

---

## Objetivos

- Permitir al usuario definir **intereses específicos** sin depender de feeds predefinidos.
- Combinar **texto + geografía** como mecanismo de filtrado.
- Visualizar resultados de forma coherente con el resto del sistema.
- Servir como input para correlaciones y narrativas.

---

## Rol dentro del sistema

- Feature **user-driven**
- Extiende el sistema sin modificar la arquitectura base
- Conecta:
  - Fuentes de datos
  - GlobalMap
  - Panel "My Monitors"

---

## Modelo Conceptual de un Monitor

Un monitor se define por los siguientes atributos:

```ts
interface Monitor {
  id: string
  name: string
  keywords: string[]
  color: string
  location?: {
    lat: number
    lon: number
  }
  enabled: boolean
  createdAt: timestamp
}
```

---

## Tipos de Monitores

### 1. Keyword-only Monitor

Basado únicamente en texto.

**Características**:
- Aplica sobre titulares, descripciones y eventos
- No aparece en el mapa
- Útil para seguimiento temático sin contexto geográfico

**Ejemplo**:
- Keywords: `tsmc`, `semiconductor`, `chip shortage`

---

### 2. Geo-contextual Monitor

Combina keywords + coordenadas.

**Características**:
- Se representa visualmente en el mapa
- Permite correlación espacial
- Integración directa con GlobalMap

**Ejemplo**:
- Keywords: `iran`, `enrichment`
- Location: Natanz (lat/lon)

---

## Creación y Edición

### Flujo de Usuario

1. Abrir modal "Add Monitor"
2. Definir:
   - Nombre
   - Keywords (comma-separated)
   - Color
   - Ubicación (opcional)
3. Guardar monitor

**Comportamiento del sistema**:
- Persiste la configuración
- Activa el monitor automáticamente

---

### Persistencia

- Persistencia en cliente (local storage o equivalente)
- No requiere backend
- Debe soportar:
  - Edición
  - Eliminación
  - Activar / desactivar

---

## Integración con GlobalMap

Cuando un monitor tiene ubicación:

- Se representa como un hotspot personalizado
- Usa el color definido por el usuario
- Comparte comportamiento de tooltip enriquecido
- Puede coexistir con capas del sistema

---

## Panel "My Monitors"

### Contenido del panel

- Lista de monitores activos
- Contador de eventos detectados
- Última coincidencia
- Estado (activo / pausado)

### Comportamiento

- Actualización en tiempo real o por refresh global
- Visualización coherente con otros paneles

---

## Integración con Fuentes de Datos

Los monitores se aplican como filtros transversales sobre:

- Noticias
- Eventos geopolíticos
- Alertas
- Señales narrativas

> **Nota**: un evento puede disparar múltiples monitores.

---

## Relación con Correlation Engine

Los monitores:

- Generan señales estructuradas
- Pueden cruzarse entre sí
- Alimentan:
  - Patrones emergentes
  - Momentum
  - Correlaciones cruzadas

---

## Consideraciones Técnicas

- Evaluación eficiente de keywords
- Normalización de texto (case-insensitive)
- Cacheo de resultados por ciclo
- Evitar duplicados entre refreshes

---

## Estado de Implementación

- 🟡 Especificación definida
- ⏳ Implementación pendiente

---

## Relación con otras Features

- `GlobalMap` → visualización espacial
- `IntelFeed` → fuente principal de eventos
- `CorrelationEngine` → análisis avanzado
- `NarrativeTracker` → detección de relato