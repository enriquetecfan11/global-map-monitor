# Changelog

Todos los cambios notables en este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto adhiere a [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] - 2026-01-09

### Added
- Layout vertical estructurado con 6 secciones principales
- **GlobalMapSection**: Componente de mapa Leaflet con altura fija (45vh), integración con react-leaflet, configuración de iconos por defecto
- **FeedsSection**: Sección de feeds con cards agrupadas por categoría (World/Geopolitical, Technology/AI, Finance, Alerts), layout responsive con grid
- **MarketsSection**: Sección de mercados con:
  - **MarketsTable**: Tabla compacta con índices, stocks y criptomonedas (placeholder data)
  - **SectorHeatmap**: Heatmap visual de sectores con indicadores de rendimiento
- **AnalyticalModulesSection**: Sección de módulos analíticos con:
  - **CorrelationEnginePanel**: Panel con estado visual (scanning/running/idle)
  - **NarrativeTrackerPanel**: Panel con estado visual (scanning/running/idle)
- **CustomMonitorsModal**: Modal dialog para crear monitores personalizados con inputs para keywords (required) y location (optional), no visible por defecto
- Estructura de document flow normal sin posicionamiento absoluto
- Scroll natural en contenedor principal

### Changed
- **App.tsx**: Reestructurado para layout vertical con Header fijo y contenedor scrollable, incluye todas las nuevas secciones en orden vertical
- **Header.tsx**: Añadido posicionamiento sticky (`sticky top-0 z-40`) para mantenerlo siempre visible

### Fixed
- Corrección de clase CSS inexistente `bg-gray-750` en MarketsTable, reemplazada por `bg-gray-700`
- Configuración correcta de iconos de Leaflet para evitar problemas de renderizado en React
