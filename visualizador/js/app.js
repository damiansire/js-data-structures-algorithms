// Router por hash + render del catálogo y del host de escenas.
//   #/                → catálogo (home)
//   #/scene/<id>      → vista de una escena
// i18n: inglés por defecto, toggle a español. Al cambiar idioma se re-renderiza
// la vista actual; cada escena se reconstruye leyendo getLang() al montarse.

import { CATEGORIES, SCENES, SCENES_BY_ID } from './catalog.js';
import { el, clear } from './dom.js';
import { t, pick, getLang, toggleLang, onLang } from './i18n.js';
import { startConstellation } from './home-bg.js';

const app = document.getElementById('app');

// Fondo animado global (constelación de nodos con pulsos viajando por aristas).
// Se pausa al entrar a una escena (queda detrás, no se ve) y se reanuda en home.
const bg = startConstellation();

// Las escenas se cargan bajo demanda (dynamic import) por id.
const SCENE_LOADERS = {
  'bubble-sort': () => import('./scenes/bubble-sort.js'),
  'quick-sort': () => import('./scenes/quick-sort.js'),
  'merge-sort-recursive': () => import('./scenes/merge-sort.js'),
  'merge-sort-in-place': () => import('./scenes/merge-sort.js'),
  'binary-search': () => import('./scenes/binary-search.js'),
  stack: () => import('./scenes/stack.js'),
  list: () => import('./scenes/list.js'),
  'binary-tree': () => import('./scenes/pachinko.js'),
  'binary-search-tree': () => import('./scenes/pachinko.js'),
  tree: () => import('./scenes/tree.js'),
  fibonacci: () => import('./scenes/fibonacci.js'),
  greddy: () => import('./scenes/greddy.js'),
  'letter-count': () => import('./scenes/letter-count.js'),
  'remove-duplicates': () => import('./scenes/remove-duplicates.js'),
  // ── clásicos añadidos ──
  'insertion-sort': () => import('./scenes/insertion-sort.js'),
  'selection-sort': () => import('./scenes/selection-sort.js'),
  'heap-sort': () => import('./scenes/heap-sort.js'),
  'counting-sort': () => import('./scenes/counting-sort.js'),
  'radix-sort': () => import('./scenes/radix-sort.js'),
  'linear-search': () => import('./scenes/linear-search.js'),
  'jump-search': () => import('./scenes/jump-search.js'),
  'interpolation-search': () => import('./scenes/interpolation-search.js'),
  bfs: () => import('./scenes/bfs.js'),
  dfs: () => import('./scenes/dfs.js'),
  dijkstra: () => import('./scenes/dijkstra.js'),
  'topological-sort': () => import('./scenes/topological-sort.js'),
  'kruskal-mst': () => import('./scenes/kruskal-mst.js'),
  'kmp-search': () => import('./scenes/kmp-search.js'),
  levenshtein: () => import('./scenes/levenshtein.js'),
  'caesar-cipher': () => import('./scenes/caesar-cipher.js'),
  'euclid-gcd': () => import('./scenes/euclid-gcd.js'),
  'sieve-eratosthenes': () => import('./scenes/sieve-eratosthenes.js'),
  'tower-of-hanoi': () => import('./scenes/tower-of-hanoi.js'),
  'n-queens': () => import('./scenes/n-queens.js'),
};

let activeScene = null; // { destroy() }
// Token de generación: cada navegación (renderScene/renderHome) lo incrementa.
// Tras un await, una navegación que ya no es la vigente se aborta para no
// montar una escena sobre un host reemplazado (race de routing/idioma).
let renderGen = 0;

function destroyActive() {
  if (activeScene && typeof activeScene.destroy === 'function') {
    try {
      activeScene.destroy();
    } catch (_) {
      /* noop */
    }
  }
  activeScene = null;
}

/* ── Chrome (topbar / footer) según idioma ─────────────────────── */
function applyChrome() {
  document.documentElement.lang = getLang();
  setText('brand-sub', t('brand_sub'));
  setText('lang-label', t('lang_name'));
  setText('footer-text', t('footer'));
  const toggle = document.getElementById('lang-toggle');
  if (toggle) toggle.title = t('lang_switch_to');
}
function setText(id, text) {
  const n = document.getElementById(id);
  if (n) n.textContent = text;
}

/* ── Home / catálogo ───────────────────────────────────────────── */
function renderHome() {
  renderGen++;
  destroyActive();
  bg.start(); // reanudar el fondo animado en el catálogo
  clear(app);

  const builtCount = SCENES.filter((s) => s.built).length;
  // Deriva del catálogo, igual que las otras stats (no hardcodear).
  const categoryCount = new Set(SCENES.map((s) => s.category)).size;

  app.append(
    el(
      'section',
      { class: 'hero' },
      heroBubbles(),
      el(
        'div',
        { class: 'hero-inner' },
        el(
          'h1',
          {},
          t('hero_pre'),
          el('span', { class: 'accent' }, t('hero_accent')),
          t('hero_post')
        ),
        el('p', { class: 'hero-sub' }, t('hero_sub')),
        el(
          'div',
          { class: 'hero-stats' },
          chip(String(SCENES.length), t('stat_scenes')),
          chip(String(builtCount), t('stat_animated')),
          chip(String(categoryCount), t('stat_categories')),
          el('span', { class: 'chip ghost' }, t('stat_vanilla'))
        ),
        el('div', { class: 'scroll-hint' }, t('scroll_hint'), el('span', { class: 'arrow' }, '↓'))
      )
    )
  );

  for (const [key, cat] of Object.entries(CATEGORIES)) {
    const scenes = SCENES.filter((s) => s.category === key);
    if (!scenes.length) continue;

    const grid = el('div', { class: 'grid' });
    scenes.forEach((s, i) => grid.append(sceneCard(s, cat, i)));

    const label = pick(cat.label);
    const word = scenes.length > 1 ? t('count_scenes') : t('count_scene');
    app.append(
      el(
        'section',
        { class: 'cat', style: { '--cat-accent': cat.accent } },
        el(
          'div',
          { class: 'cat-head' },
          el('span', { class: 'cat-emoji' }, cat.emoji),
          el('h2', {}, label),
          el('span', { class: 'count' }, `${scenes.length} ${word}`)
        ),
        grid
      )
    );
  }
}

function chip(value, label) {
  return el('span', { class: 'chip' }, el('b', {}, value), ' ' + label);
}

// Campo de burbujas vivas del hero (con números, eco de Bubble Sort).
function heroBubbles() {
  const field = el('div', { class: 'hero-bubbles', 'aria-hidden': 'true' });
  const nums = [3, 8, 1, 5, 9, 2, 7, 4, 6, 8, 1, 3, 5, 9, 2, 7];
  for (let i = 0; i < nums.length; i++) {
    const v = nums[i];
    const size = 26 + Math.random() * 64;
    const hue = 190 + (v / 9) * 120;
    field.append(
      el(
        'span',
        {
          class: 'hero-bubble',
          style: {
            '--h': String(hue),
            width: `${size.toFixed(0)}px`,
            height: `${size.toFixed(0)}px`,
            left: `${(2 + Math.random() * 96).toFixed(1)}%`,
            animationDelay: `${(-Math.random() * 16).toFixed(2)}s`,
            animationDuration: `${(13 + Math.random() * 12).toFixed(1)}s`,
          },
        },
        String(v)
      )
    );
  }
  return field;
}

// Micro-animación por categoría (siempre en movimiento → da "alma").
function motifFor(category) {
  const motif = el('div', { class: `card-motif motif-${category}`, 'aria-hidden': 'true' });
  if (category === 'sorting') {
    [40, 70, 30, 90, 55, 75, 45].forEach((h, i) =>
      motif.append(el('span', { class: 'm-bar', style: { '--n': String(i), height: `${h}%` } }))
    );
  } else if (category === 'structures') {
    for (let i = 0; i < 4; i++) motif.append(el('span', { class: 'm-block', style: { '--n': String(i) } }));
  } else if (category === 'search') {
    for (let i = 0; i < 7; i++) motif.append(el('span', { class: 'm-dot', style: { '--n': String(i) } }));
  } else {
    for (let i = 0; i < 5; i++) motif.append(el('span', { class: 'm-spark', style: { '--n': String(i) } }));
  }
  return motif;
}

function sceneCard(s, cat, idx) {
  const card = el(
    'article',
    {
      class: 'card ' + (s.built ? 'is-built' : 'is-soon'),
      style: { '--card-accent': cat.accent, '--i': String(idx) },
    },
    motifFor(s.category),
    el(
      'div',
      { class: 'card-top' },
      el('span', { class: 'card-emoji' }, s.emoji),
      s.built
        ? el('span', { class: 'badge ready' }, t('badge_ready'))
        : el('span', { class: 'badge soon' }, t('badge_soon'))
    ),
    el('h3', {}, s.title),
    el('span', { class: 'scene-name' }, '“' + pick(s.scene) + '”'),
    el('p', {}, pick(s.description)),
    el('span', { class: 'repo' }, s.repo)
  );

  if (s.built) {
    card.addEventListener('click', () => {
      location.hash = `#/scene/${s.id}`;
    });
    card.tabIndex = 0;
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        location.hash = `#/scene/${s.id}`;
      }
    });
  }
  return card;
}

/* ── Vista de escena ───────────────────────────────────────────── */
async function renderScene(id) {
  const gen = ++renderGen;
  destroyActive();
  bg.stop(); // pausar el fondo animado: queda detrás de la escena y no se ve
  const meta = SCENES_BY_ID[id];
  if (!meta) return renderHome();

  clear(app);

  const head = el(
    'div',
    { class: 'scene-head' },
    el('a', { class: 'back-btn', href: '#/', title: t('back_title') }, '←'),
    el(
      'div',
      { class: 'scene-titles' },
      el('h1', {}, el('span', {}, meta.emoji), meta.title),
      el('p', { class: 'scene-sub' }, '“' + pick(meta.scene) + '”'),
      el('p', { class: 'scene-desc' }, pick(meta.description))
    )
  );

  const host = el('div', { class: 'scene-host' });
  app.append(el('section', { class: 'scene-view' }, head, host));

  const loader = SCENE_LOADERS[id];
  if (!loader) {
    host.append(soonStage(meta));
    return;
  }

  try {
    const mod = await loader();
    // Si llegó otra navegación mientras se cargaba el módulo, abortar: el host
    // ya fue reemplazado y montar aquí dejaría una escena huérfana.
    if (gen !== renderGen) return;
    activeScene = mod.default(host, meta) || null;
    wirePlayOnCanvas(host);
  } catch (err) {
    if (gen !== renderGen) return;
    console.error('Error cargando la escena', id, err);
    host.append(soonStage(meta, true));
  }
}

// Usabilidad: en las escenas con reproductor (las que tienen barra de transporte
// con contador "X / Y"), hacer click en el lienzo (donde aparece "Ready to play")
// equivale a tocar Play/Pausa. Las escenas interactivas (Stack/List) no tienen ese
// contador, así que no se ven afectadas.
function wirePlayOnCanvas(host) {
  host.querySelectorAll('.stage').forEach((stage) => {
    const progress = stage.querySelector('.transport .progress');
    const primary = stage.querySelector('.transport .tbtn.primary');
    const canvas = stage.querySelector('.stage-canvas');
    if (!progress || !primary || !canvas) return; // no es una escena con reproductor
    canvas.classList.add('playable');
    canvas.addEventListener('click', (e) => {
      // si por algún motivo hay un control real dentro del lienzo, respetarlo
      if (e.target.closest('button, a, input, select, textarea')) return;
      primary.click();
    });
  });
}

function soonStage(meta, errored = false) {
  return el(
    'div',
    { class: 'stage' },
    el(
      'div',
      { class: 'soon-stage' },
      el('div', { class: 'big-emoji' }, errored ? '🚧' : meta.emoji),
      el('h3', {}, errored ? t('error_title') : t('soon_title')),
      el('p', {}, errored ? t('error_body') : t('soon_body'))
    )
  );
}

/* ── Router ────────────────────────────────────────────────────── */
function route() {
  applyChrome();
  const hash = location.hash || '#/';
  const m = hash.match(/^#\/scene\/(.+)$/);
  if (m) renderScene(m[1]);
  else renderHome();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Toggle de idioma
const langBtn = document.getElementById('lang-toggle');
if (langBtn) langBtn.addEventListener('click', () => toggleLang());

// Al cambiar idioma: re-render de la vista actual (sin scroll-to-top brusco)
onLang(() => {
  applyChrome();
  const hash = location.hash || '#/';
  const m = hash.match(/^#\/scene\/(.+)$/);
  if (m) renderScene(m[1]);
  else renderHome();
});

window.addEventListener('hashchange', route);
route();
