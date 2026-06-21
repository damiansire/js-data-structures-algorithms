// Escena: Heap Sort — "Una pirámide de torneo".
//
// Trace FIEL al heap sort clásico (max-heap sobre array):
//   buildMaxHeap: siftDown desde n/2-1 hasta 0
//   for end = n-1 .. 1: swap(a[0], a[end]); heapSize--; siftDown(0)
//   siftDown(i): mientras el hijo mayor > padre, intercambiar y bajar.
//
// Metáfora: el array ES una pirámide de torneo (heap binario). El nodo i tiene
// hijos 2i+1 y 2i+2; se distribuye por profundidad (y) y por mitades en x, igual
// que un árbol (ver pachinko.js para el posicionamiento de nodos + aristas SVG).
//   · build / sift: se resalta la comparación padre-vs-hijos y el intercambio
//     (el campeón burbujea hacia arriba).
//   · extract: la raíz (campeón máximo) se intercambia con el último nodo del
//     heap y esa posición se vuelve la COLA ORDENADA (verde), cae fuera de la
//     pirámide a la fila de ordenados de abajo.
// Pasos: sift-compare / sift-swap / extract / settled / done. Se ejecuta el
// algoritmo real para generar la traza.

import { el, clear } from '../dom.js';
import { Player, buildTransport } from '../player.js';
import { getLang } from '../i18n.js';

const INPUT = [4, 10, 3, 5, 1, 8, 7, 2];
const N = INPUT.length;

// CSS propio de la escena, autoinyectado una sola vez (no editamos index.html).
const CSS_HREF = './css/scene-heap-sort.css';
if (!document.querySelector(`link[data-scene="heap-sort"]`)) {
  document.head.append(
    el('link', { rel: 'stylesheet', href: CSS_HREF, dataset: { scene: 'heap-sort' } }),
  );
}

const tag = (v) => `<span class="mono">${v}</span>`;

// ─────────────────────────────── Idiomas ──────────────────────────────────
// Inglés por defecto; español opcional. Mantenemos <span class="mono"> en ambos
// idiomas y las interpolaciones como funciones.
const STRINGS = {
  en: {
    ready: 'Ready to play.',
    buildPhase:
      'Phase 1 — building the max-heap: every champion bubbles up so the strongest reaches the top 🏆',
    extractPhase:
      'Phase 2 — extracting champions: the top fighter drops into the sorted tail, one by one.',
    siftCompare: (parent, child) =>
      `Match: parent ${tag(parent)} vs strongest child ${tag(child)}.`,
    siftCompareOk: (parent, child) =>
      `Parent ${tag(parent)} ≥ child ${tag(child)} → stays. The branch is settled.`,
    siftSwap: (parent, child) =>
      `Child ${tag(child)} &gt; parent ${tag(parent)} → they swap, the champion climbs ↑`,
    extract: (root, last) =>
      `Top champion ${tag(root)} swaps with the last node ${tag(last)} and leaves the pyramid.`,
    settled: (value) => `${tag(value)} lands in the sorted tail — its final place ✔`,
    done: 'Pyramid emptied: the array is sorted from smallest to largest ✨',
    cardComplexityTitle: 'Complexity',
    cardComplexitySub: 'in-place, not stable',
    cardHeapTitle: 'Structure',
    cardHeapBig: 'max-heap',
    cardHeapSub: 'child 2i+1 / 2i+2',
    cardInputTitle: 'Input',
    cardInputSub: 'array as a pyramid',
    cardOutputTitle: 'Output',
    cardOutputSub: 'ascending',
    sortedLabel: 'SORTED TAIL',
    heapLabel: 'HEAP · TOURNAMENT PYRAMID',
  },
  es: {
    ready: 'Listo para reproducir.',
    buildPhase:
      'Fase 1 — armando el max-heap: cada campeón burbujea hacia arriba para que el más fuerte llegue a la cima 🏆',
    extractPhase:
      'Fase 2 — extrayendo campeones: el de arriba cae a la cola ordenada, uno por uno.',
    siftCompare: (parent, child) => `Duelo: padre ${tag(parent)} vs hijo más fuerte ${tag(child)}.`,
    siftCompareOk: (parent, child) =>
      `Padre ${tag(parent)} ≥ hijo ${tag(child)} → se queda. La rama está acomodada.`,
    siftSwap: (parent, child) =>
      `Hijo ${tag(child)} &gt; padre ${tag(parent)} → intercambian, el campeón sube ↑`,
    extract: (root, last) =>
      `El campeón ${tag(root)} intercambia con el último nodo ${tag(last)} y sale de la pirámide.`,
    settled: (value) => `${tag(value)} aterriza en la cola ordenada — su lugar definitivo ✔`,
    done: 'Pirámide vaciada: el array quedó ordenado de menor a mayor ✨',
    cardComplexityTitle: 'Complejidad',
    cardComplexitySub: 'in-place, no estable',
    cardHeapTitle: 'Estructura',
    cardHeapBig: 'max-heap',
    cardHeapSub: 'hijo 2i+1 / 2i+2',
    cardInputTitle: 'Entrada',
    cardInputSub: 'array como pirámide',
    cardOutputTitle: 'Salida',
    cardOutputSub: 'ascendente',
    sortedLabel: 'COLA ORDENADA',
    heapLabel: 'HEAP · PIRÁMIDE DE TORNEO',
  },
};

// ───────────────────────────── Geometría ──────────────────────────────────
// El índice i del array se ubica como nodo de un árbol binario completo:
//   depth = floor(log2(i+1));  posición dentro del nivel = i - (2^depth - 1)
//   x ∈ [0,1] = (pos + 0.5) / (2^depth)  → centrado en su celda del nivel.
function geomFor(i) {
  const depth = Math.floor(Math.log2(i + 1));
  const levelStart = Math.pow(2, depth) - 1;
  const posInLevel = i - levelStart;
  const levelCount = Math.pow(2, depth);
  const x = (posInLevel + 0.5) / levelCount;
  return { x, depth };
}

const TOP_PAD = 11; // % desde arriba hasta el centro de la raíz
const LEVEL_GAP = 25; // % de alto entre niveles
const topPct = (depth) => TOP_PAD + depth * LEVEL_GAP;
const leftPct = (x) => 8 + x * 84; // 8% de margen a cada lado

// ───────────────────────── Construcción de la traza ───────────────────────
// Ejecuta el heap sort real y emite un paso por evento visual.
function buildTrace(input) {
  const a = input.slice();
  const steps = [];
  const swap = (i, j) => {
    const t = a[i];
    a[i] = a[j];
    a[j] = t;
  };

  function siftDown(i, size) {
    while (true) {
      const l = 2 * i + 1;
      const r = 2 * i + 2;
      if (l >= size) break; // sin hijos en el heap: nada que comparar
      // el hijo "más fuerte" es el de mayor valor (el que compite contra el padre)
      const strongest = r < size && a[r] > a[l] ? r : l;
      const largest = a[strongest] > a[i] ? strongest : i;
      if (largest === i) {
        // ningún hijo lo supera: la rama queda acomodada.
        steps.push({
          type: 'sift-compare',
          parent: i,
          child: strongest,
          parentVal: a[i],
          childVal: a[strongest],
          settledBranch: true,
        });
        break;
      }
      const preParent = a[i];
      const preChild = a[largest];
      steps.push({
        type: 'sift-compare',
        parent: i,
        child: largest,
        parentVal: preParent,
        childVal: preChild,
        settledBranch: false,
      });
      swap(i, largest);
      steps.push({
        type: 'sift-swap',
        parent: i,
        child: largest,
        parentVal: preParent, // valor que estaba en el padre (el menor)
        childVal: preChild, // valor que sube desde el hijo (el mayor)
      });
      i = largest;
    }
  }

  // Fase 1: construir el max-heap.
  steps.push({ type: 'phase', phase: 'build' });
  for (let i = Math.floor(N / 2) - 1; i >= 0; i--) {
    siftDown(i, N);
  }

  // Fase 2: extraer campeones.
  steps.push({ type: 'phase', phase: 'extract' });
  for (let end = N - 1; end >= 1; end--) {
    const rootVal = a[0];
    const lastVal = a[end];
    swap(0, end);
    steps.push({ type: 'extract', end, rootVal, lastVal });
    steps.push({ type: 'settled', index: end, value: a[end] });
    siftDown(0, end);
  }
  steps.push({ type: 'settled', index: 0, value: a[0] });

  steps.push({ type: 'done' });
  return { steps, sorted: a.slice() };
}

export default function mountHeapSort(host, meta) {
  const S = STRINGS[getLang()] || STRINGS.en;

  // ── Pirámide (nodos) + aristas SVG ──
  const pyramid = el('div', { class: 'hs-pyramid' });
  const edges = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  edges.setAttribute('class', 'hs-edges');
  edges.setAttribute('preserveAspectRatio', 'none');
  edges.setAttribute('viewBox', '0 0 100 100');

  // aristas estáticas: cada nodo (salvo la raíz) tiene línea a su padre.
  const edgeLines = new Array(N).fill(null);
  for (let i = 1; i < N; i++) {
    const parent = Math.floor((i - 1) / 2);
    const gC = geomFor(i);
    const gP = geomFor(parent);
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', leftPct(gP.x));
    line.setAttribute('y1', topPct(gP.depth));
    line.setAttribute('x2', leftPct(gC.x));
    line.setAttribute('y2', topPct(gC.depth));
    line.setAttribute('class', 'hs-edge');
    edges.append(line);
    edgeLines[i] = line;
  }

  // un nodo por POSICIÓN del heap (la posición es fija; el valor cambia).
  const nodes = INPUT.map((_, i) => {
    const g = geomFor(i);
    const valSpan = el('span', { class: 'hs-node-val' }, '');
    const node = el('div', { class: 'hs-node' }, valSpan);
    node.style.left = leftPct(g.x) + '%';
    node.style.top = topPct(g.depth) + '%';
    node._val = valSpan;
    return node;
  });
  nodes.forEach((n) => pyramid.append(n));

  const heapLabel = el('span', { class: 'hs-zone-label' }, S.heapLabel);
  const stageCol = el('div', { class: 'hs-heap-col' }, heapLabel, edges, pyramid);

  // ── Cola ordenada (debajo) ──
  const sortedRow = el('div', { class: 'hs-sorted' });
  const sortedWrap = el(
    'div',
    { class: 'hs-sorted-wrap' },
    el('span', { class: 'hs-zone-label hs-zone-ok' }, S.sortedLabel),
    sortedRow,
  );

  // ── Lienzo ──
  const narrator = el('div', { class: 'narrator' }, S.ready);
  const canvas = el('div', { class: 'stage-canvas hs-stage' }, stageCol, sortedWrap, narrator);

  const setNarration = (html) => {
    narrator.innerHTML = html;
  };

  // ── Helpers de render ──
  let heapSize = N; // posiciones aún dentro del heap (0..heapSize-1)

  function paintValues(arr, size) {
    nodes.forEach((n, i) => {
      n._val.textContent = String(arr[i]);
      const inHeap = i < size;
      n.classList.toggle('hs-out', !inHeap);
      if (edgeLines[i]) edgeLines[i].classList.toggle('hs-edge-out', !inHeap);
    });
  }

  function clearHi() {
    nodes.forEach((n) => n.classList.remove('hs-parent', 'hs-child', 'hs-swap', 'hs-extract'));
  }

  // El estado del array se reconstruye desde la traza (idempotente para reset),
  // así que mantenemos una copia viva que vamos mutando con cada paso.
  let live = INPUT.slice();

  function resetVisual() {
    live = INPUT.slice();
    heapSize = N;
    clearHi();
    clear(sortedRow);
    paintValues(live, heapSize);
    setNarration(S.ready);
  }

  function dropSorted(index, value) {
    const chip = el('span', { class: 'hs-sorted-chip mono' }, String(value));
    // insertamos en orden de posición final para que la cola se lea de menor a mayor
    const after = Array.from(sortedRow.children).find((c) => Number(c.dataset.idx) > index);
    chip.dataset.idx = String(index);
    sortedRow.insertBefore(chip, after || null);
    requestAnimationFrame(() => chip.classList.add('hs-sorted-in'));
  }

  function apply(step) {
    switch (step.type) {
      case 'phase':
        clearHi();
        return step.phase === 'build' ? S.buildPhase : S.extractPhase;

      case 'sift-compare': {
        clearHi();
        const p = nodes[step.parent];
        const c = nodes[step.child];
        p.classList.add('hs-parent');
        if (c) c.classList.add('hs-child');
        if (step.settledBranch) {
          return S.siftCompareOk(step.parentVal, step.childVal);
        }
        return S.siftCompare(step.parentVal, step.childVal);
      }

      case 'sift-swap': {
        // swap real en el array vivo + repintar; resaltar el movimiento.
        const t = live[step.parent];
        live[step.parent] = live[step.child];
        live[step.child] = t;
        paintValues(live, heapSize);
        clearHi();
        nodes[step.parent].classList.add('hs-swap');
        nodes[step.child].classList.add('hs-swap');
        return S.siftSwap(step.parentVal, step.childVal);
      }

      case 'extract': {
        clearHi();
        // raíz ↔ último nodo del heap
        const t = live[0];
        live[0] = live[step.end];
        live[step.end] = t;
        nodes[0].classList.add('hs-extract');
        nodes[step.end].classList.add('hs-extract');
        paintValues(live, heapSize); // el último aún figura en el heap hasta 'settled'
        return S.extract(step.rootVal, step.lastVal);
      }

      case 'settled': {
        clearHi();
        // la posición sale del heap y cae a la cola ordenada
        heapSize = step.index;
        nodes[step.index].classList.add('hs-out');
        paintValues(live, heapSize);
        dropSorted(step.index, step.value);
        return S.settled(step.value);
      }

      case 'done': {
        clearHi();
        nodes.forEach((n) => n.classList.add('hs-out'));
        Array.from(sortedRow.children).forEach((c, i) => {
          setTimeout(() => c.classList.add('hs-sorted-win'), i * 55);
        });
        return S.done;
      }
    }
  }

  const trace = buildTrace(INPUT);
  const player = new Player({
    steps: trace.steps,
    apply,
    reset: resetVisual,
    baseDelay: 700,
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
      S.cardComplexityTitle,
      el('span', { class: 'big' }, 'O(n log n)'),
      S.cardComplexitySub,
    ),
    infoCard(S.cardHeapTitle, el('span', { class: 'big' }, S.cardHeapBig), S.cardHeapSub),
    infoCard(S.cardInputTitle, el('code', {}, `[${INPUT.join(', ')}]`), S.cardInputSub),
    infoCard(S.cardOutputTitle, el('code', {}, `[${trace.sorted.join(', ')}]`), S.cardOutputSub),
  );

  clear(host);
  host.append(stage, aside);
  resetVisual();

  return {
    destroy() {
      player.destroy();
    },
  };
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
