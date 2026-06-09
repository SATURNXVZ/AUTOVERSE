const pptxgen = require("pptxgenjs");

const pres = new pptxgen();
pres.layout = 'LAYOUT_16x9';
pres.title = 'AutoVerse — Sistemas Distribuídos';

// ── COLORS ─────────────────────────────────────────────────────────────────
const C = {
  bg:       '0a0a0b',
  surface:  '111113',
  surface2: '1a1a1e',
  border:   '2a2a30',
  red:      'e8192c',
  gold:     'f5a623',
  white:    'f0f0f5',
  muted:    '8a8a9a',
  light:    'd0d0da',
  green:    '50c878',
};

const makeShadow = () => ({ type: "outer", color: "000000", blur: 8, offset: 3, angle: 45, opacity: 0.25 });

// ═══════════════════════════════════════════════════════════════════════════
// SLIDE 1 — ARQUITETURA & PREMISSAS DE SISTEMAS DISTRIBUÍDOS
// ═══════════════════════════════════════════════════════════════════════════
const s1 = pres.addSlide();
s1.background = { color: C.bg };

// Top label
s1.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.08, fill: { color: C.red }, line: { color: C.red, width: 0 } });

// Slide number
s1.addText('01 / 03', { x: 8.8, y: 0.2, w: 1.0, h: 0.3, fontSize: 9, color: C.muted, fontFace: 'Calibri', align: 'right' });

// Title area
s1.addText('Arquitetura & Premissas', {
  x: 0.5, y: 0.2, w: 7, h: 0.55,
  fontSize: 28, fontFace: 'Cambria', bold: true, color: C.white,
});
s1.addText('AutoVerse — Revista Distribuída de Carros', {
  x: 0.5, y: 0.72, w: 7, h: 0.35,
  fontSize: 13, fontFace: 'Calibri', color: C.gold, italic: true,
});

// ── Architecture Diagram (LEFT) ─────────────────────────────────────────────
const boxW = 2.1, boxH = 0.52;

// Browser
s1.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.4, y: 1.25, w: boxW, h: boxH, fill: { color: C.surface2 }, line: { color: C.red, width: 1.5 }, rectRadius: 0.05, shadow: makeShadow() });
s1.addText('🌐  Cliente (Browser)', { x: 0.4, y: 1.25, w: boxW, h: boxH, fontSize: 9, fontFace: 'Calibri', color: C.white, bold: true, align: 'center', valign: 'middle', margin: 0 });

// Arrow 1
s1.addShape(pres.shapes.LINE, { x: 1.45, y: 1.77, w: 0, h: 0.3, line: { color: C.muted, width: 1.2 } });
s1.addText('HTTP/REST', { x: 0.55, y: 1.82, w: 1.8, h: 0.22, fontSize: 7, fontFace: 'Calibri', color: C.muted, align: 'center' });

// CDN / Load Balancer
s1.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.4, y: 2.07, w: boxW, h: boxH, fill: { color: C.surface2 }, line: { color: C.gold, width: 1.5 }, rectRadius: 0.05, shadow: makeShadow() });
s1.addText('⚡  CDN / Load Balancer\nRender Edge Network', { x: 0.4, y: 2.07, w: boxW, h: boxH, fontSize: 8, fontFace: 'Calibri', color: C.white, bold: true, align: 'center', valign: 'middle', margin: 0 });

// Arrow 2
s1.addShape(pres.shapes.LINE, { x: 1.45, y: 2.59, w: 0, h: 0.28, line: { color: C.muted, width: 1.2 } });

// API Backend
s1.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.4, y: 2.87, w: boxW, h: boxH, fill: { color: C.surface2 }, line: { color: C.red, width: 1.5 }, rectRadius: 0.05, shadow: makeShadow() });
s1.addText('🚀  API Backend\nNode.js + Express', { x: 0.4, y: 2.87, w: boxW, h: boxH, fontSize: 8, fontFace: 'Calibri', color: C.white, bold: true, align: 'center', valign: 'middle', margin: 0 });

// Fork lines
s1.addShape(pres.shapes.LINE, { x: 1.45, y: 3.39, w: 0, h: 0.2, line: { color: C.muted, width: 1 } });
s1.addShape(pres.shapes.LINE, { x: 0.75, y: 3.59, w: 1.4, h: 0, line: { color: C.muted, width: 1 } });
s1.addShape(pres.shapes.LINE, { x: 0.75, y: 3.59, w: 0, h: 0.25, line: { color: C.muted, width: 1 } });
s1.addShape(pres.shapes.LINE, { x: 2.15, y: 3.59, w: 0, h: 0.25, line: { color: C.muted, width: 1 } });

// Cache
s1.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.25, y: 3.84, w: 0.95, h: 0.52, fill: { color: C.surface2 }, line: { color: C.green, width: 1.5 }, rectRadius: 0.05, shadow: makeShadow() });
s1.addText('💾\nCache\n(TTL)', { x: 0.25, y: 3.84, w: 0.95, h: 0.52, fontSize: 7, fontFace: 'Calibri', color: C.green, bold: true, align: 'center', valign: 'middle', margin: 0 });

// Data
s1.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 1.7, y: 3.84, w: 0.95, h: 0.52, fill: { color: C.surface2 }, line: { color: C.gold, width: 1.5 }, rectRadius: 0.05, shadow: makeShadow() });
s1.addText('🗄️\nData\nLayer', { x: 1.7, y: 3.84, w: 0.95, h: 0.52, fontSize: 7, fontFace: 'Calibri', color: C.gold, bold: true, align: 'center', valign: 'middle', margin: 0 });

// ── Distributed Patterns (CENTER + RIGHT) ─────────────────────────────────
const patterns = [
  { icon: '🔄', title: 'Circuit Breaker', desc: 'CLOSED → OPEN → HALF_OPEN\nprotege contra falhas em cascata', col: C.red },
  { icon: '💾', title: 'Distributed Cache', desc: 'node-cache com TTL configurável\nreduz latência e carga no DB', col: C.green },
  { icon: '📊', title: 'Observabilidade', desc: '/api/metrics: uptime, hit rate,\ninstance ID, circuit state', col: C.gold },
  { icon: '❤️', title: 'Health Check', desc: '/health para liveness probe\nnativo no Render.com', col: C.red },
  { icon: '🌍', title: 'Service Registry', desc: 'UUID único por instância\nheaders X-Instance-Id, X-Served-By', col: C.gold },
  { icon: '⚡', title: 'Escalabilidade', desc: 'API stateless → scale-out\nhorizontal automático', col: C.green },
];

const cols = [2.75, 6.45];
const rows = [1.15, 2.62, 4.05];
let pi = 0;
for (let r = 0; r < 3; r++) {
  for (let c = 0; c < 2; c++) {
    const p = patterns[pi++];
    const x = cols[c], y = rows[r], w = 3.45, h = 1.25;
    s1.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, fill: { color: C.surface }, line: { color: C.border, width: 1 }, rectRadius: 0.06, shadow: makeShadow() });
    // icon circle
    s1.addShape(pres.shapes.OVAL, { x: x + 0.15, y: y + 0.35, w: 0.52, h: 0.52, fill: { color: p.col, transparency: 80 }, line: { color: p.col, width: 1 } });
    s1.addText(p.icon, { x: x + 0.15, y: y + 0.35, w: 0.52, h: 0.52, fontSize: 15, align: 'center', valign: 'middle', margin: 0 });
    s1.addText(p.title, { x: x + 0.75, y: y + 0.12, w: 2.55, h: 0.35, fontSize: 11, fontFace: 'Calibri', bold: true, color: C.white, margin: 0 });
    s1.addText(p.desc, { x: x + 0.75, y: y + 0.47, w: 2.55, h: 0.65, fontSize: 8.5, fontFace: 'Calibri', color: C.light, margin: 0 });
  }
}

// Bottom tag
s1.addText('Tecnologias: Node.js · Express · node-cache · UUID · compression · morgan', {
  x: 0.4, y: 5.3, w: 9.2, h: 0.25,
  fontSize: 8.5, fontFace: 'Calibri', color: C.muted, align: 'center',
});


// ═══════════════════════════════════════════════════════════════════════════
// SLIDE 2 — ESCOLHA DA NUVEM
// ═══════════════════════════════════════════════════════════════════════════
const s2 = pres.addSlide();
s2.background = { color: C.bg };

s2.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.08, fill: { color: C.gold }, line: { color: C.gold, width: 0 } });
s2.addText('02 / 03', { x: 8.8, y: 0.2, w: 1.0, h: 0.3, fontSize: 9, color: C.muted, fontFace: 'Calibri', align: 'right' });

s2.addText('Escolha da Nuvem', { x: 0.5, y: 0.2, w: 7, h: 0.55, fontSize: 28, fontFace: 'Cambria', bold: true, color: C.white });
s2.addText('Fundamentação técnica e estratégica para seleção do provedor', { x: 0.5, y: 0.72, w: 8, h: 0.35, fontSize: 13, fontFace: 'Calibri', color: C.gold, italic: true });

// ── Render.com Hero Card ──────────────────────────────────────────────────
s2.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.4, y: 1.1, w: 4.0, h: 3.5, fill: { color: C.surface }, line: { color: C.gold, width: 2 }, rectRadius: 0.1, shadow: makeShadow() });
s2.addText('☁️', { x: 0.4, y: 1.25, w: 4.0, h: 0.9, fontSize: 44, align: 'center', valign: 'middle' });
s2.addText('Render.com', { x: 0.4, y: 2.1, w: 4.0, h: 0.45, fontSize: 22, fontFace: 'Cambria', bold: true, color: C.gold, align: 'center' });
s2.addText('Platform-as-a-Service', { x: 0.4, y: 2.5, w: 4.0, h: 0.3, fontSize: 11, fontFace: 'Calibri', color: C.muted, align: 'center' });

const renderFeatures = [
  '✅  Deploy automático via GitHub',
  '✅  HTTPS + domínio gratuito',
  '✅  Health checks nativos',
  '✅  Auto-scaling horizontal',
  '✅  CDN Edge global',
  '✅  Zero-downtime deploys',
];
s2.addText(renderFeatures.map(f => ({ text: f + '\n', options: { breakLine: false } })).map(f => f.text).join(''), {
  x: 0.6, y: 2.85, w: 3.6, h: 1.6, fontSize: 9, fontFace: 'Calibri', color: C.light,
});

// ── Comparison Table ──────────────────────────────────────────────────────
const tableHeaders = [
  [
    { text: 'Critério', options: { bold: true, color: C.white, fill: { color: C.surface2 }, fontSize: 9, fontFace: 'Calibri', align: 'center' } },
    { text: 'Render.com', options: { bold: true, color: C.gold, fill: { color: C.surface2 }, fontSize: 9, fontFace: 'Calibri', align: 'center' } },
    { text: 'Heroku', options: { bold: true, color: C.muted, fill: { color: C.surface2 }, fontSize: 9, fontFace: 'Calibri', align: 'center' } },
    { text: 'AWS EC2', options: { bold: true, color: C.muted, fill: { color: C.surface2 }, fontSize: 9, fontFace: 'Calibri', align: 'center' } },
    { text: 'Vercel', options: { bold: true, color: C.muted, fill: { color: C.surface2 }, fontSize: 9, fontFace: 'Calibri', align: 'center' } },
  ]
];

const tableRows = [
  ['Free Tier', '✅ Sim', '❌ Encerrado', '⚠️ Limitado', '⚠️ Só frontend'],
  ['Node.js nativo', '✅ Sim', '✅ Sim', '✅ Sim', '⚠️ Serverless'],
  ['Health Checks', '✅ Nativo', '✅ Sim', '⚠️ Manual', '❌ Não'],
  ['Auto Scaling', '✅ Sim', '✅ Sim', '✅ Avançado', '✅ Automático'],
  ['Deploy via Git', '✅ Sim', '✅ Sim', '⚠️ Complexo', '✅ Sim'],
  ['Facilidade', '⭐⭐⭐⭐⭐', '⭐⭐⭐⭐', '⭐⭐', '⭐⭐⭐⭐'],
];

const mkCell = (text, isFirst) => ({
  text,
  options: {
    fontSize: 8.5, fontFace: 'Calibri',
    color: isFirst ? C.gold : (text.startsWith('✅') ? C.green : text.startsWith('❌') ? C.red : C.light),
    fill: { color: C.surface },
    border: { pt: 0.5, color: C.border },
    align: 'center', valign: 'middle',
  }
});

const tableData = [
  tableHeaders[0],
  ...tableRows.map(row => row.map((cell, i) => mkCell(cell, i === 0))),
];

s2.addTable(tableData, {
  x: 4.75, y: 1.1, w: 4.8, h: 3.4,
  rowH: 0.44,
  border: { pt: 0.5, color: C.border },
});

// Bottom note
s2.addText(
  '🏆  Render.com selecionado por combinar simplicidade de deploy, suporte nativo a Node.js, health checks automáticos e tier gratuito com HTTPS — ideal para demonstrar sistemas distribuídos em ambiente de produção real.',
  {
    x: 0.4, y: 4.72, w: 9.2, h: 0.75,
    fontSize: 9.5, fontFace: 'Calibri', color: C.light, align: 'left',
    fill: { color: C.surface2 },
    margin: [6, 10, 6, 10],
    shape: pres.shapes.ROUNDED_RECTANGLE,
  }
);


// ═══════════════════════════════════════════════════════════════════════════
// SLIDE 3 — BENEFÍCIOS DA SOLUÇÃO
// ═══════════════════════════════════════════════════════════════════════════
const s3 = pres.addSlide();
s3.background = { color: C.bg };

s3.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.08, fill: { color: C.green }, line: { color: C.green, width: 0 } });
s3.addText('03 / 03', { x: 8.8, y: 0.2, w: 1.0, h: 0.3, fontSize: 9, color: C.muted, fontFace: 'Calibri', align: 'right' });

s3.addText('Benefícios da Solução', { x: 0.5, y: 0.2, w: 7, h: 0.55, fontSize: 28, fontFace: 'Cambria', bold: true, color: C.white });
s3.addText('Como os padrões distribuídos entregam valor para o AutoVerse', { x: 0.5, y: 0.72, w: 9, h: 0.35, fontSize: 13, fontFace: 'Calibri', color: C.green, italic: true });

// ── 6 Benefit Cards ─────────────────────────────────────────────────────────
const benefits = [
  {
    icon: '⚡', color: C.gold,
    title: 'Alta Performance',
    metric: '~95% cache hit',
    desc: 'Cache distribuído com TTL reduz latência de resposta. Artigos populares servidos da memória em < 5ms vs. 50ms+ do banco.',
  },
  {
    icon: '🔒', color: C.green,
    title: 'Resiliência',
    metric: 'Circuit Breaker',
    desc: 'Circuit Breaker previne falhas em cascata. Sistema degrada graciosamente: se o serviço falhar, o frontend exibe cache.',
  },
  {
    icon: '📈', color: C.red,
    title: 'Escalabilidade',
    metric: 'Scale horizontal',
    desc: 'API stateless permite múltiplas instâncias. Render.com adiciona instâncias automaticamente sob carga elevada.',
  },
  {
    icon: '🔍', color: C.gold,
    title: 'Observabilidade',
    metric: 'Métricas em tempo real',
    desc: 'Endpoint /api/metrics expõe uptime, cache hit rate, estado do circuit breaker e ID único de cada instância.',
  },
  {
    icon: '🚀', color: C.green,
    title: 'Deploy Contínuo',
    metric: 'CI/CD automático',
    desc: 'Push no GitHub dispara deploy automático no Render. Zero-downtime deploy garante disponibilidade 99.9%.',
  },
  {
    icon: '🌍', color: C.red,
    title: 'Disponibilidade Global',
    metric: 'CDN Edge',
    desc: 'Conteúdo estático servido via CDN global. Latência reduzida para usuários no Brasil, EUA e Europa.',
  },
];

const bCols = [0.35, 3.48, 6.6];
const bRows = [1.15, 3.0];
let bi = 0;
for (let r = 0; r < 2; r++) {
  for (let c = 0; c < 3; c++) {
    const b = benefits[bi++];
    const x = bCols[c], y = bRows[r], w = 2.95, h = 1.68;
    s3.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, fill: { color: C.surface }, line: { color: C.border, width: 1 }, rectRadius: 0.08, shadow: makeShadow() });
    // colored top accent fill (full width, top-rounded)
    s3.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h: 0.45, fill: { color: b.color, transparency: 85 }, line: { color: b.color, width: 0.5 }, rectRadius: 0.06 });
    s3.addText(b.icon, { x, y: y + 0.0, w, h: 0.45, fontSize: 16, align: 'left', margin: [0, 0, 0, 12] });
    s3.addText(b.metric, { x, y: y + 0.0, w: w - 0.1, h: 0.45, fontSize: 9, fontFace: 'Calibri', bold: true, color: b.color, align: 'right', margin: [0, 10, 0, 0] });
    s3.addText(b.title, { x: x + 0.12, y: y + 0.47, w: w - 0.2, h: 0.3, fontSize: 11, fontFace: 'Calibri', bold: true, color: C.white, margin: 0 });
    s3.addText(b.desc, { x: x + 0.12, y: y + 0.78, w: w - 0.2, h: 0.82, fontSize: 8, fontFace: 'Calibri', color: C.light, margin: 0 });
  }
}

// Footer with live link
s3.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.35, y: 4.8, w: 9.3, h: 0.62, fill: { color: C.surface2 }, line: { color: C.red, width: 1.5 }, rectRadius: 0.06 });
s3.addText(
  '🔴  Sistema em produção: autoverse-frontend.onrender.com  |  API: autoverse-api.onrender.com/health  |  Código: github.com/user/autoverse',
  { x: 0.35, y: 4.8, w: 9.3, h: 0.62, fontSize: 9, fontFace: 'Calibri', color: C.gold, align: 'center', valign: 'middle', bold: true, margin: 0 }
);

// ── WRITE FILE ───────────────────────────────────────────────────────────────
pres.writeFile({ fileName: '/mnt/user-data/outputs/AutoVerse_Sistemas_Distribuidos.pptx' })
  .then(() => console.log('✅  PPT saved'))
  .catch(e => { console.error(e); process.exit(1); });
