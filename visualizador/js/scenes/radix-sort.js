// Escena: LSD Radix Sort — "Clasificando el correo, dígito por dígito".
//
// Trace FIEL al LSD Radix Sort (base 10, estable):
//   for d in [ones, tens, hundreds]:
//     buckets = Array.from({length:10}, () => [])
//     for item of list: buckets[digit(item, d)].push(item)   // distribución estable
//     list = [].concat(...buckets)                            // recolección 0..9
//
// Metáfora: cada número es una carta en una fila. En cada pasada miramos UN
// dígito (unidades → decenas → centenas, resaltado en la carta) y dejamos caer
// cada carta en el casillero 0..9 de ese dígito (estable: respeta el orden de
// llegada). Luego recolectamos los casilleros de izquierda a derecha y rearmamos
// la fila. Repetimos con el siguiente dígito hasta el más significativo.

import { el, clear } from '../dom.js';
import { Player, buildTransport } from '../player.js';
import { getLang } from '../i18n.js';

const INPUT = [170, 45, 75, 90, 802, 24, 2, 66];
const MAX_DIGITS = 3; // el máximo (802) tiene 3 dígitos

// ── Strings bilingües (inglés por defecto, español opcional) ──────────
const STRINGS = {
  en: {
    ready: 'Ready to play.',
    reset: 'Ready to play. The mail gets sorted one digit at a time.',
    digitNames: ['ones', 'tens', 'hundreds'],
    pass: (digitName, place) =>
      `Pass ${place}: looking at the <b>${digitName}</b> digit of every piece of mail.`,
    bucket: (value, digit, digitName) =>
      `<span class="mono">${value}</span> → its ${digitName} digit is <span class="mono">${digit}</span>. Into bin <span class="mono">${digit}</span> it goes.`,
    gather: (digitName) =>
      `Gathering bins 0…9 left to right, the row is rebuilt — now stable by the ${digitName} digit.`,
    done: (out) =>
      `Every digit processed. The mail is sorted → <span class="mono">[${out}]</span> ✨`,
    queueLabel: 'MAIL ROW',
    binsLabel: 'BINS 0…9',
    cardComplexityTitle: 'Complexity',
    cardComplexitySub: 'd · (n + b)',
    cardStableTitle: 'Stability',
    cardStableSub: 'order-preserving',
    cardInputTitle: 'Input',
    cardInputSub: (n) => `${n} pieces`,
    cardPassesTitle: 'Passes',
    cardPassesSub: 'ones · tens · hundreds',
  },
  es: {
    ready: 'Listo para reproducir.',
    reset: 'Listo para reproducir. El correo se ordena un dígito a la vez.',
    digitNames: ['unidades', 'decenas', 'centenas'],
    pass: (digitName, place) =>
      `Pasada ${place}: miramos el dígito de las <b>${digitName}</b> de cada carta.`,
    bucket: (value, digit, digitName) =>
      `<span class="mono">${value}</span> → su dígito de ${digitName} es <span class="mono">${digit}</span>. Cae en el casillero <span class="mono">${digit}</span>.`,
    gather: (digitName) =>
      `Recolectando los casilleros 0…9 de izquierda a derecha, se rearma la fila — ya estable por el dígito de ${digitName}.`,
    done: (out) =>
      `Todos los dígitos procesados. El correo quedó ordenado → <span class="mono">[${out}]</span> ✨`,
    queueLabel: 'FILA DE CORREO',
    binsLabel: 'CASILLEROS 0…9',
    cardComplexityTitle: 'Complejidad',
    cardComplexitySub: 'd · (n + b)',
    cardStableTitle: 'Estabilidad',
    cardStableSub: 'conserva el orden',
    cardInputTitle: 'Entrada',
    cardInputSub: (n) => `${n} cartas`,
    cardPassesTitle: 'Pasadas',
    cardPassesSub: 'unidades · decenas · centenas',
  },
};

// CSS propio de la escena, autoinyectado una sola vez (no editamos index.html).
const CSS_HREF = './css/scene-radix-sort.css';
if (!document.querySelector(`link[data-scene="radix-sort"]`)) {
  document.head.append(
    el('link', { rel: 'stylesheet', href: CSS_HREF, dataset: { scene: 'radix-sort' } }),
  );
}

const digitAt = (value, place) => Math.floor(value / Math.pow(10, place)) % 10;

/**
 * Construye los pasos corriendo el LSD radix sort real. Cada pasada genera:
 *   · pass(place)        — empieza a mirar un dígito
 *   · bucket(item,digit) — una carta cae en su casillero (estable)
 *   · gather(place)      — recolecta casilleros 0..9 y rearma la fila
 * Termina con done. El estado final está garantizado ordenado.
 */
function buildTrace(input) {
  let list = input.slice();
  const steps = [];
  for (let place = 0; place < MAX_DIGITS; place++) {
    steps.push({ type: 'pass', place });
    const buckets = Array.from({ length: 10 }, () => []);
    list.forEach((value, fromIndex) => {
      const digit = digitAt(value, place);
      buckets[digit].push(value);
      steps.push({
        type: 'bucket',
        value,
        digit,
        place,
        fromIndex,
        binSlot: buckets[digit].length - 1,
      });
    });
    list = [].concat(...buckets);
    steps.push({ type: 'gather', place, order: list.slice() });
  }
  steps.push({ type: 'done', result: list.slice() });
  return steps;
}

export default function mountRadixSort(host, meta) {
  const S = STRINGS[getLang()] || STRINGS.en;

  // ── La fila de correo (cada carta es un número de 3 dígitos) ────────
  function makeCard(value) {
    const padded = String(value).padStart(MAX_DIGITS, '0');
    const digitSpans = padded
      .split('')
      .map((ch, i) =>
        el('span', { class: 'rx-digit', dataset: { pos: String(MAX_DIGITS - 1 - i) } }, ch),
      );
    const card = el(
      'div',
      { class: 'rx-card' },
      el('span', { class: 'rx-card-icon' }, '✉️'),
      el('span', { class: 'rx-card-num mono' }, ...digitSpans),
    );
    card._value = value;
    card._digits = digitSpans;
    return card;
  }

  const row = el('div', { class: 'rx-row' });
  const rowWrap = el(
    'div',
    { class: 'rx-row-wrap' },
    el('span', { class: 'rx-zone-label' }, S.queueLabel),
    row,
  );

  // ── Los 10 casilleros 0..9 ──────────────────────────────────────────
  const binBodies = [];
  const bins = Array.from({ length: 10 }, (_, d) => {
    const body = el('div', { class: 'rx-bin-body' });
    binBodies.push(body);
    return el(
      'div',
      { class: 'rx-bin' },
      el('span', { class: 'rx-bin-label mono' }, String(d)),
      body,
    );
  });
  const binsLane = el('div', { class: 'rx-bins' }, ...bins);
  const binsWrap = el(
    'div',
    { class: 'rx-bins-wrap' },
    el('span', { class: 'rx-zone-label rx-zone-accent' }, S.binsLabel),
    binsLane,
  );

  // ── Lienzo ──────────────────────────────────────────────────────────
  const narrator = el('div', { class: 'narrator' }, S.ready);
  const canvas = el('div', { class: 'stage-canvas rx-stage' }, rowWrap, binsWrap, narrator);

  // ── Helpers de render ───────────────────────────────────────────────
  function setNarration(html) {
    narrator.innerHTML = html;
  }

  function clearMarks() {
    canvas.querySelectorAll('.rx-card').forEach((c) => {
      c.classList.remove('rx-active', 'rx-binned');
      c._digits.forEach((d) => d.classList.remove('rx-digit-on'));
    });
    bins.forEach((b) => b.classList.remove('rx-bin-hot'));
  }

  // Resalta el dígito en la posición `place` de TODAS las cartas.
  function highlightPlace(place) {
    canvas.querySelectorAll('.rx-card').forEach((c) => {
      c._digits.forEach((d) => d.classList.toggle('rx-digit-on', Number(d.dataset.pos) === place));
    });
  }

  function clearBins() {
    binBodies.forEach((b) => clear(b));
  }

  // Render de la fila a partir de un orden de valores (rearma desde cero).
  function renderRow(order) {
    clear(row);
    order.forEach((v) => row.append(makeCard(v)));
  }

  let currentPlace = 0;

  function resetVisual() {
    clearBins();
    renderRow(INPUT);
    clearMarks();
    setNarration(S.reset);
  }

  function apply(step, ctx) {
    const animate = ctx && ctx.animate;

    if (step.type === 'pass') {
      clearMarks();
      clearBins();
      currentPlace = step.place;
      highlightPlace(step.place);
      return S.pass(S.digitNames[step.place], step.place + 1);
    }

    if (step.type === 'bucket') {
      clearMarks();
      highlightPlace(step.place);
      // localiza la carta de origen en la fila por su posición de partida
      const cards = row.querySelectorAll('.rx-card');
      const src = cards[step.fromIndex];
      if (src) {
        src.classList.add('rx-active');
        src._digits.forEach((d) =>
          d.classList.toggle('rx-digit-on', Number(d.dataset.pos) === step.place),
        );
      }
      // suelta una copia de la carta en el casillero correspondiente
      bins[step.digit].classList.add('rx-bin-hot');
      const dropped = makeCard(step.value);
      dropped.classList.add('rx-binned');
      dropped._digits.forEach((d) =>
        d.classList.toggle('rx-digit-on', Number(d.dataset.pos) === step.place),
      );
      if (animate) dropped.classList.add('rx-drop');
      binBodies[step.digit].append(dropped);
      return S.bucket(step.value, step.digit, S.digitNames[step.place]);
    }

    if (step.type === 'gather') {
      clearMarks();
      highlightPlace(step.place);
      renderRow(step.order);
      highlightPlace(step.place);
      // marca las cartas recién recolectadas
      row.querySelectorAll('.rx-card').forEach((c, i) => {
        if (animate) {
          c.style.animationDelay = `${i * 40}ms`;
          c.classList.add('rx-gathered');
        }
      });
      clearBins();
      return S.gather(S.digitNames[step.place]);
    }

    // done
    clearMarks();
    clearBins();
    renderRow(step.result);
    row.querySelectorAll('.rx-card').forEach((c, i) => {
      c.style.animationDelay = `${i * 60}ms`;
      c.classList.add('rx-sorted');
    });
    return S.done(step.result.join(', '));
  }

  // ── Player + transporte ─────────────────────────────────────────────
  const player = new Player({
    steps: buildTrace(INPUT),
    apply,
    reset: resetVisual,
    baseDelay: 640,
  });
  const { bar, sync } = buildTransport(player);
  player.onChange = (s) => {
    sync(s);
    if (s.narration) setNarration(s.narration);
  };

  const stage = el('div', { class: 'stage' }, canvas, bar);
  const sorted = radixSort(INPUT);
  const aside = el(
    'div',
    { class: 'scene-aside' },
    infoCard(
      S.cardComplexityTitle,
      el('span', { class: 'big' }, 'O(d·(n+b))'),
      S.cardComplexitySub,
    ),
    infoCard(S.cardStableTitle, el('span', { class: 'big' }, 'Stable'), S.cardStableSub),
    infoCard(
      S.cardInputTitle,
      el('code', {}, `[${INPUT.join(', ')}]`),
      S.cardInputSub(INPUT.length),
    ),
    infoCard(S.cardPassesTitle, el('span', { class: 'big' }, String(MAX_DIGITS)), S.cardPassesSub),
  );

  clear(host);
  host.append(stage, aside);
  resetVisual();

  // referencia para evitar warning de variable sin uso del orden inicial
  void currentPlace;
  void sorted;

  return {
    destroy() {
      player.destroy();
    },
  };
}

// Réplica fiel del LSD radix sort real (para mostrar la salida en el aside).
function radixSort(input) {
  let list = input.slice();
  for (let place = 0; place < MAX_DIGITS; place++) {
    const buckets = Array.from({ length: 10 }, () => []);
    for (const value of list) buckets[digitAt(value, place)].push(value);
    list = [].concat(...buckets);
  }
  return list;
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
