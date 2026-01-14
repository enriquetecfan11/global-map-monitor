# News-Driven Sector Heatmap

## Descripción

Sistema de heatmap de sectores basado en análisis narrativo de noticias, que transforma el Sector Heatmap de datos hardcodeados a un sistema dinámico que refleja el impacto de noticias recientes sobre cada sector económico.

Cada sector se representa mediante un tile de color que indica la narrativa dominante (positiva, negativa o neutra) basada en la agregación de noticias de las últimas 12 horas, clasificadas por sector, sentimiento e impacto.

---

## Objetivos

- Representar el **impacto narrativo** de noticias sobre sectores económicos
- Proporcionar una vista agregada de cómo las noticias afectan cada sector
- Permitir exploración detallada de las noticias que impulsan cada score
- Mantener consistencia con el sistema de feeds RSS existente
- Generar explicaciones narrativas (no numéricas) sobre el estado de cada sector

---

## Modelo Conceptual

### Sectores

El sistema clasifica noticias en 8 sectores económicos principales:

- **Technology**: Tecnología, software, semiconductores, IA, cloud computing
- **Finance**: Banca, mercados financieros, trading, divisas, bancos centrales
- **Healthcare**: Salud, farmacéutica, dispositivos médicos, hospitales
- **Energy**: Petróleo, gas, energía renovable, nuclear, solar
- **Consumer**: Retail, consumo, marcas, comercio
- **Industrial**: Manufactura, industria, fábricas, producción
- **Materials**: Acero, cobre, commodities, minería
- **Utilities**: Servicios públicos, energía eléctrica, red eléctrica

### Clasificación de Noticias

Cada noticia se clasifica en tres dimensiones:

1. **Sector Primario**: El sector económico más relevante
2. **Sentimiento**: Positivo, negativo o neutro
3. **Impacto**: Bajo, medio o alto

Una noticia puede afectar múltiples sectores (multi-sector). Por ejemplo: "Tech stocks fall" afecta tanto a Technology como a Finance.

### Scoring Narrativo

Cada sector recibe un **sector narrative score** normalizado de -100 a +100:

- **Score positivo** (+1 a +100): Narrativa positiva dominante
- **Score negativo** (-1 a -100): Narrativa negativa dominante
- **Score neutro** (0): Sin narrativa clara o sin noticias relevantes

El score se calcula agregando el impacto ponderado de todas las noticias relevantes en las últimas 12 horas.

---

## Arquitectura

### Flujo de Datos

```mermaid
flowchart TD
    FeedStore[feedStore.ts<br/>FeedItem[]] --> Classifier[sectorClassifier.ts<br/>Clasifica por sector/sentiment/impact]
    Classifier --> Aggregator[sectorScoringService.ts<br/>Agrega por sector<br/>Calcula narrative score]
    Aggregator --> SectorStore[sectorStore.ts<br/>Estado de scores por sector]
    SectorStore --> Heatmap[SectorHeatmap.tsx<br/>Renderiza tiles con colores]
    Heatmap -->|Click| Modal[SectorDetailsModal.tsx<br/>Muestra noticias y explicación]
    
    FeedStore -.->|Eventos de país| MapStore[mapStore.ts]
    MapStore -.->|Filtra noticias<br/>por país| Classifier
```

### Componentes Principales

1. **`sectorClassifier.ts`**: Clasifica noticias por sector, sentimiento e impacto usando keyword matching
2. **`sectorScoringService.ts`**: Calcula scores narrativos por sector con agregación y normalización
3. **`sectorStore.ts`**: Store Zustand que mantiene scores y noticias por sector, se actualiza automáticamente cuando `feedStore` cambia
4. **`SectorHeatmap.tsx`**: Componente visual que renderiza tiles de sectores con colores basados en scores
5. **`SectorDetailsModal.tsx`**: Modal que muestra noticias relevantes y explicación narrativa al hacer click en un sector

---

## Modelo de Datos

### Tipos

```typescript
export type Sector = 'Technology' | 'Finance' | 'Healthcare' | 'Energy' | 
  'Consumer' | 'Industrial' | 'Materials' | 'Utilities';

export type Sentiment = 'positive' | 'negative' | 'neutral';
export type ImpactLevel = 'low' | 'medium' | 'high';

export interface SectorClassification {
  primarySector: Sector;
  subsector?: string;
  sentiment: Sentiment;
  impact: ImpactLevel;
  confidence: number; // 0-1
}

export interface SectorScore {
  sector: Sector;
  score: number; // -100 a +100 (normalizado)
  newsCount: number;
  positiveCount: number;
  negativeCount: number;
  topNews: FeedItem[]; // Top 5-10 noticias
  lastUpdate: Date;
}
```

### Relación con FeedItem

El sistema utiliza `FeedItem` del sistema de feeds RSS existente. No se extiende `FeedItem` con metadata de sector; la clasificación se calcula on-the-fly cuando es necesario.

---

## Lógica de Clasificación

### Clasificación por Sector

Se utiliza **keyword matching** sobre el título y descripción de cada noticia:

#### Technology
- Keywords: "tech", "technology", "software", "semiconductor", "chip", "ai", "artificial intelligence", "cloud", "computing", "digital", "internet", "cyber", "data", "algorithm"

#### Finance
- Keywords: "bank", "financial", "finance", "market", "trading", "stock", "currency", "fed", "federal reserve", "central bank", "economy", "inflation", "interest rate", "bond"

#### Healthcare
- Keywords: "health", "healthcare", "medical", "pharma", "pharmaceutical", "drug", "hospital", "clinic", "treatment", "medicine", "patient", "disease"

#### Energy
- Keywords: "oil", "gas", "energy", "renewable", "solar", "wind", "nuclear", "power", "electricity", "fuel", "petroleum", "crude", "energy sector"

#### Consumer
- Keywords: "retail", "consumer", "shopping", "brand", "store", "sales", "consumer goods", "marketplace", "e-commerce"

#### Industrial
- Keywords: "manufacturing", "industrial", "factory", "production", "manufacturing", "industrial sector", "factory", "plant"

#### Materials
- Keywords: "steel", "copper", "commodity", "mining", "metal", "raw materials", "commodities", "mineral"

#### Utilities
- Keywords: "utility", "utilities", "power", "electricity", "grid", "energy grid", "public utility", "power plant"

### Clasificación de Sentimiento

#### Positivos
Keywords: "growth", "surge", "gain", "rise", "boost", "breakthrough", "success", "profit", "increase", "up", "positive", "expansion", "recovery", "improvement"

#### Negativos
Keywords: "decline", "fall", "crash", "crisis", "loss", "breach", "attack", "failure", "decrease", "down", "negative", "recession", "collapse", "downturn", "drop"

#### Neutral
Por defecto si no se detectan keywords claros de sentimiento positivo o negativo.

### Clasificación de Impacto

El nivel de impacto se determina por:

1. **Alta prioridad** (`high`):
   - `isAlert === true` (noticia marcada como alerta)
   - Keywords de alta intensidad: "crisis", "crash", "breakthrough", "emergency", "critical"
   - Noticias muy recientes (< 2 horas)

2. **Media prioridad** (`medium`):
   - Noticias recientes (2-6 horas)
   - Keywords de intensidad media: "surge", "decline", "significant"

3. **Baja prioridad** (`low`):
   - Por defecto para noticias sin indicadores de alta o media prioridad
   - Noticias más antiguas (6-12 horas)

### Multi-Sector

Una noticia puede afectar múltiples sectores. Por ejemplo:
- "Tech stocks fall" → Technology + Finance
- "Oil prices surge, affecting energy sector" → Energy + Finance

El sistema clasifica la noticia para todos los sectores relevantes y cada sector recibe el impacto correspondiente.

---

## Lógica de Scoring

### Agregación por Sector

El sistema agrupa todas las noticias clasificadas por sector y calcula un score agregado.

### Ventana de Tiempo

Por defecto: **últimas 12 horas** (configurable).

Solo se consideran noticias dentro de esta ventana para el cálculo del score.

### Fórmula de Score

```
score = Σ(weighted_impact × sentiment_direction)

donde:
- weighted_impact = impact_multiplier × recency_decay
- impact_multiplier: low=1, medium=2, high=3
- recency_decay: 1.0 (< 2h), 0.8 (2-6h), 0.6 (6-12h)
- sentiment_direction: positive=+1, negative=-1, neutral=0
```

### Normalización

El score crudo se normaliza al rango **-100 a +100**:

```
normalized_score = (raw_score / max_possible_score) × 100

donde max_possible_score se calcula asumiendo todas las noticias con impacto alto y recencia máxima.
```

### Top News

Se seleccionan las top 5-10 noticias por sector basándose en:
1. Impacto (high > medium > low)
2. Recencia (más recientes primero)
3. Sentimiento (prioridad a noticias con sentimiento claro)

---

## Interacciones UX

### Heatmap Visual

El heatmap muestra 8 tiles, uno por cada sector:

- **Layout**: Grid 2x4 (responsive: 2 columnas en móvil, 4 en desktop)
- **Colores**:
  - Rojo (`bg-red-600`): Score negativo alto (-50 a -100) - Narrativa negativa dominante
  - Amarillo oscuro (`bg-yellow-500`): Score negativo bajo (-1 a -49) o neutro
  - Amarillo claro (`bg-yellow-300`): Score positivo bajo (+1 a +49) o neutro
  - Verde (`bg-green-400`): Score positivo alto (+50 a +100) - Narrativa positiva dominante
- **Contenido de Tile**:
  - Nombre del sector
  - Score visual (badge de color)
  - Hover effect: `hover:scale-105`

### Click en Sector

Al hacer click en un tile del sector:

1. Se abre `SectorDetailsModal`
2. El modal muestra:
   - **Header**: Nombre del sector + badge de score visual
   - **Explicación Narrativa**: Texto generado desde template que explica por qué el sector tiene ese score (no números, solo narrativa)
   - **Lista de Noticias**: Top 5-10 noticias con:
     - Título
     - Fuente
     - Timestamp relativo
     - Badge de sentimiento (positive/negative/neutral)
     - Badge de impacto (low/medium/high)

### Explicación Narrativa

La explicación se genera usando templates basados en:

- Score positivo/negativo
- Top 3 noticias más relevantes
- Patrones detectados (ej: "Multiple high-impact negative news items about...")

**Ejemplo de explicación**:
> "The Technology sector is experiencing significant negative narrative pressure. Multiple high-impact news items about semiconductor supply chain disruptions and cybersecurity breaches are driving concerns. Recent reports indicate ongoing challenges in the tech industry, with particular focus on infrastructure vulnerabilities."

**No se incluyen números** en la explicación; solo narrativa descriptiva.

---

## Integración con Sistema Existente

### Feed Store

El `sectorStore` se suscribe automáticamente a cambios en `feedStore`:

- Cuando `feedStore.feeds` se actualiza, `sectorStore` recalcula todos los scores
- No requiere llamadas manuales; la actualización es reactiva

### Map Events (Futuro)

Cuando se hace click en un país en el mapa:

- Filtrar noticias por país (usando `countryExtractor` existente)
- Recalcular scores de sectores solo para noticias de ese país
- Mostrar en modal o panel lateral (implementación futura)

---

## Estados y Fallbacks

### Sin Noticias

Si un sector no tiene noticias relevantes en las últimas 12 horas:
- Score: 0 (neutro)
- Color: Amarillo claro (`bg-yellow-300`)
- Modal muestra: "No recent news items for this sector"

### Carga

Durante la carga inicial o actualización:
- Mostrar skeleton o spinner en los tiles
- Deshabilitar clicks hasta que los scores estén calculados

### Errores

Si hay un error en la clasificación o scoring:
- Mostrar score neutro (0)
- Log error en consola
- No bloquear el resto del heatmap

---

## Performance

### Optimizaciones

- **Clasificación bajo demanda**: La clasificación se ejecuta solo cuando `feedStore` se actualiza, no en cada render
- **Cache de scores**: Los scores se recalculan solo cuando hay nuevas noticias o cambia la ventana de tiempo
- **Lazy calculation**: Los scores se calculan solo para sectores que tienen noticias relevantes

### Límites

- Ventana de tiempo: 12 horas (configurable)
- Top news por sector: Máximo 10 noticias
- Clasificación: Keyword matching (no NLP complejo por ahora)

---

## Extensibilidad Futura

### Mejoras Potenciales

1. **NLP Avanzado**: Reemplazar keyword matching con análisis de sentimiento más sofisticado
2. **Subsectores**: Clasificación más granular (ej: "Semiconductors" dentro de Technology)
3. **Machine Learning**: Modelo entrenado para clasificación automática
4. **Filtros Temporales**: Permitir al usuario cambiar la ventana de tiempo (6h, 12h, 24h)
5. **Comparación Temporal**: Mostrar evolución del score en el tiempo
6. **Correlaciones**: Detectar correlaciones entre sectores basadas en noticias compartidas

---

## Referencias

- **Feeds RSS**: `docs/features/NewsFeedIngestion.md`
- **Tipos de Feeds**: `src/types/feed.types.ts`
- **Store de Feeds**: `src/stores/feedStore.ts`
- **Clasificador**: `src/utils/sectorClassifier.ts`
- **Scoring Service**: `src/utils/sectorScoringService.ts`
- **Store de Sectores**: `src/stores/sectorStore.ts`
- **Componente Heatmap**: `src/components/Markets/SectorHeatmap.tsx`
- **Modal de Detalles**: `src/components/Markets/SectorDetailsModal.tsx`

