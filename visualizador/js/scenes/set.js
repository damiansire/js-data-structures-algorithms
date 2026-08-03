// Escena: Set — "El club de socios" (hash set, valores únicos).
//
// Un conjunto guarda valores ÚNICOS: add() de algo que ya está NO hace nada
// (rebota en el miembro existente). Detrás es una tabla hash sin valores, así
// que has() es O(1). Refleja la semántica real de Estructuras-de-datos/set/set.js.

import { el, clear } from '../dom.js';
import { getLang } from '../i18n.js';
import { HashSet } from '../trace/set.trace.mjs';

const POOL = ['apple', 'banana', 'cherry', 'date', 'fig', 'grape', 'kiwi', 'lemon'];

const COLORS = [
  ['#a78bfa', '#7c3aed'],
  ['#22d3ee', '#0891b2'],
  ['#34d399', '#059669'],
  ['#fbbf24', '#d97706'],
  ['#fb7185', '#e11d48'],
  ['#60a5fa', '#2563eb'],
];

const STRINGS = {
  en: {
    initial: 'A set holds <b>unique</b> values. <b>add()</b> the same one twice — it bounces.',
    addBtn: 'add()',
    removeBtn: 'remove()',
    clearBtn: '🗑  clear',
    addedMsg: (v) => `<b>add('${v}')</b> → new member joined.`,
    dupMsg: (v) => `<b>add('${v}')</b> → already in the set; ignored (bounced).`,
    removedMsg: (v) => `<b>remove('${v}')</b> → member left.`,
    fullMsg: 'Every value from the pool is already in — try add() to see it bounce.',
    empty: 'Set is empty — add() first.',
    cleared: 'Set cleared.',
    cardSizeSub: 'unique members',
    cardHasSub: 'O(1) average',
    cardDupSub: 'add() ignored',
  },
  es: {
    initial: 'Un set guarda valores <b>únicos</b>. <b>add()</b> el mismo dos veces — rebota.',
    addBtn: 'add()',
    removeBtn: 'remove()',
    clearBtn: '🗑  vaciar',
    addedMsg: (v) => `<b>add('${v}')</b> → se sumó un miembro nuevo.`,
    dupMsg: (v) => `<b>add('${v}')</b> → ya estaba en el set; ignorado (rebotó).`,
    removedMsg: (v) => `<b>remove('${v}')</b> → se fue un miembro.`,
    fullMsg: 'Todos los valores del pool ya están — probá add() para ver el rebote.',
    empty: 'El set está vacío — hacé add() primero.',
    cleared: 'Set vaciado.',
    cardSizeSub: 'miembros únicos',
    cardHasSub: 'O(1) promedio',
    cardDupSub: 'add() ignorado',
  },
};

// La lógica del set vive en trace/set.trace.mjs (única copia en la capa de
// vista, con test de equivalencia contra Estructuras-de-datos/set/set.js).

export default function mountSet(host) {
  const S = STRINGS[getLang()] || STRINGS.en;
  const set = new HashSet();
  const order = []; // orden de llegada, para color estable
  let seed = 7;
  const pick = () => {
    seed = (seed * 5 + 3) % POOL.length;
    return POOL[seed];
  };

  const members = el('div', { class: 'set-members' });
  const canvas = el('div', { class: 'stage-canvas set-stage' }, members);
  const narrator = el('div', { class: 'narrator' }, S.initial);
  canvas.append(narrator);

  const setNarration = (html) => {
    narrator.innerHTML = html;
  };

  function render(enterV, bounceV) {
    clear(members);
    const vals = set.values();
    if (vals.length === 0) {
      members.append(el('span', { class: 'set-empty' }, '{ }'));
    } else {
      for (const v of vals) {
        const idx = order.indexOf(v);
        const [c1, c2] = COLORS[(idx < 0 ? 0 : idx) % COLORS.length];
        const cls = 'set-chip' + (v === enterV ? ' enter' : '') + (v === bounceV ? ' bounce' : '');
        members.append(
          el(
            'span',
            { class: cls, style: { background: `linear-gradient(180deg, ${c1}, ${c2})` } },
            v,
          ),
        );
      }
    }
  }

  function syncStats() {
    statSize.textContent = String(set.size());
    removeBtn.disabled = set.size() === 0;
    clearBtn.disabled = set.size() === 0;
  }

  function doAdd() {
    const v = pick();
    const isNew = set.add(v);
    if (isNew) {
      order.push(v);
      setNarration(S.addedMsg(v));
      render(v, null);
    } else {
      setNarration(S.dupMsg(v));
      render(null, v);
    }
    syncStats();
  }

  function doRemove() {
    const vals = set.values();
    if (vals.length === 0) return;
    const v = vals[seed % vals.length];
    set.delete(v);
    const oi = order.indexOf(v);
    if (oi >= 0) order.splice(oi, 1);
    setNarration(S.removedMsg(v));
    render(null, null);
    syncStats();
  }

  function doClear() {
    for (const v of set.values()) set.delete(v);
    order.length = 0;
    setNarration(S.cleared);
    render(null, null);
    syncStats();
  }

  const addBtn = el('button', { class: 'tbtn primary' }, S.addBtn);
  const removeBtn = el('button', { class: 'tbtn' }, S.removeBtn);
  const clearBtn = el('button', { class: 'tbtn' }, S.clearBtn);
  addBtn.addEventListener('click', doAdd);
  removeBtn.addEventListener('click', doRemove);
  clearBtn.addEventListener('click', doClear);

  const bar = el(
    'div',
    { class: 'transport' },
    addBtn,
    removeBtn,
    el('span', { class: 'spacer' }),
    clearBtn,
  );

  const statSize = el('span', { class: 'big' }, '0');

  const stage = el('div', { class: 'stage' }, canvas, bar);
  const aside = el(
    'div',
    { class: 'scene-aside' },
    infoCard('size()', statSize, S.cardSizeSub),
    infoCard('has()', el('span', { class: 'big' }, '✓'), S.cardHasSub),
    infoCard('duplicate', el('span', { class: 'big' }, '⤾'), S.cardDupSub),
  );

  clear(host);
  host.append(stage, aside);

  render(null, null);
  syncStats();
  doAdd();
  doAdd();
  doAdd();

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
