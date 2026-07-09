// Escena: Circular Buffer — "La memoria que da la vuelta" (ring buffer).
//
// N slots fijos en círculo. write() ocupa la cabeza y la avanza; cuando está
// lleno, write() PISA el más viejo y la cola también avanza (por eso "da la
// vuelta"). read() libera el más viejo. Refleja la semántica real de
// Estructuras-de-datos/circular-buffer/circular-buffer.js.

import { el, clear } from '../dom.js';
import { getLang } from '../i18n.js';

const N = 8; // capacidad
const CENTER = 150;
const SLOT_R = 98;
const PTR_R = 132;

const STRINGS = {
  en: {
    initial: `Ring buffer, capacity <b>${N}</b>. <b>write()</b> to fill; it wraps around.`,
    writeBtn: 'write()',
    readBtn: 'read()',
    clearBtn: '🗑  clear',
    writeMsg: (n) => `<b>write(${n})</b> → stored at head; head advances.`,
    overwriteMsg: (n, old) =>
      `<b>write(${n})</b> → buffer full, overwrote <span class="mono">${old}</span>; tail advances too.`,
    readMsg: (val) => `<b>read()</b> → returned oldest <span class="mono">${val}</span>.`,
    emptyErr: '⚠️ <b>read()</b> on an empty buffer throws <span class="mono">Error</span>.',
    cleared: 'Buffer cleared.',
    head: 'head · write',
    tail: 'tail · read',
    cardSizeSub: 'items / capacity',
    cardFullSub: 'oldest gets overwritten',
    cardEmptySub: 'count === 0',
  },
  es: {
    initial: `Ring buffer, capacidad <b>${N}</b>. <b>write()</b> para llenar; da la vuelta.`,
    writeBtn: 'write()',
    readBtn: 'read()',
    clearBtn: '🗑  vaciar',
    writeMsg: (n) => `<b>write(${n})</b> → guardado en head; head avanza.`,
    overwriteMsg: (n, old) =>
      `<b>write(${n})</b> → buffer lleno, pisó <span class="mono">${old}</span>; tail también avanza.`,
    readMsg: (val) => `<b>read()</b> → devolvió el más viejo <span class="mono">${val}</span>.`,
    emptyErr: '⚠️ <b>read()</b> sobre buffer vacío lanza <span class="mono">Error</span>.',
    cleared: 'Buffer vaciado.',
    head: 'head · escribe',
    tail: 'tail · lee',
    cardSizeSub: 'ocupados / capacidad',
    cardFullSub: 'el más viejo se pisa',
    cardEmptySub: 'count === 0',
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

// Buffer circular fiel al repo.
class CircularBuffer {
  constructor(capacity) {
    this.capacity = capacity;
    this.buffer = new Array(capacity).fill(undefined);
    this.head = 0;
    this.tail = 0;
    this.count = 0;
  }
  isEmpty() {
    return this.count === 0;
  }
  isFull() {
    return this.count === this.capacity;
  }
  write(element) {
    const overwritten = this.isFull() ? this.buffer[this.head] : undefined;
    const at = this.head;
    this.buffer[this.head] = element;
    this.head = (this.head + 1) % this.capacity;
    if (this.isFull()) this.tail = (this.tail + 1) % this.capacity;
    else this.count++;
    return { at, overwritten };
  }
  read() {
    if (this.isEmpty()) throw new Error('read() sobre buffer vacio');
    const at = this.tail;
    const value = this.buffer[this.tail];
    this.buffer[this.tail] = undefined;
    this.tail = (this.tail + 1) % this.capacity;
    this.count--;
    return { at, value };
  }
}

/** Posición (x, y) del índice `i` sobre un círculo de radio `radius`, empezando arriba. */
function posOf(i, radius) {
  const a = (i / N) * Math.PI * 2 - Math.PI / 2;
  return { x: CENTER + radius * Math.cos(a), y: CENTER + radius * Math.sin(a) };
}

export default function mountCircularBuffer(host) {
  const S = STRINGS[getLang()] || STRINGS.en;
  const cb = new CircularBuffer(N);
  let counter = 0;
  let shakeTimer = null;

  const ring = el('div', { class: 'cb-ring' });
  const canvas = el('div', { class: 'stage-canvas cb-stage' }, ring);
  const narrator = el('div', { class: 'narrator' }, S.initial);
  canvas.append(narrator);

  const setNarration = (html) => {
    narrator.innerHTML = html;
  };

  // Dibuja los N slots + los punteros head/tail. `pulse` marca el slot a animar.
  function render(pulse) {
    clear(ring);
    for (let i = 0; i < N; i++) {
      const filled = cb.buffer[i] !== undefined;
      const { x, y } = posOf(i, SLOT_R);
      const attrs = {
        class: `cb-slot${filled ? ' is-filled' : ''}${i === pulse ? ' pulse' : ''}`,
        style: { left: `${x}px`, top: `${y}px` },
      };
      if (filled) {
        const [c1, c2] = SLOT_COLORS[i % SLOT_COLORS.length];
        attrs.style.background = `linear-gradient(180deg, ${c1}, ${c2})`;
      }
      ring.append(
        el(
          'div',
          attrs,
          el('span', { class: 'cb-slot__i' }, String(i)),
          filled ? el('span', { class: 'cb-slot__v' }, String(cb.buffer[i])) : null,
        ),
      );
    }
    const h = posOf(cb.head, PTR_R);
    const t = posOf(cb.tail, PTR_R);
    ring.append(
      el(
        'div',
        { class: 'cb-ptr cb-ptr--head', style: { left: `${h.x}px`, top: `${h.y}px` } },
        'W',
      ),
      el(
        'div',
        { class: 'cb-ptr cb-ptr--tail', style: { left: `${t.x}px`, top: `${t.y}px` } },
        'R',
      ),
    );
  }

  function syncStats() {
    statSize.textContent = `${cb.count} / ${N}`;
    statFull.textContent = cb.isFull() ? 'true' : 'false';
    statFull.style.color = cb.isFull() ? 'var(--red, #e11d48)' : 'var(--ink)';
    statEmpty.textContent = cb.isEmpty() ? 'true' : 'false';
    statEmpty.style.color = cb.isEmpty() ? 'var(--green)' : 'var(--ink)';
    readBtn.disabled = cb.isEmpty();
    clearBtn.disabled = cb.isEmpty();
  }

  function flashFull() {
    ring.classList.add('shake');
    clearTimeout(shakeTimer);
    shakeTimer = setTimeout(() => ring.classList.remove('shake'), 480);
  }

  function doWrite() {
    counter += 1;
    const wasFull = cb.isFull();
    const { at, overwritten } = cb.write(counter);
    if (wasFull) {
      setNarration(S.overwriteMsg(counter, overwritten));
      flashFull();
    } else {
      setNarration(S.writeMsg(counter));
    }
    render(at);
    syncStats();
  }

  function doRead() {
    if (cb.isEmpty()) return;
    const { at, value } = cb.read();
    setNarration(S.readMsg(value));
    render(at);
    syncStats();
  }

  function doClear() {
    cb.buffer.fill(undefined);
    cb.head = cb.tail = cb.count = 0;
    setNarration(S.cleared);
    render(-1);
    syncStats();
  }

  const writeBtn = el('button', { class: 'tbtn primary' }, S.writeBtn);
  const readBtn = el('button', { class: 'tbtn' }, S.readBtn);
  const clearBtn = el('button', { class: 'tbtn' }, S.clearBtn);
  writeBtn.addEventListener('click', doWrite);
  readBtn.addEventListener('click', doRead);
  clearBtn.addEventListener('click', doClear);

  const bar = el(
    'div',
    { class: 'transport' },
    writeBtn,
    readBtn,
    el('span', { class: 'spacer' }),
    clearBtn,
  );

  const statSize = el('span', { class: 'big' }, `0 / ${N}`);
  const statFull = el('span', { class: 'big' }, 'false');
  const statEmpty = el('span', { class: 'big', style: { color: 'var(--green)' } }, 'true');

  const legend = el(
    'div',
    { class: 'cb-legend' },
    el('span', { class: 'cb-legend__item' }, el('i', { class: 'cb-dot cb-dot--head' }), S.head),
    el('span', { class: 'cb-legend__item' }, el('i', { class: 'cb-dot cb-dot--tail' }), S.tail),
  );

  const stage = el('div', { class: 'stage' }, canvas, bar);
  const aside = el(
    'div',
    { class: 'scene-aside' },
    infoCard('size()', statSize, S.cardSizeSub),
    infoCard('isFull()', statFull, S.cardFullSub),
    infoCard('isEmpty()', statEmpty, S.cardEmptySub),
    legend,
  );

  clear(host);
  host.append(stage, aside);

  render(-1);
  syncStats();
  doWrite();
  doWrite();
  doWrite();

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
