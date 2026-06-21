// Escena: Linked List — "Un tren de carga".
//
// Cada nodo es un VAGÓN; el puntero `next` es el ENGANCHE/cadena entre vagones
// (con una flechita →). La cabeza (head) y la cola (last) llevan su banderín.
//
// La List de este módulo es FIEL a Estructuras-de-datos/list/list.js:
//   - push(data): agrega al FINAL. Si head == null, head = node; si no,
//     last.next = node. Siempre last = node y length++.  (O(1) gracias a last)
//   - delete(element): elimina el PRIMER nodo cuyo data coincide. Mantiene
//     head y last sincronizados y decrementa length, replicando los if del repo
//     (caso cabeza, recorrido por next, reconexión y ajuste de last/length).
//   - getLastElement()/getElementByIndex()/find(): recorrido por next.
//
// `prepend(data)` (insertar al inicio) NO existe en el repo; lo agregamos como
// extensión natural manteniendo los MISMOS invariantes (head nuevo, last si la
// lista estaba vacía, length++) para poder mostrar inserción "al inicio".

import { el, clear, wait } from '../dom.js';
import { getLang } from '../i18n.js';

// ── Strings bilingües (EN por defecto, ES opcional) ──────────────
const STRINGS = {
  en: {
    locoTitle: 'Locomotive — head points to the first car',
    narratorStart: 'Train at the station. Try <b>push()</b> to couple a car.',
    legendHead: 'head',
    legendHeadSub: 'first car',
    legendLast: 'last',
    legendLastSub: 'tail · O(1)',
    flagHead: 'head',
    flagLast: 'last',
    nextNull: 'next = null',
    next: 'next',
    nullTag: 'null',
    emptyRail: 'head = null · no cars',
    pushFirst: (n) => `<b>push(${n})</b> → first car: <span class="mono">head = last</span>.`,
    pushMore: (n) =>
      `<b>push(${n})</b> → a car drops at the end and the tail <span class="mono">last.next</span> couples it.`,
    prependFirst: (n) => `<b>prepend(${n})</b> → first car: <span class="mono">head = last</span>.`,
    prependMore: (n) =>
      `<b>prepend(${n})</b> → it drops at the front and its <span class="mono">next</span> points to the old head.`,
    popMsg: (n) =>
      `<b>delete(${n})</b> → the tail uncouples; the second-to-last becomes <span class="mono">last</span>.`,
    shiftMsg: (n) =>
      `<b>delete(${n})</b> on the head → <span class="mono">head = head.next</span>; pointers are reconnected.`,
    emptyAgain: 'Empty train again. <span class="mono">head = null</span>.',
    cleared: 'Tracks cleared. <span class="mono">head = null · length = 0</span>.',
    btnPush: '⬇  push() · at the end',
    btnPrepend: '⬅  prepend() · at the start',
    btnShift: '✂  delete head',
    btnPop: '✂  delete tail',
    btnClear: '🗑  clear',
    cardLengthSub: 'counter kept by the list',
    cardHeadSub: 'first car · O(1)',
    cardLastSub: 'tail · push() is O(1)',
  },
  es: {
    locoTitle: 'Locomotora — head apunta al primer vagón',
    narratorStart: 'Tren en la estación. Probá <b>push()</b> para enganchar un vagón.',
    legendHead: 'head',
    legendHeadSub: 'primer vagón',
    legendLast: 'last',
    legendLastSub: 'cola · O(1)',
    flagHead: 'head',
    flagLast: 'last',
    nextNull: 'next = null',
    next: 'next',
    nullTag: 'null',
    emptyRail: 'head = null · sin vagones',
    pushFirst: (n) => `<b>push(${n})</b> → primer vagón: <span class="mono">head = last</span>.`,
    pushMore: (n) =>
      `<b>push(${n})</b> → cae un vagón al final y la cola <span class="mono">last.next</span> lo engancha.`,
    prependFirst: (n) =>
      `<b>prepend(${n})</b> → primer vagón: <span class="mono">head = last</span>.`,
    prependMore: (n) =>
      `<b>prepend(${n})</b> → cae al frente y su <span class="mono">next</span> apunta al viejo head.`,
    popMsg: (n) =>
      `<b>delete(${n})</b> → se desengancha la cola; el penúltimo pasa a ser <span class="mono">last</span>.`,
    shiftMsg: (n) =>
      `<b>delete(${n})</b> sobre el head → <span class="mono">head = head.next</span>; se reconectan los punteros.`,
    emptyAgain: 'Tren vacío otra vez. <span class="mono">head = null</span>.',
    cleared: 'Vías despejadas. <span class="mono">head = null · length = 0</span>.',
    btnPush: '⬇  push() · al final',
    btnPrepend: '⬅  prepend() · al inicio',
    btnShift: '✂  borrar head',
    btnPop: '✂  borrar cola',
    btnClear: '🗑  vaciar',
    cardLengthSub: 'contador que mantiene la lista',
    cardHeadSub: 'primer vagón · O(1)',
    cardLastSub: 'cola · push() es O(1)',
  },
};

// ── CSS auto-inyectado (la escena trae su propia hoja sin tocar el index) ──
const CSS_HREF = new URL('../../css/scene-list.css', import.meta.url).href;
function ensureStyle() {
  if (document.querySelector('link[data-scene="list"]')) return;
  const link = el('link', { rel: 'stylesheet', href: CSS_HREF, dataset: { scene: 'list' } });
  document.head.append(link);
}

/* ── Modelo: List fiel a list.js ─────────────────────────────────── */
class Node {
  constructor(data) {
    this.data = data;
    this.next = null;
  }
}
class List {
  constructor() {
    this.head = null;
    this.last = null;
    this.length = 0;
  }
  // Agrega al final — replica push() del repo.
  push(data) {
    const node = new Node(data);
    if (this.head == null) this.head = node;
    else this.last.next = node;
    this.last = node;
    this.length++;
    return node;
  }
  // Extensión: agrega al inicio manteniendo los mismos invariantes.
  prepend(data) {
    const node = new Node(data);
    if (this.head == null) this.last = node;
    node.next = this.head;
    this.head = node;
    this.length++;
    return node;
  }
  // Elimina el primer nodo con ese data — replica delete() del repo.
  delete(element) {
    let aux = this.head;
    if (aux == null) return null;
    if (aux.data == element) {
      this.head = aux.next;
      if (aux == this.last) this.last = this.head;
      this.length--;
      return aux.data;
    }
    while (aux.next != null && aux.next.data != element) aux = aux.next;
    if (aux.next == null) return null;
    const removed = aux.next;
    aux.next = aux.next.next;
    if (removed == this.last) this.last = aux;
    this.length--;
    return removed.data;
  }
  toArray() {
    const out = [];
    let aux = this.head;
    while (aux != null) {
      out.push(aux);
      aux = aux.next;
    }
    return out;
  }
}

const CAR_COLORS = [
  ['#a78bfa', '#7c3aed'],
  ['#22d3ee', '#0891b2'],
  ['#34d399', '#059669'],
  ['#fbbf24', '#d97706'],
  ['#fb7185', '#e11d48'],
  ['#60a5fa', '#2563eb'],
];

export default function mountList(host, meta) {
  ensureStyle();

  const S = STRINGS[getLang()] || STRINGS.en;

  const list = new List();
  let counter = 0;
  let busy = false;
  const colorByNode = new Map(); // nodo -> índice de color (identidad estable)

  // ── DOM base ────────────────────────────────────────────────────
  const rail = el('div', { class: 'll-rail' });
  const train = el('div', { class: 'll-train' });
  const loco = el(
    'div',
    { class: 'll-loco', title: S.locoTitle },
    el('span', { class: 'll-loco-face' }, '🚂'),
    el('span', { class: 'll-loco-smoke' }),
  );
  train.append(loco, rail);

  const canvas = el('div', { class: 'stage-canvas ll-stage' }, train);
  const narrator = el('div', { class: 'narrator' }, S.narratorStart);
  canvas.append(narrator);

  const headMark = el(
    'div',
    { class: 'll-legend ll-legend-head' },
    el('b', {}, S.legendHead),
    el('small', {}, S.legendHeadSub),
  );
  const lastMark = el(
    'div',
    { class: 'll-legend ll-legend-last' },
    el('b', {}, S.legendLast),
    el('small', {}, S.legendLastSub),
  );
  canvas.append(el('div', { class: 'll-legends' }, headMark, lastMark));

  function setNarration(html) {
    narrator.innerHTML = html;
  }

  // ── Render del tren: reconstruye vagones + enganches desde el modelo ──
  function render(opts = {}) {
    const { fallNode = null, fallSide = 'tail' } = opts;
    clear(rail);
    const nodes = list.toArray();
    nodes.forEach((node, i) => {
      const ci = colorByNode.get(node) ?? 0;
      const [c1, c2] = CAR_COLORS[ci % CAR_COLORS.length];
      const isHead = i === 0;
      const isLast = node === list.last;

      const car = el(
        'div',
        {
          class: 'll-car' + (isHead ? ' is-head' : '') + (isLast ? ' is-last' : ''),
          style: { background: `linear-gradient(160deg, ${c1}, ${c2})` },
        },
        isHead ? el('span', { class: 'll-flag ll-flag-head' }, S.flagHead) : null,
        isLast ? el('span', { class: 'll-flag ll-flag-last' }, S.flagLast) : null,
        el('span', { class: 'll-car-val' }, String(node.data)),
        el('span', { class: 'll-car-wheels' }, el('i', {}), el('i', {})),
      );
      if (node === fallNode) car.classList.add('ll-fall');

      // Enganche / cadena que representa node.next (flechita →) salvo en la cola.
      const link = el(
        'div',
        { class: 'll-link' + (isLast ? ' is-null' : '') },
        el('span', { class: 'll-link-chain' }),
        el('span', { class: 'll-link-arrow' }, isLast ? '∅' : '→'),
        el('span', { class: 'll-link-label' }, isLast ? S.nextNull : S.next),
      );

      rail.append(car, link);
    });

    if (nodes.length === 0) {
      rail.append(el('div', { class: 'll-empty' }, S.emptyRail));
    }

    // Anima el último enganche recién creado.
    if (fallNode && fallSide === 'tail') {
      const links = rail.querySelectorAll('.ll-link');
      const prevLink = links[links.length - 2]; // enganche del penúltimo vagón
      if (prevLink) {
        prevLink.classList.add('ll-link-join');
        prevLink.addEventListener('animationend', () => prevLink.classList.remove('ll-link-join'), {
          once: true,
        });
      }
    }
    if (fallNode && fallSide === 'head') {
      const firstLink = rail.querySelector('.ll-link');
      if (firstLink) {
        firstLink.classList.add('ll-link-join');
        firstLink.addEventListener(
          'animationend',
          () => firstLink.classList.remove('ll-link-join'),
          { once: true },
        );
      }
    }
  }

  function syncStats() {
    statLen.textContent = String(list.length);
    statHead.textContent = list.head ? String(list.head.data) : S.nullTag;
    statLast.textContent = list.last ? String(list.last.data) : S.nullTag;
    statHead.style.color = list.head ? 'var(--cyan)' : 'var(--ink-faint)';
    statLast.style.color = list.last ? 'var(--green)' : 'var(--ink-faint)';

    const empty = list.length === 0;
    pushBtn.disabled = busy;
    prependBtn.disabled = busy;
    popBtn.disabled = busy || empty;
    shiftBtn.disabled = busy || empty;
    clearBtn.disabled = busy || empty;
  }

  // ── Operaciones interactivas ────────────────────────────────────
  async function doPush() {
    if (busy) return;
    busy = true;
    counter += 1;
    const node = list.push(counter);
    colorByNode.set(node, counter - 1);
    setNarration(list.length === 1 ? S.pushFirst(counter) : S.pushMore(counter));
    render({ fallNode: node, fallSide: 'tail' });
    syncStats();
    await wait(640);
    busy = false;
    syncStats();
  }

  async function doPrepend() {
    if (busy) return;
    busy = true;
    counter += 1;
    const node = list.prepend(counter);
    colorByNode.set(node, counter - 1);
    setNarration(list.length === 1 ? S.prependFirst(counter) : S.prependMore(counter));
    render({ fallNode: node, fallSide: 'head' });
    syncStats();
    await wait(640);
    busy = false;
    syncStats();
  }

  // pop(): borra la COLA (last). delete() del repo recorre por next y reajusta last.
  async function doPop() {
    if (busy || list.length === 0) return;
    busy = true;
    const target = list.last;
    const cars = rail.querySelectorAll('.ll-car');
    const lastCar = cars[cars.length - 1];
    const lastLink = rail.querySelectorAll('.ll-link')[cars.length - 1];
    setNarration(S.popMsg(target.data));
    if (lastLink) lastLink.classList.add('ll-link-break');
    if (lastCar) lastCar.classList.add('ll-leave');
    await wait(520);
    list.delete(target.data);
    colorByNode.delete(target);
    render();
    syncStats();
    busy = false;
    syncStats();
    if (list.length === 0) setNarration(S.emptyAgain);
  }

  // shift(): borra el HEAD. delete() del repo: head = aux.next, reajusta last si quedaba uno.
  async function doShift() {
    if (busy || list.length === 0) return;
    busy = true;
    const target = list.head;
    const firstCar = rail.querySelector('.ll-car');
    const firstLink = rail.querySelector('.ll-link');
    setNarration(S.shiftMsg(target.data));
    if (firstLink) firstLink.classList.add('ll-link-break');
    if (firstCar) firstCar.classList.add('ll-leave-front');
    await wait(520);
    list.delete(target.data);
    colorByNode.delete(target);
    render();
    syncStats();
    busy = false;
    syncStats();
    if (list.length === 0) setNarration(S.emptyAgain);
  }

  async function doClear() {
    if (busy) return;
    busy = true;
    // Desengancha de a uno, desde el final, usando delete() real.
    while (list.last) {
      list.delete(list.last.data);
    }
    colorByNode.clear();
    render();
    setNarration(S.cleared);
    syncStats();
    busy = false;
    syncStats();
  }

  // ── Controles (interactivos, estilo stack.js) ───────────────────
  const pushBtn = el('button', { class: 'tbtn primary' }, S.btnPush);
  const prependBtn = el('button', { class: 'tbtn' }, S.btnPrepend);
  const shiftBtn = el('button', { class: 'tbtn' }, S.btnShift);
  const popBtn = el('button', { class: 'tbtn' }, S.btnPop);
  const clearBtn = el('button', { class: 'tbtn' }, S.btnClear);
  pushBtn.addEventListener('click', doPush);
  prependBtn.addEventListener('click', doPrepend);
  shiftBtn.addEventListener('click', doShift);
  popBtn.addEventListener('click', doPop);
  clearBtn.addEventListener('click', doClear);

  const bar = el(
    'div',
    { class: 'transport' },
    pushBtn,
    prependBtn,
    el('span', { class: 'spacer' }),
    shiftBtn,
    popBtn,
    clearBtn,
  );

  // ── Info cards (length / head / last en vivo) ───────────────────
  const statLen = el('span', { class: 'big' }, '0');
  const statHead = el('span', { class: 'big', style: { color: 'var(--ink-faint)' } }, 'null');
  const statLast = el('span', { class: 'big', style: { color: 'var(--ink-faint)' } }, 'null');

  const stage = el('div', { class: 'stage' }, canvas, bar);
  const aside = el(
    'div',
    { class: 'scene-aside' },
    infoCard('length', statLen, S.cardLengthSub),
    infoCard('head', statHead, S.cardHeadSub),
    infoCard('last', statLast, S.cardLastSub),
  );

  clear(host);
  host.append(stage, aside);

  // ── Arranque con 4 vagones precargados ──────────────────────────
  for (const v of [3, 7, 9, 5]) {
    counter += 1;
    const node = list.push(v);
    colorByNode.set(node, counter - 1);
  }
  render();
  syncStats();

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
