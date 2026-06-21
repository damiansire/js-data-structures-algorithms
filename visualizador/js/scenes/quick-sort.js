// Escena: Quick Sort — "Un profesor ordenando alumnos por altura".
//
// Trace FIEL a Ordenamiento/quick-sort/quick-sort.js (partición de Lomuto):
//   pivot = arr[end]; i = start-1
//   for j in [start, end): if arr[j] <= pivot { i++; swap(i,j) }
//   swap(i+1, end); pivote queda en i+1
//
// Visual: cada valor es un alumno-barra cuya altura crece con el valor. El
// pivote (último del rango) se ilumina con un foco. El puntero j recorre la
// fila; los menores o iguales se intercambian hacia la izquierda. Al final el
// pivote aterriza en su lugar definitivo y las subsecciones se ordenan igual.

import { el, clear } from '../dom.js';
import { Player, buildTransport } from '../player.js';
import { getLang } from '../i18n.js';

const VALUES = [7, 2, 9, 4, 1, 8, 5, 3];
const N = VALUES.length;
const MAXV = Math.max(...VALUES);

const STRINGS = {
  en: {
    ready: 'Ready to play.',
    pivot: (lo, hi, value) =>
      `Subsection <span class="mono">${lo}…${hi}</span>. Pivot under the spotlight: <span class="mono">${value}</span> 🔦`,
    scan: (student, pivot) =>
      `Is student <span class="mono">${student}</span> ≤ pivot <span class="mono">${pivot}</span>?`,
    swap: 'Yes → I move them to the left of the pivot.',
    keep: 'Yes, and they are already on the right side.',
    place: (value) => `The pivot <span class="mono">${value}</span> lands in its final place.`,
    settled: (value) => `<span class="mono">${value}</span> is now in its final position ✔`,
    done: 'Row sorted from shortest to tallest! ✨',
    card_avg_title: 'Average',
    card_avg_sub: 'worst case O(n²)',
    card_part_title: 'Partition',
    card_part_sub: 'pivot = arr[end]',
    card_input_title: 'Input',
    card_input_sub: 'in-place',
  },
  es: {
    ready: 'Listo para reproducir.',
    pivot: (lo, hi, value) =>
      `Subsección <span class="mono">${lo}…${hi}</span>. Pivote bajo el foco: <span class="mono">${value}</span> 🔦`,
    scan: (student, pivot) =>
      `¿El alumno <span class="mono">${student}</span> ≤ pivote <span class="mono">${pivot}</span>?`,
    swap: 'Sí → lo muevo hacia la izquierda del pivote.',
    keep: 'Sí, y ya está del lado correcto.',
    place: (value) =>
      `El pivote <span class="mono">${value}</span> aterriza en su lugar definitivo.`,
    settled: (value) => `<span class="mono">${value}</span> ya está en su posición final ✔`,
    done: '¡Fila ordenada de menor a mayor! ✨',
    card_avg_title: 'Promedio',
    card_avg_sub: 'peor caso O(n²)',
    card_part_title: 'Partición',
    card_part_sub: 'pivote = arr[end]',
    card_input_title: 'Entrada',
    card_input_sub: 'in-place',
  },
};

function buildTrace(input) {
  const a = input.slice();
  const steps = [];
  const swap = (i, j) => {
    const t = a[i];
    a[i] = a[j];
    a[j] = t;
  };
  function partition(start, end) {
    const pivot = a[end];
    steps.push({ type: 'pivot', index: end, value: pivot, lo: start, hi: end });
    let i = start - 1;
    for (let j = start; j < end; j++) {
      steps.push({ type: 'scan', j, pivot, lo: start, hi: end });
      if (a[j] <= pivot) {
        i++;
        if (i !== j) {
          swap(i, j);
          steps.push({ type: 'swap', a: i, b: j });
        } else {
          steps.push({ type: 'keep', index: i });
        }
      }
    }
    swap(i + 1, end);
    steps.push({ type: 'place', a: i + 1, b: end, value: pivot });
    steps.push({ type: 'settled', index: i + 1 });
    return i + 1;
  }
  function qs(start, end) {
    if (start >= end) {
      if (start === end) steps.push({ type: 'settled', index: start });
      return;
    }
    const p = partition(start, end);
    qs(start, p - 1);
    qs(p + 1, end);
  }
  qs(0, a.length - 1);
  steps.push({ type: 'done' });
  return steps;
}

const leftPct = (k) => ((k + 0.5) / N) * 100;

export default function mountQuickSort(host) {
  const S = STRINGS[getLang()] || STRINGS.en;
  const band = el('div', { class: 'qs-band' });
  const floor = el('div', { class: 'qs-floor' });
  const canvas = el('div', { class: 'stage-canvas qs-stage' }, band, floor);
  const narrator = el('div', { class: 'narrator' }, S.ready);
  canvas.append(narrator);

  // barras (identidad estable por valor)
  const bars = VALUES.map((v) => {
    const h = 42 + (v / MAXV) * 200;
    const b = el(
      'div',
      { class: 'qs-bar', style: { height: `${h}px` } },
      el('span', { class: 'qs-cap' }, String(v)),
      el('span', { class: 'qs-spot' }),
    );
    b._value = v;
    return b;
  });
  bars.forEach((b) => canvas.append(b));
  let slots = bars.slice();

  function place(instant = false) {
    slots.forEach((b, k) => {
      if (instant) b.classList.add('no-anim');
      b.style.left = `${leftPct(k)}%`;
      if (instant) requestAnimationFrame(() => b.classList.remove('no-anim'));
    });
  }
  function setBand(lo, hi) {
    band.style.opacity = '1';
    band.style.left = `${(lo / N) * 100}%`;
    band.style.width = `${((hi - lo + 1) / N) * 100}%`;
  }
  function clearScan() {
    bars.forEach((b) => b.classList.remove('qs-scan'));
  }
  function setNarration(html) {
    narrator.innerHTML = html;
  }
  function resetVisual() {
    bars.forEach((b) => b.classList.remove('qs-pivot', 'qs-scan', 'qs-settled', 'qs-win'));
    band.style.opacity = '0';
    slots = bars.slice();
    place(true);
    setNarration(S.ready);
  }

  function apply(step) {
    switch (step.type) {
      case 'pivot':
        bars.forEach((b) => b.classList.remove('qs-pivot', 'qs-scan'));
        slots[step.index].classList.add('qs-pivot');
        setBand(step.lo, step.hi);
        return S.pivot(step.lo, step.hi, step.value);
      case 'scan':
        clearScan();
        slots[step.j].classList.add('qs-scan');
        return S.scan(slots[step.j]._value, step.pivot);
      case 'swap': {
        const ba = slots[step.a];
        const bb = slots[step.b];
        [slots[step.a], slots[step.b]] = [slots[step.b], slots[step.a]];
        ba.style.left = `${leftPct(slots.indexOf(ba))}%`;
        bb.style.left = `${leftPct(slots.indexOf(bb))}%`;
        return S.swap;
      }
      case 'keep':
        return S.keep;
      case 'place': {
        const ba = slots[step.a];
        const bb = slots[step.b];
        [slots[step.a], slots[step.b]] = [slots[step.b], slots[step.a]];
        ba.style.left = `${leftPct(slots.indexOf(ba))}%`;
        bb.style.left = `${leftPct(slots.indexOf(bb))}%`;
        return S.place(step.value);
      }
      case 'settled':
        clearScan();
        slots[step.index].classList.remove('qs-pivot');
        slots[step.index].classList.add('qs-settled');
        return S.settled(slots[step.index]._value);
      case 'done':
        band.style.opacity = '0';
        bars.forEach((b, i) => {
          b.classList.remove('qs-scan', 'qs-pivot');
          b.classList.add('qs-settled');
          setTimeout(() => b.classList.add('qs-win'), i * 60);
        });
        return S.done;
    }
  }

  const player = new Player({
    steps: buildTrace(VALUES),
    apply,
    reset: resetVisual,
    baseDelay: 680,
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
    infoCard(S.card_avg_title, el('span', { class: 'big' }, 'O(n log n)'), S.card_avg_sub),
    infoCard(S.card_part_title, el('span', { class: 'big' }, 'Lomuto'), S.card_part_sub),
    infoCard(S.card_input_title, el('code', {}, `[${VALUES.join(', ')}]`), S.card_input_sub),
  );

  clear(host);
  host.append(stage, aside);
  requestAnimationFrame(() => place(true));

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
