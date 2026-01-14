/**
 * Servicio para obtener y parsear feeds RSS.
 * Basado en docs/reference/RssFeedsStrategy.md
 * 
 * Incluye feeds primarios (Google News) y complementarios (medios individuales).
 * Usa proxy CORS público (corsproxy.io) para evitar bloqueos de CORS.
 * Maneja errores y timeouts de forma silenciosa.
 * Cache en memoria por sesión para evitar requests repetidos.
 * Elimina duplicados basándose en el título (clave primaria).
 */

import type { FeedItem, FeedCategory } from '../types/feed.types';

// Cache en memoria por sesión
const rssCache = new Map<string, FeedItem[]>();

// Timeout para requests (10 segundos)
const RSS_TIMEOUT = 10000;

// Proxy CORS público - usando corsproxy.io como alternativa más confiable
const CORS_PROXY = 'https://corsproxy.io/?';

/**
 * Convierte una URL a su versión proxificada usando corsproxy.io
 * para evitar problemas de CORS.
 * 
 * @param url - URL original del feed RSS
 * @returns URL del proxy con la URL original codificada
 */
const getProxiedUrl = (url: string): string => {
  const encodedUrl = encodeURIComponent(url);
  return `${CORS_PROXY}${encodedUrl}`;
};

/**
 * URLs de feeds RSS según RssFeedsStrategy.md
 * Incluye feeds primarios (Google News) y complementarios (medios individuales)
 */
export const RSS_FEED_URLS: Record<FeedCategory, string[]> = {
  world: [
    // Primario
    'https://news.google.com/rss/search?q=world+news&hl=en-US&gl=US&ceid=US:en',
    // Complementarios
    'https://feeds.bbci.co.uk/news/world/rss.xml',
    'https://feeds.npr.org/1001/rss.xml',
    'https://www.theguardian.com/world/rss',
    'https://www.reutersagency.com/feed/?taxonomy=best-sectors&post_type=best',
    'https://thediplomat.com/feed/',
    'https://www.al-monitor.com/rss',
  ],
  geopolitical: [
    // Primario
    'https://news.google.com/rss/search?q=geopolitics&hl=en-US&gl=US&ceid=US:en',
    // Complementarios
    'https://www.csis.org/analysis/feed',
    'https://www.brookings.edu/feed/',
    'https://www.cfr.org/rss.xml',
    'https://www.defenseone.com/rss/all/',
    'https://warontherocks.com/feed/',
    'https://breakingdefense.com/feed/',
    'https://www.thedrive.com/the-war-zone/feed',
    'https://www.bellingcat.com/feed/',
    'https://www.defense.gov/DesktopModules/ArticleCS/RSS.ashx?max=10&ContentType=1&Site=945',
    'https://www.whitehouse.gov/news/feed/',
    'https://www.state.gov/rss-feed/press-releases/feed/',
  ],
  technology: [
    // Primario
    'https://news.google.com/rss/search?q=technology+news&hl=en-US&gl=US&ceid=US:en',
    // Complementarios
    'https://hnrss.org/frontpage',
    'https://feeds.arstechnica.com/arstechnica/technology-lab',
    'https://www.theverge.com/rss/index.xml',
    'https://www.technologyreview.com/feed/',
    'https://www.cisa.gov/uscert/ncas/alerts.xml',
    'https://krebsonsecurity.com/feed/',
  ],
  ai: [
    // Primario
    'https://news.google.com/rss/search?q=artificial+intelligence&hl=en-US&gl=US&ceid=US:en',
    // Complementarios
    'https://rss.arxiv.org/rss/cs.AI',
    'https://openai.com/news/rss.xml',
  ],
  finance: [
    // Primario
    'https://news.google.com/rss/search?q=financial+markets&hl=en-US&gl=US&ceid=US:en',
    // Complementarios
    'https://www.cnbc.com/id/100003114/device/rss/rss.html',
    'https://feeds.marketwatch.com/marketwatch/topstories',
    'https://finance.yahoo.com/news/rssindex',
    'https://www.reutersagency.com/feed/?best-topics=business-finance&post_type=best',
    'https://www.ft.com/rss/home',
    'https://www.federalreserve.gov/feeds/press_all.xml',
    'https://www.sec.gov/news/pressreleases.rss',
    'https://home.treasury.gov/system/files/136/treasury-rss.xml',
  ],
};

/**
 * Extrae el nombre de la fuente desde el título del item, el link, o el feed.
 */
const extractSource = (item: Element, feedUrl?: string): string => {
  // Google News RSS incluye el source en el título como "Title - Source"
  const titleText = item.querySelector('title')?.textContent || '';
  const parts = titleText.split(' - ');
  
  if (parts.length > 1) {
    return parts[parts.length - 1].trim().toUpperCase();
  }
  
  // Intentar obtener source desde el elemento source (algunos feeds RSS lo incluyen)
  const sourceElement = item.querySelector('source');
  if (sourceElement) {
    const sourceText = sourceElement.textContent?.trim() || sourceElement.getAttribute('name');
    if (sourceText) {
      return sourceText.toUpperCase();
    }
  }
  
  // Intentar obtener desde dc:creator (Dublin Core)
  const creator = item.querySelector('dc\\:creator')?.textContent?.trim() ||
                  item.querySelector('creator')?.textContent?.trim();
  if (creator) {
    return creator.toUpperCase();
  }
  
  // Fallback: extraer dominio del link
  const linkText = extractLink(item);
  if (linkText) {
    try {
      const url = new URL(linkText);
      const hostname = url.hostname.replace('www.', '');
      // Extraer nombre del dominio (ej: "bbc.co.uk" -> "BBC")
      const domainParts = hostname.split('.');
      const domainName = domainParts.length > 1 ? domainParts[domainParts.length - 2] : domainParts[0];
      return domainName.toUpperCase();
    } catch {
      // Si falla, intentar desde feedUrl
      if (feedUrl) {
        try {
          const url = new URL(feedUrl);
          const hostname = url.hostname.replace('www.', '');
          const domainParts = hostname.split('.');
          const domainName = domainParts.length > 1 ? domainParts[domainParts.length - 2] : domainParts[0];
          return domainName.toUpperCase();
        } catch {
          return 'UNKNOWN';
        }
      }
    }
  }
  
  return 'UNKNOWN';
};

/**
 * Normaliza un título para comparación (deduplicación).
 * El título se usa como clave primaria según RssFeedsStrategy.md
 */
const normalizeTitle = (title: string): string => {
  return title.toLowerCase().trim().replace(/\s+/g, ' ').replace(/[^\w\s]/g, '');
};

/**
 * Genera un ID único para un feed item basado en su título.
 * El título se usa como clave primaria según RssFeedsStrategy.md
 */
const generateItemId = (title: string, category: FeedCategory): string => {
  // Normalizar título: lowercase, sin espacios extra, hash simple
  const normalized = title.toLowerCase().trim().replace(/\s+/g, '-');
  return `${category}-${normalized.substring(0, 50)}`;
};

/**
 * Extrae el link de un item RSS, manejando diferentes formatos.
 * Algunos feeds tienen el link como texto, otros como atributo.
 */
const extractLink = (item: Element): string | null => {
  // Intentar obtener link como texto (formato estándar)
  const linkText = item.querySelector('link')?.textContent?.trim();
  if (linkText) {
    return linkText;
  }

  // Intentar obtener link como atributo (algunos feeds usan esto)
  const linkElement = item.querySelector('link');
  if (linkElement) {
    const href = linkElement.getAttribute('href');
    if (href) {
      return href;
    }
  }

  // Intentar obtener guid como link (algunos feeds usan guid como link)
  const guid = item.querySelector('guid')?.textContent?.trim();
  if (guid && guid.startsWith('http')) {
    return guid;
  }

  return null;
};

/**
 * Parsea un item RSS XML a FeedItem
 */
const parseRssItem = (item: Element, category: FeedCategory, feedUrl?: string): FeedItem | null => {
  try {
    const title = item.querySelector('title')?.textContent?.trim();
    const link = extractLink(item);
    const pubDateText = item.querySelector('pubDate')?.textContent || 
                       item.querySelector('dc\\:date')?.textContent ||
                       item.querySelector('date')?.textContent;
    const description = item.querySelector('description')?.textContent?.trim();

    if (!title || !link) {
      return null;
    }

    const pubDate = pubDateText ? new Date(pubDateText) : new Date();
    const source = extractSource(item, feedUrl);
    const id = generateItemId(title, category);

    return {
      id,
      title,
      link,
      source,
      pubDate,
      category,
      description,
    };
  } catch (error) {
    console.warn('Error parsing RSS item:', error);
    return null;
  }
};

/**
 * Parsea XML RSS a array de FeedItem
 */
const parseRssXml = (xmlText: string, category: FeedCategory, url?: string): FeedItem[] => {
  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
    
    // Verificar errores de parseo
    const parseError = xmlDoc.querySelector('parsererror');
    if (parseError) {
      console.warn(`RSS parse error for ${url || 'unknown'}:`, parseError.textContent);
      return [];
    }

    const items = xmlDoc.querySelectorAll('item');
    const feedItems: FeedItem[] = [];

    items.forEach((item) => {
      const parsed = parseRssItem(item, category, url);
      if (parsed) {
        feedItems.push(parsed);
      }
    });

    if (url && feedItems.length > 0) {
      console.log(`✓ Parsed ${feedItems.length} items from ${url}`);
    } else if (url && feedItems.length === 0) {
      console.warn(`⚠ No items parsed from ${url}`);
    }

    return feedItems;
  } catch (error) {
    console.warn(`Error parsing RSS XML from ${url || 'unknown'}:`, error);
    return [];
  }
};

/**
 * Obtiene un feed RSS desde una URL usando proxy CORS.
 * Usa cache para evitar llamadas repetidas.
 * Maneja errores de CORS y timeouts de forma silenciosa.
 * 
 * @param url - URL del feed RSS
 * @param category - Categoría del feed
 * @returns Array de FeedItem o array vacío si hay error
 */
export const fetchRssFeed = async (
  url: string,
  category: FeedCategory
): Promise<FeedItem[]> => {
  // Verificar cache
  if (rssCache.has(url)) {
    return rssCache.get(url)!;
  }

  try {
    // Crear AbortController para timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), RSS_TIMEOUT);

    // Usar proxy CORS para evitar bloqueos
    const proxiedUrl = getProxiedUrl(url);
    
    const response = await fetch(proxiedUrl, {
      signal: controller.signal,
      mode: 'cors',
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      // Silenciar errores de feeds complementarios (comportamiento esperado)
      // Solo loguear en modo desarrollo si es necesario
      if (import.meta.env.DEV) {
        console.debug(`RSS feed failed: ${url} - Status: ${response.status}`);
      }
      return [];
    }

    // corsproxy.io devuelve directamente el contenido XML, no JSON
    const xmlText = await response.text();
    
    // Verificar que el contenido no esté vacío
    if (!xmlText || xmlText.trim().length === 0) {
      if (import.meta.env.DEV) {
        console.debug(`RSS feed proxy returned empty response: ${url}`);
      }
      return [];
    }
    const items = parseRssXml(xmlText, category, url);

    // Guardar en cache
    rssCache.set(url, items);

    return items;
  } catch (error) {
    // Manejar errores de CORS, timeout, o red
    // Silenciar errores esperados (feeds complementarios pueden fallar)
    if (error instanceof Error && import.meta.env.DEV) {
      if (error.name === 'AbortError') {
        console.debug(`RSS feed timeout: ${url}`);
      } else if (error.message.includes('CORS') || error.message.includes('Failed to fetch')) {
        console.debug(`RSS feed CORS error: ${url}`);
      } else {
        console.debug(`RSS feed error: ${url}`, error.message);
      }
    }
    
    // Retornar array vacío en lugar de lanzar excepción
    return [];
  }
};

/**
 * Elimina duplicados de items basándose en el título normalizado.
 * Mantiene el primer item encontrado (prioridad a feeds primarios).
 */
const deduplicateItems = (items: FeedItem[]): FeedItem[] => {
  const seen = new Map<string, FeedItem>();
  
  for (const item of items) {
    const normalizedTitle = normalizeTitle(item.title);
    
    // Si ya existe un item con el mismo título, mantener el primero
    if (!seen.has(normalizedTitle)) {
      seen.set(normalizedTitle, item);
    }
  }
  
  return Array.from(seen.values());
};

/**
 * Obtiene todos los feeds RSS definidos en RssFeedsStrategy.md
 * Incluye feeds primarios y complementarios, eliminando duplicados por título.
 * 
 * @returns Record con feeds por categoría
 */
export const fetchAllRssFeeds = async (): Promise<Record<FeedCategory, FeedItem[]>> => {
  const results: Record<FeedCategory, FeedItem[]> = {
    world: [],
    geopolitical: [],
    technology: [],
    ai: [],
    finance: [],
  };

  // Fetch todos los feeds en paralelo para mejor performance
  const allPromises: Promise<void>[] = [];
  
  Object.entries(RSS_FEED_URLS).forEach(([category, urls]) => {
    const feedCategory = category as FeedCategory;
    
    // Crear una promesa para cada URL de la categoría
    urls.forEach((url, index) => {
      const isPrimary = index === 0;
      const promise = fetchRssFeed(url, feedCategory).then((items) => {
        // Los items se añaden en orden: primero primarios, luego complementarios
        results[feedCategory].push(...items);
        if (items.length > 0) {
          console.log(`✓ ${isPrimary ? 'Primary' : 'Complementary'} feed ${url}: ${items.length} items`);
        } else if (isPrimary) {
          // Solo advertir si es un feed primario que falla (más crítico)
          console.warn(`⚠ Primary feed ${url}: 0 items`);
        }
        // Feeds complementarios que retornan 0 items es comportamiento esperado, no loguear
      }).catch((error) => {
        // Solo loguear errores de feeds primarios
        if (index === 0) {
          console.error(`✗ Error fetching primary feed ${url}:`, error);
        }
        // Errores de feeds complementarios son esperados, no loguear
      });
      allPromises.push(promise);
    });
  });

  // Esperar a que todos los feeds se completen
  await Promise.allSettled(allPromises);
  
  // Log resumen por categoría
  Object.entries(results).forEach(([category, items]) => {
    console.log(`📊 ${category}: ${items.length} total items (after deduplication)`);
  });

  // Eliminar duplicados por título en cada categoría
  // Mantiene el orden: primarios primero, luego complementarios
  Object.keys(results).forEach((category) => {
    const feedCategory = category as FeedCategory;
    results[feedCategory] = deduplicateItems(results[feedCategory]);
    
    // Ordenar por fecha (más recientes primero)
    results[feedCategory].sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime());
  });

  return results;
};

/**
 * Limpia el cache de feeds RSS.
 * Útil para forzar una recarga completa de todos los feeds.
 */
export const clearRssCache = (): void => {
  rssCache.clear();
};

