// Escena: Interpolation Search — "Adivinar la página de un nombre en la guía".
//
// Trace FIEL al algoritmo estándar (array ORDENADO y ~uniforme):
//   lo = 0; hi = n - 1
//   while lo <= hi and target >= a[lo] and target <= a[hi]:
//     pos = lo + floor( ((target - a[lo]) * (hi - lo)) / (a[hi] - a[lo]) )
//     if a[pos] === target  → encontrado
//     if a[pos] <  target   → lo = pos + 1   (descarta lo..pos)
//     else                  → hi = pos - 1   (descarta pos..hi)
//
// Visual: el array es una hilera de "páginas" de la guía telefónica. En vez de
// abrir SIEMPRE el medio (binary), el dedo ESTIMA dónde caería el valor de
// forma proporcional a su posición dentro de [a[lo], a[hi]] y salta cerca. La
// ventana [lo, hi] se va angostando; la sonda (probe) aterriza junto al
// objetivo (dorado al encontrarlo). Mostramos la fracción interpolada y el dedo
// apuntando a la página estimada.

import { el, clear } from '../dom.js';
import { Player, buildTransport } from '../player.js';
import { getLang } from '../i18n.js';

const ARRAY = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120];
const N = ARRAY.length; // 12
const TARGET = 90; // está en el array (índice 8)

// ── Strings bilingües (inglés por defecto, español opcional) ──────────
const STRINGS = {
  en: {
    ready: 'Ready to play.',
    looking: 'Looking up ',
    bookLabel: 'PHONE BOOK · sorted pages',
    windowLabel: (lo, hi) => `Window: pages <span class="mono">${lo}…${hi}</span>`,
    estimate: (lo, hi, pos, frac) =>
      `Estimate: the value sits about <span class="mono">${frac}</span> into the window <span class="mono">[${lo}…${hi}]</span> → thumb lands on page <span class="mono">${pos}</span> 👍`,
    probe: (pos, value) =>
      `Open page <span class="mono">${pos}</span> → <span class="mono">${value}</span>`,
    narrowRight: (value) =>
      `<span class="mono">${value}</span> is too small → skip ahead, drop the <b>left</b> pages.`,
    narrowLeft: (value) =>
      `<span class="mono">${value}</span> is too big → flip back, drop the <b>right</b> pages.`,
    found: (pos) => `Found it on page <span class="mono">${pos}</span>! 🏆`,
    notfound: () => `Not in the book. Returns <span class="mono">-1</span>.`,
    done: 'Done — fewer flips than always guessing the middle. ✨',
    cxTitle: 'Complexity',
    cxBig: 'O(log log n)',
    cxSub: 'uniform data · worst O(n)',
    preTitle: 'Precondition',
    preBig: 'sorted + uniform',
    preSub: 'needs an ascending, evenly spread array',
    targetTitle: 'Target',
    targetSub: (list) => `in [${list}]`,
    formulaTitle: 'Probe formula',
    formulaSub: 'estimate by proportion, not the middle',
  },
  es: {
    ready: 'Listo para reproducir.',
    looking: 'Buscando ',
    bookLabel: 'GUÍA TELEFÓNICA · páginas ordenadas',
    windowLabel: (lo, hi) => `Ventana: páginas <span class="mono">${lo}…${hi}</span>`,
    estimate: (lo, hi, pos, frac) =>
      `Estimación: el valor está a ~<span class="mono">${frac}</span> dentro de la ventana <span class="mono">[${lo}…${hi}]</span> → el dedo cae en la página <span class="mono">${pos}</span> 👍`,
    probe: (pos, value) =>
      `Abro la página <span class="mono">${pos}</span> → <span class="mono">${value}</span>`,
    narrowRight: (value) =>
      `<span class="mono">${value}</span> es muy chico → salto adelante, descarto las páginas de la <b>izquierda</b>.`,
    narrowLeft: (value) =>
      `<span class="mono">${value}</span> es muy grande → vuelvo atrás, descarto las páginas de la <b>derecha</b>.`,
    found: (pos) => `¡La encontré en la página <span class="mono">${pos}</span>! 🏆`,
    notfound: () => `No está en la guía. Devuelve <span class="mono">-1</span>.`,
    done: 'Listo — menos vueltas que adivinar siempre el medio. ✨',
    cxTitle: 'Complejidad',
    cxBig: 'O(log log n)',
    cxSub: 'datos uniformes · peor O(n)',
    preTitle: 'Precondición',
    preBig: 'ordenado + uniforme',
    preSub: 'requiere array ascendente y bien repartido',
    targetTitle: 'Objetivo',
    targetSub: (list) => `en [${list}]`,
    formulaTitle: 'Fórmula de sonda',
    formulaSub: 'estima por proporción, no por el medio',
  },
};

// CSS propio de la escena, autoinyectado una sola vez (no editamos index.html).
const CSS_HREF = './css/scene-interpolation-search.css';
if (!document.querySelector(`link[data-scene="interpolation-search"]`)) {
  document.head.append(
    el('link', {
      rel: 'stylesheet',
      href: CSS_HREF,
      dataset: { scene: 'interpolation-search' },
    }),
  );
}

/**
 * Construye los pasos ejecutando el algoritmo REAL de interpolation search.
 * Cada iteración produce: estimate → probe → (found | narrow). Al cerrar el
 * bucle, found o notfound, y por último done.
 */
function buildTrace(arr, target) {
  const steps = [];
  let lo = 0;
  let hi = arr.length - 1;

  steps.push({ type: 'window', lo, hi });

  while (lo <= hi && target >= arr[lo] && target <= arr[hi]) {
    const denom = arr[hi] - arr[lo];
    // estima la posición proporcional (idéntico al algoritmo estándar)
    const fraction = denom === 0 ? 0 : (target - arr[lo]) / denom;
    const pos = denom === 0 ? lo : lo + Math.floor(((target - arr[lo]) * (hi - lo)) / denom);

    steps.push({
      type: 'estimate',
      lo,
      hi,
      pos,
      frac: denom === 0 ? '0' : fraction.toFixed(2),
    });
    steps.push({ type: 'probe', pos, value: arr[pos] });

    if (arr[pos] === target) {
      steps.push({ type: 'found', pos });
      steps.push({ type: 'done' });
      return steps;
    }
    if (arr[pos] < target) {
      steps.push({ type: 'narrow', side: 'right', from: lo, to: pos, value: arr[pos] });
      lo = pos + 1;
    } else {
      steps.push({ type: 'narrow', side: 'left', from: pos, to: hi, value: arr[pos] });
      hi = pos - 1;
    }
    steps.push({ type: 'window', lo, hi });
  }

  steps.push({ type: 'notfound' });
  steps.push({ type: 'done' });
  return steps;
}

const centerPct = (k) => ((k + 0.5) / N) * 100;

export default function mountInterpolationSearch(host, meta) {
  const S = STRINGS[getLang()] || STRINGS.en;

  // ── La hilera de páginas (el array ordenado) ─────────────────────────
  const pages = ARRAY.map((v, i) =>
    el(
      'div',
      { class: 'intp-page', dataset: { idx: String(i) } },
      el('span', { class: 'intp-page-val mono' }, String(v)),
      el('span', { class: 'intp-page-idx mono' }, '#' + i),
    ),
  );
  const rail = el('div', { class: 'intp-rail' }, ...pages);

  // El dedo / pulgar que estima la página y la sonda visual.
  const thumb = el('div', { class: 'intp-thumb' }, '👍');
  const thumbWrap = el('div', { class: 'intp-thumb-wrap' }, thumb);

  // Etiqueta de la fracción interpolada que flota sobre la página estimada.
  const fracTag = el('div', { class: 'intp-frac mono' }, '');

  const book = el(
    'div',
    { class: 'intp-book' },
    el('span', { class: 'intp-book-label' }, S.bookLabel),
    el('div', { class: 'intp-rail-wrap' }, thumbWrap, fracTag, rail),
  );

  const target = el(
    'div',
    { class: 'intp-target' },
    S.looking,
    el('span', { class: 'mono' }, String(TARGET)),
  );

  const narrator = el('div', { class: 'narrator' }, S.ready);
  const canvas = el('div', { class: 'stage-canvas intp-stage' }, target, book, narrator);

  // ── Helpers de render ────────────────────────────────────────────────
  function setNarration(html) {
    narrator.innerHTML = html;
  }

  function clearProbe() {
    pages.forEach((p) => p.classList.remove('intp-probing', 'intp-estimating'));
    thumbWrap.classList.remove('intp-thumb-on');
    fracTag.classList.remove('intp-frac-on');
  }

  function markWindow(lo, hi) {
    pages.forEach((p, i) => {
      const inside = i >= lo && i <= hi && !p.classList.contains('intp-dropped');
      p.classList.toggle('intp-in-window', inside);
    });
  }

  function positionThumb(pos) {
    const pct = centerPct(pos);
    thumbWrap.style.left = pct + '%';
    fracTag.style.left = pct + '%';
  }

  function resetVisual() {
    pages.forEach((p) =>
      p.classList.remove(
        'intp-in-window',
        'intp-probing',
        'intp-estimating',
        'intp-dropped',
        'intp-found',
        'intp-fail',
      ),
    );
    clearProbe();
    fracTag.textContent = '';
    fracTag.classList.remove('intp-frac-on');
    thumbWrap.classList.remove('intp-thumb-on');
    setNarration(S.ready);
  }

  function apply(step) {
    switch (step.type) {
      case 'window':
        markWindow(step.lo, step.hi);
        pages.forEach((p) => p.classList.remove('intp-probing', 'intp-estimating'));
        if (step.lo > step.hi) return S.windowLabel(step.lo, step.hi);
        return S.windowLabel(step.lo, step.hi);

      case 'estimate': {
        pages.forEach((p) => p.classList.remove('intp-estimating', 'intp-probing'));
        positionThumb(step.pos);
        thumbWrap.classList.add('intp-thumb-on');
        fracTag.textContent = step.frac;
        fracTag.classList.add('intp-frac-on');
        pages[step.pos].classList.add('intp-estimating');
        return S.estimate(step.lo, step.hi, step.pos, step.frac);
      }

      case 'probe': {
        pages.forEach((p) => p.classList.remove('intp-estimating'));
        positionThumb(step.pos);
        pages[step.pos].classList.add('intp-probing');
        return S.probe(step.pos, step.value);
      }

      case 'narrow': {
        for (let k = step.from; k <= step.to; k++) {
          pages[k].classList.remove('intp-in-window', 'intp-probing', 'intp-estimating');
          pages[k].classList.add('intp-dropped');
        }
        return step.side === 'right' ? S.narrowRight(step.value) : S.narrowLeft(step.value);
      }

      case 'found':
        clearProbe();
        positionThumb(step.pos);
        thumbWrap.classList.add('intp-thumb-on');
        pages[step.pos].classList.remove('intp-probing');
        pages[step.pos].classList.add('intp-found');
        return S.found(step.pos);

      case 'notfound':
        pages.forEach((p) => p.classList.add('intp-fail'));
        return S.notfound();

      case 'done':
        return S.done;
    }
  }

  const player = new Player({
    steps: buildTrace(ARRAY, TARGET),
    apply,
    reset: resetVisual,
    baseDelay: 920,
  });

  const { bar, sync } = buildTransport(player);
  player.onChange = (state) => {
    sync(state);
    if (state.narration) setNarration(state.narration);
  };

  const stage = el('div', { class: 'stage' }, canvas, bar);
  const aside = el(
    'div',
    { class: 'scene-aside' },
    infoCard(S.cxTitle, el('span', { class: 'big' }, S.cxBig), S.cxSub),
    infoCard(S.preTitle, el('span', { class: 'big' }, S.preBig), S.preSub),
    infoCard(
      S.formulaTitle,
      el('code', {}, 'lo + ⌊(t−a[lo])·(hi−lo) / (a[hi]−a[lo])⌋'),
      S.formulaSub,
    ),
    infoCard(S.targetTitle, el('code', {}, String(TARGET)), S.targetSub(ARRAY.join(', '))),
  );

  clear(host);
  host.append(stage, aside);

  return { destroy: () => player.destroy() };
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
