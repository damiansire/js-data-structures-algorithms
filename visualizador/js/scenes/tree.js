// Escena: Árbol GENERAL (n-ario) como ORGANIGRAMA que se despliega en abanico.
//
// Trace FIEL a Estructuras-de-datos/tree/tree.js:
//   - TreeNode { value, children: [] }; addChild empuja al final (children.push).
//   - El árbol se arma con insertByPath(value, path) en ESE orden de inserción.
//   - El recorrido natural de un árbol n-ario así direccionado por path es
//     DFS pre-orden: visito el nodo y luego recorro children de izq. a der.
//     (mismo sentido en que selectedByPath navega .GetChildByValue por nivel).
//
// Visual: cada nodo es una tarjeta (div) conectada por una línea SVG a su padre.
// Layout tidy por niveles: y = profundidad, x = reparto por ancho de subárbol
// (los hijos se reparten bajo el padre, sin solaparse). Cada step del Player =
// visitar/expandir un nodo: al expandir, sus hijos se abren en ABANICO desde la
// posición del padre, escalonados. El nodo actual queda resaltado.

import { el, clear } from '../dom.js';
import { Player, buildTransport } from '../player.js';
import { getLang } from '../i18n.js';

// ── Strings bilingües (inglés por defecto, español opcional) ─────────────────
const STRINGS = {
  en: {
    ready: 'Ready to play.',
    visit: (n, ruta) =>
      `Visit <span class="mono">${n.value}</span> ${n.icon} &nbsp;·&nbsp; path <span class="mono">${ruta}</span>`,
    expand: (n, count, names) =>
      `Expand the ${count} children of <span class="mono">${n.value}</span> as a fan → ${names}`,
    leaf: (n) => `<span class="mono">${n.value}</span> is a leaf (no children) 🍃`,
    done: 'DFS pre-order traversal complete: visited the whole org chart ✨',
    info_structure_title: 'Structure',
    info_structure_big: 'N-ary tree',
    info_structure_sub: 'arbitrary children per node',
    info_traversal_title: 'Traversal',
    info_traversal_big: 'DFS pre-order',
    info_traversal_sub: 'node → children (left→right)',
    info_nodes_title: 'Nodes',
    info_nodes_sub: (d) => `max depth ${d}`,
  },
  es: {
    ready: 'Listo para reproducir.',
    visit: (n, ruta) =>
      `Visito <span class="mono">${n.value}</span> ${n.icon} &nbsp;·&nbsp; ruta <span class="mono">${ruta}</span>`,
    expand: (n, count, names) =>
      `Despliego los ${count} hijos de <span class="mono">${n.value}</span> en abanico → ${names}`,
    leaf: (n) => `<span class="mono">${n.value}</span> es una hoja (sin hijos) 🍃`,
    done: 'Recorrido DFS pre-orden completo: visité todo el organigrama ✨',
    info_structure_title: 'Estructura',
    info_structure_big: 'Árbol n-ario',
    info_structure_sub: 'hijos arbitrarios por nodo',
    info_traversal_title: 'Recorrido',
    info_traversal_big: 'DFS pre-orden',
    info_traversal_sub: 'nodo → hijos (izq→der)',
    info_nodes_title: 'Nodos',
    info_nodes_sub: (d) => `profundidad máx ${d}`,
  },
};

// ── Árbol fijo, en el MISMO orden de inserción que tree.js ───────────────────
//   fileSystem.root = "Equipo"
//   insertByPath("C:"); insertByPath("D:");
//   insertByPath("Datos","D:");
//   insertByPath("Bin","C:"); insertByPath("Usuarios","C:"); insertByPath("Windows","C:");
//   insertByPath("Damian","C:/Usuarios"); insertByPath("Publico","C:/Usuarios");
//   insertByPath("Escritorio","C:/Usuarios/Damian"); insertByPath("Documentos","C:/Usuarios/Damian");
//   insertByPath("MaterialDeEstudio","C:/Usuarios/Damian/Documentos");
const TREE = {
  value: 'Equipo',
  icon: '🖥️',
  children: [
    {
      value: 'C:',
      icon: '💽',
      children: [
        { value: 'Bin', icon: '📁', children: [] },
        {
          value: 'Usuarios',
          icon: '📁',
          children: [
            {
              value: 'Damian',
              icon: '👤',
              children: [
                { value: 'Escritorio', icon: '🗂️', children: [] },
                {
                  value: 'Documentos',
                  icon: '📂',
                  children: [{ value: 'MaterialDeEstudio', icon: '📄', children: [] }],
                },
              ],
            },
            { value: 'Publico', icon: '👥', children: [] },
          ],
        },
        { value: 'Windows', icon: '🪟', children: [] },
      ],
    },
    {
      value: 'D:',
      icon: '💽',
      children: [{ value: 'Datos', icon: '📁', children: [] }],
    },
  ],
};

// ── Layout tidy: x por reparto de "hojas" (ancho de subárbol), y por nivel ──
const COL = 86; // ancho horizontal por hoja
const ROW = 104; // alto por nivel
const PAD_X = 40;
const PAD_Y = 34;

// Asigna a cada nodo: id, depth, parent y posición (xUnits = centro en columnas).
function layout(root) {
  const nodes = [];
  let leafCursor = 0;
  let id = 0;

  function walk(node, depth, parentId) {
    const self = {
      id: id++,
      value: node.value,
      icon: node.icon,
      depth,
      parentId,
      children: [],
    };
    nodes.push(self);
    if (node.children.length === 0) {
      self.xUnits = leafCursor + 0.5; // ocupa una columna
      leafCursor += 1;
    } else {
      const childIds = node.children.map((c) => walk(c, depth + 1, self.id));
      self.children = childIds;
      const first = nodes[childIds[0]];
      const last = nodes[childIds[childIds.length - 1]];
      self.xUnits = (first.xUnits + last.xUnits) / 2; // centrado sobre sus hijos
    }
    return self.id;
  }
  walk(root, 0, null);
  return nodes;
}

const NODES = layout(TREE);
const TOTAL_LEAVES = Math.max(...NODES.map((n) => n.xUnits)) + 0.5;
const W = PAD_X * 2 + TOTAL_LEAVES * COL;
const MAX_DEPTH = Math.max(...NODES.map((n) => n.depth));
const H = PAD_Y * 2 + (MAX_DEPTH + 0.5) * ROW + 30;

const px = (n) => PAD_X + n.xUnits * COL;
const py = (n) => PAD_Y + n.depth * ROW;

// ── Recorrido DFS pre-orden: visitar nodo → expandir (abanico) hijos ─────────
function buildTrace() {
  const steps = [];
  function dfs(nodeId) {
    const node = NODES[nodeId];
    steps.push({ type: 'visit', id: nodeId });
    if (node.children.length) {
      steps.push({ type: 'expand', id: nodeId, children: node.children });
      for (const childId of node.children) dfs(childId);
    } else {
      steps.push({ type: 'leaf', id: nodeId });
    }
  }
  dfs(0);
  steps.push({ type: 'done' });
  return steps;
}

export default function mountTree(host, meta) {
  const S = STRINGS[getLang()] || STRINGS.en;
  const W_ = Math.round(W);
  const H_ = Math.round(H);

  // SVG overlay para las líneas padre→hijo.
  const SVGNS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(SVGNS, 'svg');
  svg.setAttribute('class', 'tr-links');
  svg.setAttribute('viewBox', `0 0 ${W_} ${H_}`);
  svg.setAttribute('width', String(W_));
  svg.setAttribute('height', String(H_));

  // Una línea por nodo (desde su padre). Identidad estable por id.
  const lines = NODES.map((n) => {
    if (n.parentId == null) return null;
    const p = NODES[n.parentId];
    const ln = document.createElementNS(SVGNS, 'path');
    ln.setAttribute('class', 'tr-link');
    // curva suave vertical: M padre … C … hijo
    const x1 = px(p);
    const y1 = py(p) + 26;
    const x2 = px(n);
    const y2 = py(n) - 26;
    const my = (y1 + y2) / 2;
    ln.setAttribute('d', `M ${x1} ${y1} C ${x1} ${my}, ${x2} ${my}, ${x2} ${y2}`);
    svg.append(ln);
    return ln;
  });

  // Tarjetas (divs) posicionadas absolutamente.
  const cards = NODES.map((n) => {
    const card = el(
      'div',
      {
        class:
          'tr-node' +
          (n.depth === 0 ? ' tr-root' : '') +
          (n.children.length === 0 ? ' tr-leaf-node' : ''),
        style: { left: `${px(n)}px`, top: `${py(n)}px` },
      },
      el('span', { class: 'tr-ico' }, n.icon),
      el('span', { class: 'tr-label' }, n.value),
    );
    return card;
  });

  const plane = el(
    'div',
    { class: 'tr-plane', style: { width: `${W_}px`, height: `${H_}px` } },
    svg,
    ...cards,
  );
  const scroll = el('div', { class: 'tr-scroll' }, plane);

  const canvas = el('div', { class: 'stage-canvas tr-stage' }, scroll);
  const narrator = el('div', { class: 'narrator' }, S.ready);
  canvas.append(narrator);

  function setNarration(html) {
    narrator.innerHTML = html;
  }

  // estado visual
  let revealed = new Set();

  function showNode(id, stagger = 0) {
    revealed.add(id);
    const card = cards[id];
    const ln = lines[id];
    setTimeout(() => {
      card.classList.add('tr-shown');
      if (ln) ln.classList.add('tr-link-shown');
    }, stagger);
  }

  function resetVisual() {
    revealed = new Set();
    cards.forEach((c) =>
      c.classList.remove('tr-shown', 'tr-current', 'tr-visited', 'tr-expanded', 'tr-fan'),
    );
    lines.forEach((l) => l && l.classList.remove('tr-link-shown', 'tr-link-active'));
    // la raíz arranca visible
    showNode(0, 0);
    cards[0].classList.add('tr-current');
    setNarration(S.ready);
  }

  function clearCurrent() {
    cards.forEach((c) => c.classList.remove('tr-current'));
  }

  function apply(step) {
    switch (step.type) {
      case 'visit': {
        clearCurrent();
        const n = NODES[step.id];
        // asegurá que el nodo (y su línea) estén a la vista
        if (!revealed.has(step.id)) showNode(step.id, 0);
        cards[step.id].classList.add('tr-current');
        cards[step.id].classList.remove('tr-fan');
        const ruta = pathOf(step.id);
        return S.visit(n, ruta);
      }
      case 'expand': {
        const n = NODES[step.id];
        cards[step.id].classList.add('tr-expanded');
        // abanico: hijos aparecen desde el padre, escalonados
        step.children.forEach((cid, k) => {
          cards[cid].classList.add('tr-fan');
          showNode(cid, 120 + k * 120);
          if (lines[cid])
            setTimeout(() => lines[cid].classList.add('tr-link-active'), 120 + k * 120);
        });
        cards[step.id].classList.add('tr-visited');
        const names = step.children.map((c) => NODES[c].value).join(', ');
        return S.expand(n, step.children.length, names);
      }
      case 'leaf': {
        const n = NODES[step.id];
        cards[step.id].classList.add('tr-visited');
        return S.leaf(n);
      }
      case 'done':
        clearCurrent();
        cards.forEach((c, i) => {
          c.classList.add('tr-visited');
          setTimeout(() => c.classList.add('tr-fan'), i * 30);
          setTimeout(() => c.classList.remove('tr-fan'), 400 + i * 30);
        });
        return S.done;
    }
  }

  function pathOf(id) {
    const parts = [];
    let cur = id;
    while (cur != null) {
      parts.unshift(NODES[cur].value);
      cur = NODES[cur].parentId;
    }
    // omito la raíz "Equipo" para que la ruta se parezca a la de tree.js (C:/Usuarios/…)
    return parts.slice(1).join('/') || '/';
  }

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
  const aside = el(
    'div',
    { class: 'scene-aside' },
    infoCard(
      S.info_structure_title,
      el('span', { class: 'big' }, S.info_structure_big),
      S.info_structure_sub,
    ),
    infoCard(
      S.info_traversal_title,
      el('span', { class: 'big' }, S.info_traversal_big),
      S.info_traversal_sub,
    ),
    infoCard(
      S.info_nodes_title,
      el('span', { class: 'big' }, String(NODES.length)),
      S.info_nodes_sub(MAX_DEPTH),
    ),
  );

  clear(host);
  host.append(stage, aside);
  // estado inicial: sólo la raíz visible
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
