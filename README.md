# AutoVerse — Revista Distribuída de Carros

## 🏎️ Sobre

AutoVerse é um blog/revista de carros de alta performance construído sobre premissas de **sistemas distribuídos**:

## 🏗️ Arquitetura

```
┌─────────────────────────────────────────────────┐
│                   CLIENTE (Browser)              │
└──────────────────────┬──────────────────────────┘
                       │ HTTP/REST
          ┌────────────▼────────────┐
          │   Load Balancer         │  ← Render.com CDN
          │   (Render.com Edge)     │
          └────────────┬────────────┘
                       │
          ┌────────────▼────────────┐
          │  API Gateway / Backend  │  ← Node.js + Express
          │  Instance A / B / C     │
          └─────┬───────────┬───────┘
                │           │
     ┌──────────▼──┐  ┌────▼─────────┐
     │ In-Memory   │  │  Data Layer  │
     │ Cache       │  │  (Articles   │
     │ (node-cache)│  │   DB)        │
     └─────────────┘  └─────────────┘
```

## 🔮 Premissas de Sistemas Distribuídos Implementadas

| Padrão | Implementação |
|--------|---------------|
| **Caching Distribuído** | node-cache com TTL configurável |
| **Circuit Breaker** | Classe CircuitBreaker (CLOSED/OPEN/HALF_OPEN) |
| **Health Check** | `GET /health` — usado pelo load balancer |
| **Service Registry** | Instance ID único por processo |
| **Observabilidade** | `GET /api/metrics` — uptime, cache hit rate, requests |
| **Escalabilidade** | Stateless API → horizontal scaling no Render |
| **Tolerância a falhas** | Cache-first, fallback gracioso no frontend |
| **Compressão** | `compression` middleware (gzip) |
| **Load Balancing** | Render.com distribui entre instâncias |
| **Headers de rastreio** | `X-Instance-Id`, `X-Served-By`, `X-Cache` |

## 🚀 Deploy

### Render.com (Produção)

```bash
# 1. Push para GitHub
git init && git add . && git commit -m "AutoVerse v1"
git remote add origin https://github.com/SEU_USER/autoverse.git
git push origin main

# 2. Conectar no Render.com via render.yaml
# Dashboard → New → Blueprint → Link repo
```

### Local

```bash
cd backend && npm install && node server.js
# API: http://localhost:3001
# Abrir frontend/index.html no browser
```

## 📊 Endpoints da API

| Endpoint | Descrição | Cache TTL |
|----------|-----------|-----------|
| `GET /health` | Liveness probe | — |
| `GET /api/metrics` | Observabilidade | — |
| `GET /api/articles` | Listar artigos | 120s |
| `GET /api/articles/:slug` | Artigo individual | 300s |
| `GET /api/categories` | Categorias | 600s |
| `GET /api/featured` | Destaques | 180s |
| `GET /api/search?q=` | Busca full-text | — |

## ☁️ Por que Render.com?

- **Free tier** com HTTPS automático
- **Deploy via Git** com CI/CD integrado
- **Auto-scaling** horizontal
- **Health checks** nativos
- **Edge CDN** global
- **Zero config** para Node.js e sites estáticos
