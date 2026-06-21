// Escena: Topological Sort (Kahn) — "Vestirse en el orden correcto".
//
// Trace FIEL al algoritmo de Kahn sobre un DAG FIJO de dependencias de ropa:
//   underwear → pants
//   pants     → belt, shoes
//   socks     → shoes
//   shirt     → tie, jacket
//   tie       → jacket
//   belt      → jacket
//
// Kahn:
//   1) calcular in-degree de cada nodo.
//   2) repetir: tomar un nodo con in-degree 0 (desempate por orden fijo),
//      agregarlo a la salida, y quitar sus aristas salientes (decrementar el
//      in-degree de sus vecinos). Quitar una arista puede "liberar" otro nodo.
//
// Metáfora: cada nodo es una prenda. Un nodo con in-degree 0 (no requiere nada
// antes) BRILLA y se "pone": pasa a una lista numerada y ordenada abajo; sus
// flechas de dependencia salientes se borran, habilitando los siguientes.

import { el, clear } from '../dom.js';
import { Player, buildTransport } from '../player.js';
import { getLang } from '../i18n.js';

// ── CSS propio de la escena, autoinyectado una vez (no editamos index.html) ──
const CSS_HREF = './css/scene-topological-sort.css';
if (!document.querySelector('link[data-scene="topological-sort"]')) {
  document.head.append(
    el('link', { rel: 'stylesheet', href: CSS_HREF, dataset: { scene: 'topological-sort' } }),
  );
}

const tag = (v) => `<span class="mono">${v}</span>`;

// ── Idiomas (inglés por defecto; español opcional) ───────────────────────────
const STRINGS = {
  en: {
    ready: 'Ready to play. Get dressed in the right order.',
    indegree: 'in',
    queueLabel: 'READY TO PUT ON · in-degree 0',
    orderLabel: 'GETTING DRESSED · ORDER',
    pick: (label, emoji) =>
      `${emoji} ${tag(label)} needs nothing first (in-degree 0) → put it on. ✨`,
    removeEdge: (from, to, emoji, deg) =>
      `Remove ${tag(from)} → ${tag(to)}: ${emoji} ${tag(to)} needs 1 fewer. in-degree → ${tag(deg)}.`,
    freed: (label, emoji) => `${emoji} ${tag(label)} reaches in-degree 0 — it can be put on next.`,
    done: (order) => `Fully dressed! A valid order: ${tag(order)} ✨`,
    cardAlgoTitle: 'Algorithm',
    cardAlgoSub: "Kahn's, in-degree 0 first",
    cardComplexityTitle: 'Complexity',
    cardComplexitySub: 'V + E',
    cardOrderTitle: 'Resulting order',
    cardOrderSub: 'a valid topological order',
    cardEmpty: '—',
  },
  es: {
    ready: 'Listo para reproducir. Vestite en el orden correcto.',
    indegree: 'in',
    queueLabel: 'LISTO PARA PONERSE · in-degree 0',
    orderLabel: 'VISTIÉNDOSE · ORDEN',
    pick: (label, emoji) =>
      `${emoji} ${tag(label)} no necesita nada antes (in-degree 0) → se pone. ✨`,
    removeEdge: (from, to, emoji, deg) =>
      `Quito ${tag(from)} → ${tag(to)}: ${emoji} ${tag(to)} necesita 1 menos. in-degree → ${tag(deg)}.`,
    freed: (label, emoji) => `${emoji} ${tag(label)} llega a in-degree 0 — se puede poner ahora.`,
    done: (order) => `¡Vestido completo! Un orden válido: ${tag(order)} ✨`,
    cardAlgoTitle: 'Algoritmo',
    cardAlgoSub: 'Kahn, in-degree 0 primero',
    cardComplexityTitle: 'Complejidad',
    cardComplexitySub: 'V + E',
    cardOrderTitle: 'Orden resultante',
    cardOrderSub: 'un orden topológico válido',
    cardEmpty: '—',
  },
};

// ── DAG FIJO de prendas. Orden del array = orden de desempate de Kahn. ────────
// x,y en % sobre el tablero (la raíz de dependencias arriba, jacket abajo).
const NODES = [
  { id: 'underwear', en: 'underwear', es: 'ropa interior', emoji: '🩲', x: 18, y: 14 },
  { id: 'socks', en: 'socks', es: 'medias', emoji: '🧦', x: 50, y: 14 },
  { id: 'shirt', en: 'shirt', es: 'camisa', emoji: '👔', x: 82, y: 14 },
  { id: 'pants', en: 'pants', es: 'pantalón', emoji: '👖', x: 18, y: 45 },
  { id: 'tie', en: 'tie', es: 'corbata', emoji: '👔', x: 82, y: 45 },
  { id: 'belt', en: 'belt', es: 'cinturón', emoji: '🪢', x: 8, y: 74 },
  { id: 'shoes', en: 'shoes', es: 'zapatos', emoji: '👞', x: 40, y: 74 },
  { id: 'jacket', en: 'jacket', es: 'saco', emoji: '🧥', x: 78, y: 74 },
];

// aristas dirigidas from → to (requisito: from antes que to)
const EDGES = [
  ['underwear', 'pants'],
  ['pants', 'belt'],
  ['pants', 'shoes'],
  ['socks', 'shoes'],
  ['shirt', 'tie'],
  ['shirt', 'jacket'],
  ['tie', 'jacket'],
  ['belt', 'jacket'],
];

// índice fijo para el desempate (orden de NODES)
const ORDER_INDEX = new Map(NODES.map((n, i) => [n.id, i]));

// ── Traza con el algoritmo de Kahn REAL ──────────────────────────────────────
function buildTrace() {
  const steps = [];
  const indeg = new Map(NODES.map((n) => [n.id, 0]));
  const adj = new Map(NODES.map((n) => [n.id, []]));
  for (const [from, to] of EDGES) {
    adj.get(from).push(to);
    indeg.set(to, indeg.get(to) + 1);
  }

  // cola de nodos con in-degree 0; se mantiene ordenada por el índice fijo.
  const ready = NODES.filter((n) => indeg.get(n.id) === 0).map((n) => n.id);
  ready.sort((a, b) => ORDER_INDEX.get(a) - ORDER_INDEX.get(b));

  const output = [];
  while (ready.length) {
    const id = ready.shift();
    output.push(id);
    steps.push({ type: 'pick', id });

    for (const to of adj.get(id)) {
      const deg = indeg.get(to) - 1;
      indeg.set(to, deg);
      const freed = deg === 0;
      steps.push({ type: 'removeEdge', from: id, to, deg, freed });
      if (freed) {
        // inserción ordenada por el índice de desempate
        let i = 0;
        while (i < ready.length && ORDER_INDEX.get(ready[i]) < ORDER_INDEX.get(to)) i++;
        ready.splice(i, 0, to);
      }
    }
  }

  steps.push({ type: 'done', order: output.slice() });
  return steps;
}

const byId = new Map(NODES.map((n) => [n.id, n]));

export default function mountTopologicalSort(host) {
  const S = STRINGS[getLang()] || STRINGS.en;
  const lang = getLang() === 'es' ? 'es' : 'en';
  const labelOf = (id) => byId.get(id)[lang];
  const emojiOf = (id) => byId.get(id).emoji;

  // ── lienzo ──
  const board = el('div', { class: 'tsg-board' });

  const edgesSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  edgesSvg.setAttribute('class', 'tsg-edges');
  edgesSvg.setAttribute('preserveAspectRatio', 'none');
  edgesSvg.setAttribute('viewBox', '0 0 100 100');

  // marcador de flecha (arrowhead)
  const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
  const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
  marker.setAttribute('id', 'tsg-arrow');
  marker.setAttribute('viewBox', '0 0 10 10');
  marker.setAttribute('refX', '8');
  marker.setAttribute('refY', '5');
  marker.setAttribute('markerWidth', '7');
  marker.setAttribute('markerHeight', '7');
  marker.setAttribute('orient', 'auto-start-reverse');
  marker.setAttribute('markerUnits', 'userSpaceOnUse');
  const arrowPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  arrowPath.setAttribute('d', 'M 0 0 L 10 5 L 0 10 z');
  arrowPath.setAttribute('class', 'tsg-arrowhead');
  marker.append(arrowPath);
  defs.append(marker);
  edgesSvg.append(defs);

  // nodos como círculos absolutos
  const nodeEls = new Map(); // id → { node, badge }
  for (const n of NODES) {
    const badge = el('span', { class: 'tsg-badge mono' }, '0');
    const node = el(
      'div',
      { class: 'tsg-node' },
      el('span', { class: 'tsg-emoji' }, n.emoji),
      el('span', { class: 'tsg-label' }, n[lang]),
      badge,
    );
    node.style.left = n.x + '%';
    node.style.top = n.y + '%';
    board.append(node);
    nodeEls.set(n.id, { node, badge });
  }

  // aristas (una <line> por arista, con flecha)
  const edgeEls = new Map(); // "from→to" → line
  // acortamos la línea para no entrar al nodo (radio ~ en unidades de viewBox)
  for (const [from, to] of EDGES) {
    const a = byId.get(from);
    const b = byId.get(to);
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const len = Math.hypot(dx, dy) || 1;
    const ux = dx / len;
    const uy = dy / len;
    const PAD_A = 7; // sale del borde del nodo origen
    const PAD_B = 9; // llega antes del borde del nodo destino (deja lugar a la flecha)
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', a.x + ux * PAD_A);
    line.setAttribute('y1', a.y + uy * PAD_A);
    line.setAttribute('x2', b.x - ux * PAD_B);
    line.setAttribute('y2', b.y - uy * PAD_B);
    line.setAttribute('class', 'tsg-edge');
    line.setAttribute('marker-end', 'url(#tsg-arrow)');
    edgesSvg.append(line);
    edgeEls.set(from + '→' + to, line);
  }

  // ── zona de salida (orden numerado) ──
  const orderRow = el('div', { class: 'tsg-order' });
  const orderWrap = el(
    'div',
    { class: 'tsg-order-wrap' },
    el('span', { class: 'tsg-zone-label' }, S.orderLabel),
    orderRow,
  );

  const narrator = el('div', { class: 'narrator' }, S.ready);
  const canvas = el(
    'div',
    { class: 'stage-canvas tsg-stage' },
    edgesSvg,
    board,
    orderWrap,
    narrator,
  );

  const setNarration = (html) => {
    narrator.innerHTML = html;
  };

  // in-degree inicial para el render de badges en reset.
  function initialIndeg() {
    const indeg = new Map(NODES.map((n) => [n.id, 0]));
    for (const [, to] of EDGES) indeg.set(to, indeg.get(to) + 1);
    return indeg;
  }

  function setBadge(id, deg) {
    const { node, badge } = nodeEls.get(id);
    badge.textContent = String(deg);
    node.classList.toggle('tsg-ready', deg === 0);
  }

  function resetVisual() {
    const indeg = initialIndeg();
    for (const n of NODES) {
      const { node } = nodeEls.get(n.id);
      node.classList.remove('tsg-pick', 'tsg-done', 'tsg-freed');
      node.style.opacity = '1';
      setBadge(n.id, indeg.get(n.id));
    }
    for (const line of edgeEls.values()) {
      line.classList.remove('tsg-edge-gone');
      line.style.opacity = '1';
    }
    clear(orderRow);
    setNarration(S.ready);
  }

  let placedCount = 0;

  function apply(step) {
    switch (step.type) {
      case 'pick': {
        const { node } = nodeEls.get(step.id);
        node.classList.remove('tsg-ready');
        node.classList.add('tsg-pick');
        // pasa a la lista ordenada abajo
        placedCount += 1;
        const chip = el(
          'div',
          { class: 'tsg-chip' },
          el('span', { class: 'tsg-chip-num mono' }, String(placedCount)),
          el('span', { class: 'tsg-chip-emoji' }, emojiOf(step.id)),
          el('span', { class: 'tsg-chip-label' }, labelOf(step.id)),
        );
        orderRow.append(chip);
        requestAnimationFrame(() => chip.classList.add('tsg-chip-in'));
        // el nodo del tablero se atenúa (ya está puesto)
        setTimeout(() => node.classList.add('tsg-done'), 260);
        return S.pick(labelOf(step.id), emojiOf(step.id));
      }
      case 'removeEdge': {
        const line = edgeEls.get(step.from + '→' + step.to);
        if (line) {
          line.classList.add('tsg-edge-gone');
          line.style.opacity = '0';
        }
        setBadge(step.to, step.deg);
        if (step.freed) {
          const { node } = nodeEls.get(step.to);
          node.classList.add('tsg-freed');
          setTimeout(() => node.classList.remove('tsg-freed'), 600);
          return S.freed(labelOf(step.to), emojiOf(step.to));
        }
        return S.removeEdge(labelOf(step.from), labelOf(step.to), emojiOf(step.to), step.deg);
      }
      case 'done': {
        for (const id of step.order) {
          const { node } = nodeEls.get(id);
          node.classList.add('tsg-done');
        }
        orderRow.querySelectorAll('.tsg-chip').forEach((c, i) => {
          setTimeout(() => c.classList.add('tsg-chip-win'), i * 70);
        });
        const order = step.order.map((id) => labelOf(id)).join(' → ');
        return S.done(order);
      }
    }
  }

  const trace = buildTrace();
  const finalOrder = trace[trace.length - 1].order;

  const player = new Player({
    steps: trace,
    apply,
    reset: () => {
      placedCount = 0;
      resetVisual();
    },
    baseDelay: 760,
  });
  const { bar, sync } = buildTransport(player);
  player.onChange = (s) => {
    sync(s);
    if (s.narration) setNarration(s.narration);
  };

  const stage = el('div', { class: 'stage' }, canvas, bar);

  const orderText = finalOrder.map((id) => labelOf(id)).join(' → ');
  const aside = el(
    'div',
    { class: 'scene-aside' },
    infoCard(S.cardAlgoTitle, el('span', { class: 'big' }, 'Kahn'), S.cardAlgoSub),
    infoCard(S.cardComplexityTitle, el('span', { class: 'big' }, 'O(V + E)'), S.cardComplexitySub),
    infoCard(S.cardOrderTitle, el('code', { class: 'tsg-order-code' }, orderText), S.cardOrderSub),
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
      : null,
  );
}
