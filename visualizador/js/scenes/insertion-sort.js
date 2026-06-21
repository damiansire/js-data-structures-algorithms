// Escena: Insertion Sort — "Ordenando una mano de cartas".
//
// Trace FIEL al algoritmo estándar de inserción:
//   for (let i = 1; i < n; i++) {
//     const key = a[i];
//     let j = i - 1;
//     while (j >= 0 && a[j] > key) { a[j + 1] = a[j]; j--; }
//     a[j + 1] = key;
//   }
//
// Visual: cada valor es una carta en una fila. La parte izquierda ya está
// ordenada (verde). En cada ronda se LEVANTA la carta actual (key) fuera de la
// fila; las cartas ordenadas mayores se DESPLAZAN a la derecha abriendo un hueco
// y la carta DESCIENDE a su ranura correcta. Se resaltan la carta levantada, las
// comparaciones y la región ordenada que crece hacia la derecha.

import { el, clear } from '../dom.js';
import { Player, buildTransport } from '../player.js';
import { getLang } from '../i18n.js';

const VALUES = [5, 2, 8, 1, 9, 3, 7, 4];
const N = VALUES.length;
const MAXV = Math.max(...VALUES);

// ── Strings bilingües (inglés por defecto, español opcional) ──────────
const STRINGS = {
  en: {
    ready: 'Ready to play.',
    reset: 'Ready to play. We sort a hand of playing cards, left to right.',
    pick: (value, i) =>
      `Round <span class="mono">${i}</span>: I lift the card <span class="mono">${value}</span> out of the row 🃏`,
    compare: (sorted, key) =>
      `Is the sorted card <span class="mono">${sorted}</span> bigger than <span class="mono">${key}</span>?`,
    shift: (sorted) => `Yes → <span class="mono">${sorted}</span> slides right to open a gap.`,
    place: (value) =>
      `No (or edge) → the card <span class="mono">${value}</span> drops into its slot ✔`,
    done: 'Hand sorted from lowest to highest! ✨',
    sortedLabel: 'SORTED',
    handLabel: 'HAND',
    cardTimeTitle: 'Average',
    cardTimeSub: 'worst case O(n²)',
    cardStableTitle: 'Property',
    cardStableSub: 'stable · in-place',
    cardInputTitle: 'Input',
    cardInputSub: 'cards in hand',
  },
  es: {
    ready: 'Listo para reproducir.',
    reset: 'Listo para reproducir. Ordenamos una mano de cartas, de izquierda a derecha.',
    pick: (value, i) =>
      `Ronda <span class="mono">${i}</span>: levanto la carta <span class="mono">${value}</span> fuera de la fila 🃏`,
    compare: (sorted, key) =>
      `¿La carta ordenada <span class="mono">${sorted}</span> es mayor que <span class="mono">${key}</span>?`,
    shift: (sorted) =>
      `Sí → <span class="mono">${sorted}</span> se desliza a la derecha para abrir un hueco.`,
    place: (value) =>
      `No (o borde) → la carta <span class="mono">${value}</span> cae en su ranura ✔`,
    done: '¡Mano ordenada de menor a mayor! ✨',
    sortedLabel: 'ORDENADAS',
    handLabel: 'MANO',
    cardTimeTitle: 'Promedio',
    cardTimeSub: 'peor caso O(n²)',
    cardStableTitle: 'Propiedad',
    cardStableSub: 'estable · in-place',
    cardInputTitle: 'Entrada',
    cardInputSub: 'cartas en mano',
  },
};

// CSS propio de la escena, autoinyectado una sola vez (no editamos index.html).
const CSS_HREF = new URL('../../css/scene-insertion-sort.css', import.meta.url).href;
if (!document.querySelector(`link[data-scene="insertion-sort"]`)) {
  document.head.append(
    el('link', { rel: 'stylesheet', href: CSS_HREF, dataset: { scene: 'insertion-sort' } }),
  );
}

/**
 * Construye los pasos ejecutando insertion sort sobre `input`.
 * Cada paso describe una micro-acción (pick / compare / shift / place / done).
 * Los índices `slot` son posiciones físicas en la fila; el visual reordena las
 * cartas según esos slots, por eso el trace es idempotente para el reset.
 */
function buildTrace(input) {
  const a = input.slice();
  const steps = [];
  for (let i = 1; i < a.length; i++) {
    const key = a[i];
    let j = i - 1;
    steps.push({ type: 'pick', index: i, value: key, sortedTo: i - 1 });
    while (j >= 0 && a[j] > key) {
      steps.push({ type: 'compare', index: j, sorted: a[j], key, result: true });
      // a[j+1] = a[j]: la carta ordenada se desliza una posición a la derecha.
      steps.push({ type: 'shift', from: j, to: j + 1, sorted: a[j] });
      a[j + 1] = a[j];
      j--;
    }
    if (j >= 0) {
      steps.push({ type: 'compare', index: j, sorted: a[j], key, result: false });
    }
    a[j + 1] = key;
    steps.push({ type: 'place', slot: j + 1, value: key, sortedTo: i });
  }
  steps.push({ type: 'done' });
  return steps;
}

const leftPct = (k) => ((k + 0.5) / N) * 100;

export default function mountInsertionSort(host, meta) {
  const S = STRINGS[getLang()] || STRINGS.en;

  const handLabel = el('span', { class: 'is-zone-label' }, S.handLabel);
  const sortedLabel = el('span', { class: 'is-zone-label is-zone-ok' }, S.sortedLabel);
  const labels = el('div', { class: 'is-labels' }, sortedLabel, handLabel);
  const row = el('div', { class: 'is-row' });
  const narrator = el('div', { class: 'narrator' }, S.ready);
  const canvas = el('div', { class: 'stage-canvas is-stage' }, labels, row, narrator);

  // Cartas: identidad estable por índice de creación, se reubican por slot.
  const cards = VALUES.map((v) => {
    const h = 46 + (v / MAXV) * 150;
    const c = el(
      'div',
      { class: 'is-card', style: { height: `${h}px` } },
      el('span', { class: 'is-card-pip is-pip-tl' }, String(v)),
      el('span', { class: 'is-card-rank mono' }, String(v)),
      el('span', { class: 'is-card-pip is-pip-br' }, String(v)),
    );
    c._value = v;
    return c;
  });
  cards.forEach((c) => row.append(c));

  // slots[k] = carta que ocupa la posición física k.
  let slots = cards.slice();

  function setNarration(html) {
    narrator.innerHTML = html;
  }

  function placeAll(instant = false) {
    slots.forEach((c, k) => {
      if (instant) c.classList.add('no-anim');
      c.style.left = `${leftPct(k)}%`;
      if (instant) requestAnimationFrame(() => c.classList.remove('no-anim'));
    });
  }

  function clearMarks() {
    cards.forEach((c) => c.classList.remove('is-key', 'is-compare', 'is-gap'));
  }

  // Marca como ordenadas las primeras `count` posiciones físicas.
  function markSorted(count) {
    slots.forEach((c, k) => {
      c.classList.toggle('is-sorted', k < count);
    });
  }

  function resetVisual() {
    cards.forEach((c) =>
      c.classList.remove('is-key', 'is-compare', 'is-gap', 'is-sorted', 'is-win'),
    );
    slots = cards.slice();
    markSorted(1); // la 1ª carta es la mano ordenada inicial
    placeAll(true);
    setNarration(S.reset);
  }

  function apply(step) {
    switch (step.type) {
      case 'pick': {
        clearMarks();
        markSorted(step.sortedTo + 1);
        const card = slots[step.index];
        card.classList.add('is-key');
        return S.pick(step.value, step.index);
      }
      case 'compare': {
        cards.forEach((c) => c.classList.remove('is-compare'));
        if (step.result) slots[step.index].classList.add('is-compare');
        return S.compare(step.sorted, step.key);
      }
      case 'shift': {
        // La carta ordenada en `from` se mueve físicamente a `to` (derecha),
        // dejando un hueco a su izquierda.
        const card = slots[step.from];
        slots[step.to] = card;
        slots[step.from] = null;
        card.classList.add('is-gap');
        card.style.left = `${leftPct(step.to)}%`;
        return S.shift(step.sorted);
      }
      case 'place': {
        // La carta levantada (is-key) cae en su ranura definitiva.
        const card = cards.find((c) => c.classList.contains('is-key'));
        slots[step.slot] = card;
        card.classList.remove('is-key', 'is-gap');
        card.style.left = `${leftPct(step.slot)}%`;
        cards.forEach((c) => c.classList.remove('is-compare', 'is-gap'));
        markSorted(step.sortedTo + 1);
        return S.place(step.value);
      }
      case 'done':
        clearMarks();
        slots.forEach((c, k) => {
          c.classList.add('is-sorted');
          setTimeout(() => c.classList.add('is-win'), k * 60);
        });
        return S.done;
    }
  }

  const player = new Player({
    steps: buildTrace(VALUES),
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
  const aside = el(
    'div',
    { class: 'scene-aside' },
    infoCard(S.cardTimeTitle, el('span', { class: 'big' }, 'O(n²)'), S.cardTimeSub),
    infoCard(S.cardStableTitle, el('span', { class: 'big' }, 'Stable'), S.cardStableSub),
    infoCard(S.cardInputTitle, el('code', {}, `[${VALUES.join(', ')}]`), S.cardInputSub),
  );

  clear(host);
  host.append(stage, aside);
  resetVisual();
  requestAnimationFrame(() => placeAll(true));

  return {
    destroy() {
      player.destroy();
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
