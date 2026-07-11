// Escena: Queue — "La fila del súper" (FIFO).
//
// Interactiva: enqueue() mete una persona por atrás (derecha); dequeue() atiende
// a la del frente (izquierda) y se va. Refleja la semántica real de
// Estructuras-de-datos/queue/queue.ts: dequeue() sobre una cola vacía lanza un
// Error (acá lo mostramos como aviso, sin romper la escena).

import { el, clear } from '../dom.js';
import { getLang } from '../i18n.js';

const STRINGS = {
  en: {
    initial: 'Empty queue. Try <b>enqueue()</b>.',
    front: 'front',
    back: 'back',
    enqueueBtn: 'enqueue()  ⬅',
    dequeueBtn: '⬅  dequeue()',
    clearBtn: '🗑  clear',
    enqueueMsg: (n) => `<b>enqueue(${n})</b> → joins the back of the line.`,
    dequeueMsg: (val) =>
      `<b>dequeue()</b> → <span class="mono">${val}</span> is served and leaves.`,
    emptyErr: '⚠️ <b>dequeue()</b> on an empty queue throws <span class="mono">Error</span>.',
    emptyAgain: 'Empty queue again. FIFO ✔',
    cleared: 'Queue cleared.',
    cardLengthSub: 'O(n) walks the nodes',
    cardPeekSub: 'front without dequeuing · O(1)',
    cardEmptySub: 'head === null',
  },
  es: {
    initial: 'Cola vacía. Probá <b>enqueue()</b>.',
    front: 'frente',
    back: 'final',
    enqueueBtn: 'enqueue()  ⬅',
    dequeueBtn: '⬅  dequeue()',
    clearBtn: '🗑  vaciar',
    enqueueMsg: (n) => `<b>enqueue(${n})</b> → se suma al final de la fila.`,
    dequeueMsg: (val) => `<b>dequeue()</b> → <span class="mono">${val}</span> es atendido y se va.`,
    emptyErr: '⚠️ <b>dequeue()</b> sobre cola vacía lanza <span class="mono">Error</span>.',
    emptyAgain: 'Cola vacía otra vez. FIFO ✔',
    cleared: 'Cola vaciada.',
    cardLengthSub: 'O(n) recorre nodos',
    cardPeekSub: 'frente sin desencolar · O(1)',
    cardEmptySub: 'head === null',
  },
};

const CARD_COLORS = [
  ['#a78bfa', '#7c3aed'],
  ['#22d3ee', '#0891b2'],
  ['#34d399', '#059669'],
  ['#fbbf24', '#d97706'],
  ['#fb7185', '#e11d48'],
  ['#60a5fa', '#2563eb'],
];

// Cola fiel al repo: nodos enlazados, head al frente, tail al final.
class Node {
  constructor(data) {
    this.data = data;
    this.next = null;
  }
}
class Queue {
  constructor() {
    this.head = null;
    this.tail = null;
  }
  isEmpty() {
    return this.head === null;
  }
  length() {
    let aux = this.head;
    let c = 0;
    while (aux !== null) {
      c++;
      aux = aux.next;
    }
    return c;
  }
  peek() {
    return this.head === null ? null : this.head.data;
  }
  enqueue(element) {
    const node = new Node(element);
    if (this.tail === null) this.head = this.tail = node;
    else {
      this.tail.next = node;
      this.tail = node;
    }
    return node;
  }
  dequeue() {
    if (this.head === null) throw new Error('dequeue() sobre cola vacia');
    const node = this.head;
    this.head = this.head.next;
    if (this.head === null) this.tail = null;
    return node;
  }
}

export default function mountQueue(host) {
  const S = STRINGS[getLang()] || STRINGS.en;
  const queue = new Queue();
  let counter = 0;
  let busy = false;

  const lane = el('div', { class: 'q-lane' });
  const frontTag = el('div', { class: 'q-end q-end--front' }, S.front, el('br'), '→');
  const backTag = el('div', { class: 'q-end q-end--back' }, '←', el('br'), S.back);
  const track = el('div', { class: 'q-track' }, frontTag, lane, backTag);

  const canvas = el('div', { class: 'stage-canvas q-stage' }, track);
  const narrator = el('div', { class: 'narrator' }, S.initial);
  canvas.append(narrator);

  const cardsByNode = new Map();

  const setNarration = (html) => {
    narrator.innerHTML = html;
  };

  function cardFor(node, idx) {
    const [c1, c2] = CARD_COLORS[idx % CARD_COLORS.length];
    return el(
      'div',
      {
        class: 'q-card enter',
        style: { background: `linear-gradient(180deg, ${c1}, ${c2})` },
      },
      el('span', {}, String(node.data)),
    );
  }

  function syncStats() {
    statLen.textContent = String(queue.length());
    statFront.textContent = queue.isEmpty() ? '—' : String(queue.peek());
    statEmpty.textContent = queue.isEmpty() ? 'true' : 'false';
    statEmpty.style.color = queue.isEmpty() ? 'var(--green)' : 'var(--ink)';
    dequeueBtn.disabled = queue.isEmpty() || busy;
    enqueueBtn.disabled = busy;
    clearBtn.disabled = queue.isEmpty() || busy;
  }

  function doEnqueue() {
    if (busy) return;
    counter += 1;
    const node = queue.enqueue(counter);
    const card = cardFor(node, queue.length() - 1);
    cardsByNode.set(node, card);
    lane.append(card);
    setNarration(S.enqueueMsg(counter));
    syncStats();
    card.addEventListener('animationend', () => card.classList.remove('enter'), { once: true });
  }

  function doDequeue() {
    if (busy || queue.isEmpty()) return;
    busy = true;
    const node = queue.dequeue();
    const card = cardsByNode.get(node);
    const val = node.data;
    cardsByNode.delete(node);
    setNarration(S.dequeueMsg(val));
    card.classList.add('leave');
    card.addEventListener(
      'animationend',
      () => {
        card.remove();
        busy = false;
        syncStats();
        if (queue.isEmpty()) setNarration(S.emptyAgain);
      },
      { once: true },
    );
    syncStats();
  }

  function doClear() {
    if (busy) return;
    while (!queue.isEmpty()) queue.dequeue();
    cardsByNode.clear();
    clear(lane);
    setNarration(S.cleared);
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
    dequeueBtn,
    enqueueBtn,
    el('span', { class: 'spacer' }),
    clearBtn,
  );

  const statLen = el('span', { class: 'big' }, '0');
  const statFront = el('span', { class: 'big' }, '—');
  const statEmpty = el('span', { class: 'big', style: { color: 'var(--green)' } }, 'true');

  const stage = el('div', { class: 'stage' }, canvas, bar);
  const aside = el(
    'div',
    { class: 'scene-aside' },
    infoCard('length()', statLen, S.cardLengthSub),
    infoCard('peek()', statFront, S.cardPeekSub),
    infoCard('isEmpty()', statEmpty, S.cardEmptySub),
  );

  clear(host);
  host.append(stage, aside);

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
