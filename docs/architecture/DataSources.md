# DataSources

## Descripción

Este documento define **todas las fuentes de datos externas** utilizadas por **map-monitor**, su propósito, tipo de información, fiabilidad y consideraciones técnicas.

En map-monitor, **las APIs externas actúan como backend lógico**.  
No existe un backend propio que centralice datos: el sistema consume, transforma y correlaciona información **directamente en cliente**.

---

## Principios de Diseño

- **Frontend-driven**: todas las fuentes se consumen desde el navegador.
- **Stateless**: los datos no se almacenan de forma persistente.
- **Best-effort**: el sistema debe funcionar aunque una fuente falle.
- **No blocking**: ninguna API puede bloquear el render global.

---

## Clasificación de Fuentes

Las fuentes se agrupan por dominio semántico:

- Geografía base
- Noticias
- Clima y alertas
- Fenómenos naturales
- Tráfico e infraestructuras
- Mercados y señales (futuro)


---

## Endpoints y URLs de Fuentes de Datos

Esta sección enumera **todas las URLs externas** que map-monitor consume directa o indirectamente.  
Sirve como referencia técnica, auditoría de dependencias y base para futuras migraciones o proxies.

---

### Geografía Base

**World Atlas (TopoJSON)**
- https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json

---

### Noticias y Eventos Globales

**GDELT Project – Document API**
- https://api.gdeltproject.org/api/v2/doc/doc

Parámetros habituales:
- `query`
- `mode=artlist`
- `maxrecords`
- `format=json`

Ejemplo:
- https://api.gdeltproject.org/api/v2/doc/doc?query=china&mode=artlist&maxrecords=5&format=json

---

### Clima y Meteorología

**Open-Meteo – Current Weather**
- https://api.open-meteo.com/v1/forecast

Parámetros usados:
- `latitude`
- `longitude`
- `current=temperature_2m,weather_code,wind_speed_10m`

Ejemplo:
- https://api.open-meteo.com/v1/forecast?latitude=25.03&longitude=121.5&current=temperature_2m,weather_code,wind_speed_10m

---

**NOAA / weather.gov – Alertas activas**
- https://api.weather.gov/alerts/active

Parámetros usados:
- `status=actual`
- `severity=Extreme,Severe`

Ejemplo:
- https://api.weather.gov/alerts/active?status=actual&severity=Extreme,Severe

---

### Fenómenos Naturales

**USGS – Earthquakes (Weekly, ≥4.5)**
- https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_week.geojson

---

### Tráfico Aéreo

**OpenSky Network – Aircraft States**
- https://opensky-network.org/api/states/all

Parámetros usados:
- `lamin`
- `lomin`
- `lamax`
- `lomax`

Ejemplo:
- https://opensky-network.org/api/states/all?lamin=23&lomin=119&lamax=27&lomax=123

---

### Infraestructura Estratégica (Datasets Internos)

Estas fuentes **no dependen de APIs externas** y se mantienen como datasets internos versionados:

- Shipping chokepoints (manual)
- Cables submarinos (manual)
- Instalaciones nucleares (manual)
- Bases militares (manual)

> Estos datasets deben residir en el repositorio y documentarse por separado si se amplían.

---

## Notas Importantes

- Ninguna URL requiere autenticación.
- Todas las peticiones son **GET**.
- El sistema debe asumir:
  - Latencia variable
  - Fallos intermitentes
  - Rate limits no documentados

---

## Fuentes Geográficas

### World Atlas (TopoJSON)

**Uso**
- Países del mundo
- Geometrías base para render del mapa

**Endpoint**
- CDN (world-atlas)

**Características**
- Estático
- Alta fiabilidad
- Bajo peso

**Notas**
- Se usa como capa base
- No requiere refresh frecuente

---

## Noticias y Eventos

### GDELT Project

**Uso**
- Noticias geopolíticas
- Detección de eventos por keywords
- Contexto en tooltips y monitores

**Tipo**
- Noticias globales agregadas

**Características**
- Gran cobertura
- Latencia variable
- Respuestas no siempre homogéneas

**Riesgos**
- Rate limits implícitos
- CORS inestable en algunos entornos

**Mitigación**
- Cacheo en cliente
- Uso limitado (headlines, no full text)

---

## Clima y Meteorología

### Open-Meteo

**Uso**
- Condiciones actuales en hotspots
- Contexto ambiental

**Datos**
- Temperatura
- Viento
- Código meteorológico

**Ventajas**
- No requiere API key
- Alta disponibilidad

---

### NOAA / weather.gov

**Uso**
- Alertas meteorológicas severas
- Riesgos naturales (US-centric)

**Datos**
- Severidad
- Tipo de evento
- Región afectada

**Notas**
- Principalmente Estados Unidos
- Alertas agrupadas por región para evitar clutter

---

## Fenómenos Naturales

### USGS Earthquake API

**Uso**
- Terremotos recientes
- Magnitud y profundidad

**Datos**
- GeoJSON
- Actualización frecuente

**Visualización**
- Círculos concéntricos
- Color según magnitud

---

## Tráfico y Movilidad

### OpenSky Network

**Uso**
- Tráfico aéreo aproximado
- Densidad de vuelos en hotspots

**Datos**
- Estados de aeronaves en bounding box

**Riesgos**
- Rate limits estrictos
- Respuestas lentas en horas pico

**Mitigación**
- Uso solo bajo demanda (tooltip)
- Cacheo por región

---

## Infraestructura Crítica (Estático)

### Shipping Chokepoints

**Uso**
- Puntos estratégicos del comercio global
- Contexto económico y geopolítico

**Origen**
- Dataset curado manualmente

---

### Cables Submarinos

**Uso**
- Conectividad digital global
- Riesgo sistémico de cortes

**Origen**
- Dataset manual (hubs principales)

---

### Instalaciones Nucleares

**Uso**
- Riesgo estratégico
- Contexto geopolítico

**Origen**
- Dataset manual

---

### Bases Militares

**Uso**
- Proyección de poder
- Contexto de conflicto

**Origen**
- Dataset manual

---

## Gestión de Errores y Fallbacks

- Cada fuente debe:
  - Fallar de forma silenciosa
  - No bloquear el render
  - No romper el mapa

**Estrategias**
- `try/catch` por fuente
- Timeout implícito
- Cache local por sesión

---

## Cacheo

- Cache en memoria (por sesión)
- Clave basada en:
  - Fuente
  - Región
  - Query
- No persistente entre sesiones

---

## Seguridad y Privacidad

- No se envían datos del usuario a terceros
- Solo se realizan peticiones de lectura
- Sin autenticación
- Sin tracking

---

## Extensibilidad Futura

Este sistema está diseñado para admitir nuevas fuentes:

- Mercados financieros
- Blockchain / on-chain
- Redes sociales
- Sensores propios

Toda nueva fuente debe:
1. Documentarse aquí
2. Indicar dominio semántico
3. Definir estrategia de fallback

---

## Estado

- 🟢 Fuentes identificadas
- 🟡 Normalización pendiente
- ⏳ Centralización de acceso pendiente

---
