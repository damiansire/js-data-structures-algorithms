// Escena: Pachinko — un mismo tablero para DOS algoritmos de árbol binario.
//
// meta.id === 'binary-search-tree'  → BST: inserción por COMPARACIÓN.
//   Fiel a Estructuras-de-datos/binary-search-tree/binary-search-tree.js:
//     value < current.value → izquierda ; value > current.value → derecha ;
//     value === current.value → duplicado, NO se inserta.
//
// meta.id === 'binary-tree'         → árbol binario GENÉRICO.
//   El módulo real (binary-tree.js) NO compara valores: cuelga hijos por una
//   ruta explícita + lado ('left'|'right'). No hay invariante de orden. Para
//   un Pachinko animable y fiel a esa ausencia de regla, llenamos el árbol en
//   orden por niveles (breadth-first, completo): la bolita baja por el camino
//   hacia el primer hueco libre, prefiriendo SIEMPRE izquierda antes que
//   derecha. La desviación en cada nodo es estructural (¿queda lugar a la
//   izquierda?), no por valor.
//
// Metáfora: la raíz arriba. Cada número es una BOLITA que cae y, en cada nodo,
// se desvía izquierda/derecha según la regla del algoritmo, resaltando el nodo
// comparado, hasta materializarse en un hueco vacío con su arista al padre.

import { el, clear } from '../dom.js';
import { Player, buildTransport } from '../player.js';
import { getLang } from '../i18n.js';

// ─────────────────────────────── Idiomas ──────────────────────────────────
// Inglés por defecto; español opcional. Mantenemos el markup <span class="mono">
// en ambos idiomas y las interpolaciones como funciones.
const STRINGS = {
  en: {
    ready: 'Ready to play.',
    // narración BST
    bstCompareDup: (val, against) =>
      `Ball ${tag(val)} hits ${tag(against)} — =.`,
    bstCompareMove: (val, rel, against, side) =>
      `${tag(val)} ${rel} ${tag(against)} → deflects to the ${side}.`,
    bstSideLeft: 'left ↙',
    bstSideRight: 'right ↘',
    bstSideEqual: 'equal',
    // narración BT
    btCompare: (val, against) =>
      `Ball ${tag(val)} reaches node ${tag(
        against
      )}: it looks for the first free slot (left before right).`,
    dup: (val) =>
      `${tag(val)} already exists — the BST allows no duplicates, the ball is discarded.`,
    placeRoot: (val) =>
      `${tag(val)} is the <strong>root</strong>: it starts at the top of the board.`,
    placeChild: (val, sideTxt) =>
      `Slot found: ${tag(val)} materializes as the ${sideTxt} child 🎯`,
    sideLeft: 'left',
    sideRight: 'right',
    doneBST: (total) =>
      `Tree complete: ${tag(total)} nodes, an in-order traversal gives the values sorted ✨`,
    doneBT: (total) =>
      `Tree complete: ${tag(total)} nodes hung by levels ✨`,
    // tarjetas (info-card)
    cardRule: 'Rule',
    ruleBigBST: 'smaller ↙ / larger ↗',
    ruleSubBST: 'duplicates are ignored',
    ruleBigBT: 'by levels',
    ruleSubBT: 'no order: first free slot',
    cardBST: 'Binary Search Tree',
    cardBT: 'Binary Tree',
    cardSubBST: 'average insertion',
    cardSubBT: 'generic insertion',
    cardInput: 'Input',
    cardInputSub: (n) => `${n} balls`,
  },
  es: {
    ready: 'Listo para reproducir.',
    // narración BST
    bstCompareDup: (val, against) =>
      `La bolita ${tag(val)} choca con ${tag(against)} — =.`,
    bstCompareMove: (val, rel, against, side) =>
      `${tag(val)} ${rel} ${tag(against)} → se desvía a la ${side}.`,
    bstSideLeft: 'izquierda ↙',
    bstSideRight: 'derecha ↘',
    bstSideEqual: 'igual',
    // narración BT
    btCompare: (val, against) =>
      `La bolita ${tag(val)} llega al nodo ${tag(
        against
      )}: busca el primer hueco libre (izquierda antes que derecha).`,
    dup: (val) =>
      `${tag(val)} ya existe — el BST no admite duplicados, la bolita se descarta.`,
    placeRoot: (val) =>
      `${tag(val)} es la <strong>raíz</strong>: arranca arriba del tablero.`,
    placeChild: (val, sideTxt) =>
      `Hueco encontrado: ${tag(val)} se materializa como hijo ${sideTxt} 🎯`,
    sideLeft: 'izquierdo',
    sideRight: 'derecho',
    doneBST: (total) =>
      `Árbol completo: ${tag(total)} nodos, recorrido in-order da los valores ordenados ✨`,
    doneBT: (total) =>
      `Árbol completo: ${tag(total)} nodos colgados por niveles ✨`,
    // tarjetas (info-card)
    cardRule: 'Regla',
    ruleBigBST: 'menor ↙ / mayor ↗',
    ruleSubBST: 'duplicados se ignoran',
    ruleBigBT: 'por niveles',
    ruleSubBT: 'sin orden: primer hueco libre',
    cardBST: 'Binary Search Tree',
    cardBT: 'Binary Tree',
    cardSubBST: 'inserción promedio',
    cardSubBT: 'inserción genérica',
    cardInput: 'Entrada',
    cardInputSub: (n) => `${n} bolitas`,
  },
};

const tag = (v) => `<span class="mono">${v}</span>`;

// Secuencias pensadas para llenar 4 niveles sin solaparse.
const SEQ_BST = [50, 30, 70, 20, 40, 60, 80, 35, 65];
const SEQ_BT = [1, 2, 3, 4, 5, 6, 7, 8, 9];

// ───────────────────────────── Geometría ──────────────────────────────────
// Cada nodo tiene profundidad (depth) y una coordenada x en [0,1] obtenida
// partiendo a la mitad el rango disponible al bajar izquierda/derecha. Así dos
// nodos nunca comparten x y el ancho se reparte parejo por nivel.
//   raíz: rango [0,1] → x = 0.5
//   izquierda: rango [lo, mid] ; derecha: rango [mid, hi]
function geomFor(path) {
  // path: array de 'L'/'R' desde la raíz.
  let lo = 0;
  let hi = 1;
  for (const dir of path) {
    const mid = (lo + hi) / 2;
    if (dir === 'L') hi = mid;
    else lo = mid;
  }
  const x = (lo + hi) / 2;
  return { x, depth: path.length };
}

const TOP_PAD = 9; // % desde arriba hasta el centro de la raíz
const LEVEL_GAP = 25; // % de alto entre niveles

function topPct(depth) {
  return TOP_PAD + depth * LEVEL_GAP;
}
function leftPct(x) {
  // dejamos 8% de margen a cada lado para que los círculos no se corten
  return 8 + x * 84;
}

// ───────────────────────── Construcción de la traza ───────────────────────
// Simulamos la inserción real para generar los pasos (compare* + place).
function buildTrace(seq, mode) {
  const steps = [];
  // nodos por clave de path ("" = raíz, "L","LR",…)
  const nodes = new Map(); // pathKey → { value }

  const key = (path) => path.join('');

  function bstInsert(value) {
    if (!nodes.has('')) {
      steps.push({ type: 'place', path: [], value, parent: null });
      nodes.set('', { value });
      return;
    }
    const path = [];
    while (true) {
      const cur = nodes.get(key(path));
      steps.push({ type: 'compare', path: path.slice(), value, against: cur.value });
      if (value === cur.value) {
        steps.push({ type: 'dup', path: path.slice(), value });
        return;
      }
      const dir = value < cur.value ? 'L' : 'R';
      const parentKey = key(path);
      path.push(dir);
      if (!nodes.has(key(path))) {
        steps.push({ type: 'place', path: path.slice(), value, parent: parentKey, dir });
        nodes.set(key(path), { value });
        return;
      }
      // hay nodo: seguimos descendiendo (resaltaremos el siguiente compare)
    }
  }

  // BFS: encuentra el path del primer nodo (en orden por niveles) que tenga al
  // menos un hijo libre, prefiriendo izquierda. Mantiene el árbol COMPLETO.
  function btTargetPath() {
    const queue = [[]];
    while (queue.length) {
      const p = queue.shift();
      if (!nodes.has(key(p.concat('L'))) || !nodes.has(key(p.concat('R')))) return p;
      queue.push(p.concat('L'));
      queue.push(p.concat('R'));
    }
    return [];
  }

  function btInsert(value) {
    if (!nodes.has('')) {
      steps.push({ type: 'place', path: [], value, parent: null });
      nodes.set('', { value });
      return;
    }
    // animamos el descenso desde la raíz hasta el nodo objetivo (camino BFS)
    const target = btTargetPath();
    const path = [];
    for (let i = 0; i <= target.length; i++) {
      const cur = nodes.get(key(path));
      steps.push({ type: 'compare', path: path.slice(), value, against: cur.value });
      if (i < target.length) path.push(target[i]);
    }
    const parentKey = key(target);
    const dir = nodes.has(key(target.concat('L'))) ? 'R' : 'L';
    const childPath = target.concat(dir);
    steps.push({ type: 'place', path: childPath, value, parent: parentKey, dir });
    nodes.set(key(childPath), { value });
  }

  const insert = mode === 'bst' ? bstInsert : btInsert;
  for (const v of seq) insert(v);
  steps.push({ type: 'done' });
  return steps;
}

export default function mountPachinko(host, meta = {}) {
  const S = STRINGS[getLang()] || STRINGS.en;
  const isBST = meta.id === 'binary-search-tree';
  const mode = isBST ? 'bst' : 'bt';
  const seq = isBST ? SEQ_BST : SEQ_BT;

  // ── lienzo ──
  const board = el('div', { class: 'pk-board' }); // contenedor de nodos
  const edges = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  edges.setAttribute('class', 'pk-edges');
  edges.setAttribute('preserveAspectRatio', 'none');
  edges.setAttribute('viewBox', '0 0 100 100');
  const ballDot = el('span', {}, '');
  const ball = el('div', { class: 'pk-ball' }, ballDot);
  const canvas = el('div', { class: 'stage-canvas pk-stage' }, edges, board, ball);
  const narrator = el('div', { class: 'narrator' }, S.ready);
  canvas.append(narrator);

  const setNarration = (html) => {
    narrator.innerHTML = html;
  };

  // estado visual: pathKey → { node:el, value, x, depth, parentKey }
  const placed = new Map();
  const key = (path) => path.join('');

  function svgEdge(fromGeom, toGeom) {
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', leftPct(fromGeom.x));
    line.setAttribute('y1', topPct(fromGeom.depth));
    line.setAttribute('x2', leftPct(toGeom.x));
    line.setAttribute('y2', topPct(toGeom.depth));
    line.setAttribute('class', 'pk-edge');
    return line;
  }

  function placeNode(path, value, parentKey) {
    const g = geomFor(path);
    const node = el(
      'div',
      { class: 'pk-node' },
      el('span', { class: 'pk-node-val' }, String(value))
    );
    node.style.left = leftPct(g.x) + '%';
    node.style.top = topPct(g.depth) + '%';
    board.append(node);
    // arista al padre
    if (parentKey != null) {
      const parent = placed.get(parentKey);
      const line = svgEdge({ x: parent.x, depth: parent.depth }, g);
      edges.append(line);
      node._edge = line;
    }
    placed.set(key(path), { node, value, x: g.x, depth: g.depth, parentKey });
    // pop de entrada
    requestAnimationFrame(() => node.classList.add('pk-pop'));
  }

  function clearHi() {
    placed.forEach((p) => p.node.classList.remove('pk-hit'));
  }

  // posiciona la bolita (el punto interno) sobre el centro del nodo del path.
  // El % es relativo a la caja .pk-ball, que comparte el mismo inset que
  // .pk-board, así left%/top% coinciden con los de los nodos.
  function moveBall(geom, show = true) {
    ballDot.style.left = leftPct(geom.x) + '%';
    ballDot.style.top = topPct(geom.depth) + '%';
    ball.style.opacity = show ? '1' : '0';
  }

  function setBallValue(v) {
    ballDot.textContent = String(v);
  }

  function resetVisual() {
    clear(board);
    while (edges.firstChild) edges.removeChild(edges.firstChild);
    placed.clear();
    ball.style.opacity = '0';
    ball.classList.remove('pk-drop');
    setNarration(S.ready);
  }

  function apply(step) {
    switch (step.type) {
      case 'compare': {
        clearHi();
        const cur = placed.get(key(step.path));
        if (cur) cur.node.classList.add('pk-hit');
        // bolita visible cayendo hacia el nodo comparado
        setBallValue(step.value);
        const g = geomFor(step.path);
        // la bolita entra desde arriba si es la raíz comparada
        moveBall(g, true);
        ball.classList.add('pk-drop');
        if (isBST) {
          const rel =
            step.value < step.against ? '&lt;' : step.value > step.against ? '&gt;' : '=';
          const side =
            step.value < step.against
              ? S.bstSideLeft
              : step.value > step.against
                ? S.bstSideRight
                : S.bstSideEqual;
          if (step.value === step.against) {
            return S.bstCompareDup(step.value, step.against);
          }
          return S.bstCompareMove(step.value, rel, step.against, side);
        }
        return S.btCompare(step.value, step.against);
      }
      case 'dup': {
        clearHi();
        const cur = placed.get(key(step.path));
        if (cur) cur.node.classList.add('pk-hit');
        ball.classList.add('pk-reject');
        setTimeout(() => ball.classList.remove('pk-reject'), 500);
        ball.style.opacity = '0';
        return S.dup(step.value);
      }
      case 'place': {
        clearHi();
        ball.style.opacity = '0';
        ball.classList.remove('pk-drop');
        placeNode(step.path, step.value, step.parent ?? null);
        if (step.parent == null) {
          return S.placeRoot(step.value);
        }
        const sideTxt = step.dir === 'L' ? S.sideLeft : S.sideRight;
        return S.placeChild(step.value, sideTxt);
      }
      case 'done': {
        clearHi();
        ball.style.opacity = '0';
        placed.forEach((p, i) => {
          setTimeout(() => p.node.classList.add('pk-win'), 0);
        });
        const total = placed.size;
        return isBST ? S.doneBST(total) : S.doneBT(total);
      }
    }
  }

  const player = new Player({
    steps: buildTrace(seq, mode),
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

  const ruleCard = isBST
    ? infoCard(
        S.cardRule,
        el('span', { class: 'big' }, S.ruleBigBST),
        S.ruleSubBST
      )
    : infoCard(S.cardRule, el('span', { class: 'big' }, S.ruleBigBT), S.ruleSubBT);

  const aside = el(
    'div',
    { class: 'scene-aside' },
    infoCard(
      isBST ? S.cardBST : S.cardBT,
      el('span', { class: 'big' }, isBST ? 'O(log n)' : 'O(n)'),
      isBST ? S.cardSubBST : S.cardSubBT
    ),
    ruleCard,
    infoCard(S.cardInput, el('code', {}, `[${seq.join(', ')}]`), S.cardInputSub(seq.length))
  );

  clear(host);
  host.append(stage, aside);

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
