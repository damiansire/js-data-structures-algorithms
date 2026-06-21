// Escena: Breadth-First Search (BFS) — "Ondas que se expanden en un estanque".
//
// BFS estándar con cola, fiel al algoritmo clásico:
//   queue = [src]; visited = {src}
//   while queue:
//     u = dequeue
//     for each neighbor v of u not visited:
//       visit, mark visited, enqueue
//
// Metáfora: el nodo origen pulsa como una piedra que cae al agua y la
// exploración se expande NIVEL POR NIVEL, como ondas concéntricas. Cada nodo
// se colorea según su DISTANCIA (nivel) al origen; cada arista se enciende al
// recorrerla; la COLA se muestra en vivo en el aside.
//
// Grafo NO dirigido fijo de 8 nodos con posiciones a mano. Desde el origen (A)
// se generan varios niveles bien diferenciados.

import { el, clear } from '../dom.js';
import { Player, buildTransport } from '../player.js';
import { getLang } from '../i18n.js';

// ─────────────────────────────── Idiomas ──────────────────────────────────
// Inglés por defecto; español opcional. Mantenemos <span class="mono"> en
// ambos idiomas y las interpolaciones como funciones.
const STRINGS = {
  en: {
    ready: 'Ready to play. A pebble is about to drop on node A.',
    visitSrc: (n) =>
      `The pebble drops on the source ${tag(n)} (level <span class="mono">0</span>) — the first ripple starts. Enqueue it.`,
    dequeue: (n, lvl) =>
      `Dequeue ${tag(n)} (level <span class="mono">${lvl}</span>): we explore its neighbors.`,
    enqueue: (v, u, lvl) =>
      `Neighbor ${tag(v)} is unvisited → mark it (level <span class="mono">${lvl}</span>), light the edge ${tag(u)}–${tag(v)} and enqueue it.`,
    skip: (v, u) => `Neighbor ${tag(v)} is already visited → skip the edge ${tag(u)}–${tag(v)}.`,
    done: (n) =>
      `Queue empty: every node reached. ${tag(n)} nodes coloured by their ripple distance from A ✨`,
    queueTitle: 'Queue',
    queueEmpty: 'empty',
    queueHint: 'FIFO · front ◀ to back',
    visitedTitle: 'Visited',
    visitedSub: (n) => `${n} of 8 nodes`,
    levelsTitle: 'Ripples',
    levelsSub: 'distance from A',
    cardAlgo: 'Breadth-First Search',
    cardAlgoSub: 'level by level',
    legendSource: 'source',
  },
  es: {
    ready: 'Listo para reproducir. Una piedra está por caer en el nodo A.',
    visitSrc: (n) =>
      `La piedra cae en el origen ${tag(n)} (nivel <span class="mono">0</span>) — empieza la primera onda. Lo encolamos.`,
    dequeue: (n, lvl) =>
      `Desencolamos ${tag(n)} (nivel <span class="mono">${lvl}</span>): exploramos sus vecinos.`,
    enqueue: (v, u, lvl) =>
      `El vecino ${tag(v)} no fue visitado → lo marcamos (nivel <span class="mono">${lvl}</span>), encendemos la arista ${tag(u)}–${tag(v)} y lo encolamos.`,
    skip: (v, u) =>
      `El vecino ${tag(v)} ya fue visitado → salteamos la arista ${tag(u)}–${tag(v)}.`,
    done: (n) =>
      `Cola vacía: todos los nodos alcanzados. ${tag(n)} nodos coloreados por su distancia de onda desde A ✨`,
    queueTitle: 'Cola',
    queueEmpty: 'vacía',
    queueHint: 'FIFO · frente ◀ a fondo',
    visitedTitle: 'Visitados',
    visitedSub: (n) => `${n} de 8 nodos`,
    levelsTitle: 'Ondas',
    levelsSub: 'distancia desde A',
    cardAlgo: 'Breadth-First Search',
    cardAlgoSub: 'nivel por nivel',
    legendSource: 'origen',
  },
};

const tag = (v) => `<span class="mono">${v}</span>`;

// ───────────────────────────── Grafo fijo ─────────────────────────────────
// 8 nodos con posiciones (left%/top%) a mano. Lista de adyacencia no dirigida.
// Desde A (origen) salen 3 niveles bien marcados.
//        A(0)
//       / | \
//     B   C   D        nivel 1
//    / \  |   |
//   E   F G   H        nivel 2  (G es vecino de C; H de D; E,F de B; G también de F)
// y se mantiene dentro del ~80% superior del box (origen 10%, fila inferior 78%)
// y, sumado a la banda inferior del board (bottom 92px), el pill del narrador no
// tapa la fila E/F/G/H.
const NODES = [
  { id: 'A', x: 50, y: 10 },
  { id: 'B', x: 22, y: 42 },
  { id: 'C', x: 50, y: 42 },
  { id: 'D', x: 78, y: 42 },
  { id: 'E', x: 12, y: 78 },
  { id: 'F', x: 34, y: 78 },
  { id: 'G', x: 58, y: 78 },
  { id: 'H', x: 84, y: 78 },
];

const INDEX = new Map(NODES.map((n, i) => [n.id, i]));

// Aristas no dirigidas (pares por id). El orden define el orden de visita.
const EDGES = [
  ['A', 'B'],
  ['A', 'C'],
  ['A', 'D'],
  ['B', 'E'],
  ['B', 'F'],
  ['C', 'G'],
  ['D', 'H'],
  ['F', 'G'], // cruce extra: G ya quedará visitado al llegar por F (arista salteada)
];

const SOURCE = 'A';

// Lista de adyacencia (no dirigida).
function buildAdj() {
  const adj = new Map(NODES.map((n) => [n.id, []]));
  for (const [u, v] of EDGES) {
    adj.get(u).push(v);
    adj.get(v).push(u);
  }
  return adj;
}

// ───────────────────────── Construcción de la traza ───────────────────────
// Ejecutamos BFS REAL para generar los pasos y el nivel de cada nodo.
function buildTrace(src) {
  const adj = buildAdj();
  const steps = [];
  const visited = new Set();
  const level = new Map();
  const queue = [];

  // visita del origen
  visited.add(src);
  level.set(src, 0);
  queue.push(src);
  steps.push({ type: 'visit-src', node: src, level: 0, queue: queue.slice() });

  while (queue.length) {
    const u = queue.shift();
    steps.push({
      type: 'dequeue',
      node: u,
      level: level.get(u),
      queue: queue.slice(),
    });
    for (const v of adj.get(u)) {
      if (visited.has(v)) {
        steps.push({ type: 'skip', from: u, to: v, queue: queue.slice() });
        continue;
      }
      visited.add(v);
      level.set(v, level.get(u) + 1);
      queue.push(v);
      steps.push({
        type: 'enqueue',
        from: u,
        to: v,
        level: level.get(v),
        queue: queue.slice(),
      });
    }
  }

  steps.push({ type: 'done', count: visited.size, queue: [] });
  return { steps, level };
}

// Clave canónica de una arista no dirigida.
const edgeKey = (a, b) => (a < b ? `${a}|${b}` : `${b}|${a}`);

// CSS propio de la escena, autoinyectado una sola vez (no editamos index.html).
const CSS_HREF = './css/scene-bfs.css';
if (!document.querySelector(`link[data-scene="bfs"]`)) {
  document.head.append(
    el('link', { rel: 'stylesheet', href: CSS_HREF, dataset: { scene: 'bfs' } }),
  );
}

export default function mountBFS(host, meta = {}) {
  const S = STRINGS[getLang()] || STRINGS.en;
  const { steps, level } = buildTrace(SOURCE);
  const maxLevel = Math.max(...level.values());

  // ── Aristas (SVG overlay, viewBox 0..100) ──
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', 'bfs-edges');
  svg.setAttribute('preserveAspectRatio', 'none');
  svg.setAttribute('viewBox', '0 0 100 100');

  const edgeEls = new Map(); // edgeKey → <line>
  for (const [u, v] of EDGES) {
    const a = NODES[INDEX.get(u)];
    const b = NODES[INDEX.get(v)];
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', a.x);
    line.setAttribute('y1', a.y);
    line.setAttribute('x2', b.x);
    line.setAttribute('y2', b.y);
    line.setAttribute('class', 'bfs-edge');
    svg.append(line);
    edgeEls.set(edgeKey(u, v), line);
  }

  // ── Nodos (círculos absolutos en %) ──
  const board = el('div', { class: 'bfs-board' });
  const nodeEls = new Map(); // id → el
  for (const n of NODES) {
    const node = el(
      'div',
      { class: 'bfs-node', dataset: { id: n.id } },
      el('span', { class: 'bfs-ripple' }),
      el('span', { class: 'bfs-node-val' }, n.id),
    );
    node.style.left = n.x + '%';
    node.style.top = n.y + '%';
    if (n.id === SOURCE) node.classList.add('bfs-source');
    board.append(node);
    nodeEls.set(n.id, node);
  }

  const canvas = el('div', { class: 'stage-canvas bfs-stage' }, svg, board);
  const narrator = el('div', { class: 'narrator' }, S.ready);
  canvas.append(narrator);

  // ── Aside: la cola en vivo + tarjetas ──
  const queueRow = el('div', { class: 'bfs-queue' });
  const queueEmpty = el('span', { class: 'bfs-queue-empty' }, S.queueEmpty);
  const queueCard = el(
    'div',
    { class: 'info-card bfs-queue-card' },
    el('h4', {}, S.queueTitle),
    queueRow,
    el('div', { class: 'bfs-queue-hint' }, S.queueHint),
  );

  const visitedBig = el('span', { class: 'big' }, '0');
  const visitedCard = infoCard(S.visitedTitle, visitedBig, S.visitedSub(0));
  const visitedSubEl = visitedCard.querySelector('.bfs-sub');

  const legend = el('div', { class: 'bfs-legend' });
  for (let lvl = 0; lvl <= maxLevel; lvl++) {
    legend.append(
      el(
        'span',
        { class: 'bfs-legend-item' },
        el('span', {
          class: 'bfs-legend-dot',
          style: { '--bfs-level': String(lvl), '--bfs-max': String(maxLevel) },
        }),
        el('span', { class: 'mono' }, String(lvl)),
      ),
    );
  }
  const levelsCard = el(
    'div',
    { class: 'info-card bfs-levels-card' },
    el('h4', {}, S.levelsTitle),
    legend,
    el('div', { class: 'bfs-sub' }, S.levelsSub),
  );

  // ── Helpers de render ──
  const setNarration = (html) => {
    narrator.innerHTML = html;
  };

  function setLevelVar(node, lvl) {
    node.style.setProperty('--bfs-level', String(lvl));
    node.style.setProperty('--bfs-max', String(maxLevel));
  }

  function renderQueue(ids) {
    clear(queueRow);
    if (!ids.length) {
      queueRow.append(queueEmpty);
      return;
    }
    ids.forEach((id, i) => {
      const lvl = level.get(id);
      const chip = el('span', { class: 'bfs-chip mono' }, id);
      setLevelVar(chip, lvl);
      if (i === 0) chip.classList.add('bfs-chip-front');
      queueRow.append(chip);
    });
  }

  function clearActive() {
    nodeEls.forEach((n) => n.classList.remove('bfs-active', 'bfs-frontier'));
    edgeEls.forEach((e) => e.classList.remove('bfs-edge-active'));
  }

  function setVisitedCount(c) {
    visitedBig.textContent = String(c);
    if (visitedSubEl) visitedSubEl.textContent = S.visitedSub(c);
  }

  function pulse(node, cls) {
    node.classList.remove(cls);
    void node.offsetWidth; // reflow para reiniciar la animación
    node.classList.add(cls);
  }

  function resetVisual() {
    clearActive();
    nodeEls.forEach((n) => {
      n.classList.remove('bfs-visited', 'bfs-dequeued', 'bfs-win');
      n.style.removeProperty('--bfs-level');
      n.style.removeProperty('--bfs-max');
    });
    edgeEls.forEach((e) => e.classList.remove('bfs-edge-on'));
    renderQueue([]);
    setVisitedCount(0);
    setNarration(S.ready);
  }

  let visitedCount = 0;

  function apply(step) {
    switch (step.type) {
      case 'visit-src': {
        clearActive();
        const node = nodeEls.get(step.node);
        node.classList.add('bfs-visited', 'bfs-active');
        setLevelVar(node, step.level);
        pulse(node, 'bfs-ping');
        visitedCount = 1;
        setVisitedCount(visitedCount);
        renderQueue(step.queue);
        return S.visitSrc(step.node);
      }
      case 'dequeue': {
        clearActive();
        const node = nodeEls.get(step.node);
        node.classList.add('bfs-dequeued', 'bfs-active');
        renderQueue(step.queue);
        return S.dequeue(step.node, step.level);
      }
      case 'enqueue': {
        const fromN = nodeEls.get(step.from);
        const toN = nodeEls.get(step.to);
        fromN.classList.add('bfs-active');
        toN.classList.add('bfs-visited', 'bfs-frontier');
        setLevelVar(toN, step.level);
        pulse(toN, 'bfs-ping');
        const edge = edgeEls.get(edgeKey(step.from, step.to));
        if (edge) edge.classList.add('bfs-edge-on', 'bfs-edge-active');
        visitedCount += 1;
        setVisitedCount(visitedCount);
        renderQueue(step.queue);
        return S.enqueue(step.to, step.from, step.level);
      }
      case 'skip': {
        const fromN = nodeEls.get(step.from);
        fromN.classList.add('bfs-active');
        const edge = edgeEls.get(edgeKey(step.from, step.to));
        if (edge) {
          edge.classList.remove('bfs-skip');
          void edge.getBoundingClientRect();
          edge.classList.add('bfs-skip');
          setTimeout(() => edge.classList.remove('bfs-skip'), 500);
        }
        renderQueue(step.queue);
        return S.skip(step.to, step.from);
      }
      case 'done': {
        clearActive();
        nodeEls.forEach((n, id) => {
          n.classList.remove('bfs-dequeued');
          setTimeout(() => n.classList.add('bfs-win'), (level.get(id) || 0) * 120);
        });
        renderQueue([]);
        return S.done(step.count);
      }
    }
  }

  const player = new Player({
    steps,
    apply,
    reset: resetVisual,
    baseDelay: 720,
  });
  const { bar, sync } = buildTransport(player);
  player.onChange = (s) => {
    sync(s);
    if (s.narration) setNarration(s.narration);
  };

  const stage = el('div', { class: 'stage' }, canvas, bar);
  const aside = el(
    'div',
    { class: 'scene-aside' },
    infoCard(S.cardAlgo, el('span', { class: 'big' }, 'O(V+E)'), S.cardAlgoSub),
    queueCard,
    visitedCard,
    levelsCard,
  );

  clear(host);
  host.append(stage, aside);
  resetVisual();

  return { destroy: () => player.destroy() };
}

function infoCard(title, big, sub) {
  return el(
    'div',
    { class: 'info-card' },
    el('h4', {}, title),
    big,
    sub ? el('div', { class: 'bfs-sub' }, sub) : null,
  );
}
