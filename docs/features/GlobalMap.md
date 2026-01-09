# GlobalMap

## Descripción

`GlobalMap` es el componente central de **map-monitor**.  
Representa un mapa mundial interactivo que actúa como **superficie de inteligencia**, integrando eventos geopolíticos, infraestructuras críticas y fenómenos naturales en una única vista contextual.

No es un mapa de navegación, sino un **mapa semántico de situación**: cada elemento visible tiene significado estratégico.

---

## Objetivos

- Proporcionar una **visión global inmediata** del estado del mundo.
- Superponer **capas de eventos y activos críticos** sobre el mapa.
- Ofrecer **contexto en tiempo real** mediante tooltips enriquecidos.
- Servir como punto de anclaje visual para feeds, correlaciones y monitores personalizados.

---

## Rol dentro del sistema

- **Feature core** del proyecto.
- Punto de entrada cognitivo para el usuario.
- Fuente primaria de contexto espacial para:
  - Monitores personalizados
  - Correlaciones
  - Narrativas
  - Alertas

---

## Capas del Mapa (Map Layers)

El mapa se compone de múltiples capas independientes, activables y extensibles.

### 1. Base Geográfica

- Países del mundo (proyección global)
- Diferenciación visual de países sancionados
- Graticulado (latitud / longitud)
- Etiquetas oceánicas

**Propósito**: orientación y contexto geográfico.

---

### 2. Hotspots Geopolíticos

Puntos estratégicos con nivel de amenaza asociado.

**Atributos**:
- Nombre
- Latitud / Longitud
- Nivel: `low | elevated | high`
- Descripción contextual

**Visualización**:
- Círculo central
- Anillo pulsante
- Color según amenaza

---

### 3. Zonas de Conflicto

Regiones activas de conflicto representadas como polígonos aproximados.

**Ejemplos**:
- Ucrania
- Gaza
- Taiwán Strait
- Yemen

**Propósito**: indicar regiones de alta inestabilidad persistente.

---

### 4. Infraestructura Estratégica

#### 4.1 Shipping Chokepoints
- Canales y estrechos clave del comercio global
- Representados con marcadores específicos

#### 4.2 Cables Submarinos
- Puntos de aterrizaje de grandes hubs de conectividad
- Infraestructura crítica digital

#### 4.3 Instalaciones Nucleares
- Enriquecimiento
- Plantas nucleares
- Zonas sensibles

#### 4.4 Bases Militares
- Principales bases y hubs estratégicos
- Representación simbólica diferenciada

---

### 5. Fenómenos Naturales

#### 5.1 Alertas Meteorológicas
- Alertas severas/extremas
- Agrupadas por región
- Severidad codificada por color

#### 5.2 Terremotos
- Actividad sísmica reciente
- Tamaño y color según magnitud
- Profundidad y tiempo en tooltip

---

### 6. Ciclo Día / Noche

- Terminador día-noche calculado dinámicamente
- Sombreado del hemisferio nocturno

**Propósito**:
- Contexto temporal
- Soporte visual para análisis geoestratégico

---

## Tooltips Enriquecidos

Los elementos interactivos del mapa generan tooltips dinámicos.

### Contenido típico de un tooltip

- Descripción del punto/zona
- Hora local calculada
- Condiciones meteorológicas actuales
- Tráfico aéreo aproximado
- Titular de noticia relevante (si aplica)

**Nota**: los datos se cargan bajo demanda y pueden cachearse en cliente.

---

## Fuentes de Datos

El mapa consume datos de múltiples APIs públicas:

- Geografía mundial (TopoJSON / GeoJSON)
- Clima y alertas meteorológicas
- Actividad sísmica global
- Tráfico aéreo
- Noticias geopolíticas

> Todas las fuentes deben documentarse de forma centralizada en `docs/architecture/DataSources.md`.

---

## Interacción del Usuario

- Hover para obtener contexto inmediato
- Mapa no navegable (no pan/zoom libre por defecto)
- Integración con:
  - Monitores personalizados
  - Sistema de correlación
  - Narrativas

---

## Consideraciones Técnicas

- Renderizado mediante capas superpuestas
- Separación clara entre:
  - Datos
  - Lógica de transformación
  - Render visual
- Preparado para:
  - Activación/desactivación de capas
  - Filtros dinámicos
  - Extensión futura (nuevas capas)

---

## Estado de Implementación

- 🟡 Documentación definida
- ⏳ Implementación pendiente (según metodología spec-driven)

---

## Relación con otras Features

- `Monitors` → inyectan puntos y zonas dinámicas en el mapa
- `CorrelationEngine` → utiliza eventos del mapa como input
- `NarrativeTracker` → ancla narrativas a regiones y hotspots

---
