// Escena: Deque — "La fila con dos puertas" (double-ended queue).
//
// Se agrega y se saca por AMBOS extremos: pushFront/popFront (izquierda) y
// pushBack/popBack (derecha), todo O(1). Con una sola puerta es un stack o una
// cola; con las dos, una deque. Refleja la semántica real de
// Estructuras-de-datos/deque/deque.js (doblemente enlazada).

import { el, clear } from '../dom.js';
import { getLang } from '../i18n.js';

const CARD_COLORS = [
  ['#a78bfa', '#7c3aed'],
  ['#22d3ee', '#0891b2'],
  ['#34d399', '#059669'],
  ['#fbbf24', '#d97706'],
  ['#fb7185', '#e11d48'],
  ['#60a5fa', '#2563eb'],
];

const STRINGS = {
  en: {
    initial: 'Deque: add or remove from <b>both</b> ends. Try the buttons.',
    front: 'front',
    back: 'back',
    pushFront: 'push ⬅',
    popFront: '⬅ pop',
    pushBack: 'push ➡',
    popBack: 'pop ➡',
    clearBtn: '🗑  clear',
    pushFrontMsg: (n) => `<b>pushFront(${n})</b> → new head on the left.`,
    pushBackMsg: (n) => `<b>pushBack(${n})</b> → new tail on the right.`,
    popFrontMsg: (v) => `<b>popFront()</b> → <span class="mono">${v}</span> left from the front.`,
    popBackMsg: (v) => `<b>popBack()</b> → <span class="mono">${v}</span> left from the back.`,
    cleared: 'Deque cleared.',
    cardSizeSub: 'items',
    cardFrontSub: 'peekFront() · O(1)',
    cardBackSub: 'peekBack() · O(1)',
  },
  es: {
    initial: 'Deque: agregá o sacá por <b>ambos</b> extremos. Probá los botones.',
    front: 'frente',
    back: 'final',
    pushFront: 'push ⬅',
    popFront: '⬅ pop',
    pushBack: 'push ➡',
    popBack: 'pop ➡',
    clearBtn: '🗑  vaciar',
    pushFrontMsg: (n) => `<b>pushFront(${n})</b> → nuevo frente a la izquierda.`,
    pushBackMsg: (n) => `<b>pushBack(${n})</b> → nuevo final a la derecha.`,
    popFrontMsg: (v) => `<b>popFront()</b> → <span class="mono">${v}</span> salió del frente.`,
    popBackMsg: (v) => `<b>popBack()</b> → <span class="mono">${v}</span> salió del final.`,
    cleared: 'Deque vaciada.',
    cardSizeSub: 'elementos',
    cardFrontSub: 'peekFront() · O(1)',
    cardBackSub: 'peekBack() · O(1)',
  },
};

// Deque fiel al repo: doblemente enlazada.
class Node {
  constructor(data) {
    this.data = data;
    this.prev = null;
    this.next = null;
  }
}
class Deque {
  constructor() {
    this.head = null;
    this.tail = null;
    this.length = 0;
  }
  isEmpty() {
    return this.length === 0;
  }
  pushFront(x) {
    const n = new Node(x);
    if (!this.head) this.head = this.tail = n;
    else {
      n.next = this.head;
      this.head.prev = n;
      this.head = n;
    }
    this.length++;
  }
  pushBack(x) {
    const n = new Node(x);
    if (!this.tail) this.head = this.tail = n;
    else {
      n.prev = this.tail;
      this.tail.next = n;
      this.tail = n;
    }
    this.length++;
  }
  popFront() {
    const n = this.head;
    this.head = n.next;
    if (!this.head) this.tail = null;
    else this.head.prev = null;
    this.length--;
    return n.data;
  }
  popBack() {
    const n = this.tail;
    this.tail = n.prev;
    if (!this.tail) this.head = null;
    else this.tail.next = null;
    this.length--;
    return n.data;
  }
  toArray() {
    const out = [];
    for (let a = this.head; a; a = a.next) out.push(a.data);
    return out;
  }
}

export default function mountDeque(host) {
  const S = STRINGS[getLang()] || STRINGS.en;
  const dq = new Deque();
  let counter = 0;

  const lane = el('div', { class: 'dq-lane' });
  const frontTag = el('div', { class: 'q-end q-end--front' }, S.front, el('br'), '→');
  const backTag = el('div', { class: 'q-end q-end--back' }, '←', el('br'), S.back);
  const track = el('div', { class: 'q-track' }, frontTag, lane, backTag);

  const canvas = el('div', { class: 'stage-canvas dq-stage' }, track);
  const narrator = el('div', { class: 'narrator' }, S.initial);
  canvas.append(narrator);

  const setNarration = (html) => {
    narrator.innerHTML = html;
  };

  // `enterAt`: índice del card que acaba de entrar (para animarlo desde su lado).
  function render(enterAt, side) {
    clear(lane);
    dq.toArray().forEach((v, i) => {
      const [c1, c2] = CARD_COLORS[v % CARD_COLORS.length];
      const anim = i === enterAt ? ` enter-${side}` : '';
      lane.append(
        el(
          'div',
          {
            class: `dq-card${anim}`,
            style: { background: `linear-gradient(180deg, ${c1}, ${c2})` },
          },
          String(v),
        ),
      );
    });
  }

  function syncStats() {
    statSize.textContent = String(dq.length);
    statFront.textContent = dq.isEmpty() ? '—' : String(dq.head.data);
    statBack.textContent = dq.isEmpty() ? '—' : String(dq.tail.data);
    for (const b of [popFrontBtn, popBackBtn, clearBtn]) b.disabled = dq.isEmpty();
  }

  function doPushFront() {
    counter += 1;
    dq.pushFront(counter);
    setNarration(S.pushFrontMsg(counter));
    render(0, 'left');
    syncStats();
  }
  function doPushBack() {
    counter += 1;
    dq.pushBack(counter);
    setNarration(S.pushBackMsg(counter));
    render(dq.length - 1, 'right');
    syncStats();
  }
  function doPopFront() {
    if (dq.isEmpty()) return;
    const v = dq.popFront();
    setNarration(S.popFrontMsg(v));
    render(-1);
    syncStats();
  }
  function doPopBack() {
    if (dq.isEmpty()) return;
    const v = dq.popBack();
    setNarration(S.popBackMsg(v));
    render(-1);
    syncStats();
  }
  function doClear() {
    dq.head = dq.tail = null;
    dq.length = 0;
    setNarration(S.cleared);
    render(-1);
    syncStats();
  }

  const pushFrontBtn = el('button', { class: 'tbtn primary' }, S.pushFront);
  const popFrontBtn = el('button', { class: 'tbtn' }, S.popFront);
  const pushBackBtn = el('button', { class: 'tbtn primary' }, S.pushBack);
  const popBackBtn = el('button', { class: 'tbtn' }, S.popBack);
  const clearBtn = el('button', { class: 'tbtn' }, S.clearBtn);
  pushFrontBtn.addEventListener('click', doPushFront);
  popFrontBtn.addEventListener('click', doPopFront);
  pushBackBtn.addEventListener('click', doPushBack);
  popBackBtn.addEventListener('click', doPopBack);
  clearBtn.addEventListener('click', doClear);

  const bar = el(
    'div',
    { class: 'transport dq-transport' },
    pushFrontBtn,
    popFrontBtn,
    el('span', { class: 'spacer' }),
    clearBtn,
    el('span', { class: 'spacer' }),
    popBackBtn,
    pushBackBtn,
  );

  const statSize = el('span', { class: 'big' }, '0');
  const statFront = el('span', { class: 'big' }, '—');
  const statBack = el('span', { class: 'big' }, '—');

  const stage = el('div', { class: 'stage' }, canvas, bar);
  const aside = el(
    'div',
    { class: 'scene-aside' },
    infoCard('size()', statSize, S.cardSizeSub),
    infoCard('front', statFront, S.cardFrontSub),
    infoCard('back', statBack, S.cardBackSub),
  );

  clear(host);
  host.append(stage, aside);

  render(-1);
  syncStats();
  doPushBack();
  doPushBack();
  doPushFront();

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
