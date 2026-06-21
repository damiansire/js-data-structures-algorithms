// Escena: Depth-First Search (DFS) — "Explorando un laberinto con el hilo de Ariadna".
//
// DFS estándar (recursivo / con pila) sobre un grafo NO dirigido fijo de 8 nodos
// con posiciones (x,y) puestas a mano y una lista de adyacencia definida abajo.
//   visit(node): marca el nodo, recorre sus vecinos en orden y baja al PRIMER
//                vecino no visitado (recursión / push a la pila).
//   backtrack(node): cuando un nodo no tiene vecinos sin visitar, RETROCEDE al
//                último nodo con opciones (pop de la pila).
//
// Metáfora: un HILO brillante (el hilo de Ariadna) sigue el camino mientras baja
// a fondo por una rama; al toparse con un callejón sin salida (sin vecinos sin
// visitar) RETROCEDE, retrayéndose visualmente por el hilo hasta el último nodo
// con opciones. Los nodos visitados se colorean; las aristas del camino activo
// brillan; las aristas por las que se retrocede se atenúan.
//
// Posiciones fijas (left%/top%) + aristas en un overlay <svg> (mismo patrón que
// pachinko.js). El panel lateral muestra la PILA / camino actual en vivo.

import { el, clear } from '../dom.js';
import { Player, buildTransport } from '../player.js';
import { getLang } from '../i18n.js';

// ─────────────────────────────── Idiomas ──────────────────────────────────
// Inglés por defecto; español opcional. Mantenemos <span class="mono"> en ambos
// idiomas y las interpolaciones como funciones.
const tag = (v) => `<span class="mono">${v}</span>`;

const STRINGS = {
  en: {
    ready: 'Ready to play.',
    start: (node) =>
      `Enter the maze at ${tag(node)} and tie down the thread 🧵 — start of the descent.`,
    visit: (node, from) =>
      `Follow the thread deeper to ${tag(node)}, the first unvisited neighbor of ${tag(from)}.`,
    deadEnd: (node) =>
      `${tag(node)} is a dead end — no unvisited neighbors. Retract the thread ↩`,
    backtrack: (node) =>
      `Backtrack along the thread to ${tag(node)}, looking for another way to go.`,
    done: (count) =>
      `Whole maze explored: ${tag(count)} nodes visited in depth-first order ✨`,
    cardOrder: 'Strategy',
    cardOrderBig: 'go deep first',
    cardOrderSub: 'backtrack on dead ends',
    cardComplexity: 'Complexity',
    cardComplexityBig: 'O(V + E)',
    cardComplexitySub: 'each edge once',
    cardStack: 'Stack',
    cardStackSub: 'current path (top = active)',
    cardOrderOut: 'Visit order',
    cardOrderOutSub: (n) => `${n} of 8 nodes`,
    stackEmpty: 'empty',
  },
  es: {
    ready: 'Listo para reproducir.',
    start: (node) =>
      `Entrá al laberinto en ${tag(node)} y atá el hilo 🧵 — arranca el descenso.`,
    visit: (node, from) =>
      `Seguí el hilo más a fondo hasta ${tag(node)}, el primer vecino sin visitar de ${tag(from)}.`,
    deadEnd: (node) =>
      `${tag(node)} es un callejón sin salida — sin vecinos sin visitar. Retraé el hilo ↩`,
    backtrack: (node) =>
      `Retrocedé por el hilo hasta ${tag(node)}, buscando otro camino por donde seguir.`,
    done: (count) =>
      `Laberinto entero explorado: ${tag(count)} nodos visitados en orden en profundidad ✨`,
    cardOrder: 'Estrategia',
    cardOrderBig: 'primero a fondo',
    cardOrderSub: 'retrocede en callejones',
    cardComplexity: 'Complejidad',
    cardComplexityBig: 'O(V + E)',
    cardComplexitySub: 'cada arista una vez',
    cardStack: 'Pila',
    cardStackSub: 'camino actual (tope = activo)',
    cardOrderOut: 'Orden de visita',
    cardOrderOutSub: (n) => `${n} de 8 nodos`,
    stackEmpty: 'vacía',
  },
};

// ── Grafo fijo no dirigido (8 nodos) ───────────────────────────────────────
// Posiciones puestas a mano en % (left/top sobre la zona de juego). El layout
// dibuja un "laberinto" con ramas que invitan a bajar a fondo y retroceder.
// Posiciones en %: la y se mantiene dentro del ~80% superior del tablero,
// porque el narrador ocupa ~70px abajo y no debe tapar los nodos inferiores.
const NODES = [
  { id: 'A', x: 12, y: 14 },
  { id: 'B', x: 40, y: 9 },
  { id: 'C', x: 70, y: 14 },
  { id: 'D', x: 90, y: 40 },
  { id: 'E', x: 20, y: 48 },
  { id: 'F', x: 52, y: 46 },
  { id: 'G', x: 34, y: 78 },
  { id: 'H', x: 72, y: 74 },
];

const POS = new Map(NODES.map((n) => [n.id, n]));
const SOURCE = 'A';

// Lista de adyacencia (no dirigida). Cada arista listada una vez; al construir
// la simétrica se completa en ambos sentidos. El ORDEN de los vecinos define a
// qué rama baja DFS primero.
const ADJ_DEF = {
  A: ['B', 'E'],
  B: ['C', 'F'],
  C: ['D'],
  D: ['H'],
  E: ['G'],
  F: ['G', 'H'],
  G: [],
  H: [],
};

// Construye la adyacencia simétrica preservando el orden de inserción.
function buildAdjacency(def) {
  const adj = new Map(NODES.map((n) => [n.id, []]));
  const seen = new Set();
  const addEdge = (a, b) => {
    const k = a < b ? `${a}-${b}` : `${b}-${a}`;
    if (seen.has(k)) return;
    seen.add(k);
  };
  for (const [a, neigh] of Object.entries(def)) {
    for (const b of neigh) {
      if (!adj.get(a).includes(b)) adj.get(a).push(b);
      if (!adj.get(b).includes(a)) adj.get(b).push(a);
      addEdge(a, b);
    }
  }
  return { adj, edges: [...seen].map((k) => k.split('-')) };
}

const { adj: ADJ, edges: EDGES } = buildAdjacency(ADJ_DEF);
const edgeKey = (a, b) => (a < b ? `${a}-${b}` : `${b}-${a}`);

// ── Traza: corre el DFS real para generar los pasos ────────────────────────
// visit(node, from, edge) / backtrack(to, from, edge) / done.
function buildTrace(source) {
  const steps = [];
  const visited = new Set();

  function dfs(node, from) {
    visited.add(node);
    steps.push({
      type: 'visit',
      node,
      from,
      edge: from ? edgeKey(from, node) : null,
    });
    for (const next of ADJ.get(node)) {
      if (!visited.has(next)) {
        dfs(next, node);
        // al volver de la recursión, retrocedemos por la misma arista
        steps.push({
          type: 'backtrack',
          to: node,
          from: next,
          edge: edgeKey(node, next),
        });
      }
    }
  }

  dfs(source, null);
  steps.push({ type: 'done', count: visited.size });
  return steps;
}

// ── CSS propio de la escena, autoinyectado una sola vez (no editamos index.html). ──
const CSS_HREF = './css/scene-dfs.css';
if (!document.querySelector(`link[data-scene="dfs"]`)) {
  document.head.append(
    el('link', { rel: 'stylesheet', href: CSS_HREF, dataset: { scene: 'dfs' } })
  );
}

const SVGNS = 'http://www.w3.org/2000/svg';

export default function mountDFS(host, meta = {}) {
  const S = STRINGS[getLang()] || STRINGS.en;

  // ── Lienzo ──
  const board = el('div', { class: 'dfs-board' }); // contenedor de nodos
  const edgesSvg = document.createElementNS(SVGNS, 'svg');
  edgesSvg.setAttribute('class', 'dfs-edges');
  edgesSvg.setAttribute('preserveAspectRatio', 'none');
  // width/height EXPLÍCITOS: un SVG con sólo insets puede colapsar el mapeo del
  // viewBox; con 100%/100% el viewBox 0..100 mapea 1:1 a los centros de nodos.
  edgesSvg.setAttribute('width', '100%');
  edgesSvg.setAttribute('height', '100%');
  edgesSvg.setAttribute('viewBox', '0 0 100 100');

  const canvas = el('div', { class: 'stage-canvas dfs-stage' }, edgesSvg, board);
  const narrator = el('div', { class: 'narrator' }, S.ready);
  canvas.append(narrator);

  const setNarration = (html) => {
    narrator.innerHTML = html;
  };

  // ── Aristas (líneas SVG, viewBox 0..100) ──
  const edgeEls = new Map(); // key → <line>
  for (const [a, b] of EDGES) {
    const pa = POS.get(a);
    const pb = POS.get(b);
    const line = document.createElementNS(SVGNS, 'line');
    line.setAttribute('x1', pa.x);
    line.setAttribute('y1', pa.y);
    line.setAttribute('x2', pb.x);
    line.setAttribute('y2', pb.y);
    line.setAttribute('class', 'dfs-edge');
    edgesSvg.append(line);
    edgeEls.set(edgeKey(a, b), line);
  }

  // ── Hilo de Ariadna: UNA polilínea continua que conecta los centros de los
  // nodos del camino actual (en el orden del stack). Se dibuja por encima de
  // las aristas base y se actualiza en cada visit/backtrack. ──
  const threadLine = document.createElementNS(SVGNS, 'polyline');
  threadLine.setAttribute('class', 'dfs-thread');
  threadLine.setAttribute('fill', 'none');
  edgesSvg.append(threadLine);

  function renderThread(path) {
    if (path.length < 2) {
      threadLine.setAttribute('points', '');
      return;
    }
    const pts = path.map((id) => {
      const p = POS.get(id);
      return `${p.x},${p.y}`;
    });
    threadLine.setAttribute('points', pts.join(' '));
  }

  // ── Nodos (círculos posicionados en % sobre .dfs-board) ──
  const nodeEls = new Map(); // id → el
  for (const n of NODES) {
    const node = el(
      'div',
      { class: 'dfs-node' },
      el('span', { class: 'dfs-node-val' }, n.id)
    );
    node.style.left = n.x + '%';
    node.style.top = n.y + '%';
    if (n.id === SOURCE) node.classList.add('dfs-source');
    board.append(node);
    nodeEls.set(n.id, node);
  }

  // ── Panel de la pila / camino actual (en vivo) ──
  const stackList = el('div', { class: 'dfs-stack-list' });
  const orderList = el('div', { class: 'dfs-order-list' });

  function renderStack(stack) {
    clear(stackList);
    if (!stack.length) {
      stackList.append(el('span', { class: 'dfs-stack-empty' }, S.stackEmpty));
      return;
    }
    // tope arriba (el nodo activo)
    stack
      .slice()
      .reverse()
      .forEach((id, i) => {
        const isTop = i === 0;
        stackList.append(
          el(
            'div',
            { class: 'dfs-stack-item' + (isTop ? ' dfs-stack-top' : '') },
            el('span', { class: 'dfs-stack-id mono' }, id),
            isTop ? el('span', { class: 'dfs-stack-tip' }, '◀ top') : null
          )
        );
      });
  }

  function renderOrder(order) {
    clear(orderList);
    order.forEach((id) => {
      orderList.append(el('span', { class: 'dfs-order-chip mono' }, id));
    });
  }

  // ── Estado visual ──
  let stack = []; // camino actual (pila de recursión)
  let order = []; // orden de visita

  function setNodeState(id, ...cls) {
    nodeEls.get(id).classList.add(...cls);
  }

  function resetVisual() {
    stack = [];
    order = [];
    nodeEls.forEach((node) =>
      node.classList.remove('dfs-visited', 'dfs-active', 'dfs-dead', 'dfs-done')
    );
    edgeEls.forEach((line) => line.classList.remove('dfs-edge-back'));
    renderThread(stack);
    renderStack(stack);
    renderOrder(order);
    setNarration(S.ready);
  }

  function markActive(id) {
    nodeEls.forEach((node) => node.classList.remove('dfs-active'));
    nodeEls.get(id).classList.add('dfs-active');
  }

  function apply(step) {
    switch (step.type) {
      case 'visit': {
        setNodeState(step.node, 'dfs-visited');
        nodeEls.get(step.node).classList.remove('dfs-dead');
        markActive(step.node);
        stack.push(step.node);
        order.push(step.node);
        // el hilo de Ariadna es UNA polilínea continua por el camino del stack
        renderThread(stack);
        // re-anima el "tendido" del hilo al avanzar
        replayThread();
        renderStack(stack);
        renderOrder(order);
        return step.from ? S.visit(step.node, step.from) : S.start(step.node);
      }
      case 'backtrack': {
        // retrocede: el hilo se retrae (la polilínea pierde su último tramo) y
        // la arista base recorrida se atenúa para marcar el camino abandonado.
        const line = edgeEls.get(step.edge);
        if (line) line.classList.add('dfs-edge-back');
        // marca el nodo del que volvemos como callejón explorado
        nodeEls.get(step.from).classList.add('dfs-dead');
        nodeEls.get(step.from).classList.remove('dfs-active');
        // pop del tope (el nodo que abandonamos)
        if (stack[stack.length - 1] === step.from) stack.pop();
        renderThread(stack);
        markActive(step.to);
        renderStack(stack);
        // mensaje: callejón si el nodo abandonado no tiene salidas en el hilo
        return step.fromDead ? S.deadEnd(step.from) : S.backtrack(step.to);
      }
      case 'done': {
        nodeEls.forEach((node) => node.classList.remove('dfs-active'));
        nodeEls.forEach((node, id) => {
          if (node.classList.contains('dfs-visited')) {
            setTimeout(() => node.classList.add('dfs-done'), 0);
          }
        });
        stack = [];
        renderThread(stack);
        renderStack(stack);
        return S.done(step.count);
      }
    }
  }

  // Re-dispara la animación de "tendido" de la polilínea forzando reflow.
  function replayThread() {
    threadLine.classList.remove('dfs-thread-draw');
    void threadLine.getBBox; // referencia para forzar reflow del SVG
    void edgesSvg.clientWidth;
    threadLine.classList.add('dfs-thread-draw');
  }

  // Marca qué backtracks salen de un callejón (dead end) para narrar mejor:
  // un nodo es callejón si el paso de backtrack que lo abandona NO fue precedido
  // por una visita más profunda desde él.
  const steps = buildTrace(SOURCE);
  for (let i = 0; i < steps.length; i++) {
    if (steps[i].type === 'backtrack') {
      // si el paso anterior fue la visita al mismo nodo, es un callejón puro
      const prev = steps[i - 1];
      steps[i].fromDead = prev && prev.type === 'visit' && prev.node === steps[i].from;
    }
  }

  const player = new Player({
    steps,
    apply,
    reset: resetVisual,
    baseDelay: 760,
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
    infoCard(S.cardOrder, el('span', { class: 'big' }, S.cardOrderBig), S.cardOrderSub),
    infoCard(
      S.cardComplexity,
      el('span', { class: 'big' }, S.cardComplexityBig),
      S.cardComplexitySub
    ),
    infoCard(S.cardStack, stackList, S.cardStackSub),
    infoCard(S.cardOrderOut, orderList, S.cardOrderOutSub(NODES.length))
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
    sub
      ? el('div', { style: { marginTop: '6px', fontSize: '12px', color: '#76749a' } }, sub)
      : null
  );
}
