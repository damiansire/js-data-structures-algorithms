// Escena: Priority Queue — "La sala de emergencias" (min-heap binario).
//
// Un heap binario mostrado como árbol: el de MENOR prioridad siempre en la raíz.
// enqueue() agrega abajo y sube (sift-up); dequeue() saca la raíz, sube el
// último y baja (sift-down). Abajo, el MISMO heap aplanado en un arreglo (el
// hijo de i está en 2i+1 / 2i+2). Refleja la semántica real de
// Estructuras-de-datos/priority-queue/priority-queue.js.

import { el, clear } from '../dom.js';
import { getLang } from '../i18n.js';

const SVGNS = 'http://www.w3.org/2000/svg';
const W = 480;
const ROW = 66;
const PAD_X = 26;
const PAD_Y = 26;
const NODE = 34;

const STRINGS = {
  en: {
    initial: 'Min-heap: the smallest priority is always on top. Try <b>enqueue()</b>.',
    enqueueBtn: 'enqueue()',
    dequeueBtn: 'dequeue() min',
    clearBtn: '🗑  clear',
    enqueueMsg: (p) => `<b>enqueue(${p})</b> → added at the bottom, bubbled up to its spot.`,
    dequeueMsg: (p) =>
      `<b>dequeue()</b> → removed the min <span class="mono">${p}</span>; heap re-settled.`,
    emptyErr: '⚠️ <b>dequeue()</b> on an empty queue throws <span class="mono">Error</span>.',
    cleared: 'Heap cleared.',
    arrayLabel: 'heap[]',
    cardSizeSub: 'nodes in the heap',
    cardMinSub: 'root · O(1)',
    cardOpSub: 'enqueue / dequeue',
  },
  es: {
    initial: 'Min-heap: la menor prioridad siempre arriba. Probá <b>enqueue()</b>.',
    enqueueBtn: 'enqueue()',
    dequeueBtn: 'dequeue() min',
    clearBtn: '🗑  vaciar',
    enqueueMsg: (p) => `<b>enqueue(${p})</b> → entró abajo y burbujeó hasta su lugar.`,
    dequeueMsg: (p) =>
      `<b>dequeue()</b> → sacó el mínimo <span class="mono">${p}</span>; el heap se reacomodó.`,
    emptyErr: '⚠️ <b>dequeue()</b> sobre cola vacía lanza <span class="mono">Error</span>.',
    cleared: 'Heap vaciado.',
    arrayLabel: 'heap[]',
    cardSizeSub: 'nodos en el heap',
    cardMinSub: 'raíz · O(1)',
    cardOpSub: 'enqueue / dequeue',
  },
};

// Min-heap fiel al repo (guardamos la prioridad como valor mostrado).
class MinHeap {
  constructor() {
    this.heap = [];
  }
  size() {
    return this.heap.length;
  }
  isEmpty() {
    return this.heap.length === 0;
  }
  peek() {
    return this.heap.length === 0 ? null : this.heap[0];
  }
  enqueue(p) {
    this.heap.push(p);
    let i = this.heap.length - 1;
    while (i > 0) {
      const parent = (i - 1) >> 1;
      if (this.heap[i] >= this.heap[parent]) break;
      [this.heap[i], this.heap[parent]] = [this.heap[parent], this.heap[i]];
      i = parent;
    }
  }
  dequeue() {
    if (this.heap.length === 0) throw new Error('dequeue() sobre cola de prioridad vacia');
    const min = this.heap[0];
    const last = this.heap.pop();
    if (this.heap.length > 0) {
      this.heap[0] = last;
      let i = 0;
      const n = this.heap.length;
      for (;;) {
        const l = 2 * i + 1;
        const r = 2 * i + 2;
        let s = i;
        if (l < n && this.heap[l] < this.heap[s]) s = l;
        if (r < n && this.heap[r] < this.heap[s]) s = r;
        if (s === i) break;
        [this.heap[i], this.heap[s]] = [this.heap[s], this.heap[i]];
        i = s;
      }
    }
    return min;
  }
}

const levelOf = (i) => Math.floor(Math.log2(i + 1));
const px = (i) => {
  const level = levelOf(i);
  const posInLevel = i - (2 ** level - 1);
  const count = 2 ** level;
  return PAD_X + ((posInLevel + 0.5) * (W - 2 * PAD_X)) / count;
};
const py = (i) => PAD_Y + levelOf(i) * ROW;

export default function mountPriorityQueue(host) {
  const S = STRINGS[getLang()] || STRINGS.en;
  const pq = new MinHeap();
  let seed = 41; // PRNG determinista (sin Math.random para no depender del entorno)
  const nextPriority = () => {
    seed = (seed * 73 + 41) % 100;
    return seed;
  };

  const tree = el('div', { class: 'pq-tree' });
  const arrayRow = el('div', { class: 'pq-array' });
  const canvas = el('div', { class: 'stage-canvas pq-stage' }, tree, arrayRow);
  const narrator = el('div', { class: 'narrator' }, S.initial);
  canvas.append(narrator);

  const setNarration = (html) => {
    narrator.innerHTML = html;
  };

  function render(flash) {
    clear(tree);
    const n = pq.heap.length;
    const levels = n === 0 ? 1 : levelOf(n - 1) + 1;
    const H = PAD_Y * 2 + (levels - 1) * ROW + NODE;
    tree.style.height = `${H}px`;

    // Edges (SVG paths hijo→padre).
    const svg = document.createElementNS(SVGNS, 'svg');
    svg.setAttribute('class', 'pq-links');
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    svg.setAttribute('width', String(W));
    svg.setAttribute('height', String(H));
    const half = NODE / 2;
    for (let i = 1; i < n; i++) {
      const parent = (i - 1) >> 1;
      const path = document.createElementNS(SVGNS, 'path');
      const x1 = px(parent) + half;
      const y1 = py(parent) + half;
      const x2 = px(i) + half;
      const y2 = py(i) + half;
      const my = (y1 + y2) / 2;
      path.setAttribute('d', `M ${x1} ${y1} C ${x1} ${my}, ${x2} ${my}, ${x2} ${y2}`);
      svg.append(path);
    }
    tree.append(svg);

    // Nodos.
    for (let i = 0; i < n; i++) {
      tree.append(
        el(
          'div',
          {
            class: `pq-node${i === 0 ? ' is-root' : ''}${i === flash ? ' pulse' : ''}`,
            style: { left: `${px(i)}px`, top: `${py(i)}px` },
          },
          String(pq.heap[i]),
        ),
      );
    }

    // Arreglo aplanado.
    clear(arrayRow);
    arrayRow.append(el('span', { class: 'pq-arr-label' }, S.arrayLabel));
    if (n === 0) {
      arrayRow.append(el('span', { class: 'pq-arr-empty' }, '∅'));
    } else {
      pq.heap.forEach((p, i) => {
        arrayRow.append(
          el(
            'div',
            { class: `pq-cell${i === 0 ? ' is-root' : ''}${i === flash ? ' pulse' : ''}` },
            el('span', { class: 'pq-cell__i' }, String(i)),
            el('span', { class: 'pq-cell__v' }, String(p)),
          ),
        );
      });
    }
  }

  function syncStats() {
    statSize.textContent = String(pq.size());
    statMin.textContent = pq.isEmpty() ? '—' : String(pq.peek());
    dequeueBtn.disabled = pq.isEmpty();
    clearBtn.disabled = pq.isEmpty();
  }

  function doEnqueue() {
    const p = nextPriority();
    pq.enqueue(p);
    setNarration(S.enqueueMsg(p));
    render(pq.heap.indexOf(p));
    syncStats();
  }

  function doDequeue() {
    if (pq.isEmpty()) return;
    const p = pq.dequeue();
    setNarration(S.dequeueMsg(p));
    render(0);
    syncStats();
  }

  function doClear() {
    pq.heap.length = 0;
    setNarration(S.cleared);
    render(-1);
    syncStats();
  }

  const enqueueBtn = el('button', { class: 'tbtn primary' }, S.enqueueBtn);
  const dequeueBtn = el('button', { class: 'tbtn' }, S.dequeueBtn);
  const clearBtn = el('button', { class: 'tbtn' }, S.clearBtn);
  enqueueBtn.addEventListener('click', doEnqueue);
  dequeueBtn.addEventListener('click', doDequeue);
  clearBtn.addEventListener('click', doClear);

  const bar = el(
    'div',
    { class: 'transport' },
    enqueueBtn,
    dequeueBtn,
    el('span', { class: 'spacer' }),
    clearBtn,
  );

  const statSize = el('span', { class: 'big' }, '0');
  const statMin = el('span', { class: 'big' }, '—');

  const stage = el('div', { class: 'stage' }, canvas, bar);
  const aside = el(
    'div',
    { class: 'scene-aside' },
    infoCard('size()', statSize, S.cardSizeSub),
    infoCard('peek() min', statMin, S.cardMinSub),
    infoCard('O(log n)', el('span', { class: 'big' }, '↕'), S.cardOpSub),
  );

  clear(host);
  host.append(stage, aside);

  render(-1);
  syncStats();
  doEnqueue();
  doEnqueue();
  doEnqueue();
  doEnqueue();
  doEnqueue();

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
