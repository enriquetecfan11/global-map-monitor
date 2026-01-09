# Interface Design - Diseño UI/UX de map-monitor

Documentación del diseño de interfaz de usuario para map-monitor.

## Descripción

Interface Design define la especificación completa de diseño UI/UX de la aplicación map-monitor antes de cualquier implementación de código. Este documento establece los principios, estructura, componentes y patrones de interacción que guiarán el desarrollo de la interfaz.

### Propósito

Definir de forma exhaustiva el diseño visual y de interacción de la aplicación, garantizando coherencia, usabilidad y accesibilidad antes de comenzar la implementación técnica.

### Alcance

- Estructura general del layout (mapa + paneles)
- Principios de diseño visual (dark theme, jerarquía)
- Componentes principales de la interfaz
- Patrones de interacción (drag, toggle, refresh)
- Estados visuales (loading, empty, error)
- Consideraciones de accesibilidad
- Limitaciones explícitas (non-goals)

## Goals

Los objetivos principales del diseño de interfaz son:

1. **Claridad Visual**: Jerarquía visual clara que guíe la atención del usuario hacia el mapa como elemento central
2. **Usabilidad**: Interacciones intuitivas que no requieran explicación
3. **Eficiencia**: Acceso rápido a funcionalidades principales sin saturar la interfaz
4. **Consistencia**: Patrones de diseño coherentes en toda la aplicación
5. **Accesibilidad**: Cumplimiento de estándares de accesibilidad web (WCAG)
6. **Rendimiento Visual**: Transiciones suaves y estados de carga claros

## Design Principles

### 1. Dark Theme First

La aplicación utilizará un tema oscuro como base, optimizado para:
- Reducción de fatiga visual en sesiones prolongadas
- Mejor contraste con elementos del mapa
- Consistencia con herramientas profesionales de monitoreo

### 2. Jerarquía Visual

El mapa es el elemento central de la interfaz. Todos los demás elementos deben:
- No competir visualmente con el mapa
- Apoyar la visualización del mapa sin obstruirlo
- Mantener el foco en la información geográfica

### 3. Minimalismo Funcional

- Solo mostrar información relevante en cada contexto
- Ocultar funcionalidades avanzadas hasta que sean necesarias
- Evitar sobrecarga cognitiva

### 4. Feedback Inmediato

- Toda interacción debe tener respuesta visual inmediata
- Estados de carga claramente indicados
- Mensajes de error informativos y accionables

### 5. Responsive y Adaptable

- Diseño que se adapte a diferentes tamaños de pantalla
- Paneles colapsables/expandibles según el espacio disponible
- Optimización para diferentes resoluciones

## Layout Overview

### Estructura General

La aplicación sigue un layout de panel lateral con mapa principal:

```
┌─────────────────────────────────────────┐
│  Header (barra superior)                │
├──────────┬──────────────────────────────┤
│          │                              │
│  Panel   │        Mapa Principal        │
│  Lateral │        (Área Central)        │
│          │                              │
│  (colapsable)    │                      │
│          │                              │
└──────────┴──────────────────────────────┘
```

### Zonas Principales

1. **Header/Barra Superior**
   - Título de la aplicación
   - Controles globales (refresh, configuración)
   - Indicadores de estado

2. **Panel Lateral**
   - Controles de filtrado y búsqueda
   - Lista de elementos monitoreados
   - Información contextual
   - Colapsable para maximizar área del mapa

3. **Área del Mapa (Central)**
   - Mapa interactivo como elemento principal
   - Controles de zoom y navegación integrados
   - Overlays y marcadores según el estado

4. **Paneles Flotantes (Opcionales)**
   - Detalles de elementos seleccionados
   - Información contextual temporal
   - Posicionados sobre el mapa sin bloquearlo completamente

## Main UI Components

### 1. Header Component

**Función**: Barra superior con información y controles globales

**Elementos**:
- Título/Logo de la aplicación
- Botón de refresh global
- Indicador de estado de conexión
- Botón de configuración (si aplica)

**Características**:
- Altura fija y compacta
- No debe competir visualmente con el mapa
- Controles accesibles pero discretos

### 2. Side Panel Component

**Función**: Panel lateral con controles y listas

**Elementos**:
- Botón de colapsar/expandir
- Filtros de búsqueda
- Lista de elementos monitoreados
- Controles de visualización

**Características**:
- Ancho ajustable (con límites mínimos/máximos)
- Redimensionable mediante drag
- Colapsable completamente para modo full-screen del mapa
- Scroll interno si el contenido excede el espacio

### 3. Map Container Component

**Función**: Contenedor principal del mapa

**Características**:
- Ocupa el espacio restante después del header y panel lateral
- Responsive al redimensionamiento del panel lateral
- Integración nativa con controles de Leaflet
- Z-index apropiado para overlays

### 4. Floating Detail Panel

**Función**: Panel flotante para detalles de elementos seleccionados

**Características**:
- Aparece sobre el mapa cuando se selecciona un elemento
- Posicionable (no bloquea completamente el mapa)
- Cerrable con botón o clic fuera
- Responsive al tamaño de pantalla

### 5. Status Indicators

**Función**: Indicadores visuales de estado del sistema

**Tipos**:
- Indicador de conexión (online/offline)
- Indicador de carga (sincronización en curso)
- Contador de elementos activos
- Notificaciones temporales

## Interaction Patterns

### 1. Panel Lateral - Drag to Resize

**Patrón**: El usuario puede arrastrar el borde del panel lateral para ajustar su ancho

**Comportamiento**:
- Cursor cambia a indicador de resize al pasar sobre el borde
- Feedback visual durante el drag (línea guía o sombra)
- Límites mínimos y máximos de ancho
- Persistencia del ancho en la sesión (opcional, a definir)

**Implicación Arquitectónica**: Requiere gestión de estado para el ancho del panel y handlers de eventos de mouse/touch.

### 2. Panel Lateral - Toggle Collapse

**Patrón**: Botón para colapsar/expandir completamente el panel lateral

**Comportamiento**:
- Transición suave de animación
- Icono que indica el estado (colapsado/expandido)
- El mapa se expande para ocupar el espacio liberado
- Estado persistente (opcional, a definir)

**Implicación Arquitectónica**: Estado booleano para controlar visibilidad del panel.

### 3. Global Refresh

**Patrón**: Botón de refresh que actualiza todos los datos del mapa

**Comportamiento**:
- Feedback visual inmediato (spinner o indicador)
- Deshabilitado durante la actualización
- Muestra estado de progreso si es posible
- Notificación de éxito/error al completar

**Implicación Arquitectónica**: Endpoint o función de actualización global, gestión de estados de carga.

### 4. Map Interaction

**Patrón**: Interacciones nativas del mapa (zoom, pan, selección)

**Comportamiento**:
- Zoom mediante rueda del mouse, botones o gestos táctiles
- Pan mediante drag del mapa
- Selección de elementos mediante clic
- Tooltips informativos al hover (opcional)

**Nota**: Estas interacciones son principalmente responsabilidad de Leaflet, pero el diseño debe considerar su integración visual.

### 5. Element Selection

**Patrón**: Selección de elementos en el mapa o en la lista del panel

**Comportamiento**:
- Clic en elemento del mapa o lista lo selecciona
- Feedback visual inmediato (highlight, cambio de color)
- Panel de detalles aparece o se actualiza
- Deselección mediante clic fuera o botón de cerrar

**Implicación Arquitectónica**: Estado de selección compartido entre componentes de mapa y lista.

## Visual States

### 1. Loading State

**Cuándo**: Durante carga inicial, refresh, o actualización de datos

**Indicadores**:
- Spinner o skeleton en áreas que se están cargando
- Deshabilitación de controles durante la carga
- Mensaje opcional: "Cargando datos..."
- No bloquear completamente la interfaz si es posible

**Ubicaciones**:
- Header: Indicador de sincronización
- Panel lateral: Skeleton de lista o spinner
- Mapa: Overlay sutil o indicador en esquina

### 2. Empty State

**Cuándo**: No hay datos para mostrar

**Indicadores**:
- Mensaje claro: "No hay elementos para mostrar"
- Icono ilustrativo (opcional)
- Sugerencia de acción si aplica: "Intenta ajustar los filtros"
- Mapa visible pero sin marcadores

**Ubicaciones**:
- Panel lateral: Mensaje centrado en área de lista
- Mapa: Mensaje flotante sobre el mapa

### 3. Error State

**Cuándo**: Error al cargar datos o en operaciones

**Indicadores**:
- Mensaje de error claro y específico
- Icono de error visible
- Acción sugerida: "Reintentar" o "Verificar conexión"
- No ocultar completamente la interfaz (mostrar lo que sea posible)

**Ubicaciones**:
- Header: Indicador de error de conexión
- Panel lateral: Mensaje de error en lugar de lista
- Mapa: Overlay de error si el mapa no puede cargarse

### 4. Success State

**Cuándo**: Operación completada exitosamente

**Indicadores**:
- Notificación temporal (toast) de éxito
- Feedback visual sutil (no intrusivo)
- Auto-dismiss después de unos segundos

### 5. Interactive State

**Cuándo**: Elemento interactuable (hover, focus, active)

**Indicadores**:
- Cambio de cursor apropiado (pointer, grab, etc.)
- Highlight sutil en hover
- Estado activo claramente diferenciado
- Transiciones suaves entre estados

## Accessibility Considerations

### 1. Contraste y Legibilidad

- Todos los textos deben cumplir WCAG AA mínimo (ratio 4.5:1 para texto normal)
- Elementos interactivos claramente distinguibles del fondo
- No depender únicamente del color para transmitir información

### 2. Navegación por Teclado

- Todos los elementos interactivos deben ser accesibles mediante teclado
- Orden de tabulación lógico y predecible
- Atajos de teclado para acciones frecuentes (a definir)
- Focus visible y claro

### 3. Lectores de Pantalla

- Etiquetas ARIA apropiadas para elementos complejos
- Textos alternativos para iconos e imágenes
- Anuncios de cambios de estado importantes
- Estructura semántica correcta (headings, landmarks)

### 4. Tamaño de Objetivos Táctiles

- Áreas de clic mínimo 44x44px (recomendación móvil)
- Espaciado adecuado entre elementos interactivos
- Consideración para dispositivos táctiles

### 5. Responsive Text

- Texto escalable sin pérdida de funcionalidad
- Tamaños de fuente legibles en diferentes resoluciones
- No usar tamaños de fuente fijos absolutos

### 6. Reducción de Movimiento

- Respetar preferencia `prefers-reduced-motion`
- Proporcionar alternativas sin animación cuando sea posible
- Animaciones opcionales, no esenciales para la funcionalidad

## Non-Goals

La interfaz explícitamente NO incluirá:

1. **Temas Múltiples**: Solo dark theme. No se implementará selector de tema claro/oscuro en la versión inicial.

2. **Personalización Avanzada**: No se permitirá personalización de colores, fuentes o layout por parte del usuario.

3. **Modo Pantalla Completa Dedicado**: Aunque el panel puede colapsarse, no habrá un modo fullscreen dedicado con controles especiales.

4. **Animaciones Complejas**: No se incluirán animaciones decorativas o efectos visuales complejos que no aporten funcionalidad.

5. **Widgets Personalizables**: Los paneles y componentes tendrán posiciones fijas, no serán arrastrables o reorganizables por el usuario.

6. **Integración con Terceros UI**: No se diseñará para integración con sistemas de diseño externos o frameworks UI específicos más allá de TailwindCSS.

7. **Modo Offline Completo**: Aunque se mostrarán estados de error, no se diseñará una experiencia offline completa con caché local.

8. **Multi-idioma en UI**: El diseño asume un solo idioma (a definir). No se diseñará para localización en la versión inicial.

## Open Questions

Preguntas pendientes de resolver antes de la implementación:

1. **Persistencia de Estado de UI**: ¿Debe persistirse el estado del panel (colapsado/expandido, ancho) entre sesiones?

2. **Límites de Ancho del Panel**: ¿Cuáles son los valores mínimos y máximos específicos para el ancho del panel lateral?

3. **Breakpoints Responsive**: ¿A partir de qué ancho de pantalla el layout debe cambiar (móvil, tablet, desktop)?

4. **Gestión de Múltiples Selecciones**: ¿Se permite selección múltiple de elementos o solo uno a la vez?

5. **Notificaciones y Alertas**: ¿Qué sistema de notificaciones se utilizará? ¿Toast, modales, o ambos?

6. **Integración con Leaflet Controls**: ¿Qué controles nativos de Leaflet se mostrarán y dónde? ¿Se personalizarán visualmente?

7. **Accesos Rápidos/Atajos de Teclado**: ¿Qué atajos de teclado son prioritarios para implementar?

8. **Estados de Carga Granulares**: ¿Se mostrarán estados de carga por sección o solo global?

9. **Feedback de Operaciones Asíncronas**: ¿Cómo se manejarán visualmente las operaciones que toman tiempo (progress bars, spinners, estimaciones)?

10. **Colores Específicos del Tema**: ¿Existe una paleta de colores específica o se utilizará la paleta por defecto de TailwindCSS dark mode?

## Referencias

- [Arquitectura General](../architecture/Architecture.md) - Tech stack y decisiones arquitectónicas
- [GlobalMap](GlobalMap.md) - Feature principal de mapas
- [Índice de Documentación](../index.md)

## Estado

- ✅ **Especificaciones**: Completado
- ⏳ **Implementación**: Pendiente de desarrollo
- ⏳ **Validación**: Pendiente de revisión de diseño

