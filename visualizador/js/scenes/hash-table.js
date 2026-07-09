// Escena: Hash Table — "El casillero de claves" (separate chaining).
//
// N buckets. hash(clave) elige un bucket; las claves que caen en el mismo bucket
// (colisiones) se encadenan en una lista. set() resalta el bucket destino y suma
// la entrada; get() vuelve a hashear y encuentra. Refleja la semántica real de
// Estructuras-de-datos/hash-table/hash-table.js.

import { el, clear } from '../dom.js';
import { getLang } from '../i18n.js';

const N = 8; // buckets

const WORDS = [
  'apple',
  'banana',
  'cherry',
  'date',
  'fig',
  'grape',
  'kiwi',
  'lemon',
  'mango',
  'pear',
  'plum',
  'berry',
];

const STRINGS = {
  en: {
    initial: `Hash table with <b>${N}</b> buckets. <b>set()</b> hashes a key to a bucket.`,
    setBtn: 'set()',
    getBtn: 'get()',
    clearBtn: '🗑  clear',
    setMsg: (k, i) => `<b>set('${k}')</b> → hash = ${i} → bucket ${i}.`,
    collisionMsg: (k, i) =>
      `<b>set('${k}')</b> → hash = ${i} → <b>collision</b>, chained in bucket ${i}.`,
    getMsg: (k, i, v) => `<b>get('${k}')</b> → hash = ${i} → found <span class="mono">${v}</span>.`,
    fullMsg: 'Every key is in the table. Try get() or clear.',
    empty: 'Nothing to look up yet — set() first.',
    cleared: 'Table cleared.',
    cardSizeSub: 'keys stored',
    cardLoadSub: 'size / buckets',
    cardWorstSub: 'longest chain',
  },
  es: {
    initial: `Tabla hash con <b>${N}</b> buckets. <b>set()</b> hashea una clave a un bucket.`,
    setBtn: 'set()',
    getBtn: 'get()',
    clearBtn: '🗑  vaciar',
    setMsg: (k, i) => `<b>set('${k}')</b> → hash = ${i} → bucket ${i}.`,
    collisionMsg: (k, i) =>
      `<b>set('${k}')</b> → hash = ${i} → <b>colisión</b>, encadenada en bucket ${i}.`,
    getMsg: (k, i, v) =>
      `<b>get('${k}')</b> → hash = ${i} → encontró <span class="mono">${v}</span>.`,
    fullMsg: 'Todas las claves ya están. Probá get() o vaciar.',
    empty: 'Nada para buscar todavía — hacé set() primero.',
    cleared: 'Tabla vaciada.',
    cardSizeSub: 'claves guardadas',
    cardLoadSub: 'size / buckets',
    cardWorstSub: 'cadena más larga',
  },
};

// Tabla hash fiel al repo: encadenamiento separado.
class HashTable {
  constructor(capacity) {
    this.capacity = capacity;
    this.buckets = Array.from({ length: capacity }, () => []);
    this.count = 0;
  }
  hash(key) {
    const s = String(key);
    let h = 0;
    for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
    return h % this.capacity;
  }
  set(key, value) {
    const bucket = this.buckets[this.hash(key)];
    const entry = bucket.find((e) => e.key === key);
    if (entry) {
      entry.value = value;
      return false;
    }
    bucket.push({ key, value });
    this.count++;
    return true;
  }
  get(key) {
    const entry = this.buckets[this.hash(key)].find((e) => e.key === key);
    return entry ? entry.value : undefined;
  }
}

export default function mountHashTable(host) {
  const S = STRINGS[getLang()] || STRINGS.en;
  const table = new HashTable(N);
  const inserted = [];
  let nextWord = 0;
  let value = 0;

  const rows = el('div', { class: 'ht-table' });
  const canvas = el('div', { class: 'stage-canvas ht-stage' }, rows);
  const narrator = el('div', { class: 'narrator' }, S.initial);
  canvas.append(narrator);

  const setNarration = (html) => {
    narrator.innerHTML = html;
  };

  // Redraw all buckets; `flashBucket` pulses, `flashKey` highlights one entry.
  function render(flashBucket, flashKey) {
    clear(rows);
    for (let i = 0; i < N; i++) {
      const bucket = table.buckets[i];
      const chain = el('div', { class: 'ht-chain' });
      if (bucket.length === 0) {
        chain.append(el('span', { class: 'ht-empty' }, '∅'));
      } else {
        bucket.forEach((e, j) => {
          if (j > 0) chain.append(el('span', { class: 'ht-arrow' }, '→'));
          const hot = i === flashBucket && e.key === flashKey;
          chain.append(
            el(
              'span',
              { class: `ht-entry${hot ? ' is-hot' : ''}` },
              el('span', { class: 'ht-key' }, e.key),
              el('span', { class: 'ht-val' }, String(e.value)),
            ),
          );
        });
      }
      rows.append(
        el(
          'div',
          { class: `ht-bucket${i === flashBucket ? ' is-flash' : ''}` },
          el('span', { class: 'ht-idx' }, `[${i}]`),
          chain,
        ),
      );
    }
  }

  function longestChain() {
    return table.buckets.reduce((m, b) => Math.max(m, b.length), 0);
  }

  function syncStats() {
    statSize.textContent = String(table.count);
    statLoad.textContent = `${(table.count / N).toFixed(2)}`;
    statWorst.textContent = String(longestChain());
    setBtn.disabled = nextWord >= WORDS.length;
    getBtn.disabled = inserted.length === 0;
    clearBtn.disabled = table.count === 0;
  }

  function doSet() {
    if (nextWord >= WORDS.length) {
      setNarration(S.fullMsg);
      return;
    }
    const key = WORDS[nextWord++];
    value += 1;
    const i = table.hash(key);
    const collided = table.buckets[i].length > 0;
    table.set(key, value);
    inserted.push(key);
    setNarration(collided ? S.collisionMsg(key, i) : S.setMsg(key, i));
    render(i, key);
    syncStats();
  }

  function doGet() {
    if (inserted.length === 0) {
      setNarration(S.empty);
      return;
    }
    const key = inserted[Math.floor(Math.random() * inserted.length)];
    const i = table.hash(key);
    const v = table.get(key);
    setNarration(S.getMsg(key, i, v));
    render(i, key);
    syncStats();
  }

  function doClear() {
    table.buckets = Array.from({ length: N }, () => []);
    table.count = 0;
    inserted.length = 0;
    nextWord = 0;
    value = 0;
    setNarration(S.cleared);
    render(-1, null);
    syncStats();
  }

  const setBtn = el('button', { class: 'tbtn primary' }, S.setBtn);
  const getBtn = el('button', { class: 'tbtn' }, S.getBtn);
  const clearBtn = el('button', { class: 'tbtn' }, S.clearBtn);
  setBtn.addEventListener('click', doSet);
  getBtn.addEventListener('click', doGet);
  clearBtn.addEventListener('click', doClear);

  const bar = el(
    'div',
    { class: 'transport' },
    setBtn,
    getBtn,
    el('span', { class: 'spacer' }),
    clearBtn,
  );

  const statSize = el('span', { class: 'big' }, '0');
  const statLoad = el('span', { class: 'big' }, '0.00');
  const statWorst = el('span', { class: 'big' }, '0');

  const stage = el('div', { class: 'stage' }, canvas, bar);
  const aside = el(
    'div',
    { class: 'scene-aside' },
    infoCard('size()', statSize, S.cardSizeSub),
    infoCard('load factor', statLoad, S.cardLoadSub),
    infoCard('worst case', statWorst, S.cardWorstSub),
  );

  clear(host);
  host.append(stage, aside);

  render(-1, null);
  syncStats();
  doSet();
  doSet();
  doSet();

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
