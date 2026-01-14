# Guía del Repositorio

## Convenciones rápidas
- Archivos Markdown en `PascalCase` (excepto `README.md` y `AGENTS.md`).
- No borrar archivos sin confirmación.
- Mantén `docs/` y `CHANGELOG.md` alineados con cambios reales.

### Flujo de Trabajo Spec-Driven
1. **Fase de Pensamiento**: Antes de escribir código, verificar si existe documentación (specs, tasks.md, design.md).
   - Si NO existe: Sugerir crearla primero usando el comando `/doc`.
   - Si SÍ existe: LEER el archivo antes de proponer soluciones.

2. **Gestión de Archivos**:
   - NUNCA borrar código sin preguntar.
   - NUNCA inventar nombres de archivos si ya existen convenciones en el proyecto.

3. **Comunicación**:
   - Ser conciso. No dar explicaciones obvias.
   - Si hay un error en la lógica o en las specs, mencionarlo ANTES de implementarlo.

## Reglas para Nuevas Features

1. **Mantener AGENTS.md actualizado**: Después de cada feature que afecte arquitectura o flujos core, actualizar este archivo con los cambios relevantes.
2. **Documentación viva**: Cualquier nueva feature debe documentarse en `docs/features/nombre-feature.md` siguiendo la estructura estándar (descripción, implementación, uso, diagramas).
3. **Actualizar CHANGELOG.md**: Cada nueva feature debe añadirse al `CHANGELOG.md` en la sección correspondiente (Added, Changed, Fixed, etc.).
4. **Migraciones**: Nunca modificar scripts existentes; agregar uno nuevo en `docs/migrations/` y documentarlo en el índice correspondiente.

## Referencias de Documentación
La documentación está organizada en `docs/` con la siguiente estructura:

- **Índice general**: `docs/index.md` - Tabla de contenidos global
- **Setup y configuración**: `docs/setup/` - Configuración inicial e instalación (pendiente)
- **Arquitectura**: `docs/architecture/` - Estructura del proyecto, tech stack y patrones
  - `docs/architecture/Architecture.md` - Arquitectura general
  - `docs/architecture/DataSources.md` - Fuentes de datos externas
- **Features**: `docs/features/` - Documentación de funcionalidades implementadas
  - `docs/features/GlobalMap.md` - Sistema de mapas globales (implementado con D3.js y proyección geoEqualEarth())
  - `docs/features/InterfaceDesign.md` - Diseño UI/UX
  - `docs/features/NewsFeedIngestion.md` - Sistema de ingesta de feeds RSS
  - `docs/features/NewsDrivenSectorHeatmap.md` - Heatmap de sectores basado en análisis narrativo de noticias
  - `docs/features/Monitors.md` - Sistema de monitores personalizados
  - `docs/features/FinanceApis.md` - APIs para datos financieros
- **Referencias**: `docs/reference/` - Guías y referencias de herramientas
  - `docs/reference/RssFeedsStrategy.md` - Estrategia de feeds RSS
- **Otras secciones**: `docs/optimization/`, `docs/audit/`, `docs/troubleshooting/`, `docs/migrations/`, `docs/mcp/`


### Para documentar una nueva feature:
1. Crear `docs/features/nombre-feature.md` con descripción, implementación, uso y diagramas
2. Actualizar `docs/index.md` con el nuevo documento en la sección Features
3. Actualizar `CHANGELOG.md` en la sección correspondiente
4. Actualizar `AGENTS.md` si es necesario

## Esctructura de changelog.md

```
## [Versión] - [Fecha]
### Added
- Descripción de la nueva feature
### Changed
- Descripción de los cambios realizados
### Fixed
- Descripción de los errores corregidos
```

