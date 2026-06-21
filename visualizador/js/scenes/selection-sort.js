// Escena: Selection Sort — "Una profesora eligiendo a la bailarina más bajita
// en cada ronda para formar la fila".
//
// Trace FIEL al Selection Sort estándar:
//   for (let i = 0; i < n - 1; i++) {
//     let min = i;
//     for (let j = i + 1; j < n; j++) if (a[j] < a[min]) min = j;
//     swap(a[i], a[min]);
//   }
//
// Visual: cada valor es una bailarina-barra cuya altura crece con el valor. En
// cada ronda un marcador recorre la parte derecha (sin ordenar) buscando la
// más bajita: ilumina la candidata actual, y cada vez que encuentra una más
// baja la corona como nuevo mínimo. Al terminar el barrido, ese mínimo se
// intercambia hacia la posición de borde i, que pasa a estar ordenada (verde).

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
    round: (i) =>
      `Round <span class="mono">${i + 1}</span>: searching for the shortest dancer in the unsorted part.`,
    scan: (value, min) =>
      `Is dancer <span class="mono">${value}</span> shorter than the current pick <span class="mono">${min}</span>?`,
    newMin: (value) => `Yes! <span class="mono">${value}</span> is the new shortest so far 👑`,
    swap: (value, pos) =>
      `Bring the shortest <span class="mono">${value}</span> to the front of the line (slot <span class="mono">${pos}</span>).`,
    settled: (value) => `<span class="mono">${value}</span> is locked into its final position ✔`,
    done: 'Line-up sorted from shortest to tallest! ✨',
    card_avg_title: 'Average',
    card_avg_sub: 'always O(n²)',
    card_swaps_title: 'Swaps',
    card_swaps_sub: 'at most n−1',
    card_input_title: 'Input',
    card_input_sub: 'in-place',
  },
  es: {
    ready: 'Listo para reproducir.',
    round: (i) =>
      `Ronda <span class="mono">${i + 1}</span>: busco a la bailarina más bajita de la parte sin ordenar.`,
    scan: (value, min) =>
      `¿La bailarina <span class="mono">${value}</span> es más baja que la elegida actual <span class="mono">${min}</span>?`,
    newMin: (value) =>
      `¡Sí! <span class="mono">${value}</span> es la nueva más baja hasta ahora 👑`,
    swap: (value, pos) =>
      `Traigo a la más baja <span class="mono">${value}</span> al frente de la fila (lugar <span class="mono">${pos}</span>).`,
    settled: (value) => `<span class="mono">${value}</span> queda fija en su posición final ✔`,
    done: '¡Fila ordenada de más baja a más alta! ✨',
    card_avg_title: 'Promedio',
    card_avg_sub: 'siempre O(n²)',
    card_swaps_title: 'Intercambios',
    card_swaps_sub: 'a lo sumo n−1',
    card_input_title: 'Entrada',
    card_input_sub: 'in-place',
  },
};

// CSS propio de la escena, autoinyectado una sola vez (no editamos index.html).
const CSS_HREF = './css/scene-selection-sort.css';
if (!document.querySelector(`link[data-scene="selection-sort"]`)) {
  document.head.append(
    el('link', { rel: 'stylesheet', href: CSS_HREF, dataset: { scene: 'selection-sort' } }),
  );
}

/**
 * Construye los pasos ejecutando el algoritmo real de Selection Sort.
 *   scan(j, min)   → comparamos a[j] con el mínimo actual
 *   newMin(j)      → a[j] es el nuevo mínimo
 *   swap(i, min)   → intercambiamos el mínimo al borde i
 *   settled(i)     → la posición i queda ordenada
 */
function buildTrace(input) {
  const a = input.slice();
  const steps = [];
  const swap = (i, j) => {
    const tmp = a[i];
    a[i] = a[j];
    a[j] = tmp;
  };
  for (let i = 0; i < N - 1; i++) {
    let min = i;
    steps.push({ type: 'round', i });
    for (let j = i + 1; j < N; j++) {
      steps.push({ type: 'scan', i, j, min, valueJ: a[j], valueMin: a[min] });
      if (a[j] < a[min]) {
        min = j;
        steps.push({ type: 'newMin', i, j, value: a[j] });
      }
    }
    if (min !== i) {
      steps.push({ type: 'swap', i, min, value: a[min] });
      swap(i, min);
    }
    steps.push({ type: 'settled', i, value: a[i] });
  }
  // la última barra ya quedó ordenada por descarte
  steps.push({ type: 'settled', i: N - 1, value: a[N - 1] });
  steps.push({ type: 'done' });
  return steps;
}

const leftPct = (k) => ((k + 0.5) / N) * 100;

export default function mountSelectionSort(host, meta) {
  const S = STRINGS[getLang()] || STRINGS.en;

  // ── Marcador que recorre la fila buscando el mínimo ──────────────────
  const marker = el('div', { class: 'ss-marker' }, el('span', { class: 'ss-marker-tip' }, '🔍'));
  const boundary = el('div', { class: 'ss-boundary' });
  const floor = el('div', { class: 'ss-floor' });
  const narrator = el('div', { class: 'narrator' }, S.ready);
  const canvas = el('div', { class: 'stage-canvas ss-stage' }, boundary, floor, marker, narrator);

  // ── Barras (identidad estable por valor) ─────────────────────────────
  const bars = VALUES.map((v) => {
    const h = 42 + (v / MAXV) * 200;
    const b = el(
      'div',
      { class: 'ss-bar', style: { height: `${h}px` } },
      el('span', { class: 'ss-cap' }, String(v)),
      el('span', { class: 'ss-crown' }, '👑'),
    );
    b._value = v;
    return b;
  });
  bars.forEach((b) => canvas.append(b));
  let slots = bars.slice();

  // ── Helpers de render ────────────────────────────────────────────────
  function place(instant = false) {
    slots.forEach((b, k) => {
      if (instant) b.classList.add('no-anim');
      b.style.left = `${leftPct(k)}%`;
      if (instant) requestAnimationFrame(() => b.classList.remove('no-anim'));
    });
  }

  function moveMarker(k) {
    marker.style.opacity = '1';
    marker.style.left = `${leftPct(k)}%`;
  }

  function setBoundary(i) {
    // sombrea la parte sin ordenar: desde el borde i hasta el final
    boundary.style.opacity = '1';
    boundary.style.left = `${(i / N) * 100}%`;
    boundary.style.width = `${((N - i) / N) * 100}%`;
  }

  function clearScan() {
    bars.forEach((b) => b.classList.remove('ss-scan', 'ss-min'));
  }

  function setNarration(html) {
    narrator.innerHTML = html;
  }

  function resetVisual() {
    bars.forEach((b) => b.classList.remove('ss-scan', 'ss-min', 'ss-settled', 'ss-win'));
    boundary.style.opacity = '0';
    marker.style.opacity = '0';
    slots = bars.slice();
    place(true);
    setNarration(S.ready);
  }

  function apply(step) {
    switch (step.type) {
      case 'round':
        clearScan();
        setBoundary(step.i);
        moveMarker(step.i);
        return S.round(step.i);
      case 'scan':
        bars.forEach((b) => b.classList.remove('ss-scan'));
        slots[step.j].classList.add('ss-scan');
        moveMarker(step.j);
        return S.scan(slots[step.j]._value, slots[step.min]._value);
      case 'newMin':
        bars.forEach((b) => b.classList.remove('ss-min'));
        slots[step.j].classList.add('ss-min');
        return S.newMin(slots[step.j]._value);
      case 'swap': {
        const ba = slots[step.i];
        const bb = slots[step.min];
        [slots[step.i], slots[step.min]] = [slots[step.min], slots[step.i]];
        ba.style.left = `${leftPct(slots.indexOf(ba))}%`;
        bb.style.left = `${leftPct(slots.indexOf(bb))}%`;
        return S.swap(step.value, step.i);
      }
      case 'settled':
        clearScan();
        slots[step.i].classList.remove('ss-min', 'ss-scan');
        slots[step.i].classList.add('ss-settled');
        return S.settled(slots[step.i]._value);
      case 'done':
        boundary.style.opacity = '0';
        marker.style.opacity = '0';
        bars.forEach((b, i) => {
          b.classList.remove('ss-scan', 'ss-min');
          b.classList.add('ss-settled');
          setTimeout(() => b.classList.add('ss-win'), i * 60);
        });
        return S.done;
    }
  }

  // ── Player + transporte ──────────────────────────────────────────────
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
    infoCard(S.card_avg_title, el('span', { class: 'big' }, 'O(n²)'), S.card_avg_sub),
    infoCard(S.card_swaps_title, el('span', { class: 'big' }, 'O(n)'), S.card_swaps_sub),
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
