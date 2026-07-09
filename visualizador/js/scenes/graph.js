// Escena: Graph — "La red de amistades" (grafo no dirigido, lista de adyacencia).
//
// Nodos en círculo; clic en uno lo selecciona, clic en otro los conecta con un
// eje. A la derecha, la MISMA estructura como lista de adyacencia (nodo → vecinos).
// Refleja la semántica real de Estructuras-de-datos/graph/graph.js.

import { el, clear } from '../dom.js';
import { getLang } from '../i18n.js';

const SVGNS = 'http://www.w3.org/2000/svg';
const SIZE = 300;
const CENTER = SIZE / 2;
const R = 110;
const NODE = 40;
const LABELS = 'ABCDEFGHIJ';

const STRINGS = {
  en: {
    initial: 'Click a node, then another, to connect them. <b>addNode()</b> adds one.',
    addBtn: 'addNode()',
    clearBtn: '🗑  clear',
    selectMsg: (n) => `Selected <b>${n}</b> — click another node to add an edge.`,
    edgeMsg: (a, b) => `<b>addEdge(${a}, ${b})</b> → connected (undirected).`,
    dupMsg: (a, b) => `<b>${a}–${b}</b> already connected.`,
    addNodeMsg: (n) => `<b>addNode(${n})</b> → new isolated node.`,
    fullMsg: 'Max nodes reached — connect the ones you have.',
    cleared: 'Graph cleared.',
    adjLabel: 'adjacency list',
    cardNodesSub: 'nodes · V',
    cardEdgesSub: 'edges · E',
  },
  es: {
    initial: 'Clic en un nodo y luego en otro para conectarlos. <b>addNode()</b> agrega uno.',
    addBtn: 'addNode()',
    clearBtn: '🗑  vaciar',
    selectMsg: (n) => `Seleccionaste <b>${n}</b> — clic en otro nodo para agregar un eje.`,
    edgeMsg: (a, b) => `<b>addEdge(${a}, ${b})</b> → conectados (no dirigido).`,
    dupMsg: (a, b) => `<b>${a}–${b}</b> ya estaban conectados.`,
    addNodeMsg: (n) => `<b>addNode(${n})</b> → nodo nuevo aislado.`,
    fullMsg: 'Máximo de nodos — conectá los que tenés.',
    cleared: 'Grafo vaciado.',
    adjLabel: 'lista de adyacencia',
    cardNodesSub: 'nodos · V',
    cardEdgesSub: 'ejes · E',
  },
};

// Grafo fiel al repo: no dirigido, lista de adyacencia.
class Graph {
  constructor() {
    this.adj = new Map();
  }
  addNode(n) {
    if (this.adj.has(n)) return false;
    this.adj.set(n, new Set());
    return true;
  }
  addEdge(a, b) {
    if (a === b) return false;
    this.addNode(a);
    this.addNode(b);
    if (this.adj.get(a).has(b)) return false;
    this.adj.get(a).add(b);
    this.adj.get(b).add(a);
    return true;
  }
  neighbors(n) {
    return this.adj.has(n) ? [...this.adj.get(n)] : [];
  }
  nodes() {
    return [...this.adj.keys()];
  }
  size() {
    return this.adj.size;
  }
  edgeCount() {
    let e = 0;
    for (const s of this.adj.values()) e += s.size;
    return e / 2;
  }
}

export default function mountGraph(host) {
  const S = STRINGS[getLang()] || STRINGS.en;
  const g = new Graph();
  let selected = null;

  const board = el('div', { class: 'gr-board' });
  const adj = el('div', { class: 'gr-adj' });
  const canvas = el('div', { class: 'stage-canvas gr-stage' }, board, adj);
  const narrator = el('div', { class: 'narrator' }, S.initial);
  canvas.append(narrator);

  const setNarration = (html) => {
    narrator.innerHTML = html;
  };

  const posOf = (i, n) => {
    const a = (i / Math.max(n, 1)) * Math.PI * 2 - Math.PI / 2;
    return { x: CENTER + R * Math.cos(a), y: CENTER + R * Math.sin(a) };
  };

  function onNodeClick(label) {
    if (selected === null) {
      selected = label;
      setNarration(S.selectMsg(label));
    } else if (selected === label) {
      selected = null;
      setNarration(S.initial);
    } else {
      const a = selected;
      const added = g.addEdge(a, label);
      setNarration(added ? S.edgeMsg(a, label) : S.dupMsg(a, label));
      selected = null;
    }
    render();
    syncStats();
  }

  function render() {
    clear(board);
    const nodes = g.nodes();
    const n = nodes.length;
    const index = new Map(nodes.map((v, i) => [v, i]));

    // Edges (cada eje no dirigido una sola vez: índice menor → mayor).
    const svg = document.createElementNS(SVGNS, 'svg');
    svg.setAttribute('class', 'gr-links');
    svg.setAttribute('viewBox', `0 0 ${SIZE} ${SIZE}`);
    svg.setAttribute('width', String(SIZE));
    svg.setAttribute('height', String(SIZE));
    for (const a of nodes) {
      for (const b of g.neighbors(a)) {
        if (index.get(a) < index.get(b)) {
          const pa = posOf(index.get(a), n);
          const pb = posOf(index.get(b), n);
          const line = document.createElementNS(SVGNS, 'line');
          line.setAttribute('x1', String(pa.x));
          line.setAttribute('y1', String(pa.y));
          line.setAttribute('x2', String(pb.x));
          line.setAttribute('y2', String(pb.y));
          const hot = selected && (a === selected || b === selected);
          line.setAttribute('class', hot ? 'is-hot' : '');
          svg.append(line);
        }
      }
    }
    board.append(svg);

    // Nodos.
    const neighborsOfSel = selected ? new Set(g.neighbors(selected)) : new Set();
    nodes.forEach((label, i) => {
      const { x, y } = posOf(i, n);
      const isSel = label === selected;
      const isNb = neighborsOfSel.has(label);
      const node = el(
        'button',
        {
          class: `gr-node${isSel ? ' is-selected' : ''}${isNb ? ' is-neighbor' : ''}`,
          style: { left: `${x - NODE / 2}px`, top: `${y - NODE / 2}px` },
        },
        label,
      );
      node.addEventListener('click', () => onNodeClick(label));
      board.append(node);
    });

    // Lista de adyacencia.
    clear(adj);
    adj.append(el('div', { class: 'gr-adj-label' }, S.adjLabel));
    if (n === 0) {
      adj.append(el('span', { class: 'gr-adj-empty' }, '∅'));
    } else {
      for (const label of nodes) {
        const nbs = g.neighbors(label);
        adj.append(
          el(
            'div',
            { class: 'gr-adj-row' },
            el('span', { class: 'gr-adj-key' }, label),
            el('span', { class: 'gr-adj-arrow' }, '→'),
            el('span', { class: 'gr-adj-vals' }, nbs.length ? nbs.join(', ') : '·'),
          ),
        );
      }
    }
  }

  function syncStats() {
    statNodes.textContent = String(g.size());
    statEdges.textContent = String(g.edgeCount());
    addBtn.disabled = g.size() >= LABELS.length;
    clearBtn.disabled = g.size() === 0;
  }

  function doAddNode() {
    if (g.size() >= LABELS.length) {
      setNarration(S.fullMsg);
      return;
    }
    const label = LABELS[g.size()];
    g.addNode(label);
    setNarration(S.addNodeMsg(label));
    render();
    syncStats();
  }

  function doClear() {
    g.adj.clear();
    selected = null;
    setNarration(S.cleared);
    render();
    syncStats();
  }

  const addBtn = el('button', { class: 'tbtn primary' }, S.addBtn);
  const clearBtn = el('button', { class: 'tbtn' }, S.clearBtn);
  addBtn.addEventListener('click', doAddNode);
  clearBtn.addEventListener('click', doClear);

  const bar = el('div', { class: 'transport' }, addBtn, el('span', { class: 'spacer' }), clearBtn);

  const statNodes = el('span', { class: 'big' }, '0');
  const statEdges = el('span', { class: 'big' }, '0');

  const stage = el('div', { class: 'stage' }, canvas, bar);
  const aside = el(
    'div',
    { class: 'scene-aside' },
    infoCard('nodes()', statNodes, S.cardNodesSub),
    infoCard('edges', statEdges, S.cardEdgesSub),
  );

  clear(host);
  host.append(stage, aside);

  // Arranca con un grafito de ejemplo.
  g.addEdge('A', 'B');
  g.addEdge('A', 'C');
  g.addEdge('B', 'D');
  render();
  syncStats();

  return { destroy: () => {} };
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
