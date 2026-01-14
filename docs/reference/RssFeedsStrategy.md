# RSS Feeds Strategy

## Objetivo
Centralizar la ingesta de noticias globales mediante feeds RSS generados con Google News,
optimizados por temática, idioma y relevancia estratégica para Map-Monitor.

**Estrategia principal**: El sistema se basa en agregación semántica vía Google News RSS como fuente primaria. Los medios individuales se incluyen como fuentes complementarias para cobertura especializada y oficial.

---

## Principios
- Fuentes dinámicas (Google News RSS como primario)
- Fuentes complementarias (medios especializados y oficiales)
- Queries temáticas claras
- Idioma: inglés por defecto (escalable)
- Sin duplicados entre categorías
- Pensado para análisis, no para consumo editorial clásico

---

## Reglas Editoriales (para el sistema)
- El título se usa como clave primaria
- El medio NO es prioritario, el contenido sí
- Se permite duplicado entre categorías SOLO si el score semántico es alto
- Fecha de publicación obligatoria
- Idioma detectado automáticamente

---

## Categorías y Feeds

### 1. World
Cobertura global de eventos relevantes no estrictamente geopolíticos.

**Queries base:**
- world news
- global events
- international breaking news

**Feeds RSS:**

*Primario (Google News):*
- **Google News - World**  
  https://news.google.com/rss/search?q=world+news&hl=en-US&gl=US&ceid=US:en

*Complementarios:*
- **BBC World**  
  https://feeds.bbci.co.uk/news/world/rss.xml

- **NPR News**  
  https://feeds.npr.org/1001/rss.xml

- **Guardian World**  
  https://www.theguardian.com/world/rss

- **Reuters World**  
  https://www.reutersagency.com/feed/?taxonomy=best-sectors&post_type=best

- **The Diplomat** (Asia-Pacific)  
  https://thediplomat.com/feed/

- **Al-Monitor** (Middle East)  
  https://www.al-monitor.com/rss

---

### 2. Geopolitical
Conflictos, diplomacia, tensiones internacionales, política global dura.

**Queries base:**
- geopolitics
- international relations
- military conflict
- sanctions
- foreign policy

**Feeds RSS:**

*Primario (Google News):*
- **Google News - Geopolitics**  
  https://news.google.com/rss/search?q=geopolitics&hl=en-US&gl=US&ceid=US:en

*Complementarios:*
- **CSIS** (Defense, Geopolitics)  
  https://www.csis.org/analysis/feed

- **Brookings** (Policy, Geopolitics)  
  https://www.brookings.edu/feed/

- **CFR** (Foreign Policy)  
  https://www.cfr.org/rss.xml

- **Defense One** (Military, Defense)  
  https://www.defenseone.com/rss/all/

- **War on Rocks** (Military, Strategy)  
  https://warontherocks.com/feed/

- **Breaking Defense** (Military, Defense)  
  https://breakingdefense.com/feed/

- **The Drive War Zone** (Military)  
  https://www.thedrive.com/the-war-zone/feed

- **Bellingcat** (Investigation, OSINT)  
  https://www.bellingcat.com/feed/

- **DoD News** (Military, Official)  
  https://www.defense.gov/DesktopModules/ArticleCS/RSS.ashx?max=10&ContentType=1&Site=945

- **White House**  
  https://www.whitehouse.gov/news/feed/

- **State Dept** (Diplomacy, Official)  
  https://www.state.gov/rss-feed/press-releases/feed/

**Variantes futuras:**
- geopolitics AND energy
- geopolitics AND trade
- geopolitics AND cyber

---

### 3. Technology
Tecnología general, industria, infraestructura, grandes empresas tech.

**Queries base:**
- technology news
- big tech
- semiconductors
- cloud infrastructure

**Feeds RSS:**

*Primario (Google News):*
- **Google News - Technology**  
  https://news.google.com/rss/search?q=technology+news&hl=en-US&gl=US&ceid=US:en

*Complementarios:*
- **Hacker News**  
  https://hnrss.org/frontpage

- **Ars Technica**  
  https://feeds.arstechnica.com/arstechnica/technology-lab

- **The Verge**  
  https://www.theverge.com/rss/index.xml

- **MIT Tech Review**  
  https://www.technologyreview.com/feed/

- **CISA Alerts** (Cyber, Security)  
  https://www.cisa.gov/uscert/ncas/alerts.xml

- **Krebs Security** (Cyber, Security)  
  https://krebsonsecurity.com/feed/

---

### 4. AI
Inteligencia artificial, modelos, regulación, startups, research y producto.

**Queries base:**
- artificial intelligence
- generative AI
- LLMs
- AI regulation
- AI startups

**Feeds RSS:**

*Primario (Google News):*
- **Google News - AI**  
  https://news.google.com/rss/search?q=artificial+intelligence&hl=en-US&gl=US&ceid=US:en

*Complementarios:*
- **ArXiv AI**  
  https://rss.arxiv.org/rss/cs.AI

- **OpenAI Blog**  
  https://openai.com/news/rss.xml

**Variantes estratégicas:**
- AI AND regulation
- AI AND military
- AI AND finance

---

### 5. Finance
Mercados, macroeconomía, bancos centrales, empresas cotizadas.

**Queries base:**
- financial markets
- global economy
- stock market
- central banks

**Feeds RSS:**

*Primario (Google News):*
- **Google News - Finance**  
  https://news.google.com/rss/search?q=financial+markets&hl=en-US&gl=US&ceid=US:en

*Complementarios:*
- **CNBC**  
  https://www.cnbc.com/id/100003114/device/rss/rss.html

- **MarketWatch**  
  https://feeds.marketwatch.com/marketwatch/topstories

- **Yahoo Finance**  
  https://finance.yahoo.com/news/rssindex

- **Reuters Business**  
  https://www.reutersagency.com/feed/?best-topics=business-finance&post_type=best

- **FT**  
  https://www.ft.com/rss/home

- **Federal Reserve**  
  https://www.federalreserve.gov/feeds/press_all.xml

- **SEC Announcements**  
  https://www.sec.gov/news/pressreleases.rss

- **Treasury**  
  https://home.treasury.gov/system/files/136/treasury-rss.xml

---

## Próximas extensiones (no implementar aún)
- RSS por país (geo-fencing)
- RSS por empresa / keyword
- RSS por evento activo (conflictos, crisis)
