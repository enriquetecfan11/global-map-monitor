# Map Monitor

Sistema de monitoreo de mapas geográficos desarrollado siguiendo metodología spec-driven.

## Estado Actual

- ✅ Documentación base completada
- ✅ Arquitectura y diseño definidos
- ✅ Implementación en desarrollo activo (v0.2.0)
- ✅ Layout vertical con 6 secciones principales implementadas

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Mapas**: Leaflet + react-leaflet
- **Estado**: Zustand
- **Linting**: ESLint

## Inicio Rápido

```bash
# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev

# Compilar para producción
npm run build

# Preview de producción
npm run preview
```

## Documentación

La documentación completa del proyecto se encuentra en [`docs/`](docs/index.md).


## Estructura de Map Monitor

```
map-monitor/
├── docs/                    # Documentación del proyecto
│   ├── architecture/        # Arquitectura y diseño
│   ├── features/            # Documentación de features
│   ├── setup/              # Configuración e instalación
│   ├── reference/          # Referencias y guías
│   └── index.md            # Índice general
├── src/                    # Código fuente
│   ├── components/         # Componentes React
│   ├── stores/            # Estado global (Zustand)
│   └── types/             # Definiciones TypeScript
├── scripts/               # Scripts de utilidad
├── AGENTS.md              # Reglas y convenciones del proyecto
└── CHANGELOG.md           # Historial de cambios
```

El proyecto está en desarrollo activo. Consulta el [`CHANGELOG.md`](CHANGELOG.md) para ver el historial de cambios y las features implementadas.
