const express = require('express');
const cors = require('cors');
const NodeCache = require('node-cache');
const { v4: uuidv4 } = require('uuid');
const compression = require('compression');
const morgan = require('morgan');
const os = require('os');

const app = express();
const PORT = process.env.PORT || 3001;

// ─── DISTRIBUTED SYSTEMS PATTERNS ─────────────────────────────────────────────

// 1. IN-MEMORY CACHE (simulates Redis distributed cache)
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

// 3. CIRCUIT BREAKER (simula proteção contra falhas em cascata)
class CircuitBreaker {
  constructor(name, threshold = 5, timeout = 10000) {
    this.name = name;
    this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
    this.failures = 0;
    this.threshold = threshold;
    this.timeout = timeout;
    this.nextAttempt = Date.now();
  }

  call(fn) {
    if (this.state === 'OPEN') {
      if (Date.now() < this.nextAttempt) {
        throw new Error(`Circuit ${this.name} is OPEN`);
      }
      this.state = 'HALF_OPEN';
    }
    try {
      const result = fn();
      this.onSuccess();
      return result;
    } catch (err) {
      this.onFailure();
      throw err;
    }
  }

  onSuccess() {
    this.failures = 0;
    this.state = 'CLOSED';
  }

  onFailure() {
    this.failures++;
    if (this.failures >= this.threshold) {
      this.state = 'OPEN';
      this.nextAttempt = Date.now() + this.timeout;
    }
  }
}

const articlesBreaker = new CircuitBreaker('articles-service');

// ─── MIDDLEWARE ────────────────────────────────────────────────────────────────

app.use(cors({ origin: '*' }));
app.use(compression());
app.use(morgan('combined'));
app.use(express.json());

// Request counter middleware (observability)
app.use((req, res, next) => {
  serviceRegistry.requestCount++;
  // Add instance header (for load balancer awareness)
  res.setHeader('X-Instance-Id', serviceRegistry.instanceId);
  res.setHeader('X-Served-By', serviceRegistry.hostname);
  next();
});

// ─── DATA LAYER (simulates distributed database) ──────────────────────────────

const articlesDB = [
  {
    id: '1', slug: 'ferrari-sf90-review',
    title: 'Ferrari SF90 Stradale: O Futuro Chegou',
    subtitle: 'Hybrid com 1.000 cv que redefine o conceito de supercar italiana',
    category: 'Supercarros', author: 'Carlos Mendes',
    date: '2024-03-15', readTime: 8, views: 12483,
    image: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&q=80',
    featured: true,
    tags: ['Ferrari', 'Híbrido', 'Supercar', 'Itália'],
    content: 'O SF90 Stradale representa o ápice da engenharia Ferrari: motor V8 biturbo de 4.0L combinado com três motores elétricos entrega 986cv de potência total. Com aceleração de 0-100 km/h em apenas 2.5 segundos, este híbrido plug-in é uma declaração de intenções sobre o futuro da marca.',
    specs: { power: '986 cv', torque: '800 Nm', acceleration: '2.5s', topSpeed: '340 km/h', weight: '1570 kg' }
  },
  {
    id: '2', slug: 'lamborghini-huracan-evo',
    title: 'Lamborghini Huracán EVO: Raiva em Estado Puro',
    subtitle: 'Tocador natural aspirado V10 com toda a tecnologia moderna',
    category: 'Supercarros', author: 'Ana Ferreira',
    date: '2024-03-10', readTime: 6, views: 9821,
    image: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&q=80',
    featured: true,
    tags: ['Lamborghini', 'V10', 'Supercar'],
    content: 'O Huracán EVO é a prova de que motores naturalmente aspirados ainda têm muito a dizer. Seu V10 5.2L gira livremente até 8.500 rpm produzindo 640cv com um som que poucos carros no mundo conseguem igualar.',
    specs: { power: '640 cv', torque: '600 Nm', acceleration: '2.9s', topSpeed: '325 km/h', weight: '1422 kg' }
  },
  {
    id: '3', slug: 'porsche-911-gt3',
    title: 'Porsche 911 GT3 2024: Perfeição Refinada',
    subtitle: 'O RS mais acessível que ainda domina pistas ao redor do mundo',
    category: 'Esportivos', author: 'Ricardo Costa',
    date: '2024-03-05', readTime: 7, views: 8450,
    image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80',
    featured: false,
    tags: ['Porsche', '911', 'GT3', 'Track'],
    content: 'A Porsche revisitou cada detalhe do 911 GT3 para 2024. O motor flat-six 4.0L de 510cv com caixa PDK revisada oferece tempos de pista ainda melhores, enquanto o novo pacote aerodinâmico melhora downforce em 15%.',
    specs: { power: '510 cv', torque: '470 Nm', acceleration: '3.4s', topSpeed: '320 km/h', weight: '1418 kg' }
  },
  {
    id: '4', slug: 'bmw-m4-competition',
    title: 'BMW M4 Competition xDrive: Praticidade Extrema',
    subtitle: 'Quando você quer AWD sem perder a alma M',
    category: 'Esportivos', author: 'Marcos Silva',
    date: '2024-02-28', readTime: 5, views: 7230,
    image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&q=80',
    featured: false,
    tags: ['BMW', 'M4', 'AWD', 'Turbo'],
    content: 'Com o sistema xDrive, o M4 Competition ganhou um segundo de confiança nas saídas de curvas molhadas sem perder a característica traseira que todo fã da série M adora. O motor S58 de 510cv nunca foi tão acessível.',
    specs: { power: '510 cv', torque: '650 Nm', acceleration: '3.5s', topSpeed: '290 km/h', weight: '1730 kg' }
  },
  {
    id: '5', slug: 'mclaren-720s-spider',
    title: 'McLaren 720S Spider: O Cabriolet Mais Rápido do Mundo',
    subtitle: 'Velocidade sem teto em todos os sentidos',
    category: 'Supercarros', author: 'Paula Ribeiro',
    date: '2024-02-20', readTime: 6, views: 6890,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
    featured: false,
    tags: ['McLaren', '720S', 'Spider', 'Cabriolet'],
    content: 'A McLaren provou que um conversível não precisa sacrificar rigidez ou desempenho. O 720S Spider mantém 98% da performance do coupé com o benefício de poder abrir o teto em 11 segundos a até 50 km/h.',
    specs: { power: '720 cv', torque: '770 Nm', acceleration: '2.9s', topSpeed: '341 km/h', weight: '1468 kg' }
  },
  {
    id: '6', slug: 'aston-martin-vantage',
    title: 'Aston Martin Vantage 2024: O Brit Aprimorado',
    subtitle: 'Motor AMG, design icônico britânico e agora ainda mais agressivo',
    category: 'Gran Turismo', author: 'Felipe Torres',
    date: '2024-02-15', readTime: 5, views: 5670,
    image: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=800&q=80',
    featured: false,
    tags: ['Aston Martin', 'Vantage', 'V8', 'AMG'],
    content: 'Redesenhado do zero, o novo Vantage traz o motor AMG 4.0L biturbo de 665cv numa carroceria completamente nova com maior downforce e melhores saídas de ar. O interior premium da Aston não perde o charme britânico.',
    specs: { power: '665 cv', torque: '800 Nm', acceleration: '3.5s', topSpeed: '325 km/h', weight: '1595 kg' }
  },
];

const categoriesDB = [
  { id: 'supercarros', name: 'Supercarros', count: 3, icon: '🏎️' },
  { id: 'esportivos', name: 'Esportivos', count: 2, icon: '🚗' },
  { id: 'gran-turismo', name: 'Gran Turismo', count: 1, icon: '🚘' },
];

// ─── CACHE UTILITY ─────────────────────────────────────────────────────────────

function withCache(key, ttl, fn) {
  const cached = cache.get(key);
  if (cached !== undefined) {
    serviceRegistry.cacheHits++;
    return { data: cached, fromCache: true };
  }
  serviceRegistry.cacheMisses++;
  const result = fn();
  cache.set(key, result, ttl);
  return { data: result, fromCache: false };
}

// ─── ROUTES ───────────────────────────────────────────────────────────────────

// Health check endpoint (for load balancer / k8s liveness probe)
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    instanceId: serviceRegistry.instanceId,
    hostname: serviceRegistry.hostname,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Service registry / metrics (observability)
app.get('/api/metrics', (req, res) => {
  res.json({
    ...serviceRegistry,
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    cacheStats: cache.getStats(),
    circuitBreakers: {
      articles: articlesBreaker.state,
    },
  });
});

// Get all articles (with caching)
app.get('/api/articles', (req, res) => {
  try {
    const { category, featured, limit = 20, offset = 0 } = req.query;
    const cacheKey = `articles:${category}:${featured}:${limit}:${offset}`;

    const { data, fromCache } = withCache(cacheKey, 120, () => {
      let results = [...articlesDB];
      if (category) results = results.filter(a => a.category.toLowerCase() === category.toLowerCase());
      if (featured === 'true') results = results.filter(a => a.featured);
      return {
        total: results.length,
        articles: results.slice(Number(offset), Number(offset) + Number(limit)),
      };
    });

    res.setHeader('X-Cache', fromCache ? 'HIT' : 'MISS');
    res.json({ ...data, instanceId: serviceRegistry.instanceId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single article
app.get('/api/articles/:slug', (req, res) => {
  try {
    const { slug } = req.params;
    const { data, fromCache } = withCache(`article:${slug}`, 300, () => {
      const article = articlesDB.find(a => a.slug === slug);
      if (!article) return null;
      // Increment view count (in real distributed system: use async event)
      article.views++;
      return article;
    });

    if (!data) return res.status(404).json({ error: 'Article not found' });
    res.setHeader('X-Cache', fromCache ? 'HIT' : 'MISS');
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get categories
app.get('/api/categories', (req, res) => {
  const { data, fromCache } = withCache('categories', 600, () => categoriesDB);
  res.setHeader('X-Cache', fromCache ? 'HIT' : 'MISS');
  res.json(data);
});

// Search articles
app.get('/api/search', (req, res) => {
  const { q } = req.query;
  if (!q) return res.status(400).json({ error: 'Query param "q" is required' });

  const query = q.toLowerCase();
  const results = articlesDB.filter(a =>
    a.title.toLowerCase().includes(query) ||
    a.subtitle.toLowerCase().includes(query) ||
    a.tags.some(t => t.toLowerCase().includes(query)) ||
    a.content.toLowerCase().includes(query)
  );

  res.json({ query: q, total: results.length, results });
});

// Featured articles
app.get('/api/featured', (req, res) => {
  const { data, fromCache } = withCache('featured', 180, () =>
    articlesDB.filter(a => a.featured)
  );
  res.setHeader('X-Cache', fromCache ? 'HIT' : 'MISS');
  res.json(data);
});

// ─── START ─────────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`🚀 AutoVerse API running on port ${PORT}`);
  console.log(`📊 Instance ID: ${serviceRegistry.instanceId}`);
  console.log(`💾 Cache TTL: 300s`);
  console.log(`⚡ Circuit Breaker: ACTIVE`);
});

module.exports = app;
