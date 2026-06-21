// Escena: Merge Sort — "Cartas en una mesa de casino".
//
// Un solo módulo para las DOS variantes del repo, según meta.id:
//   • merge-sort-recursive → NO muta: mantiene un mazo "original" intacto
//     arriba y arma el resultado en la fila de trabajo (el mazo nuevo).
//   • merge-sort-in-place   → muta: solo la fila de trabajo, que se reordena
//     sobre sí misma.
//
// Trace FIEL al esquema divide y vencerás de ambos archivos: parte por la
// mitad (Math.trunc(n/2)) y mezcla dos mitades ya ordenadas tomando la menor
// del frente de cada una.

import { el, clear } from '../dom.js';
import { Player, buildTransport } from '../player.js';
import { getLang } from '../i18n.js';

const VALUES = [5, 2, 8, 1, 9, 3, 7, 4]; // distintos → identidad por valor
const N = VALUES.length;

// Strings bilingües (inglés por defecto, español opcional). Las
// interpolaciones son funciones; se conserva el markup <span class="mono">…</span>.
const STRINGS = {
  en: {
    ready: 'Ready to play.',
    ghostLabel: 'original · untouched',
    workLabelRecursive: 'new deck · result',
    workLabelInPlace: 'same row · reordered in place',
    split: (vals) => `Split <span class="mono">[${vals}]</span> in half ✂️`,
    merge: (left, right, result) =>
      `Merge <span class="mono">[${left}]</span> and <span class="mono">[${right}]</span> → <span class="mono">[${result}]</span>`,
    doneRecursive: 'New deck sorted! The original stayed untouched above ✨',
    doneInPlace: 'The same row ended up sorted in place ✨',
    infoComplexityTitle: 'Complexity',
    infoComplexitySub: 'stable, divide and conquer',
    infoMemoryTitle: 'Memory',
    infoMemorySubRecursive: 'returns a new array',
    infoMemorySubInPlace: 'rewrites the original',
    infoInputTitle: 'Input',
  },
  es: {
    ready: 'Listo para reproducir.',
    ghostLabel: 'original · no se toca',
    workLabelRecursive: 'mazo nuevo · resultado',
    workLabelInPlace: 'misma fila · se reordena in-place',
    split: (vals) => `Divido <span class="mono">[${vals}]</span> por la mitad ✂️`,
    merge: (left, right, result) =>
      `Mezclo <span class="mono">[${left}]</span> y <span class="mono">[${right}]</span> → <span class="mono">[${result}]</span>`,
    doneRecursive: '¡Mazo nuevo ordenado! El original quedó intacto arriba ✨',
    doneInPlace: '¡La misma fila quedó ordenada in-place ✨',
    infoComplexityTitle: 'Complejidad',
    infoComplexitySub: 'estable, divide y vencerás',
    infoMemoryTitle: 'Memoria',
    infoMemorySubRecursive: 'devuelve un array nuevo',
    infoMemorySubInPlace: 'reescribe el original',
    infoInputTitle: 'Entrada',
  },
};

function buildTrace(input) {
  const steps = [];
  function ms(arr, lo) {
    const hi = lo + arr.length; // [lo, hi)
    if (arr.length <= 1) return arr;
    const mid = Math.trunc(arr.length / 2);
    steps.push({ type: 'split', lo, mid: lo + mid, hi });
    const L = ms(arr.slice(0, mid), lo);
    const R = ms(arr.slice(mid), lo + mid);
    const out = [];
    let i = 0;
    let j = 0;
    while (i < L.length && j < R.length) {
      if (L[i] < R[j]) out.push(L[i++]);
      else out.push(R[j++]);
    }
    while (i < L.length) out.push(L[i++]);
    while (j < R.length) out.push(R[j++]);
    steps.push({
      type: 'merge',
      lo,
      mid: lo + mid,
      hi,
      left: L.slice(),
      right: R.slice(),
      result: out.slice(),
    });
    return out;
  }
  ms(input.slice(), 0);
  steps.push({ type: 'done' });
  return steps;
}

const leftPct = (k) => ((k + 0.5) / N) * 100;
const hueFor = (v) => 190 + (v / Math.max(...VALUES)) * 120;

function makeCard(v, cls) {
  const h = hueFor(v);
  return el(
    'div',
    {
      class: cls,
      style: {
        '--h': String(h),
        background: `linear-gradient(165deg, hsl(${h} 85% 70%), hsl(${h} 70% 48%))`,
      },
    },
    el('span', {}, String(v)),
  );
}

export default function mountMergeSort(host, meta) {
  const S = STRINGS[getLang()] || STRINGS.en;
  const recursive = meta.id === 'merge-sort-recursive';

  const band = el('div', { class: 'ms-band' });
  const divider = el('div', { class: 'ms-divider' });

  // fila de referencia (solo recursivo): el mazo original que NO se toca
  let ghostRow = null;
  if (recursive) {
    ghostRow = el(
      'div',
      { class: 'ms-row ms-ghost' },
      el('span', { class: 'ms-row-label' }, S.ghostLabel),
    );
    VALUES.forEach((v, k) => {
      const c = makeCard(v, 'ms-card');
      c.style.left = `${leftPct(k)}%`;
      ghostRow.append(c);
    });
  }

  // fila de trabajo
  const workRow = el(
    'div',
    { class: 'ms-row ms-work' },
    el('span', { class: 'ms-row-label' }, recursive ? S.workLabelRecursive : S.workLabelInPlace),
    band,
    divider,
  );

  const cards = VALUES.map((v) => {
    const c = makeCard(v, 'ms-card');
    c._value = v;
    return c;
  });
  cards.forEach((c) => workRow.append(c));
  let slots = cards.slice();

  const canvas = el('div', { class: 'stage-canvas ms-stage' }, ghostRow, workRow);
  const narrator = el('div', { class: 'narrator' }, S.ready);
  canvas.append(narrator);

  function place(instant = false) {
    slots.forEach((c, k) => {
      if (instant) c.classList.add('no-anim');
      c.style.left = `${leftPct(k)}%`;
      if (instant) requestAnimationFrame(() => c.classList.remove('no-anim'));
    });
  }
  function setBand(lo, hi) {
    band.style.opacity = '1';
    band.style.left = `${(lo / N) * 100}%`;
    band.style.width = `${((hi - lo) / N) * 100}%`;
  }
  function clearMarks() {
    cards.forEach((c) => c.classList.remove('ms-left', 'ms-right', 'ms-merged'));
  }
  function setNarration(html) {
    narrator.innerHTML = html;
  }
  function resetVisual() {
    clearMarks();
    cards.forEach((c) => c.classList.remove('ms-done'));
    band.style.opacity = '0';
    divider.style.opacity = '0';
    slots = cards.slice();
    place(true);
    setNarration(S.ready);
  }

  function apply(step) {
    switch (step.type) {
      case 'split':
        clearMarks();
        setBand(step.lo, step.hi);
        divider.style.opacity = '1';
        divider.style.left = `${(step.mid / N) * 100}%`;
        for (let k = step.lo; k < step.hi; k++) {
          slots[k].classList.add(k < step.mid ? 'ms-left' : 'ms-right');
        }
        return S.split(rangeVals(slots, step.lo, step.hi));
      case 'merge': {
        divider.style.opacity = '0';
        setBand(step.lo, step.hi);
        // reordeno las cartas del rango [lo,hi) según result, por valor
        const byVal = new Map(cards.map((c) => [c._value, c]));
        for (let k = step.lo; k < step.hi; k++) {
          const c = byVal.get(step.result[k - step.lo]);
          slots[k] = c;
          c.classList.remove('ms-left', 'ms-right');
          c.classList.add('ms-merged');
          c.style.left = `${leftPct(k)}%`;
        }
        setTimeout(() => {
          for (let k = step.lo; k < step.hi; k++) slots[k].classList.remove('ms-merged');
        }, 520);
        return S.merge(step.left.join(','), step.right.join(','), step.result.join(','));
      }
      case 'done':
        band.style.opacity = '0';
        cards.forEach((c, i) => setTimeout(() => c.classList.add('ms-done'), i * 60));
        return recursive ? S.doneRecursive : S.doneInPlace;
    }
  }

  const player = new Player({
    steps: buildTrace(VALUES),
    apply,
    reset: resetVisual,
    baseDelay: 820,
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
    infoCard(
      S.infoComplexityTitle,
      el('span', { class: 'big' }, 'O(n log n)'),
      S.infoComplexitySub,
    ),
    infoCard(
      S.infoMemoryTitle,
      el('span', { class: 'big' }, recursive ? 'O(n)' : 'in-place'),
      recursive ? S.infoMemorySubRecursive : S.infoMemorySubInPlace,
    ),
    infoCard(S.infoInputTitle, el('code', {}, `[${VALUES.join(', ')}]`), `n = ${N}`),
  );

  clear(host);
  host.append(stage, aside);
  requestAnimationFrame(() => place(true));

  return { destroy: () => player.destroy() };
}

function rangeVals(slots, lo, hi) {
  const out = [];
  for (let k = lo; k < hi; k++) out.push(slots[k]._value);
  return out.join(',');
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
