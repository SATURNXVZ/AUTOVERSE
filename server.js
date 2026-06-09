const express = require('express');
const cors = require('cors');
const NodeCache = require('node-cache');
const { v4: uuidv4 } = require('uuid');
const compression = require('compression');
const morgan = require('morgan');
const path = require('path');
const os = require('os');

const app = express();
const PORT = process.env.PORT || 3001;

// ── DISTRIBUTED SYSTEMS PATTERNS ──────────────────────────────────────────────

// 1. IN-MEMORY CACHE (simulates distributed Redis cache)
const cache = new NodeCache({ stdTTL: 300, checkperiod: 60 });

// 2. SERVICE REGISTRY (simulates service discovery)
const serviceRegistry = {
  instanceId: uuidv4(),
  hostname: os.hostname(),
  startTime: new Date().toISOString(),
  requestCount: 0,
  cacheHits: 0,
  cacheMisses: 0,
};

// 3. CIRCUIT BREAKER pattern
class CircuitBreaker {
  constructor(name, threshold = 5, timeout = 10000) {
    this.name = name;
    this.state = 'CLOSED';
    this.failures = 0;
    this.threshold = threshold;
    this.timeout = timeout;
    this.nextAttempt = Date.now();
  }
  call(fn) {
    if (this.state === 'OPEN') {
      if (Date.now() < this.nextAttempt) throw new Error(`Circuit ${this.name} is OPEN`);
      this.state = 'HALF_OPEN';
    }
    try { const r = fn(); this.onSuccess(); return r; }
    catch (e) { this.onFailure(); throw e; }
  }
  onSuccess() { this.failures = 0; this.state = 'CLOSED'; }
  onFailure() { this.failures++; if (this.failures >= this.threshold) { this.state = 'OPEN'; this.nextAttempt = Date.now() + this.timeout; } }
}

const articlesBreaker = new CircuitBreaker('articles-service');

// ── MIDDLEWARE ──────────────────────────────────────────────────────────────────
app.use(cors({ origin: '*' }));
app.use(compression());
app.use(morgan('combined'));
app.use(express.json());

app.use((req, res, next) => {
  serviceRegistry.requestCount++;
  res.setHeader('X-Instance-Id', serviceRegistry.instanceId);
  res.setHeader('X-Served-By', serviceRegistry.hostname);
  next();
});

// ── DATA ──────────────────────────────────────────────────────────────────────
const articlesDB = [
  { id:'1', slug:'ferrari-sf90-review', title:'Ferrari SF90 Stradale: O Futuro Chegou', subtitle:'Hybrid com 1.000 cv que redefine o conceito de supercar italiana', category:'Supercarros', author:'Carlos Mendes', date:'2026-05-15', readTime:8, views:12483, image:'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&q=80', featured:true, tags:['Ferrari','Híbrido','Supercar','Itália'], content:'O SF90 Stradale representa o ápice da engenharia Ferrari: motor V8 biturbo de 4.0L combinado com três motores elétricos entrega 986cv de potência total. Com aceleração de 0-100 km/h em apenas 2.5 segundos, este híbrido plug-in é uma declaração de intenções sobre o futuro da marca. O sistema de tração integral eletromagnética permite torque vetorial instantâneo em cada roda, algo impossível com mecânica convencional.', specs:{power:'986 cv',torque:'800 Nm',acceleration:'2.5s',topSpeed:'340 km/h',weight:'1570 kg'} },
  { id:'2', slug:'lamborghini-huracan-evo', title:'Lamborghini Huracán EVO: Raiva em Estado Puro', subtitle:'Tocador natural aspirado V10 com toda a tecnologia moderna', category:'Supercarros', author:'Ana Ferreira', date:'2026-05-10', readTime:6, views:9821, image:'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&q=80', featured:true, tags:['Lamborghini','V10','Supercar'], content:'O Huracán EVO é a prova de que motores naturalmente aspirados ainda têm muito a dizer. Seu V10 5.2L gira livremente até 8.500 rpm produzindo 640cv com um som que poucos carros no mundo conseguem igualar. O sistema LDVI (Lamborghini Dinamica Veicolo Integrata) coordena todos os sistemas de controle do veículo com processamento em tempo real.', specs:{power:'640 cv',torque:'600 Nm',acceleration:'2.9s',topSpeed:'325 km/h',weight:'1422 kg'} },
  { id:'3', slug:'porsche-911-gt3', title:'Porsche 911 GT3 2024: Perfeição Refinada', subtitle:'O RS mais acessível que ainda domina pistas ao redor do mundo', category:'Esportivos', author:'Ricardo Costa', date:'2026-05-05', readTime:7, views:8450, image:'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80', featured:false, tags:['Porsche','911','GT3','Track'], content:'A Porsche revisitou cada detalhe do 911 GT3 para 2024. O motor flat-six 4.0L de 510cv com caixa PDK revisada oferece tempos de pista ainda melhores. O novo pacote aerodinâmico melhora downforce em 15% sem aumentar o arrasto, resultado de centenas de horas em túnel de vento.', specs:{power:'510 cv',torque:'470 Nm',acceleration:'3.4s',topSpeed:'320 km/h',weight:'1418 kg'} },
  { id:'4', slug:'bmw-m4-competition', title:'BMW M4 Competition xDrive: Praticidade Extrema', subtitle:'Quando você quer AWD sem perder a alma M', category:'Esportivos', author:'Marcos Silva', date:'2026-05-28', readTime:5, views:7230, image:'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&q=80', featured:false, tags:['BMW','M4','AWD','Turbo'], content:'Com o sistema xDrive, o M4 Competition ganhou um segundo de confiança nas saídas de curvas molhadas sem perder a característica traseira que todo fã da série M adora. O motor S58 de 510cv nunca foi tão acessível ao público geral, com modos de condução que vão do confortável ao selvagem.', specs:{power:'510 cv',torque:'650 Nm',acceleration:'3.5s',topSpeed:'290 km/h',weight:'1730 kg'} },
  { id:'5', slug:'mclaren-720s-spider', title:'McLaren 720S Spider: O Cabriolet Mais Rápido', subtitle:'Velocidade sem teto em todos os sentidos', category:'Supercarros', author:'Paula Ribeiro', date:'2026-05-20', readTime:6, views:6890, image:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80', featured:false, tags:['McLaren','720S','Spider'], content:'A McLaren provou que um conversível não precisa sacrificar rigidez ou desempenho. O 720S Spider mantém 98% da performance do coupé com o benefício de poder abrir o teto em 11 segundos a até 50 km/h. O chassi MonoCell II-T de fibra de carbono garante rigidez torcional superior a qualquer cabriolet de massa.', specs:{power:'720 cv',torque:'770 Nm',acceleration:'2.9s',topSpeed:'341 km/h',weight:'1468 kg'} },
  { id:'6', slug:'aston-martin-vantage', title:'Aston Martin Vantage 2024: O Brit Aprimorado', subtitle:'Motor AMG, design icônico britânico e agora ainda mais agressivo', category:'Gran Turismo', author:'Felipe Torres', date:'2026-05-15', readTime:5, views:5670, image:'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=800&q=80', featured:false, tags:['Aston Martin','Vantage','V8'], content:'Redesenhado do zero, o novo Vantage traz o motor AMG 4.0L biturbo de 665cv numa carroceria completamente nova com maior downforce e melhores saídas de ar. O interior premium da Aston não perde o charme britânico, mas incorpora a mais recente tecnologia de infotainment.', specs:{power:'665 cv',torque:'800 Nm',acceleration:'3.5s',topSpeed:'325 km/h',weight:'1595 kg'} },
];

const categoriesDB = [
  { id:'supercarros', name:'Supercarros', count:3, icon:'🏎️' },
  { id:'esportivos', name:'Esportivos', count:2, icon:'🚗' },
  { id:'gran-turismo', name:'Gran Turismo', count:1, icon:'🚘' },
];

// ── CACHE UTILITY ──────────────────────────────────────────────────────────────
function withCache(key, ttl, fn) {
  const cached = cache.get(key);
  if (cached !== undefined) { serviceRegistry.cacheHits++; return { data: cached, fromCache: true }; }
  serviceRegistry.cacheMisses++;
  const result = fn();
  cache.set(key, result, ttl);
  return { data: result, fromCache: false };
}

// ── API ROUTES ─────────────────────────────────────────────────────────────────
app.get('/health', (req, res) => res.json({ status:'healthy', instanceId:serviceRegistry.instanceId, hostname:serviceRegistry.hostname, uptime:process.uptime(), timestamp:new Date().toISOString() }));

app.get('/api/metrics', (req, res) => res.json({ ...serviceRegistry, uptime:process.uptime(), memory:process.memoryUsage(), cacheStats:cache.getStats(), circuitBreakers:{articles:articlesBreaker.state} }));

app.get('/api/articles', (req, res) => {
  const { category, featured, limit=20, offset=0 } = req.query;
  const cacheKey = `articles:${category}:${featured}:${limit}:${offset}`;
  const { data, fromCache } = withCache(cacheKey, 120, () => {
    let r = [...articlesDB];
    if (category) r = r.filter(a => a.category.toLowerCase() === category.toLowerCase());
    if (featured === 'true') r = r.filter(a => a.featured);
    return { total:r.length, articles:r.slice(Number(offset), Number(offset)+Number(limit)) };
  });
  res.setHeader('X-Cache', fromCache ? 'HIT' : 'MISS');
  res.json({ ...data, instanceId:serviceRegistry.instanceId });
});

app.get('/api/articles/:slug', (req, res) => {
  const { data, fromCache } = withCache(`article:${req.params.slug}`, 300, () => {
    const a = articlesDB.find(x => x.slug === req.params.slug);
    if (a) a.views++;
    return a || null;
  });
  if (!data) return res.status(404).json({ error:'Article not found' });
  res.setHeader('X-Cache', fromCache ? 'HIT' : 'MISS');
  res.json(data);
});

app.get('/api/categories', (req, res) => {
  const { data, fromCache } = withCache('categories', 600, () => categoriesDB);
  res.setHeader('X-Cache', fromCache ? 'HIT' : 'MISS');
  res.json(data);
});

app.get('/api/search', (req, res) => {
  const { q } = req.query;
  if (!q) return res.status(400).json({ error:'Query param "q" required' });
  const query = q.toLowerCase();
  const results = articlesDB.filter(a => a.title.toLowerCase().includes(query) || a.subtitle.toLowerCase().includes(query) || a.tags.some(t => t.toLowerCase().includes(query)));
  res.json({ query:q, total:results.length, results });
});

app.get('/api/featured', (req, res) => {
  const { data, fromCache } = withCache('featured', 180, () => articlesDB.filter(a => a.featured));
  res.setHeader('X-Cache', fromCache ? 'HIT' : 'MISS');
  res.json(data);
});

// ── SERVE FRONTEND (inline HTML) ───────────────────────────────────────────────
const frontendHTML = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>AutoVerse — Revista de Carros</title>
  <style>
    :root{--bg:#0a0a0b;--surface:#111113;--surface2:#1a1a1e;--border:#2a2a30;--red:#e8192c;--red-dim:#c0152a;--gold:#f5a623;--text:#f0f0f5;--muted:#8a8a9a;--light:#d0d0da;--green:#50c878}
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    html{scroll-behavior:smooth}
    body{background:var(--bg);color:var(--text);font-family:'Segoe UI',system-ui,sans-serif;min-height:100vh}
    nav{position:fixed;top:0;left:0;right:0;z-index:100;background:rgba(10,10,11,.93);backdrop-filter:blur(12px);border-bottom:1px solid var(--border);padding:0 2rem;height:60px;display:flex;align-items:center;justify-content:space-between}
    .nav-logo{font-size:1.5rem;font-weight:900;letter-spacing:-.03em;color:var(--text);text-decoration:none}.nav-logo span{color:var(--red)}
    .nav-links{display:flex;gap:1.5rem;list-style:none}.nav-links a{color:var(--muted);text-decoration:none;font-size:.85rem;text-transform:uppercase;letter-spacing:.08em;transition:color .2s}.nav-links a:hover{color:var(--text)}
    .search-wrap{position:relative}.search-input{background:var(--surface2);border:1px solid var(--border);color:var(--text);padding:.4rem 1rem .4rem 2.2rem;border-radius:20px;font-size:.85rem;width:200px;outline:none;transition:border-color .2s,width .3s}.search-input:focus{border-color:var(--red);width:260px}.search-icon{position:absolute;left:.7rem;top:50%;transform:translateY(-50%);color:var(--muted);font-size:.8rem}
    .hero{margin-top:60px;height:85vh;min-height:500px;position:relative;display:flex;align-items:flex-end;overflow:hidden}
    .hero-bg{position:absolute;inset:0;background-size:cover;background-position:center;transition:opacity .6s;filter:brightness(.5)}
    .hero-gradient{position:absolute;inset:0;background:linear-gradient(to top,rgba(10,10,11,1) 0%,rgba(10,10,11,.3) 60%,transparent 100%)}
    .hero-content{position:relative;z-index:1;padding:3rem 4rem 4rem;max-width:700px}
    .hero-badge{display:inline-block;background:var(--red);color:#fff;font-size:.7rem;font-weight:700;text-transform:uppercase;letter-spacing:.12em;padding:.3rem .8rem;border-radius:2px;margin-bottom:1rem}
    .hero-title{font-size:clamp(2rem,5vw,3.5rem);font-weight:900;line-height:1.1;margin-bottom:.75rem}
    .hero-subtitle{color:var(--light);font-size:1.05rem;margin-bottom:1.5rem;line-height:1.5}
    .hero-meta{display:flex;gap:1.5rem;align-items:center;flex-wrap:wrap}.hero-author{color:var(--muted);font-size:.85rem}.hero-author strong{color:var(--gold)}
    .btn-read{background:var(--red);color:#fff;border:none;cursor:pointer;padding:.7rem 1.8rem;border-radius:4px;font-size:.9rem;font-weight:700;text-transform:uppercase;letter-spacing:.05em;transition:background .2s,transform .1s}.btn-read:hover{background:var(--red-dim);transform:translateY(-1px)}
    .hero-dots{position:absolute;bottom:1.5rem;right:4rem;display:flex;gap:.5rem;z-index:2}.dot{width:8px;height:8px;border-radius:50%;background:rgba(255,255,255,.3);cursor:pointer;transition:background .2s,width .2s}.dot.active{background:var(--red);width:24px;border-radius:4px}
    .section{max-width:1300px;margin:0 auto;padding:3rem 2rem}
    .section-header{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:1.5rem;border-bottom:2px solid var(--red);padding-bottom:.6rem}
    .section-title{font-size:1.1rem;font-weight:800;text-transform:uppercase;letter-spacing:.1em}
    .see-all{color:var(--red);font-size:.8rem;text-transform:uppercase;letter-spacing:.08em;cursor:pointer;text-decoration:none}
    .grid-3{display:grid;grid-template-columns:repeat(auto-fill,minmax(360px,1fr));gap:1.5rem}
    .card{background:var(--surface);border:1px solid var(--border);border-radius:8px;overflow:hidden;cursor:pointer;transition:transform .2s,box-shadow .2s}.card:hover{transform:translateY(-3px);box-shadow:0 12px 30px rgba(0,0,0,.5);border-color:var(--red)}
    .card-img-wrap{overflow:hidden;height:210px}.card-img{width:100%;height:210px;object-fit:cover;display:block;transition:transform .3s}.card:hover .card-img{transform:scale(1.03)}
    .card-body{padding:1.2rem}.card-category{font-size:.7rem;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:var(--red);margin-bottom:.5rem}
    .card-title{font-size:1.05rem;font-weight:700;line-height:1.35;margin-bottom:.5rem}.card-sub{font-size:.85rem;color:var(--muted);line-height:1.4;margin-bottom:1rem}
    .card-footer{display:flex;justify-content:space-between;align-items:center}.card-author{font-size:.75rem;color:var(--muted)}.card-author strong{color:var(--gold)}.card-read{font-size:.75rem;color:var(--muted)}
    .card-tags{display:flex;flex-wrap:wrap;gap:.4rem;margin-bottom:.75rem}.tag{background:var(--surface2);border:1px solid var(--border);color:var(--muted);font-size:.65rem;padding:.2rem .5rem;border-radius:3px;text-transform:uppercase;letter-spacing:.06em}
    .article-detail{display:none;position:fixed;inset:0;z-index:200;background:var(--bg);overflow-y:auto}.article-detail.open{display:block}
    .article-detail-inner{max-width:800px;margin:0 auto;padding:2rem;padding-top:80px}
    .back-btn{background:none;border:1px solid var(--border);color:var(--muted);padding:.5rem 1.2rem;border-radius:4px;cursor:pointer;font-size:.85rem;margin-bottom:2rem;transition:all .2s}.back-btn:hover{border-color:var(--red);color:var(--text)}
    .article-hero-img{width:100%;height:400px;object-fit:cover;border-radius:8px;margin-bottom:1.5rem}
    .article-meta{display:flex;gap:1.5rem;align-items:center;flex-wrap:wrap;margin-bottom:1rem}
    .article-title{font-size:2.2rem;font-weight:900;line-height:1.15;margin-bottom:.75rem}
    .article-subtitle{font-size:1.1rem;color:var(--light);margin-bottom:2rem;line-height:1.5}
    .article-content{font-size:1rem;line-height:1.8;color:var(--light);margin-bottom:2.5rem}
    .specs-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:1rem;background:var(--surface);border:1px solid var(--border);border-radius:8px;padding:1.5rem;margin-bottom:2rem}
    .spec-item{text-align:center}.spec-value{font-size:1.3rem;font-weight:800;color:var(--red)}.spec-label{font-size:.7rem;color:var(--muted);text-transform:uppercase;letter-spacing:.06em;margin-top:.25rem}
    .cats{display:flex;gap:.75rem;flex-wrap:wrap;margin-bottom:2rem}
    .cat-btn{background:var(--surface);border:1px solid var(--border);color:var(--muted);padding:.45rem 1.1rem;border-radius:20px;font-size:.8rem;cursor:pointer;transition:all .2s;text-transform:uppercase;letter-spacing:.06em}.cat-btn.active,.cat-btn:hover{background:var(--red);border-color:var(--red);color:#fff}
    .stats-bar{background:var(--surface2);border:1px solid var(--border);border-radius:8px;padding:1rem 2rem;display:flex;gap:2rem;flex-wrap:wrap;justify-content:space-around;margin-bottom:2rem}
    .stat{text-align:center}.stat-val{font-size:1.4rem;font-weight:800;color:var(--gold)}.stat-lbl{font-size:.7rem;color:var(--muted);text-transform:uppercase;letter-spacing:.08em}
    .dist-banner{background:var(--surface2);border:1px solid var(--border);border-top:2px solid var(--gold);border-radius:8px;padding:1rem 1.5rem;margin-bottom:2rem;display:flex;gap:2rem;flex-wrap:wrap;align-items:center;font-size:.78rem}
    .dist-item{display:flex;flex-direction:column;gap:.1rem}.dist-label{color:var(--muted);text-transform:uppercase;letter-spacing:.08em;font-size:.65rem}.dist-value{color:var(--gold);font-weight:700;font-family:monospace}
    .dist-badge{padding:.2rem .5rem;border-radius:3px;font-size:.7rem;font-weight:700;text-transform:uppercase}
    .badge-hit{background:rgba(80,200,120,.15);color:var(--green);border:1px solid rgba(80,200,120,.3)}.badge-miss{background:rgba(232,25,44,.15);color:var(--red);border:1px solid rgba(232,25,44,.3)}.badge-closed{background:rgba(80,200,120,.15);color:var(--green);border:1px solid rgba(80,200,120,.3)}
    .skeleton{background:linear-gradient(90deg,var(--surface) 25%,var(--surface2) 50%,var(--surface) 75%);background-size:200% 100%;animation:shimmer 1.5s infinite;border-radius:6px}
    @keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
    .skeleton-card{height:340px;border-radius:8px}
    .search-results{position:fixed;top:60px;right:2rem;z-index:150;background:var(--surface);border:1px solid var(--border);border-radius:8px;width:340px;box-shadow:0 8px 24px rgba(0,0,0,.5);padding:.75rem;display:none}.search-results.open{display:block}
    .search-result-item{padding:.6rem .75rem;border-radius:4px;cursor:pointer;transition:background .15s}.search-result-item:hover{background:var(--surface2)}
    .sri-title{font-size:.88rem;font-weight:600;margin-bottom:.15rem}.sri-cat{font-size:.7rem;color:var(--red);text-transform:uppercase;letter-spacing:.06em}
    footer{background:var(--surface);border-top:1px solid var(--border);padding:2rem;text-align:center;color:var(--muted);font-size:.8rem;margin-top:4rem}
    footer strong{color:var(--gold)}
    @media(max-width:768px){.hero-content{padding:2rem 1.5rem 3rem}.specs-grid{grid-template-columns:repeat(3,1fr)}.nav-links{display:none}.search-input{width:140px}.grid-3{grid-template-columns:1fr}}
  </style>
</head>
<body>
<nav>
  <a class="nav-logo" href="#"><span>Auto</span>Verse</a>
  <ul class="nav-links">
    <li><a href="#">Supercarros</a></li><li><a href="#">Esportivos</a></li><li><a href="#">Gran Turismo</a></li>
  </ul>
  <div class="search-wrap">
    <span class="search-icon">🔍</span>
    <input class="search-input" id="searchInput" type="text" placeholder="Buscar carros..." autocomplete="off"/>
    <div class="search-results" id="searchResults"></div>
  </div>
</nav>
<div class="hero" id="hero">
  <div class="hero-bg" id="heroBg"></div>
  <div class="hero-gradient"></div>
  <div class="hero-content">
    <span class="hero-badge">Em Destaque</span>
    <h1 class="hero-title" id="heroTitle">Carregando...</h1>
    <p class="hero-subtitle" id="heroSubtitle"></p>
    <div class="hero-meta">
      <span class="hero-author" id="heroAuthor"></span>
      <button class="btn-read" id="heroBtn">Ler Artigo →</button>
    </div>
  </div>
  <div class="hero-dots" id="heroDots"></div>
</div>
<div class="article-detail" id="articleDetail">
  <div class="article-detail-inner">
    <button class="back-btn" id="backBtn">← Voltar</button>
    <img src="" alt="" class="article-hero-img" id="detailImg"/>
    <div class="article-meta">
      <span class="hero-badge" id="detailCat"></span>
      <span class="hero-author" id="detailAuthor"></span>
    </div>
    <h1 class="article-title" id="detailTitle"></h1>
    <p class="article-subtitle" id="detailSubtitle"></p>
    <div class="specs-grid" id="detailSpecs"></div>
    <p class="article-content" id="detailContent"></p>
    <div class="card-tags" id="detailTags"></div>
  </div>
</div>
<main>
  <div class="section">
    <div class="dist-banner" id="distBanner">
      <div class="dist-item"><span class="dist-label">Instance ID</span><span class="dist-value" id="dInstanceId">—</span></div>
      <div class="dist-item"><span class="dist-label">Host</span><span class="dist-value" id="dHost">—</span></div>
      <div class="dist-item"><span class="dist-label">Cache Status</span><span class="dist-value" id="dCache">—</span></div>
      <div class="dist-item"><span class="dist-label">Circuit Breaker</span><span class="dist-value" id="dCircuit">—</span></div>
      <div class="dist-item"><span class="dist-label">Requests</span><span class="dist-value" id="dRequests">—</span></div>
      <div class="dist-item"><span class="dist-label">Uptime</span><span class="dist-value" id="dUptime">—</span></div>
    </div>
    <div class="cats" id="catsBar"><button class="cat-btn active" data-cat="">Todos</button></div>
    <div class="section-header"><span class="section-title">Últimas Matérias</span><a class="see-all" href="#">Ver todos →</a></div>
    <div class="stats-bar" id="statsBar"></div>
    <div class="grid-3" id="articlesGrid">
      <div class="skeleton skeleton-card"></div><div class="skeleton skeleton-card"></div><div class="skeleton skeleton-card"></div>
    </div>
  </div>
</main>
<footer>
  <p><strong>AutoVerse</strong> — Revista distribuída de carros de alta performance</p>
  <p style="margin-top:.5rem">Arquitetura: API REST · Cache distribuído · Circuit Breaker · Health Check · Service Registry</p>
  <p style="margin-top:.5rem">Nuvem: <strong>Render.com</strong></p>
</footer>
<script>
const API_BASE = '';
let featured=[],heroIdx=0,heroTimer,lastCacheStatus='MISS';
async function apiFetch(path){const res=await fetch(API_BASE+path);const h=res.headers.get('X-Cache');if(h)lastCacheStatus=h;return res.json();}
function timeAgo(d){const diff=(Date.now()-new Date(d))/1000;if(diff<3600)return Math.floor(diff/60)+'min atrás';if(diff<86400)return Math.floor(diff/3600)+'h atrás';return Math.floor(diff/86400)+'d atrás';}
function formatUptime(s){return Math.floor(s/3600)+'h '+Math.floor((s%3600)/60)+'m';}
function renderHero(a){document.getElementById('heroBg').style.backgroundImage=\`url(\${a.image})\`;document.getElementById('heroTitle').textContent=a.title;document.getElementById('heroSubtitle').textContent=a.subtitle;document.getElementById('heroAuthor').innerHTML=\`Por <strong>\${a.author}</strong> · \${timeAgo(a.date)}\`;document.getElementById('heroBtn').onclick=()=>openArticle(a);}
function buildHeroDots(){const d=document.getElementById('heroDots');d.innerHTML=featured.map((_,i)=>\`<div class="dot \${i===0?'active':''}" data-i="\${i}"></div>\`).join('');d.querySelectorAll('.dot').forEach(x=>x.onclick=()=>jumpHero(+x.dataset.i));}
function jumpHero(i){heroIdx=i;renderHero(featured[i]);document.querySelectorAll('.dot').forEach((d,j)=>d.classList.toggle('active',j===i));resetHeroTimer();}
function resetHeroTimer(){clearInterval(heroTimer);heroTimer=setInterval(()=>jumpHero((heroIdx+1)%featured.length),6000);}
function renderCard(a){return \`<div class="card" onclick='openArticle(\${JSON.stringify(a)})'><div class="card-img-wrap"><img class="card-img" src="\${a.image}" alt="\${a.title}" loading="lazy"/></div><div class="card-body"><div class="card-category">\${a.category}</div><h3 class="card-title">\${a.title}</h3><p class="card-sub">\${a.subtitle}</p><div class="card-tags">\${a.tags.map(t=>\`<span class="tag">\${t}</span>\`).join('')}</div><div class="card-footer"><span class="card-author">Por <strong>\${a.author}</strong></span><span class="card-read">📖 \${a.readTime} min · 👁 \${a.views.toLocaleString()}</span></div></div></div>\`;}
function renderGrid(articles){document.getElementById('articlesGrid').innerHTML=articles.length?articles.map(renderCard).join(''):'<p style="color:var(--muted)">Nenhum artigo encontrado.</p>';}
function openArticle(a){document.getElementById('detailImg').src=a.image;document.getElementById('detailImg').alt=a.title;document.getElementById('detailCat').textContent=a.category;document.getElementById('detailAuthor').innerHTML=\`Por <strong>\${a.author}</strong> · \${timeAgo(a.date)} · \${a.readTime} min\`;document.getElementById('detailTitle').textContent=a.title;document.getElementById('detailSubtitle').textContent=a.subtitle;document.getElementById('detailContent').textContent=a.content;document.getElementById('detailTags').innerHTML=a.tags.map(t=>\`<span class="tag">\${t}</span>\`).join('');const labels={power:'Potência',torque:'Torque',acceleration:'0-100',topSpeed:'Vel. Máx.',weight:'Peso'};document.getElementById('detailSpecs').innerHTML=a.specs?Object.entries(a.specs).map(([k,v])=>\`<div class="spec-item"><div class="spec-value">\${v}</div><div class="spec-label">\${labels[k]||k}</div></div>\`).join(''):'';const det=document.getElementById('articleDetail');det.classList.add('open');det.scrollTop=0;}
document.getElementById('backBtn').onclick=()=>document.getElementById('articleDetail').classList.remove('open');
async function refreshMetrics(){try{const m=await fetch('/api/metrics').then(r=>r.json());document.getElementById('dInstanceId').textContent=(m.instanceId||'').slice(0,8)+'...';document.getElementById('dHost').textContent=m.hostname;const hit=m.cacheHits,miss=m.cacheMisses,total=hit+miss,ratio=total?((hit/total)*100).toFixed(0):'0';document.getElementById('dCache').innerHTML=\`<span class="dist-badge \${lastCacheStatus==='HIT'?'badge-hit':'badge-miss'}">\${lastCacheStatus}</span> \${ratio}% hit rate\`;document.getElementById('dCircuit').innerHTML=\`<span class="dist-badge badge-closed">\${(m.circuitBreakers&&m.circuitBreakers.articles)||'CLOSED'}</span>\`;document.getElementById('dRequests').textContent=(m.requestCount||0).toLocaleString();document.getElementById('dUptime').textContent=formatUptime(m.uptime||0);}catch(e){}}
async function loadCategories(){try{const cats=await apiFetch('/api/categories');const bar=document.getElementById('catsBar');bar.innerHTML=\`<button class="cat-btn active" data-cat="">Todos</button>\`+cats.map(c=>\`<button class="cat-btn" data-cat="\${c.name}">\${c.icon} \${c.name}</button>\`).join('');bar.querySelectorAll('.cat-btn').forEach(btn=>btn.onclick=()=>{bar.querySelectorAll('.cat-btn').forEach(b=>b.classList.remove('active'));btn.classList.add('active');loadArticles(btn.dataset.cat);});}catch(e){}}
function renderStats(articles){const tv=articles.reduce((s,a)=>s+a.views,0),ar=articles.reduce((s,a)=>s+a.readTime,0)/articles.length;document.getElementById('statsBar').innerHTML=\`<div class="stat"><div class="stat-val">\${articles.length}</div><div class="stat-lbl">Artigos</div></div><div class="stat"><div class="stat-val">\${tv.toLocaleString()}</div><div class="stat-lbl">Visualizações</div></div><div class="stat"><div class="stat-val">\${ar.toFixed(1)} min</div><div class="stat-lbl">Leitura Média</div></div><div class="stat"><div class="stat-val">3</div><div class="stat-lbl">Categorias</div></div>\`;}
async function loadArticles(category=''){document.getElementById('articlesGrid').innerHTML=[1,2,3].map(()=>'<div class="skeleton skeleton-card"></div>').join('');try{const path=category?\`/api/articles?category=\${encodeURIComponent(category)}\`:'/api/articles';const data=await apiFetch(path);const articles=data.articles||data;renderGrid(articles);renderStats(articles);}catch(e){document.getElementById('articlesGrid').innerHTML='<p style="color:var(--muted)">Erro ao carregar.</p>';}}
let sd;document.getElementById('searchInput').addEventListener('input',function(){clearTimeout(sd);const q=this.value.trim();if(!q){document.getElementById('searchResults').classList.remove('open');return;}sd=setTimeout(async()=>{try{const data=await apiFetch('/api/search?q='+encodeURIComponent(q));const box=document.getElementById('searchResults');box.innerHTML=!data.results?.length?'<div style="padding:.75rem;color:var(--muted);font-size:.85rem">Nenhum resultado.</div>':data.results.map(a=>\`<div class="search-result-item" onclick='openArticle(\${JSON.stringify(a)})'><div class="sri-title">\${a.title}</div><div class="sri-cat">\${a.category}</div></div>\`).join('');box.classList.add('open');}catch(e){}},300);});
document.addEventListener('click',e=>{if(!e.target.closest('.search-wrap'))document.getElementById('searchResults').classList.remove('open');});
async function init(){try{featured=await apiFetch('/api/featured');if(featured.length){renderHero(featured[0]);buildHeroDots();resetHeroTimer();}}catch(e){}await Promise.all([loadCategories(),loadArticles()]);await refreshMetrics();setInterval(refreshMetrics,15000);}
init();
</script>
</body>
</html>`;

app.get('/', (req, res) => res.send(frontendHTML));
app.get('/index.html', (req, res) => res.send(frontendHTML));

app.listen(PORT, () => {
  console.log(`🚀 AutoVerse running on port ${PORT}`);
  console.log(`📊 Instance: ${serviceRegistry.instanceId}`);
});

module.exports = app;
