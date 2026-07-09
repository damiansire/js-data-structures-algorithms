// Escena: Bounded Stack — "Una pila con límite" (LIFO con capacidad fija).
//
// A diferencia de la pila enlazada (escena `stack`), esta tiene un tope duro:
// N slots de capacidad. push() llena el siguiente slot desde abajo; push() sobre
// una pila llena es OVERFLOW (lo mostramos como aviso, sin romper la escena),
// pop() sobre vacía es UNDERFLOW. Es la pila respaldada por un arreglo de tamaño
// fijo — la que aparece en sistemas con memoria acotada.

import { el, clear } from '../dom.js';
import { getLang } from '../i18n.js';

const CAPACITY = 6;

const STRINGS = {
  en: {
    initial: `Bounded stack, capacity <b>${CAPACITY}</b>. <b>push()</b> until it overflows.`,
    pushBtn: '⬇  push()',
    popBtn: '⬆  pop()',
    clearBtn: '🗑  clear',
    pushMsg: (n, size) => `<b>push(${n})</b> → slot ${size} of ${CAPACITY} filled.`,
    overflow: `⚠️ <b>push()</b> on a full stack → <span class="mono">stack overflow</span> (capacity ${CAPACITY}).`,
    popMsg: (val) => `<b>pop()</b> → <span class="mono">${val}</span> leaves the top.`,
    underflow: '⚠️ <b>pop()</b> on an empty stack → <span class="mono">underflow</span>.',
    cleared: 'Stack cleared.',
    capLabel: 'capacity',
    cardSizeSub: 'items in use',
    cardFullSub: 'size === capacity',
    cardEmptySub: 'size === 0',
  },
  es: {
    initial: `Pila acotada, capacidad <b>${CAPACITY}</b>. <b>push()</b> hasta que desborde.`,
    pushBtn: '⬇  push()',
    popBtn: '⬆  pop()',
    clearBtn: '🗑  vaciar',
    pushMsg: (n, size) => `<b>push(${n})</b> → slot ${size} de ${CAPACITY} lleno.`,
    overflow: `⚠️ <b>push()</b> sobre pila llena → <span class="mono">overflow</span> (capacidad ${CAPACITY}).`,
    popMsg: (val) => `<b>pop()</b> → <span class="mono">${val}</span> sale del tope.`,
    underflow: '⚠️ <b>pop()</b> sobre pila vacía → <span class="mono">underflow</span>.',
    cleared: 'Pila vaciada.',
    capLabel: 'capacidad',
    cardSizeSub: 'elementos en uso',
    cardFullSub: 'size === capacidad',
    cardEmptySub: 'size === 0',
  },
};

const SLOT_COLORS = [
  ['#a78bfa', '#7c3aed'],
  ['#22d3ee', '#0891b2'],
  ['#34d399', '#059669'],
  ['#fbbf24', '#d97706'],
  ['#fb7185', '#e11d48'],
  ['#60a5fa', '#2563eb'],
];

// Pila respaldada por un arreglo de tamaño fijo: el tope duro es la capacidad.
class BoundedStack {
  constructor(capacity) {
    this.capacity = capacity;
    this.items = [];
  }
  get size() {
    return this.items.length;
  }
  isFull() {
    return this.items.length >= this.capacity;
  }
  isEmpty() {
    return this.items.length === 0;
  }
  push(x) {
    if (this.isFull()) throw new RangeError('stack overflow');
    this.items.push(x);
  }
  pop() {
    if (this.isEmpty()) throw new RangeError('stack underflow');
    return this.items.pop();
  }
}

export default function mountBoundedStack(host) {
  const S = STRINGS[getLang()] || STRINGS.en;
  const stack = new BoundedStack(CAPACITY);
  let counter = 0;
  let shakeTimer = null;

  const frame = el('div', { class: 'bstk-frame' });
  const canvas = el('div', { class: 'stage-canvas bstk-stage' }, frame);
  const narrator = el('div', { class: 'narrator' }, S.initial);
  canvas.append(narrator);

  const capTag = el('div', { class: 'bstk-cap' }, `${S.capLabel}: ${CAPACITY}`);
  canvas.append(capTag);

  const setNarration = (html) => {
    narrator.innerHTML = html;
  };

  // Renders the fixed frame: `capacity` slots, top slot first (visually stacked
  // downward), filled ones coloured. `changed` marks the slot to animate.
  function renderSlots(changed) {
    clear(frame);
    for (let row = CAPACITY - 1; row >= 0; row--) {
      const filled = row < stack.size;
      const isTop = filled && row === stack.size - 1;
      const attrs = { class: `bstk-slot${filled ? ' is-filled' : ''}${isTop ? ' is-top' : ''}` };
      if (filled) {
        const [c1, c2] = SLOT_COLORS[row % SLOT_COLORS.length];
        attrs.style = { background: `linear-gradient(180deg, ${c1}, ${c2})` };
      }
      if (row === changed) attrs.class += ' pulse';
      frame.append(
        el(
          'div',
          attrs,
          el('span', { class: 'bstk-idx' }, `[${row}]`),
          filled ? el('span', { class: 'bstk-val' }, String(stack.items[row])) : null,
        ),
      );
    }
  }

  function syncStats() {
    statSize.textContent = `${stack.size} / ${CAPACITY}`;
    statFull.textContent = stack.isFull() ? 'true' : 'false';
    statFull.style.color = stack.isFull() ? 'var(--red, #e11d48)' : 'var(--ink)';
    statEmpty.textContent = stack.isEmpty() ? 'true' : 'false';
    statEmpty.style.color = stack.isEmpty() ? 'var(--green)' : 'var(--ink)';
    popBtn.disabled = stack.isEmpty();
    clearBtn.disabled = stack.isEmpty();
    pushBtn.classList.toggle('is-full', stack.isFull());
  }

  function flashOverflow() {
    frame.classList.add('shake');
    capTag.classList.add('is-hot');
    clearTimeout(shakeTimer);
    shakeTimer = setTimeout(() => {
      frame.classList.remove('shake');
      capTag.classList.remove('is-hot');
    }, 520);
  }

  function doPush() {
    if (stack.isFull()) {
      setNarration(S.overflow);
      flashOverflow();
      return;
    }
    counter += 1;
    stack.push(counter);
    setNarration(S.pushMsg(counter, stack.size));
    renderSlots(stack.size - 1);
    syncStats();
  }

  function doPop() {
    if (stack.isEmpty()) {
      setNarration(S.underflow);
      flashOverflow();
      return;
    }
    const val = stack.pop();
    setNarration(S.popMsg(val));
    renderSlots(stack.size);
    syncStats();
  }

  function doClear() {
    stack.items.length = 0;
    setNarration(S.cleared);
    renderSlots(-1);
    syncStats();
  }

  const pushBtn = el('button', { class: 'tbtn primary' }, S.pushBtn);
  const popBtn = el('button', { class: 'tbtn' }, S.popBtn);
  const clearBtn = el('button', { class: 'tbtn' }, S.clearBtn);
  pushBtn.addEventListener('click', doPush);
  popBtn.addEventListener('click', doPop);
  clearBtn.addEventListener('click', doClear);

  const bar = el(
    'div',
    { class: 'transport' },
    pushBtn,
    popBtn,
    el('span', { class: 'spacer' }),
    clearBtn,
  );

  const statSize = el('span', { class: 'big' }, `0 / ${CAPACITY}`);
  const statFull = el('span', { class: 'big' }, 'false');
  const statEmpty = el('span', { class: 'big', style: { color: 'var(--green)' } }, 'true');

  const stage = el('div', { class: 'stage' }, canvas, bar);
  const aside = el(
    'div',
    { class: 'scene-aside' },
    infoCard('size()', statSize, S.cardSizeSub),
    infoCard('isFull()', statFull, S.cardFullSub),
    infoCard('isEmpty()', statEmpty, S.cardEmptySub),
  );

  clear(host);
  host.append(stage, aside);

  renderSlots(-1);
  syncStats();
  doPush();
  doPush();

  return {
    destroy: () => {
      clearTimeout(shakeTimer);
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
