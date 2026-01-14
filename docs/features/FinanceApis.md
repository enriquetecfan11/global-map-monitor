# APIs Gratuitas para Datos Financieros

Guía completa de APIs gratuitas para obtener datos de mercados, criptomonedas, commodities y sectores.

---

## 1. APIs Generales de Mercados (Acciones, Índices, ETFs)

### Yahoo Finance (vía bibliotecas)

**Opción recomendada - Sin API key necesaria**

- **URL Base**: N/A (usar bibliotecas)
- **Límites**: Sin límites oficiales (usar con moderación)
- **Ventajas**: Datos completos, históricos, gratuito 100%
- **Desventajas**: No oficial, puede cambiar sin aviso

**Bibliotecas JavaScript:**
```bash
npm install yahoo-finance2
```

**Ejemplo de uso:**
```javascript
import yahooFinance from 'yahoo-finance2';

// Obtener cotización actual
const quote = await yahooFinance.quote('AAPL');
console.log(quote.regularMarketPrice, quote.regularMarketChangePercent);

// Múltiples símbolos
const quotes = await yahooFinance.quote(['AAPL', 'MSFT', 'GOOGL']);

// Datos históricos
const historical = await yahooFinance.historical('TSLA', {
  period1: '2024-01-01',
  period2: '2024-12-31'
});
```

**Datos disponibles:**
- Precio actual
- Cambio % y absoluto
- Volumen
- Máximo/mínimo del día
- Históricos (OHLC)
- Información de la empresa

## 2. APIs de Criptomonedas

### CoinGecko (RECOMENDADA)

**URL**: https://www.coingecko.com/en/api

- **API Key**: No requerida para plan gratuito
- **Límites**: 10-30 requests/minuto (sin API key)
- **Ventajas**: Muy completa, sin registro necesario
- **Desventajas**: Rate limit puede ser bajo en picos

**Endpoints útiles:**

```javascript
// Precios simples con cambio 24h
const url = 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana,cardano,polkadot&vs_currencies=usd&include_24hr_change=true&include_market_cap=true';

// Respuesta:
{
  "bitcoin": {
    "usd": 43250,
    "usd_24h_change": 2.5,
    "usd_market_cap": 845000000000
  },
  "ethereum": { ... }
}

// Top 100 criptomonedas por market cap
const top100 = 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1';

// Datos históricos
const history = 'https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=30';

// Información detallada de una cripto
const details = 'https://api.coingecko.com/api/v3/coins/bitcoin';
```

-

## 3. APIs de Commodities (Oro, Plata, Petróleo)

### FreeForexAPI (incluye metales)

**URL**: https://freeforexapi.com/

- **API Key**: No requerida
- **Límites**: Sin límites documentados
- **Ventajas**: Gratis, sin registro
- **Desventajas**: Menos confiable

```javascript
// Oro
const gold = 'https://freeforexapi.com/api/live?pairs=XAUUSD';

// Plata
const silver = 'https://freeforexapi.com/api/live?pairs=XAGUSD';
```

---

## 4. Índice VIX (Volatilidad)

### Yahoo Finance

El VIX está disponible en Yahoo Finance con el símbolo `^VIX`:

```javascript
// Usando yahoo-finance2
const vix = await yahooFinance.quote('^VIX');
console.log(vix.regularMarketPrice);
```
