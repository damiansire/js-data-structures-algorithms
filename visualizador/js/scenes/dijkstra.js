// Escena: Dijkstra — "Un GPS buscando la ruta más corta".
//
// Algoritmo estándar de Dijkstra sobre un grafo NO dirigido, ponderado y fijo
// de 6 nodos con posiciones (x,y) puestas a mano y pesos positivos.
//   dist[src] = 0 ; dist[otros] = ∞
//   repetir: tomar el nodo NO visitado con menor dist → finalizarlo (verde) ;
//            relajar sus aristas: si dist[u] + w < dist[v] → dist[v] = dist[u]+w
//
// Metáfora: cada nodo muestra su distancia tentativa actual (∞ y luego números,
// como el "tiempo estimado" de un GPS). En cada paso el nodo NO visitado más
// cercano se ilumina como FINALIZADO; se examinan sus aristas y las etiquetas
// de los vecinos se actualizan cuando se encuentra una ruta más corta (la arista
// relajada destella). Las aristas se dibujan con su peso en un <svg> overlay.
//
// Pasos: select(node,dist) / relax(edge,from,to,newDist) / skip / done.
// La traza la genera Dijkstra real; las etiquetas finales son correctas.

import { el, clear } from '../dom.js';
import { Player, buildTransport } from '../player.js';
import { getLang } from '../i18n.js';

// ─────────────────────────────── Grafo fijo ───────────────────────────────
// Posiciones en % (0..100) sobre el lienzo, puestas a mano para que las aristas
// no se crucen feo. A es la fuente (source).
const NODES = [
  { id: 'A', x: 14, y: 50 },
  { id: 'B', x: 38, y: 20 },
  { id: 'C', x: 38, y: 80 },
  { id: 'D', x: 64, y: 38 },
  { id: 'E', x: 64, y: 78 },
  { id: 'F', x: 88, y: 56 },
];

// Aristas no dirigidas con peso positivo. {u, v, w}.
const EDGES = [
  { u: 'A', v: 'B', w: 4 },
  { u: 'A', v: 'C', w: 2 },
  { u: 'B', v: 'C', w: 1 },
  { u: 'B', v: 'D', w: 5 },
  { u: 'C', v: 'D', w: 8 },
  { u: 'C', v: 'E', w: 10 },
  { u: 'D', v: 'E', w: 2 },
  { u: 'D', v: 'F', w: 6 },
  { u: 'E', v: 'F', w: 3 },
];

const SOURCE = 'A';
const INF = Infinity;

// Clave canónica de una arista (no dirigida) para identificarla en el SVG.
const edgeKey = (a, b) => (a < b ? `${a}-${b}` : `${b}-${a}`);

// ─────────────────────────────── Idiomas ──────────────────────────────────
// Inglés por defecto; español opcional. Mantenemos <span class="mono"> en ambos
// y las interpolaciones como funciones.
const mono = (v) => `<span class="mono">${v}</span>`;
const dlabel = (d) => (d === INF ? '∞' : String(d));

const STRINGS = {
  en: {
    ready: 'Ready to play. The GPS starts at the source.',
    init: (src) =>
      `Source ${mono(src)} gets distance ${mono(0)}; every other node starts at ${mono('∞')}.`,
    select: (node, dist) =>
      `Closest unvisited node: ${mono(node)} at distance ${mono(dlabel(dist))} → its route is now <b>final</b> 🟢`,
    relax: (from, to, oldD, newD) =>
      `Shorter route to ${mono(to)} via ${mono(from)}: ${mono(dlabel(oldD))} → ${mono(newD)}. Edge relaxed ⚡`,
    skip: (from, to, dist) =>
      `Route to ${mono(to)} via ${mono(from)} is not shorter (${mono(dlabel(dist))}). Kept as is.`,
    done: (src) =>
      `All nodes finalized. Shortest distances from ${mono(src)} are locked in ✨`,
    cardAlgoTitle: 'Algorithm',
    cardAlgoSub: 'greedy + priority',
    cardComplexityTitle: 'Complexity',
    cardComplexitySub: 'binary-heap variant',
    cardSourceTitle: 'Source',
    cardSourceSub: '6 nodes · 9 edges',
    distTitle: 'Tentative distances',
    distFrom: (src) => `shortest from ${src}`,
    legendFinal: 'finalized',
    legendActive: 'examining',
    legendInf: 'unreached',
  },
  es: {
    ready: 'Listo para reproducir. El GPS arranca en el origen.',
    init: (src) =>
      `El origen ${mono(src)} recibe distancia ${mono(0)}; los demás nodos empiezan en ${mono('∞')}.`,
    select: (node, dist) =>
      `Nodo no visitado más cercano: ${mono(node)} a distancia ${mono(dlabel(dist))} → su ruta queda <b>definitiva</b> 🟢`,
    relax: (from, to, oldD, newD) =>
      `Ruta más corta a ${mono(to)} vía ${mono(from)}: ${mono(dlabel(oldD))} → ${mono(newD)}. Arista relajada ⚡`,
    skip: (from, to, dist) =>
      `La ruta a ${mono(to)} vía ${mono(from)} no es más corta (${mono(dlabel(dist))}). Se mantiene.`,
    done: (src) =>
      `Todos los nodos finalizados. Las distancias mínimas desde ${mono(src)} quedan fijadas ✨`,
    cardAlgoTitle: 'Algoritmo',
    cardAlgoSub: 'greedy + prioridad',
    cardComplexityTitle: 'Complejidad',
    cardComplexitySub: 'variante con heap',
    cardSourceTitle: 'Origen',
    cardSourceSub: '6 nodos · 9 aristas',
    distTitle: 'Distancias tentativas',
    distFrom: (src) => `mínima desde ${src}`,
    legendFinal: 'finalizado',
    legendActive: 'examinando',
    legendInf: 'sin alcanzar',
  },
};

// CSS propio de la escena, autoinyectado una sola vez (no editamos index.html).
const CSS_HREF = './css/scene-dijkstra.css';
if (!document.querySelector(`link[data-scene="dijkstra"]`)) {
  document.head.append(
    el('link', { rel: 'stylesheet', href: CSS_HREF, dataset: { scene: 'dijkstra' } })
  );
}

// ───────────────────────── Construcción de la traza ───────────────────────
// Dijkstra REAL. Genera los pasos que la escena reproduce; las distancias
// finales son las correctas.
function buildTrace() {
  // lista de adyacencia (no dirigida)
  const adj = new Map(NODES.map((n) => [n.id, []]));
  for (const { u, v, w } of EDGES) {
    adj.get(u).push({ to: v, w });
    adj.get(v).push({ to: u, w });
  }

  const dist = new Map(NODES.map((n) => [n.id, INF]));
  dist.set(SOURCE, 0);
  const visited = new Set();

  const steps = [];
  // snapshot de las distancias en este punto de la traza
  const snap = () => Object.fromEntries(dist);

  steps.push({ type: 'init', dist: snap() });

  while (visited.size < NODES.length) {
    // nodo no visitado con menor dist (orden estable por id para empates)
    let u = null;
    let best = INF;
    for (const n of NODES) {
      if (visited.has(n.id)) continue;
      const d = dist.get(n.id);
      if (d < best) {
        best = d;
        u = n.id;
      }
    }
    if (u == null) break; // resto inalcanzable (no ocurre en este grafo)

    visited.add(u);
    steps.push({ type: 'select', node: u, dist: dist.get(u), distMap: snap() });

    // relajar aristas salientes hacia vecinos no visitados
    for (const { to, w } of adj.get(u)) {
      if (visited.has(to)) continue;
      const cur = dist.get(to);
      const cand = dist.get(u) + w;
      if (cand < cur) {
        dist.set(to, cand);
        steps.push({
          type: 'relax',
          from: u,
          to,
          edge: edgeKey(u, to),
          oldDist: cur,
          newDist: cand,
          distMap: snap(),
        });
      } else {
        steps.push({
          type: 'skip',
          from: u,
          to,
          edge: edgeKey(u, to),
          dist: cur,
          distMap: snap(),
        });
      }
    }
  }

  steps.push({ type: 'done', dist: snap() });
  return steps;
}

// ─────────────────────────────── Geometría ────────────────────────────────
const nodeById = new Map(NODES.map((n) => [n.id, n]));

export default function mountDijkstra(host, meta = {}) {
  const S = STRINGS[getLang()] || STRINGS.en;

  // ── Lienzo: SVG (aristas + pesos) + nodos absolutos + narrador ──
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', 'dij-edges');
  svg.setAttribute('preserveAspectRatio', 'none');
  svg.setAttribute('viewBox', '0 0 100 100');

  // refs a las líneas y a los textos de peso por clave de arista
  const edgeLines = new Map();
  for (const { u, v, w } of EDGES) {
    const a = nodeById.get(u);
    const b = nodeById.get(v);
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', a.x);
    line.setAttribute('y1', a.y);
    line.setAttribute('x2', b.x);
    line.setAttribute('y2', b.y);
    line.setAttribute('class', 'dij-edge');
    svg.append(line);
    edgeLines.set(edgeKey(u, v), line);
  }

  // Etiquetas de peso: en HTML (no SVG) para tipografía nítida y centrada.
  const board = el('div', { class: 'dij-board' });
  for (const { u, v, w } of EDGES) {
    const a = nodeById.get(u);
    const b = nodeById.get(v);
    const wl = el('span', { class: 'dij-weight' }, String(w));
    wl.style.left = (a.x + b.x) / 2 + '%';
    wl.style.top = (a.y + b.y) / 2 + '%';
    wl.dataset.edge = edgeKey(u, v);
    board.append(wl);
  }
  const weightEls = new Map();
  board.querySelectorAll('.dij-weight').forEach((w) => weightEls.set(w.dataset.edge, w));

  // Nodos: círculo con id + etiqueta de distancia tentativa.
  const nodeEls = new Map();
  for (const n of NODES) {
    const distLabel = el('span', { class: 'dij-node-dist mono' }, '∞');
    const nodeEl = el(
      'div',
      { class: 'dij-node' + (n.id === SOURCE ? ' dij-source' : '') },
      el('span', { class: 'dij-node-id' }, n.id),
      distLabel
    );
    nodeEl.style.left = n.x + '%';
    nodeEl.style.top = n.y + '%';
    nodeEl._dist = distLabel;
    board.append(nodeEl);
    nodeEls.set(n.id, nodeEl);
  }

  const narrator = el('div', { class: 'narrator' }, S.ready);
  const canvas = el('div', { class: 'stage-canvas dij-stage' }, svg, board, narrator);

  const setNarration = (html) => {
    narrator.innerHTML = html;
  };

  // ── Tarjeta de distancias tentativas (en el aside) ──
  const distRows = new Map();
  const distGrid = el('div', { class: 'dij-dist-grid' });
  for (const n of NODES) {
    const chip = el('span', { class: 'dij-dist-id mono' }, n.id);
    const val = el('span', { class: 'dij-dist-val mono' }, n.id === SOURCE ? '0' : '∞');
    const row = el('div', { class: 'dij-dist-row' }, chip, val);
    distRows.set(n.id, { row, val });
    distGrid.append(row);
  }

  // ── Helpers de render ──
  function clearActive() {
    nodeEls.forEach((e) => e.classList.remove('dij-active'));
    edgeLines.forEach((l) => l.classList.remove('dij-edge-active', 'dij-edge-relaxed'));
    weightEls.forEach((w) => w.classList.remove('dij-weight-active'));
  }

  function paintDistances(distMap) {
    for (const n of NODES) {
      const d = distMap[n.id];
      const txt = d === INF || d === null ? '∞' : String(d);
      nodeEls.get(n.id)._dist.textContent = txt;
      nodeEls.get(n.id).classList.toggle('dij-reached', d !== INF && d !== null);
      const r = distRows.get(n.id);
      r.val.textContent = txt;
      r.row.classList.toggle('dij-dist-inf', d === INF || d === null);
    }
  }

  function resetVisual() {
    clearActive();
    nodeEls.forEach((e) => e.classList.remove('dij-final', 'dij-reached', 'dij-win'));
    // estado inicial: src=0, resto ∞
    const init = Object.fromEntries(NODES.map((n) => [n.id, n.id === SOURCE ? 0 : INF]));
    paintDistances(init);
    setNarration(S.ready);
  }

  function apply(step) {
    switch (step.type) {
      case 'init':
        clearActive();
        nodeEls.forEach((e) => e.classList.remove('dij-final', 'dij-win'));
        paintDistances(step.dist);
        return S.init(SOURCE);

      case 'select': {
        clearActive();
        paintDistances(step.distMap);
        const ne = nodeEls.get(step.node);
        ne.classList.add('dij-final');
        ne.classList.add('dij-active');
        return S.select(step.node, step.dist);
      }

      case 'relax': {
        clearActive();
        paintDistances(step.distMap);
        nodeEls.get(step.from).classList.add('dij-final');
        const ln = edgeLines.get(step.edge);
        if (ln) ln.classList.add('dij-edge-relaxed');
        const we = weightEls.get(step.edge);
        if (we) we.classList.add('dij-weight-active');
        nodeEls.get(step.to).classList.add('dij-active');
        return S.relax(step.from, step.to, step.oldDist, step.newDist);
      }

      case 'skip': {
        clearActive();
        paintDistances(step.distMap);
        nodeEls.get(step.from).classList.add('dij-final');
        const ln = edgeLines.get(step.edge);
        if (ln) ln.classList.add('dij-edge-active');
        const we = weightEls.get(step.edge);
        if (we) we.classList.add('dij-weight-active');
        return S.skip(step.from, step.to, step.dist);
      }

      case 'done': {
        clearActive();
        paintDistances(step.dist);
        nodeEls.forEach((e) => e.classList.add('dij-final'));
        NODES.forEach((n, i) => {
          setTimeout(() => nodeEls.get(n.id).classList.add('dij-win'), i * 70);
        });
        return S.done(SOURCE);
      }
    }
  }

  // ── Player + transporte ──
  const player = new Player({
    steps: buildTrace(),
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

  const distCard = el(
    'div',
    { class: 'info-card dij-dist-card' },
    el('h4', {}, S.distTitle),
    distGrid,
    el(
      'div',
      { style: { marginTop: '8px', fontSize: '12px', color: '#76749a' } },
      S.distFrom(SOURCE)
    )
  );

  const legend = el(
    'div',
    { class: 'info-card' },
    el('h4', {}, 'GPS'),
    el(
      'div',
      { class: 'dij-legend' },
      el('span', { class: 'dij-leg dij-leg-final' }, S.legendFinal),
      el('span', { class: 'dij-leg dij-leg-active' }, S.legendActive),
      el('span', { class: 'dij-leg dij-leg-inf' }, S.legendInf)
    )
  );

  const aside = el(
    'div',
    { class: 'scene-aside' },
    infoCard(S.cardAlgoTitle, el('span', { class: 'big' }, 'Dijkstra'), S.cardAlgoSub),
    infoCard(S.cardComplexityTitle, el('span', { class: 'big' }, 'O(E log V)'), S.cardComplexitySub),
    infoCard(S.cardSourceTitle, el('code', {}, SOURCE), S.cardSourceSub),
    distCard,
    legend
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
    sub ? el('div', { style: { marginTop: '6px', fontSize: '12px', color: '#76749a' } }, sub) : null
  );
}
