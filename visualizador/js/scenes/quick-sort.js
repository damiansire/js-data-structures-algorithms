// Escena: Quick Sort — "Un profesor ordenando alumnos por altura".
//
// La traza viene de ../trace/quick-sort.trace.mjs (única fuente de verdad,
// verificada contra Ordenamiento/quick-sort/quick-sort.js por su test de
// equivalencia). Esta escena solo la dibuja.
//
// Visual: cada valor es un alumno-barra cuya altura crece con el valor. El
// pivote (último del rango) se ilumina con un foco. El puntero j recorre la
// fila; los menores o iguales se intercambian hacia la izquierda. Al final el
// pivote aterriza en su lugar definitivo y las subsecciones se ordenan igual.

import { el, clear } from '../dom.js';
import { Player, buildTransport } from '../player.js';
import { getLang } from '../i18n.js';
import { buildTrace } from '../trace/quick-sort.trace.mjs';

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
