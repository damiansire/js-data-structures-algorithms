// Escena: Kruskal's Minimum Spanning Tree — "Conectar islas con los puentes
// más baratos".
//
// Algoritmo estándar (union-find / disjoint set) sobre un grafo fijo, no
// dirigido y ponderado de 6 nodos ("islas") con posiciones (x,y) puestas a
// mano. Se ordenan las aristas por peso ascendente; para cada arista, si sus
// dos extremos están en conjuntos distintos (union-find), se ACEPTA (union);
// si ya están en el mismo conjunto, se RECHAZA (formaría un ciclo). Termina
// cuando se aceptan n-1 aristas.
//
// Metáfora: cada nodo es una isla; las aristas candidatas son puentes con un
// costo. Procesamos los puentes del más barato al más caro: un puente aceptado
// se vuelve VERDE sólido y fusiona los dos grupos de islas (cada componente
// conexa se tiñe de un color); un puente rechazado (haría un bucle) parpadea en
// ROJO y se desvanece. Mostramos el costo total acumulado y los grupos
// union-find. Aristas + pesos en un overlay <svg> (como pachinko).

import { el, clear } from '../dom.js';
import { Player, buildTransport } from '../player.js';
import { getLang } from '../i18n.js';

// ── Strings bilingües (inglés por defecto, español opcional) ──────────
// Mantenemos el markup <span class="mono"> en ambos idiomas y las
// interpolaciones como funciones.
const STRINGS = {
  en: {
    ready: 'Ready to play.',
    intro:
      'Connecting islands with the cheapest bridges. Process candidates from cheapest to most expensive.',
    consider: (a, b, w) =>
      `Cheapest bridge left: ${tag(a)}–${tag(b)} costing ${tag(w)}. Are these islands already connected?`,
    accept: (a, b, w) =>
      `Different groups → <b>build it</b> 🟢. The bridge merges them. Total +${tag(w)}.`,
    reject: (a, b, w) =>
      `Same group already → it would make a loop 🔴 <b>skip it</b>. Total unchanged.`,
    done: (cost, n) =>
      `All islands connected with ${tag(n)} bridges. Minimum total cost: ${tag(cost)} ✨`,
    cardAlgoTitle: 'Algorithm',
    cardAlgoSub: 'sort + union-find',
    cardCostTitle: 'Total cost',
    cardCostSub: (n) => `${n} bridges chosen`,
    cardCostEmpty: 'no bridges yet',
    cardEdgesTitle: 'Bridges in the tree',
    cardEdgesEmpty: 'none yet',
    cardGroupsTitle: 'Island groups',
    cardGroupsSub: (n) => `${n} group${n === 1 ? '' : 's'}`,
    legendConsider: 'considering',
    legendAccept: 'in the tree',
    legendReject: 'rejected (loop)',
  },
  es: {
    ready: 'Listo para reproducir.',
    intro:
      'Conectar islas con los puentes más baratos. Procesamos los candidatos del más barato al más caro.',
    consider: (a, b, w) =>
      `Puente más barato que queda: ${tag(a)}–${tag(b)} con costo ${tag(w)}. ¿Estas islas ya están conectadas?`,
    accept: (a, b, w) =>
      `Grupos distintos → <b>se construye</b> 🟢. El puente los fusiona. Total +${tag(w)}.`,
    reject: (a, b, w) =>
      `Ya en el mismo grupo → haría un bucle 🔴 <b>se descarta</b>. El total no cambia.`,
    done: (cost, n) =>
      `Todas las islas conectadas con ${tag(n)} puentes. Costo total mínimo: ${tag(cost)} ✨`,
    cardAlgoTitle: 'Algoritmo',
    cardAlgoSub: 'orden + union-find',
    cardCostTitle: 'Costo total',
    cardCostSub: (n) => `${n} puentes elegidos`,
    cardCostEmpty: 'sin puentes aún',
    cardEdgesTitle: 'Puentes en el árbol',
    cardEdgesEmpty: 'ninguno aún',
    cardGroupsTitle: 'Grupos de islas',
    cardGroupsSub: (n) => `${n} grupo${n === 1 ? '' : 's'}`,
    legendConsider: 'evaluando',
    legendAccept: 'en el árbol',
    legendReject: 'rechazado (bucle)',
  },
};

const tag = (v) => `<span class="mono">${v}</span>`;

// CSS propio de la escena, autoinyectado una sola vez (no editamos index.html).
const CSS_HREF = './css/scene-kruskal-mst.css';
if (!document.querySelector(`link[data-scene="kruskal-mst"]`)) {
  document.head.append(
    el('link', { rel: 'stylesheet', href: CSS_HREF, dataset: { scene: 'kruskal-mst' } }),
  );
}

// ── El grafo fijo: 6 islas con (x,y) en [0,1] puestas a mano ───────────
// Posiciones repartidas para que las aristas se lean sin cruces feos.
const NODES = [
  { id: 'A', x: 0.16, y: 0.24 },
  { id: 'B', x: 0.5, y: 0.13 },
  { id: 'C', x: 0.84, y: 0.27 },
  { id: 'D', x: 0.26, y: 0.78 },
  { id: 'E', x: 0.58, y: 0.66 },
  { id: 'F', x: 0.86, y: 0.8 },
];

// Aristas ponderadas no dirigidas. Pesos elegidos para que el MST sea claro
// y haya al menos un par de rechazos (ciclos) durante la corrida.
const EDGES = [
  { a: 'A', b: 'B', w: 4 },
  { a: 'A', b: 'D', w: 6 },
  { a: 'B', b: 'C', w: 3 },
  { a: 'B', b: 'E', w: 5 },
  { a: 'C', b: 'F', w: 7 },
  { a: 'D', b: 'E', w: 2 },
  { a: 'E', b: 'F', w: 8 },
  { a: 'E', b: 'C', w: 9 },
];

// Aristas únicas (por si alguna se repitiera con extremos invertidos).
const UNIQUE_EDGES = dedupeEdges(EDGES);

// Paleta para teñir las componentes conexas (cada grupo, un color).
const GROUP_COLORS = [
  '#f472b6', // pink (acento de categoría grafos)
  '#22d3ee', // cyan
  '#a78bfa', // violet
  '#fbbf24', // amber
  '#34d399', // green
  '#fb7185', // rose
];

function dedupeEdges(edges) {
  const seen = new Set();
  const out = [];
  for (const e of edges) {
    const k = [e.a, e.b].sort().join('-');
    if (seen.has(k)) continue;
    seen.add(k);
    out.push({ ...e });
  }
  return out;
}

// ── Construcción de la traza: Kruskal real con union-find ──────────────
// Genera los pasos consider/accept/reject/done. La corrida real garantiza que
// el árbol final sea un MST válido (n-1 aristas, sin ciclos).
function buildTrace(nodes, edges) {
  const steps = [];
  const parent = new Map();
  const rank = new Map();
  nodes.forEach((n) => {
    parent.set(n.id, n.id);
    rank.set(n.id, 0);
  });

  function find(x) {
    while (parent.get(x) !== x) {
      parent.set(x, parent.get(parent.get(x))); // path halving
      x = parent.get(x);
    }
    return x;
  }
  function union(x, y) {
    const rx = find(x);
    const ry = find(y);
    if (rx === ry) return false;
    if (rank.get(rx) < rank.get(ry)) {
      parent.set(rx, ry);
    } else if (rank.get(rx) > rank.get(ry)) {
      parent.set(ry, rx);
    } else {
      parent.set(ry, rx);
      rank.set(rx, rank.get(rx) + 1);
    }
    return true;
  }

  // Mapa de grupos (representante de cada nodo) tras cada paso, para teñir.
  function groupsSnapshot() {
    const g = {};
    nodes.forEach((n) => {
      g[n.id] = find(n.id);
    });
    return g;
  }

  const sorted = edges
    .map((e, i) => ({ ...e, key: edgeKey(e.a, e.b) }))
    .sort((p, q) => p.w - q.w || p.key.localeCompare(q.key));

  let accepted = 0;
  let total = 0;
  const need = nodes.length - 1;

  for (const e of sorted) {
    steps.push({ type: 'consider', a: e.a, b: e.b, w: e.w, key: e.key });
    const ra = find(e.a);
    const rb = find(e.b);
    if (ra !== rb) {
      union(e.a, e.b);
      accepted += 1;
      total += e.w;
      steps.push({
        type: 'accept',
        a: e.a,
        b: e.b,
        w: e.w,
        key: e.key,
        total,
        accepted,
        groups: groupsSnapshot(),
      });
      if (accepted === need) break;
    } else {
      steps.push({
        type: 'reject',
        a: e.a,
        b: e.b,
        w: e.w,
        key: e.key,
        total,
        groups: groupsSnapshot(),
      });
    }
  }

  steps.push({ type: 'done', total, accepted });
  return steps;
}

const edgeKey = (a, b) => [a, b].sort().join('-');

// Geometría: % dentro del lienzo. Comprimimos el grafo en el ~78% SUPERIOR del
// tablero, de modo que la fila inferior de islas quede POR ENCIMA de la banda
// del narrador (que vive abajo del canvas). Así las etiquetas de peso y el nodo
// inferior nunca quedan tapados. El SVG comparte el mismo inset que .krk-board,
// con width/height explícitos, así el viewBox 0..100 mapea 1:1 con los nodos.
const PAD_X = 9; // % de margen horizontal
const TOP_Y = 6; // % desde arriba hasta la fila superior de islas
const BAND_Y = 78; // % de alto útil (el grafo vive en [TOP_Y, TOP_Y+BAND_Y])
function leftPct(x) {
  return PAD_X + x * (100 - 2 * PAD_X);
}
function topPct(y) {
  return TOP_Y + y * BAND_Y;
}

export default function mountKruskal(host, meta = {}) {
  const S = STRINGS[getLang()] || STRINGS.en;
  const nodeById = new Map(NODES.map((n) => [n.id, n]));

  // ── Lienzo: SVG (aristas + pesos) debajo de los nodos (círculos) ──────
  const SVGNS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(SVGNS, 'svg');
  svg.setAttribute('class', 'krk-edges');
  svg.setAttribute('preserveAspectRatio', 'none');
  svg.setAttribute('viewBox', '0 0 100 100');
  // width/height explícitos: el SVG llena su caja inset y el viewBox 0..100
  // mapea 1:1 con los % de left/top de los nodos (mismo inset que .krk-board).
  svg.setAttribute('width', '100%');
  svg.setAttribute('height', '100%');

  const board = el('div', { class: 'krk-board' });

  // Aristas: una <line> + una etiqueta de peso por arista (en un <g> propio
  // para poder controlar z-order y estados con clases).
  const edgeEls = new Map(); // key → { line, labelBox, labelTxt, group }
  for (const e of UNIQUE_EDGES) {
    const na = nodeById.get(e.a);
    const nb = nodeById.get(e.b);
    const x1 = leftPct(na.x);
    const y1 = topPct(na.y);
    const x2 = leftPct(nb.x);
    const y2 = topPct(nb.y);
    const mx = (x1 + x2) / 2;
    const my = (y1 + y2) / 2;
    const key = edgeKey(e.a, e.b);

    const group = document.createElementNS(SVGNS, 'g');
    group.setAttribute('class', 'krk-edge-g');

    const line = document.createElementNS(SVGNS, 'line');
    line.setAttribute('x1', x1);
    line.setAttribute('y1', y1);
    line.setAttribute('x2', x2);
    line.setAttribute('y2', y2);
    line.setAttribute('class', 'krk-edge');
    group.append(line);

    // etiqueta de peso: un rectángulo + texto centrado en el medio de la arista
    const labelBox = document.createElementNS(SVGNS, 'rect');
    labelBox.setAttribute('class', 'krk-wlabel-box');
    labelBox.setAttribute('x', mx - 3.2);
    labelBox.setAttribute('y', my - 3.4);
    labelBox.setAttribute('width', 6.4);
    labelBox.setAttribute('height', 6.8);
    labelBox.setAttribute('rx', 1.6);
    group.append(labelBox);

    const labelTxt = document.createElementNS(SVGNS, 'text');
    labelTxt.setAttribute('class', 'krk-wlabel');
    labelTxt.setAttribute('x', mx);
    labelTxt.setAttribute('y', my);
    labelTxt.setAttribute('text-anchor', 'middle');
    labelTxt.setAttribute('dominant-baseline', 'central');
    labelTxt.textContent = String(e.w);
    group.append(labelTxt);

    svg.append(group);
    edgeEls.set(key, { line, labelBox, labelTxt, group });
  }

  // Nodos: círculos absolutos con la letra de la isla.
  const nodeEls = new Map(); // id → el
  for (const n of NODES) {
    const node = el(
      'div',
      { class: 'krk-node' },
      el('span', { class: 'krk-node-icon' }, '🏝️'),
      el('span', { class: 'krk-node-id mono' }, n.id),
    );
    node.style.left = leftPct(n.x) + '%';
    node.style.top = topPct(n.y) + '%';
    board.append(node);
    nodeEls.set(n.id, node);
  }

  const narrator = el('div', { class: 'narrator' }, S.ready);
  const canvas = el('div', { class: 'stage-canvas krk-stage' }, svg, board, narrator);

  const setNarration = (html) => {
    narrator.innerHTML = html;
  };

  // ── Aside / info-cards (costo total + aristas elegidas + grupos) ───────
  const costBig = el('span', { class: 'big' }, '0');
  const costSub = el('div', { class: 'krk-card-sub' }, S.cardCostEmpty);
  const costCard = el(
    'div',
    { class: 'info-card' },
    el('h4', {}, S.cardCostTitle),
    costBig,
    costSub,
  );

  const edgesList = el('div', { class: 'krk-edges-list' });
  const edgesEmpty = el('span', { class: 'krk-edges-empty' }, S.cardEdgesEmpty);
  edgesList.append(edgesEmpty);
  const edgesCard = el('div', { class: 'info-card' }, el('h4', {}, S.cardEdgesTitle), edgesList);

  const groupsBig = el('span', { class: 'big' }, String(NODES.length));
  const groupsSub = el('div', { class: 'krk-card-sub' }, S.cardGroupsSub(NODES.length));
  const groupsCard = el(
    'div',
    { class: 'info-card' },
    el('h4', {}, S.cardGroupsTitle),
    groupsBig,
    groupsSub,
  );

  const legend = el(
    'div',
    { class: 'info-card krk-legend' },
    el('h4', {}, S.cardAlgoTitle),
    el('span', { class: 'big' }, 'O(E log E)'),
    el('div', { class: 'krk-card-sub' }, S.cardAlgoSub),
    el(
      'div',
      { class: 'krk-legend-items' },
      legendItem('krk-dot-consider', S.legendConsider),
      legendItem('krk-dot-accept', S.legendAccept),
      legendItem('krk-dot-reject', S.legendReject),
    ),
  );

  const aside = el('div', { class: 'scene-aside' }, costCard, edgesCard, groupsCard, legend);

  // ── Helpers de render ─────────────────────────────────────────────────
  function clearConsider() {
    edgeEls.forEach(({ group }) => group.classList.remove('krk-considering'));
    nodeEls.forEach((node) => node.classList.remove('krk-node-active'));
  }

  // Asigna a cada representante de grupo un índice de color estable, así el
  // mismo grupo conserva su color a medida que crece.
  let colorForRoot = new Map();
  function tintGroups(groups) {
    // groups: { nodeId → rootId }
    // Asigna color por root en orden de aparición.
    const roots = [];
    for (const id of NODES.map((n) => n.id)) {
      const r = groups[id];
      if (!roots.includes(r)) roots.push(r);
    }
    roots.forEach((r) => {
      if (!colorForRoot.has(r)) {
        colorForRoot.set(r, GROUP_COLORS[colorForRoot.size % GROUP_COLORS.length]);
      }
    });
    NODES.forEach((n) => {
      const root = groups[n.id];
      const color = colorForRoot.get(root) || GROUP_COLORS[0];
      const node = nodeEls.get(n.id);
      // sólo teñimos nodos que ya pertenecen a un grupo de >1 isla
      const groupSize = NODES.filter((m) => groups[m.id] === root).length;
      if (groupSize > 1) {
        node.style.setProperty('--krk-grp', color);
        node.classList.add('krk-node-grouped');
      } else {
        node.style.removeProperty('--krk-grp');
        node.classList.remove('krk-node-grouped');
      }
    });
  }

  function countGroups(groups) {
    const roots = new Set();
    NODES.forEach((n) => roots.add(groups[n.id]));
    return roots.size;
  }

  function renderEdgesList(chosen) {
    clear(edgesList);
    if (!chosen.length) {
      edgesList.append(edgesEmpty);
      return;
    }
    chosen.forEach((c) => {
      edgesList.append(
        el(
          'span',
          { class: 'krk-edge-chip mono' },
          `${c.a}–${c.b}`,
          el('span', { class: 'krk-edge-chip-w' }, String(c.w)),
        ),
      );
    });
  }

  // Estado reconstruido desde el trace (idempotente para reset).
  let chosen = [];

  function resetVisual() {
    clearConsider();
    chosen = [];
    colorForRoot = new Map();
    edgeEls.forEach(({ group }) => {
      group.classList.remove('krk-accepted', 'krk-rejected', 'krk-considering');
    });
    nodeEls.forEach((node) => {
      node.classList.remove('krk-node-grouped', 'krk-node-win');
      node.style.removeProperty('--krk-grp');
    });
    costBig.textContent = '0';
    costSub.textContent = S.cardCostEmpty;
    groupsBig.textContent = String(NODES.length);
    groupsSub.textContent = S.cardGroupsSub(NODES.length);
    renderEdgesList(chosen);
    setNarration(S.intro);
  }

  function apply(step) {
    switch (step.type) {
      case 'consider': {
        clearConsider();
        const eg = edgeEls.get(step.key);
        if (eg) eg.group.classList.add('krk-considering');
        nodeEls.get(step.a)?.classList.add('krk-node-active');
        nodeEls.get(step.b)?.classList.add('krk-node-active');
        return S.consider(step.a, step.b, step.w);
      }
      case 'accept': {
        clearConsider();
        const eg = edgeEls.get(step.key);
        if (eg) {
          eg.group.classList.remove('krk-rejected');
          eg.group.classList.add('krk-accepted');
        }
        chosen = chosen.concat({ a: step.a, b: step.b, w: step.w });
        costBig.textContent = String(step.total);
        costSub.textContent = S.cardCostSub(step.accepted);
        renderEdgesList(chosen);
        tintGroups(step.groups);
        const ng = countGroups(step.groups);
        groupsBig.textContent = String(ng);
        groupsSub.textContent = S.cardGroupsSub(ng);
        return S.accept(step.a, step.b, step.w);
      }
      case 'reject': {
        clearConsider();
        const eg = edgeEls.get(step.key);
        if (eg) {
          eg.group.classList.add('krk-rejected');
          // re-dispara el flash rojo
          eg.line.style.animation = 'none';
          void eg.line.getBBox; // toque para reflow lógico
        }
        return S.reject(step.a, step.b, step.w);
      }
      case 'done': {
        clearConsider();
        nodeEls.forEach((node) => node.classList.add('krk-node-win'));
        return S.done(step.total, step.accepted);
      }
    }
  }

  // ── Player + transporte ───────────────────────────────────────────────
  const player = new Player({
    steps: buildTrace(NODES, UNIQUE_EDGES),
    apply,
    reset: resetVisual,
    baseDelay: 820,
  });
  const { bar, sync } = buildTransport(player);
  player.onChange = (s) => {
    sync(s);
    if (s.narration) setNarration(s.narration);
  };

  const stage = el('div', { class: 'stage' }, canvas, bar);

  clear(host);
  host.append(stage, aside);
  resetVisual();

  return {
    destroy() {
      player.destroy();
    },
  };
}

function legendItem(dotClass, label) {
  return el(
    'span',
    { class: 'krk-legend-item' },
    el('span', { class: `krk-dot ${dotClass}` }),
    label,
  );
}
