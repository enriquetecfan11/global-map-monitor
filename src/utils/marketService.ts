/**
 * Servicio para obtener datos de mercados financieros.
 * Basado en docs/features/FinanceApis.md
 * 
 * Usa múltiples fuentes:
 * - CoinGecko para criptomonedas (BTC, ETH) - funciona sin proxy, sin API key
 * - Alpha Vantage para acciones e índices - requiere API key gratuita
 * 
 * Maneja errores y timeouts de forma silenciosa.
 * Cache en memoria por sesión para evitar requests repetidos.
 */

import type { MarketItem } from '../types/market.types';

// Cache en memoria por sesión
const marketCache = new Map<string, MarketItem[]>();

// Timeout para requests (10 segundos)
const MARKET_TIMEOUT = 10000;

/**
 * Mapeo de símbolos de visualización a identificadores de APIs
 */
const SYMBOL_NAMES: Record<string, string> = {
  SPX: 'S&P 500',
  DJI: 'Dow Jones',
  IXIC: 'NASDAQ',
  AAPL: 'Apple Inc.',
  MSFT: 'Microsoft',
  GOOGL: 'Alphabet',
  NVDA: 'Nvidia',
  ASML: 'ASML Holding',
  MU: 'Micron Technology',
  AVGO: 'Broadcom',
  AMZN: 'Amazon',
  SNPS: 'Synopsys',
  SNOW: 'Snowflake',
  ALAB: 'Alpha Lab',
  IBM: 'IBM',
  PLTR: 'Palantir',
  CRM: 'Salesforce',
  BTC: 'Bitcoin',
  ETH: 'Ethereum',
};

/**
 * Símbolos a obtener (en orden de visualización)
 */
const MARKET_SYMBOLS = [
  'SPX', 'DJI', 'IXIC', 
  'AAPL', 'MSFT', 'GOOGL', 'NVDA', 'ASML', 'MU', 'AVGO', 'AMZN', 'SNPS', 'SNOW', 'ALAB', 'IBM', 'PLTR', 'CRM',
  'BTC', 'ETH'
];

/**
 * Mapeo de símbolos a IDs de CoinGecko (para criptos)
 */
const COINGECKO_IDS: Record<string, string> = {
  BTC: 'bitcoin',
  ETH: 'ethereum',
};

/**
 * Obtiene datos de criptomonedas desde CoinGecko
 */
const fetchCryptoData = async (symbols: string[]): Promise<MarketItem[]> => {
  const cryptoItems: MarketItem[] = [];
  const cryptoIds = symbols
    .map((s) => COINGECKO_IDS[s])
    .filter((id): id is string => id !== undefined);

  if (cryptoIds.length === 0) {
    return cryptoItems;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), MARKET_TIMEOUT);

    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${cryptoIds.join(',')}&vs_currencies=usd&include_24hr_change=true`;

    const response = await fetch(url, {
      signal: controller.signal,
      mode: 'cors',
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      if (import.meta.env.DEV) {
        console.debug(`CoinGecko API failed: Status ${response.status}`);
      }
      return cryptoItems;
    }

    const data: Record<string, { usd: number; usd_24h_change: number }> = await response.json();

    symbols.forEach((symbol) => {
      const coinId = COINGECKO_IDS[symbol];
      if (coinId && data[coinId]) {
        const price = data[coinId].usd;
        const changePercent = data[coinId].usd_24h_change || 0;
        const change = (price * changePercent) / 100;

        cryptoItems.push({
          symbol,
          name: SYMBOL_NAMES[symbol] || symbol,
          value: price,
          change,
          changePercent,
        });
      }
    });
  } catch (error) {
    if (error instanceof Error && import.meta.env.DEV) {
      if (error.name === 'AbortError') {
        console.debug('CoinGecko fetch timeout');
      } else {
        console.debug('CoinGecko fetch error:', error.message);
      }
    }
  }

  return cryptoItems;
};

/**
 * Obtiene datos de acciones, índices y forex desde Yahoo Finance
 * Prueba múltiples proxies CORS y endpoints para encontrar uno que funcione
 */
const fetchStockData = async (symbols: string[]): Promise<MarketItem[]> => {
  const stockItems: MarketItem[] = [];
  
  // Separar índices y acciones
  const indices = symbols.filter((s) => ['SPX', 'DJI', 'IXIC'].includes(s));
  const stocks = symbols.filter((s) => !['SPX', 'DJI', 'IXIC', 'BTC', 'ETH'].includes(s));

  const allSymbols = [...indices.map((s) => `^${s}`), ...stocks];
  const symbolsParam = allSymbols.join(',');

  // Probar múltiples proxies y endpoints
  const proxies = [
    // Proxy 1: allorigins.win
    {
      name: 'allorigins',
      getUrl: (yahooUrl: string) => `https://api.allorigins.win/get?url=${encodeURIComponent(yahooUrl)}`,
      parseResponse: async (response: Response) => {
        const data = await response.json();
        return data.contents ? JSON.parse(data.contents) : null;
      },
    },
    // Proxy 2: cors-anywhere (puede requerir activación)
    {
      name: 'cors-anywhere',
      getUrl: (yahooUrl: string) => `https://cors-anywhere.herokuapp.com/${yahooUrl}`,
      parseResponse: async (response: Response) => await response.json(),
    },
    // Proxy 3: proxy.cors.sh
    {
      name: 'cors.sh',
      getUrl: (yahooUrl: string) => `https://proxy.cors.sh/${yahooUrl}`,
      parseResponse: async (response: Response) => await response.json(),
    },
  ];

  // Intentar primero con v7/quote (más eficiente, obtiene todos en una llamada)
  const v7Endpoint = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbolsParam}`;

  for (const proxy of proxies) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), MARKET_TIMEOUT);

      const proxiedUrl = proxy.getUrl(v7Endpoint);

      const response = await fetch(proxiedUrl, {
        signal: controller.signal,
        mode: 'cors',
        headers: {
          'Accept': 'application/json',
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        continue; // Probar siguiente proxy
      }

      const data = await proxy.parseResponse(response);

      if (!data || !data.quoteResponse?.result) {
        continue;
      }

      // Procesar respuesta v7/finance/quote
      data.quoteResponse.result.forEach((quote: any) => {
        const yahooSymbol = quote.symbol;
        let displaySymbol = yahooSymbol.replace('^', '');
        
        if (!symbols.includes(displaySymbol)) {
          return;
        }

        const price = quote.regularMarketPrice;
        const change = quote.regularMarketChange ?? 0;
        const changePercent = quote.regularMarketChangePercent ?? 0;

        if (price !== null && price !== undefined) {
          stockItems.push({
            symbol: displaySymbol,
            name: SYMBOL_NAMES[displaySymbol] || displaySymbol,
            value: typeof price === 'number' ? price : parseFloat(String(price)),
            change: typeof change === 'number' ? change : parseFloat(String(change)) || 0,
            changePercent: typeof changePercent === 'number' ? changePercent : parseFloat(String(changePercent)) || 0,
          });
        }
      });

      // Si obtuvimos datos, salir del loop
      if (stockItems.length > 0) {
        // Ordenar por el orden original de symbols
        stockItems.sort((a, b) => {
          const indexA = symbols.indexOf(a.symbol);
          const indexB = symbols.indexOf(b.symbol);
          return indexA - indexB;
        });

        if (import.meta.env.DEV) {
          console.log(`✓ Yahoo Finance data fetched via ${proxy.name}: ${stockItems.length} items`);
        }
        return stockItems;
      }
    } catch (error) {
      // Continuar con siguiente proxy
      if (import.meta.env.DEV && error instanceof Error && error.name !== 'AbortError') {
        console.debug(`Failed ${proxy.name}:`, error.message);
      }
      continue;
    }
  }

  // Si v7/quote falló, intentar con v8/chart (uno por uno)
  if (stockItems.length === 0) {
    if (import.meta.env.DEV) {
      console.debug('v7/quote failed, trying v8/chart endpoint...');
    }

    for (const proxy of proxies) {
      const chartPromises = allSymbols.map(async (symbol) => {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), MARKET_TIMEOUT);

          const endpoint = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`;
          const proxiedUrl = proxy.getUrl(endpoint);

          const response = await fetch(proxiedUrl, {
            signal: controller.signal,
            mode: 'cors',
            headers: {
              'Accept': 'application/json',
            },
          });

          clearTimeout(timeoutId);

          if (!response.ok) {
            return null;
          }

          const data = await proxy.parseResponse(response);

          if (!data?.chart?.result?.[0]) {
            return null;
          }

          const result = data.chart.result[0];
          const meta = result.meta;
          const yahooSymbol = meta.symbol;
          let displaySymbol = yahooSymbol.replace('^', '');
          
          if (!symbols.includes(displaySymbol)) {
            return null;
          }

          const price = meta.regularMarketPrice;
          const previousClose = meta.previousClose;
          const change = price && previousClose ? price - previousClose : 0;
          const changePercent = previousClose && previousClose !== 0 ? (change / previousClose) * 100 : 0;

          if (price === null || price === undefined) {
            return null;
          }

          return {
            symbol: displaySymbol,
            name: SYMBOL_NAMES[displaySymbol] || displaySymbol,
            value: typeof price === 'number' ? price : parseFloat(String(price)),
            change: typeof change === 'number' ? change : parseFloat(String(change)) || 0,
            changePercent: typeof changePercent === 'number' ? changePercent : parseFloat(String(changePercent)) || 0,
          };
        } catch (error) {
          return null;
        }
      });

      const results = await Promise.allSettled(chartPromises);
      
      results.forEach((result) => {
        if (result.status === 'fulfilled' && result.value) {
          stockItems.push(result.value);
        }
      });

      if (stockItems.length > 0) {
        // Ordenar por el orden original de symbols
        stockItems.sort((a, b) => {
          const indexA = symbols.indexOf(a.symbol);
          const indexB = symbols.indexOf(b.symbol);
          return indexA - indexB;
        });

        if (import.meta.env.DEV) {
          console.log(`✓ Yahoo Finance data fetched via ${proxy.name} (v8/chart): ${stockItems.length} items`);
        }
        break; // Salir del loop de proxies
      }
    }
  }

  // Si ningún proxy funcionó, retornar array vacío
  if (import.meta.env.DEV && stockItems.length === 0) {
    console.warn('⚠ All Yahoo Finance proxies failed. Consider using a backend proxy or API key service.');
  }

  return stockItems;
};

/**
 * Obtiene datos de mercado desde múltiples fuentes.
 * Usa cache para evitar llamadas repetidas.
 * Maneja errores de forma silenciosa.
 * 
 * @returns Array de MarketItem o array vacío si hay error
 */
export const fetchMarketData = async (): Promise<MarketItem[]> => {
  // Verificar cache
  const cacheKey = 'markets';
  if (marketCache.has(cacheKey)) {
    return marketCache.get(cacheKey)!;
  }

  try {
    // Separar criptos y acciones/índices
    const cryptoSymbols = MARKET_SYMBOLS.filter((s) => ['BTC', 'ETH'].includes(s));
    const stockSymbols = MARKET_SYMBOLS.filter((s) => !['BTC', 'ETH'].includes(s));

    // Obtener datos en paralelo
    const [cryptoItems, stockItems] = await Promise.all([
      fetchCryptoData(cryptoSymbols),
      fetchStockData(stockSymbols),
    ]);

    // Combinar y ordenar por el orden original de MARKET_SYMBOLS
    const allItems = [...cryptoItems, ...stockItems];
    allItems.sort((a, b) => {
      const indexA = MARKET_SYMBOLS.indexOf(a.symbol);
      const indexB = MARKET_SYMBOLS.indexOf(b.symbol);
      return indexA - indexB;
    });

    // Guardar en cache
    marketCache.set(cacheKey, allItems);

    if (import.meta.env.DEV) {
      console.log(`✓ Market data fetched: ${allItems.length}/${MARKET_SYMBOLS.length} items`);
    }

    return allItems;
  } catch (error) {
    // Manejar errores de timeout, red, o API
    if (error instanceof Error && import.meta.env.DEV) {
      if (error.name === 'AbortError') {
        console.debug('Market data fetch timeout');
      } else {
        console.debug('Market data fetch error:', error.message);
      }
    }

    // Retornar array vacío en lugar de lanzar excepción
    return [];
  }
};
