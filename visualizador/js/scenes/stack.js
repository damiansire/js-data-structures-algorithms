// Escena: Stack — "Una pila de platos" (LIFO).
//
// Interactiva: push() deja caer un plato desde el techo con rebote elástico;
// pop() dispara el plato del tope hacia un costado. Refleja la semántica real
// de Estructuras-de-datos/stack/stack.js, incluyendo que pop() sobre una pila
// vacía lanza un Error (acá lo mostramos como aviso, sin romper la escena).

import { el, clear } from '../dom.js';
import { getLang } from '../i18n.js';

// Strings bilingües de la escena. EN por defecto; ES opcional.
const STRINGS = {
  en: {
    initial: 'Empty stack. Try <b>push()</b>.',
    lifoLine1: 'last in,',
    lifoLine2: 'first out',
    pushBtn: '⬇  push()',
    popBtn: '⬆  pop()',
    clearBtn: '🗑  clear',
    pushMsg: (n) => `<b>push(${n})</b> → a plate drops onto the top.`,
    popMsg: (val) => `<b>pop()</b> → plate <span class="mono">${val}</span> shoots out.`,
    popEmptyErr: '⚠️ <b>pop()</b> on an empty stack throws <span class="mono">Error</span>.',
    emptyAgain: 'Empty stack again. LIFO ✔',
    cleared: 'Stack cleared.',
    cardLengthSub: 'O(n) walks the nodes',
    cardPeekSub: 'top without popping · O(1)',
    cardEmptySub: 'top === null',
  },
  es: {
    initial: 'Pila vacía. Probá <b>push()</b>.',
    lifoLine1: 'último en entrar,',
    lifoLine2: 'primero en salir',
    pushBtn: '⬇  push()',
    popBtn: '⬆  pop()',
    clearBtn: '🗑  vaciar',
    pushMsg: (n) => `<b>push(${n})</b> → cae un plato al tope.`,
    popMsg: (val) => `<b>pop()</b> → el plato <span class="mono">${val}</span> sale disparado.`,
    popEmptyErr: '⚠️ <b>pop()</b> sobre pila vacía lanza <span class="mono">Error</span>.',
    emptyAgain: 'Pila vacía otra vez. LIFO ✔',
    cleared: 'Pila vaciada.',
    cardLengthSub: 'O(n) recorre nodos',
    cardPeekSub: 'tope sin desapilar · O(1)',
    cardEmptySub: 'top === null',
  },
};

// Pila fiel al repo: nodos enlazados, el tope apunta al de abajo (prev).
class Node {
  constructor(data) {
    this.data = data;
    this.prev = null;
  }
}
class Stack {
  constructor() {
    this.top = null;
  }
  isEmpty() {
    return this.top === null;
  }
  length() {
    let aux = this.top;
    let c = 0;
    while (aux !== null) {
      c++;
      aux = aux.prev;
    }
    return c;
  }
  peek() {
    return this.top;
  }
  push(element) {
    const aux = new Node(element);
    aux.prev = this.top;
    this.top = aux;
  }
  pop() {
    if (this.top != null) this.top = this.top.prev;
    else throw new Error('No se puede hacer pop() sobre una pila vacia');
  }
}

const PLATE_COLORS = [
  ['#a78bfa', '#7c3aed'],
  ['#22d3ee', '#0891b2'],
  ['#34d399', '#059669'],
  ['#fbbf24', '#d97706'],
  ['#fb7185', '#e11d48'],
  ['#60a5fa', '#2563eb'],
];

export default function mountStack(host) {
  const S = STRINGS[getLang()] || STRINGS.en;
  const stack = new Stack();
  let counter = 0; // valor incremental para empujar
  let busy = false;

  const pile = el('div', { class: 'stk-pile' });
  const base = el('div', { class: 'stk-base' });
  const column = el('div', { class: 'stk-column' }, pile, base);

  const canvas = el('div', { class: 'stage-canvas stk-stage' }, column);
  const narrator = el('div', { class: 'narrator' }, S.initial);
  canvas.append(narrator);

  const lifoTag = el(
    'div',
    { class: 'stk-lifo' },
    'LIFO',
    el('small', {}, S.lifoLine1, el('br'), S.lifoLine2),
  );
  canvas.append(lifoTag);

  function setNarration(html) {
    narrator.innerHTML = html;
  }

  // mapa de plato DOM por nodo, para animar pop del tope
  const platesByNode = new Map();

  function plateFor(node, idx) {
    const [c1, c2] = PLATE_COLORS[idx % PLATE_COLORS.length];
    const width = 150 - (idx % 3) * 8; // leve variación para que se vea apilado
    const p = el(
      'div',
      {
        class: 'stk-plate drop',
        style: {
          width: `${width}px`,
          background: `linear-gradient(180deg, ${c1}, ${c2})`,
        },
      },
      el('span', {}, String(node.data)),
    );
    return p;
  }

  function syncStats() {
    statLen.textContent = String(stack.length());
    statTop.textContent = stack.isEmpty() ? '—' : String(stack.peek().data);
    statEmpty.textContent = stack.isEmpty() ? 'true' : 'false';
    statEmpty.style.color = stack.isEmpty() ? 'var(--green)' : 'var(--ink)';
    popBtn.disabled = stack.isEmpty() || busy;
    pushBtn.disabled = busy;
    clearBtn.disabled = stack.isEmpty() || busy;
  }

  function doPush() {
    if (busy) return;
    counter += 1;
    stack.push(counter);
    const idx = stack.length() - 1;
    const node = stack.peek();
    const p = plateFor(node, idx);
    platesByNode.set(node, p);
    pile.append(p);
    setNarration(S.pushMsg(counter));
    syncStats();
    p.addEventListener('animationend', () => p.classList.remove('drop'), { once: true });
  }

  function doPop() {
    if (busy || stack.isEmpty()) {
      if (stack.isEmpty()) {
        setNarration(S.popEmptyErr);
        lifoTag.classList.add('shake');
        setTimeout(() => lifoTag.classList.remove('shake'), 500);
      }
      return;
    }
    busy = true;
    const node = stack.peek();
    const p = platesByNode.get(node);
    const val = node.data;
    stack.pop();
    platesByNode.delete(node);
    setNarration(S.popMsg(val));
    syncStats();
    p.classList.add('eject');
    p.addEventListener(
      'animationend',
      () => {
        p.remove();
        busy = false;
        syncStats();
        if (stack.isEmpty()) setNarration(S.emptyAgain);
      },
      { once: true },
    );
  }

  function doClear() {
    if (busy) return;
    while (!stack.isEmpty()) stack.pop();
    platesByNode.clear();
    clear(pile);
    setNarration(S.cleared);
    syncStats();
  }

  // ── controles propios de la escena (no usa Player) ──────────────
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

  const statLen = el('span', { class: 'big' }, '0');
  const statTop = el('span', { class: 'big' }, '—');
  const statEmpty = el('span', { class: 'big', style: { color: 'var(--green)' } }, 'true');

  const stage = el('div', { class: 'stage' }, canvas, bar);
  const aside = el(
    'div',
    { class: 'scene-aside' },
    infoCard('length()', statLen, S.cardLengthSub),
    infoCard('peek()', statTop, S.cardPeekSub),
    infoCard('isEmpty()', statEmpty, S.cardEmptySub),
  );

  clear(host);
  host.append(stage, aside);

  // arranca con un par de platos para que no esté vacío
  doPush();
  doPush();
  doPush();

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
