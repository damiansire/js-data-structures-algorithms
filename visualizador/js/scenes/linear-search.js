// Escena: Linear Search — "Un detective revisando una rueda de reconocimiento".
//
// Trace FIEL al algoritmo estándar de búsqueda lineal:
//   for (let i = 0; i < a.length; i++) {
//     if (a[i] === target) return i;   // encontrado
//   }
//   return -1;                          // no encontrado
//
// La metáfora: cada sospechoso es una ficha (mugshot) con un número en una
// rueda de reconocimiento. Una lupa/foco recorre la fila de izquierda a
// derecha. Cada sospechoso revisado que NO coincide se apaga (gris). El que
// coincide se ilumina en dorado ("¡Encontrado!"). Si nadie coincide, todos
// quedan apagados y devuelve -1. No requiere array ordenado.

import { el, clear } from '../dom.js';
import { Player, buildTransport } from '../player.js';
import { getLang } from '../i18n.js';

const ARRAY = [14, 7, 22, 9, 31, 5, 18, 27]; // sin ordenar, está permitido
const TARGET = 31; // está en el array (índice 4)

// ── Strings bilingües (inglés por defecto, español opcional) ──────────
const STRINGS = {
  en: {
    ready: 'Ready to play.',
    searching: 'Looking for ',
    lineupLabel: 'POLICE LINEUP',
    check: (i, value) =>
      `Checking suspect #<span class="mono">${i}</span> → <span class="mono">${value}</span>. Does it match?`,
    miss: (value) => `<span class="mono">${value}</span> isn't the one. The detective moves on. 🔦`,
    found: (i, value) =>
      `Match! Suspect #<span class="mono">${i}</span> is <span class="mono">${value}</span>. Returns index <span class="mono">${i}</span>. 🏅`,
    notfound: () =>
      `Nobody in the lineup matches. The detective leaves. Returns <span class="mono">-1</span>.`,
    cxTitle: 'Complexity',
    cxSub: 'checks one by one',
    preTitle: 'Precondition',
    preBig: 'none',
    preSub: 'works on any order',
    targetTitle: 'Target',
    targetSub: (list) => `in [${list}]`,
  },
  es: {
    ready: 'Listo para reproducir.',
    searching: 'Buscando ',
    lineupLabel: 'RUEDA DE RECONOCIMIENTO',
    check: (i, value) =>
      `Reviso al sospechoso #<span class="mono">${i}</span> → <span class="mono">${value}</span>. ¿Coincide?`,
    miss: (value) => `<span class="mono">${value}</span> no es. El detective sigue de largo. 🔦`,
    found: (i, value) =>
      `¡Coincide! El sospechoso #<span class="mono">${i}</span> es <span class="mono">${value}</span>. Devuelve el índice <span class="mono">${i}</span>. 🏅`,
    notfound: () =>
      `Nadie en la rueda coincide. El detective se va. Devuelve <span class="mono">-1</span>.`,
    cxTitle: 'Complejidad',
    cxSub: 'revisa uno por uno',
    preTitle: 'Precondición',
    preBig: 'ninguna',
    preSub: 'funciona en cualquier orden',
    targetTitle: 'Objetivo',
    targetSub: (list) => `en [${list}]`,
  },
};

// CSS propio de la escena, autoinyectado una sola vez (no editamos index.html).
const CSS_HREF = './css/scene-linear-search.css';
if (!document.querySelector(`link[data-scene="linear-search"]`)) {
  document.head.append(
    el('link', { rel: 'stylesheet', href: CSS_HREF, dataset: { scene: 'linear-search' } }),
  );
}

/**
 * Construye los pasos ejecutando el algoritmo real de búsqueda lineal.
 * Un paso `check` por cada sospechoso comparado; termina en `found` o
 * `notfound`, replicando el `return i` / `return -1`.
 */
function buildTrace(arr, target) {
  const steps = [];
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === target) {
      steps.push({ type: 'check', index: i, value: arr[i], match: true });
      steps.push({ type: 'found', index: i, value: arr[i] });
      return steps;
    }
    steps.push({ type: 'check', index: i, value: arr[i], match: false });
  }
  steps.push({ type: 'notfound' });
  return steps;
}

export default function mountLinearSearch(host, meta) {
  const S = STRINGS[getLang()] || STRINGS.en;

  // ── Rueda de reconocimiento: una ficha por sospechoso ───────────────
  const cards = ARRAY.map((v, i) => {
    const card = el(
      'div',
      { class: 'lse-card', dataset: { idx: String(i) } },
      el('div', { class: 'lse-mug' }, '🧑'),
      el('div', { class: 'lse-num mono' }, String(v)),
      el('div', { class: 'lse-tag mono' }, '#' + i),
      el('div', { class: 'lse-lens' }, '🔍'),
    );
    return card;
  });
  const lineup = el('div', { class: 'lse-lineup' }, ...cards);
  const lineupWrap = el(
    'div',
    { class: 'lse-lineup-wrap' },
    el('span', { class: 'lse-zone-label' }, S.lineupLabel),
    lineup,
  );

  const target = el(
    'div',
    { class: 'lse-target' },
    el('span', { class: 'lse-target-icon' }, '🕵️'),
    S.searching,
    el('span', { class: 'mono lse-target-val' }, String(TARGET)),
  );

  const narrator = el('div', { class: 'narrator' }, S.ready);
  const canvas = el('div', { class: 'stage-canvas lse-stage' }, target, lineupWrap, narrator);

  function setNarration(html) {
    narrator.innerHTML = html;
  }

  function resetVisual() {
    cards.forEach((c) =>
      c.classList.remove('lse-checking', 'lse-cleared', 'lse-found', 'lse-fail'),
    );
    setNarration(S.ready);
  }

  function clearChecking() {
    cards.forEach((c) => c.classList.remove('lse-checking'));
  }

  function apply(step) {
    switch (step.type) {
      case 'check': {
        clearChecking();
        cards[step.index].classList.add('lse-checking');
        if (step.match) return S.check(step.index, step.value);
        // los anteriores ya revisados quedan descartados (gris)
        cards[step.index].classList.add('lse-cleared');
        return S.miss(step.value);
      }
      case 'found': {
        clearChecking();
        const c = cards[step.index];
        c.classList.remove('lse-cleared');
        c.classList.add('lse-found');
        return S.found(step.index, step.value);
      }
      case 'notfound': {
        clearChecking();
        cards.forEach((c) => {
          c.classList.remove('lse-found');
          c.classList.add('lse-fail', 'lse-cleared');
        });
        return S.notfound();
      }
    }
  }

  const player = new Player({
    steps: buildTrace(ARRAY, TARGET),
    apply,
    reset: resetVisual,
    baseDelay: 820,
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
    infoCard(S.cxTitle, el('span', { class: 'big' }, 'O(n)'), S.cxSub),
    infoCard(S.preTitle, el('span', { class: 'big' }, S.preBig), S.preSub),
    infoCard(S.targetTitle, el('code', {}, String(TARGET)), S.targetSub(ARRAY.join(', '))),
  );

  clear(host);
  host.append(stage, aside);
  resetVisual();

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
