# Changelog

Todos los cambios notables en este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto adhiere a [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed
- **Migración de D3.js a Leaflet**: Reemplazo completo del sistema de mapas de D3.js por Leaflet para resolver problemas de visualización
  - Componente base `LeafletMap.tsx` con MapContainer de react-leaflet
  - Migración de todas las capas a Leaflet: CountriesLayer, HotspotsLayer, ConflictZonesLayer, CableLandingsLayer, NuclearSitesLayer, MilitaryBasesLayer, RssCountriesLayer
  - Sistema de tooltips y popups nativo de Leaflet
  - Mapa completamente interactivo con zoom y pan habilitados (minZoom: 1, maxZoom: 10)
  - Controles de zoom personalizados (LeafletMapControls.tsx) usando hook `useMap` de react-leaflet
  - Tile layer oscuro de CartoDB para mejor visualización
  - Reutilización de capas Leaflet existentes
  - Eliminación de dependencias: d3, d3-geo, @types/d3
  - Añadidas dependencias: react-leaflet, leaflet, @types/leaflet

### Added
- **News-Driven Sector Heatmap**: Sistema de heatmap de sectores basado en análisis narrativo de noticias
  - Transformación del Sector Heatmap de datos hardcodeados a sistema dinámico basado en noticias
  - Clasificación automática de noticias por sector (Technology, Finance, Healthcare, Energy, Consumer, Industrial, Materials, Utilities), sentimiento (positive/negative/neutral) e impacto (low/medium/high) usando keyword matching
  - Cálculo de scores narrativos normalizados (-100 a +100) por sector basado en agregación de noticias de las últimas 12 horas
  - Fórmula de scoring con impacto ponderado, decay de recencia y dirección de sentimiento
  - Store de Zustand (`sectorStore.ts`) que se actualiza automáticamente cuando `feedStore` cambia
  - Componente `SectorHeatmap` actualizado para mostrar scores reales con colores que reflejan narrativa (rojo=negativa, verde=positiva, amarillo=neutra)
  - Umbrales de colores ajustados: bajo (hasta ±1), medio (±2 a ±4), alto (±5 o más, +6 es más alto)
  - Modal de detalles (`SectorDetailsModal`) que muestra explicación narrativa generada desde templates y lista de top noticias con badges de sentimiento e impacto
  - Click en sector abre modal con análisis narrativo, estadísticas y noticias relevantes
  - Soporte multi-sector: una noticia puede afectar múltiples sectores simultáneamente
  - Integración completa con sistema de feeds RSS existente
  - Documentación completa en `docs/features/NewsDrivenSectorHeatmap.md`
- **Country Situation Popup**: Vista estratégica completa de situación de país al hacer click
  - Popup estructurado con secciones modulares: encabezado, actividad reciente, eventos relevantes, señales geográficas
  - Encabezado con nombre del país, hora local calculada e indicador de actividad (low/medium/high)
  - Actividad reciente agregada: total de eventos detectados (últimas 24h) con distribución por tipo (noticias, conflicto, infraestructura)
  - Eventos relevantes: lista curada de 3-5 eventos recientes con iconos, títulos, timestamps relativos y fuentes
  - Señales geográficas: hotspots, zonas de conflicto e infraestructura crítica dentro del país
  - Servicio centralizado `countrySituationService.ts` con función `buildCountrySituation()` reutilizable
  - Matching aproximado por nombre para relacionar hotspots/infraestructura con países
  - Integración con feeds RSS para eventos en tiempo real
  - Renderizado progresivo con skeleton loading
  - Componente `CountrySituationPopup` con diseño limpio y escaneable
  - Click en país abre popup, hover mantiene tooltip básico
  - Documentación completa en `docs/features/GlobalMap.md` con sección "Country Situation Popup"
- **Leyenda Visual Profesional para GlobalMap**: Leyenda persistente e integrada que explica todos los tipos de marcadores del mapa
  - Componente `MapLegend` siempre visible en esquina inferior izquierda del mapa
  - Estructura jerárquica y compacta (máximo 240px de ancho) con agrupación lógica por categorías
  - Explicación explícita de todos los tipos de marcadores:
    - Hotspots con 3 niveles (High Threat, Elevated, Low Threat) mostrando colores y tamaños exactos
    - Conflict Zones (Active Conflict) con representación de rectángulo semitransparente
    - Infraestructura Estratégica (Cable Landings, Nuclear Sites, Military Bases) con colores únicos
    - RSS / Countries (News Activity) con gradiente de color según menciones
  - Cada elemento muestra símbolo visual exacto, nombre y descripción semántica breve
  - Estilos coherentes con dark theme (bg-gray-800/95, border-gray-700, backdrop-blur)
  - z-index 1000 para permanecer visible sobre el mapa
  - Documentación completa en `docs/features/GlobalMap.md` con sección "Visual Legend & Semantic Encoding"
  - Sistema de codificación visual documentado: colores, formas, tamaños e interpretación del mapa

## [0.5.1] - 2026-01-09

### Changed
- **GlobalMap Comportamiento de Desplazamiento**: Comportamiento dinámico del mapa según nivel de zoom
  - En zoom inicial (nivel 2): mapa fijo, desplazamiento deshabilitado, centro forzado a `[20, 0]`
  - Al hacer zoom (nivel 3 o 4): desplazamiento habilitado, usuario puede mover el mapa libremente
  - Al volver al zoom inicial: desplazamiento se deshabilita automáticamente y centro se restaura
  - Componente `FixedCenter` actualizado para controlar `dragging` dinámicamente según el nivel de zoom actual

## [0.5.0] - 2026-01-09

### Added
- **Extracción de Países desde Feeds RSS**: Nueva capa en el mapa que muestra países mencionados en los feeds RSS
  - Extracción automática de países desde títulos y descripciones de feeds RSS
  - Filtrado por lista prioritaria de ~80 países estratégicos (top countries)
  - Marcadores cuadrados en el mapa con colores según número de menciones:
    - Verde: 1 mención
    - Amarillo: 2-3 menciones
    - Naranja: 4-5 menciones
    - Rojo: 6+ menciones
  - Tamaño de marcador proporcional al número de menciones
  - Tooltips informativos con nombre del país, número de menciones y última mención
  - Toggle para activar/desactivar la capa "RSS Countries"
  - Persistencia del estado de la capa en localStorage
  - Integración automática: extracción se ejecuta al actualizar feeds RSS
  - Servicio `countryExtractor.ts` con matching inteligente de nombres de países y variantes
  - Archivo de datos `top-countries.json` con coordenadas y variantes de nombres

### Changed
- **Logs de Feeds RSS**: Reducción de ruido en consola
  - Errores de feeds complementarios ahora usan `console.debug` (solo en desarrollo)
  - Feeds complementarios que retornan 0 items ya no generan warnings (comportamiento esperado)
  - Solo se loguean errores críticos de feeds primarios
  - Logs de éxito se mantienen para todos los feeds

### Removed
- **API de Weather**: Eliminada integración con Open-Meteo API
  - Eliminado `weatherService.ts` y todas las llamadas a la API
  - Tooltips y popups ahora solo muestran hora local (sin datos climáticos)
  - Simplificada función `buildContextLines` para mostrar solo hora local
  - Reducción de dependencias externas y requests HTTP

## [0.4.2] - 2026-01-09

### Added
- **Controles de Zoom Personalizados**: Panel de controles en esquina superior izquierda del mapa
  - Botón Zoom In (+) con deshabilitación automática al alcanzar zoom máximo (nivel 4)
  - Botón Zoom Out (-) con deshabilitación automática al alcanzar zoom mínimo (nivel 2)
  - Botón Reset View para restaurar vista inicial (zoom 2, centro [20, 0]) sin animación
  - Estado local para rastrear zoom actual y actualizar botones correctamente
  - Estilo consistente con LayerToggles (fondo gris, bordes, accesibilidad 44x44px mínimo)

### Changed
- **GlobalMap Zoom Máximo**: Limitado a nivel 4 (`maxZoom={4}`) para mantener perspectiva global estratégica
- **Controles Nativos Deshabilitados**: Deshabilitados controles de zoom nativos de Leaflet (`zoomControl={false}`) para evitar duplicación con controles personalizados

### Fixed
- Corrección del botón Zoom Out que no funcionaba correctamente
- Estado de zoom ahora se actualiza correctamente mediante listener de eventos `zoomend`

## [0.4.1] - 2026-01-09

### Added
- **Feeds RSS Complementarios**: Extensión del sistema de feeds para incluir fuentes complementarias además de Google News
  - 32 feeds complementarios añadidos: medios especializados y oficiales por categoría
  - World: 6 feeds (BBC, NPR, Guardian, Reuters, The Diplomat, Al-Monitor)
  - Geopolitical: 10 feeds (CSIS, Brookings, CFR, Defense One, War on Rocks, Breaking Defense, The Drive War Zone, Bellingcat, DoD News, White House, State Dept)
  - Technology: 6 feeds (Hacker News, Ars Technica, The Verge, MIT Tech Review, CISA Alerts, Krebs Security)
  - AI: 2 feeds (ArXiv AI, OpenAI Blog)
  - Finance: 8 feeds (CNBC, MarketWatch, Yahoo Finance, Reuters Business, FT, Federal Reserve, SEC, Treasury)
  - Sistema de deduplicación automática por título normalizado (clave primaria según reglas editoriales)
  - Función `clearRssCache()` para limpiar cache y forzar recarga completa
- **Botón de Refresh Funcional**: Botón de actualización en el Header ahora refresca todos los feeds RSS
  - Limpia el cache antes de recargar para obtener datos frescos
  - Integrado con `feedStore` para actualizar estado de feeds
  - Deshabilitado durante carga para evitar múltiples requests simultáneos

### Changed
- **Documentación RSS Consolidada**: Unificación de `RssFeedsStrategy.md` y `NewsFeed.md` en un único archivo
  - `RssFeedsStrategy.md` ahora incluye estrategia completa y lista de todos los feeds
  - `NewsFeed.md` eliminado (contenido consolidado)
  - Estructura mejorada: estrategia → categorías con feeds → extensiones futuras
- **rssService.ts**: Actualizado para soportar múltiples feeds por categoría
  - `RSS_FEED_URLS` cambiado de `Record<FeedCategory, string>` a `Record<FeedCategory, string[]>`
  - `fetchAllRssFeeds()` ahora itera sobre todos los feeds (primarios y complementarios)
  - Orden de prioridad: feeds primarios primero, luego complementarios
  - Ordenamiento por fecha (más recientes primero) después de deduplicación

## [0.4.0] - 2026-01-09

### Added
- **Sistema de Feeds RSS Reales**: Implementación completa de ingesta de noticias desde Google News RSS
  - Servicio RSS (`rssService.ts`) con fetch, parse XML, y manejo de errores/CORS
  - Store de Zustand (`feedStore.ts`) para gestión de estado de feeds por categoría
  - Componente `FeedCard` unificado para todas las categorías (sin variaciones visuales)
  - Derivación automática de Alerts desde items de alta prioridad (keywords + timestamp reciente)
  - Layout de columnas según diseño de referencia (World/Geopolitical, Technology/AI, Finance, Alerts)
  - Cache en memoria por sesión para evitar requests repetidos
  - Manejo de estados: loading, empty, error (sin bloquear UI)
  - Integridad de datos: solo feeds reales, sin placeholders ni mock data
- **Tipos TypeScript**: Definiciones completas en `src/types/feed.types.ts` (FeedItem, FeedCategory, FeedGroup)
- **Documentación**: Feature documentada en `docs/features/NewsFeedIngestion.md`

### Changed
- **FeedsSection**: Refactorizado completamente para usar feeds RSS reales
  - Eliminados todos los `placeholderFeeds` y datos sintéticos
  - Integración con `feedStore` para obtener datos reales
  - Agrupación de categorías según diseño (World/Geopolitical, Technology/AI, Finance, Alerts)
  - Layout de columnas verticales con scroll independiente por columna
- **Dependencias**: Añadido `rss-parser` a `package.json` (aunque finalmente se usa DOMParser nativo del navegador)

### Fixed
- Eliminación de datos sintéticos: todos los feeds provienen de URLs reales definidas en `docs/reference/RssFeedsStrategy.md`

## [0.3.2] - 2026-01-09

### Added
- **GlobalMap Popups al Clic**: Popups interactivos que se muestran al hacer clic en localizaciones
  - Componente `EnrichedPopup` que muestra información enriquecida (hora local + clima) al hacer clic
  - Popup disponible en todas las capas de puntos geográficos: Hotspots, Cable Landings, Nuclear Sites, Military Bases
  - Misma información que tooltips (contenido base + hora local + clima actual)
  - Popup se puede cerrar haciendo clic en la X o fuera de él
  - Tooltips en hover siguen funcionando normalmente

## [0.3.1] - 2026-01-09

### Added
- **GlobalMap Tooltips Enriquecidos**: Extensión de tooltips con contexto ambiental
  - Hora local calculada desde longitud geográfica (utilidad `geoUtils.ts`)
  - Clima actual desde Open-Meteo API (condición, temperatura, viento)
  - Servicio de clima con cache en memoria por sesión (`weatherService.ts`)
  - Componente `EnrichedTooltip` que renderiza contenido base inmediatamente y carga datos async
  - Aplicado a puntos geográficos: Hotspots, Cable Landings, Nuclear Sites, Military Bases
  - Carga bajo demanda (solo en hover), sin bloquear render inicial
  - Manejo de errores silencioso (si API falla, solo no se muestra clima)

## [0.3.0] - 2026-01-09

### Added
- **GlobalMap v1 Layers**: Implementación completa de sistema de capas para el mapa global
  - **Countries Layer**: Capa de países con GeoJSON remoto, tooltips básicos y hover highlight. Carga desde fuente pública con manejo de errores
  - **Hotspots Layer**: 10 hotspots geopolíticos estratégicos (Strait of Hormuz, Suez Canal, Panama Canal, etc.) con niveles de amenaza (low/elevated/high), marcadores circulares con colores diferenciados y tooltips informativos
  - **Conflict Zones Layer**: 4 zonas de conflicto activas (Ukraine, Gaza, Taiwan Strait, Yemen) representadas como polígonos con estilo translúcido y tooltips
  - **Layer Toggles UI**: Panel flotante minimalista en esquina superior derecha del mapa para controlar visibilidad de capas, con indicadores visuales on/off y áreas click accesibles (44x44px mínimo)
  - **Map Store**: Store de Zustand (`mapStore.ts`) con persistencia en localStorage para mantener estado de capas entre sesiones
  - **Tooltip System**: Sistema unificado de tooltips (`tooltipBuilder.ts`) preparado para enriquecimiento futuro, con funciones específicas para cada tipo de elemento (países, hotspots, zonas de conflicto)
  - **Z-index Ordering**: Configuración correcta de orden de capas (countries: 100, conflicts: 200, hotspots: 300) para evitar solapes visuales
- **Data Files**: Archivos JSON estáticos para datos de hotspots (`src/data/hotspots.json`) y zonas de conflicto (`src/data/conflict-zones.json`)
- **Type Definitions**: Tipos TypeScript completos para capas, hotspots, zonas de conflicto y tooltips (`src/types/map.types.ts`)

### Changed
- **GlobalMapSection**: Integración de todas las capas y sistema de toggles, manteniendo compatibilidad con mapa base existente

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
