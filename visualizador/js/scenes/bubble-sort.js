// Escena: Bubble Sort — "Un vaso de agua con gas".
//
// La traza viene de ../trace/bubble-sort.trace.mjs (única fuente de verdad,
// verificada contra Ordenamiento/bubble-sort/bubble-sort.js por su test de
// equivalencia). Esta escena solo la dibuja.
//
// Visual: cada valor es una burbuja cuyo diámetro crece con el valor. Las
// comparaciones iluminan dos burbujas; al intercambiarse giran una alrededor
// de la otra. Tras cada pasada, la burbuja mayor queda "asentada" (su lugar
// definitivo, al fondo a la derecha del vaso).

import { el, clear } from '../dom.js';
import { Player, buildTransport } from '../player.js';
import { getLang } from '../i18n.js';
import { buildTrace } from '../trace/bubble-sort.trace.mjs';

const VALUES = [6, 3, 8, 2, 7, 4, 9, 1, 5];

// ── Strings bilingües (inglés por defecto, español opcional) ─────
const STRINGS = {
  en: {
    ready: 'Ready to play.',
    compare: (va, vb) =>
      `Comparing <span class="mono">${va}</span> and <span class="mono">${vb}</span>${
        va > vb ? ' → the larger rises' : ' → already in order'
      }`,
    swap: 'Swap: the larger bubble floats to the right 🫧',
    settle: (value) => `<span class="mono">${value}</span> reached its final spot.`,
    earlybreak: 'A pass with no swaps → already sorted. <b>Early exit</b> ✂️',
    done: 'Sorted from smallest to largest! ✨',
    card_algo_title: 'Algorithm',
    card_algo_sub: 'worst case · O(n) if already sorted',
    card_input_title: 'Input',
    card_input_sub: 'in-place',
    card_trick_title: 'Repo trick',
    card_trick_sub: 'early-exit flag',
  },
  es: {
    ready: 'Listo para reproducir.',
    compare: (va, vb) =>
      `Comparo <span class="mono">${va}</span> y <span class="mono">${vb}</span>${
        va > vb ? ' → la mayor sube' : ' → ya están en orden'
      }`,
    swap: 'Intercambio: la burbuja mayor flota a la derecha 🫧',
    settle: (value) => `<span class="mono">${value}</span> llegó a su lugar definitivo.`,
    earlybreak: 'Una pasada sin intercambios → ya está ordenado. <b>Corte temprano</b> ✂️',
    done: '¡Ordenado de menor a mayor! ✨',
    card_algo_title: 'Algoritmo',
    card_algo_sub: 'peor caso · O(n) si ya ordenado',
    card_input_title: 'Entrada',
    card_input_sub: 'in-place',
    card_trick_title: 'Truco del repo',
    card_trick_sub: 'bandera de corte temprano',
  },
};

// hue agradable según el valor (cian→violeta)
const hueFor = (v, max) => 190 + (v / max) * 110;

export default function mountBubbleSort(host, meta) {
  const S = STRINGS[getLang()] || STRINGS.en;
  const n = VALUES.length;
  const max = Math.max(...VALUES);

  // Registro de timeouts propios de la escena: destroy() los cancela para no
  // tocar un DOM ya desmontado al cambiar de escena/idioma.
  const sceneTimers = new Set();
  const later = (fn, ms) => {
    const id = setTimeout(() => {
      sceneTimers.delete(id);
      fn();
    }, ms);
    sceneTimers.add(id);
    return id;
  };

  const water = el('div', { class: 'bs-water' });
  const fizz = el('div', { class: 'bs-fizz' });
  for (let i = 0; i < 14; i++) {
    fizz.append(
      el('span', {
        class: 'bs-fizz-bit',
        style: {
          left: `${5 + Math.random() * 90}%`,
          animationDelay: `${(i * 0.7).toFixed(2)}s`,
          animationDuration: `${(4 + Math.random() * 3).toFixed(2)}s`,
        },
      }),
    );
  }

  const canvas = el('div', { class: 'stage-canvas bs-glass' }, water, fizz);
  const narrator = el('div', { class: 'narrator' }, S.ready);
  canvas.append(narrator);

  // burbujas (identidad estable por valor inicial)
  const bubbles = VALUES.map((v, i) => {
    const d = 38 + (v / max) * 62; // 38–100 px
    const h = hueFor(v, max);
    const b = el(
      'div',
      {
        class: 'bs-bubble',
        style: {
          width: `${d}px`,
          height: `${d}px`,
          '--h': String(h),
        },
      },
      el('span', { class: 'bs-val' }, String(v)),
    );
    b._value = v;
    b._home = i;
    return b;
  });
  bubbles.forEach((b) => canvas.append(b));

  // slots[k] = burbuja actualmente en la posición k
  let slots = bubbles.slice();

  function placeAll(instant = false) {
    slots.forEach((b, k) => {
      if (instant) b.classList.add('no-anim');
      b.style.left = `${((k + 0.5) / n) * 100}%`;
      if (instant) requestAnimationFrame(() => b.classList.remove('no-anim'));
    });
  }

  function clearMarks() {
    bubbles.forEach((b) => b.classList.remove('compare', 'swapping'));
  }

  function resetVisual() {
    clearMarks();
    bubbles.forEach((b) => b.classList.remove('settled', 'win'));
    slots = bubbles.slice();
    placeAll(true);
    setNarration(S.ready);
  }

  function setNarration(html) {
    narrator.innerHTML = html;
    narrator.style.opacity = '1';
  }

  // ── aplicar un paso ─────────────────────────────────────────────
  function apply(step) {
    clearMarks();
    switch (step.type) {
      case 'compare': {
        const ba = slots[step.a];
        const bb = slots[step.b];
        ba.classList.add('compare');
        bb.classList.add('compare');
        return S.compare(step.va, step.vb);
      }
      case 'swap': {
        const ba = slots[step.a];
        const bb = slots[step.b];
        ba.classList.add('swapping');
        bb.classList.add('swapping');
        // intercambio en el modelo de slots y reposicionamiento
        [slots[step.a], slots[step.b]] = [slots[step.b], slots[step.a]];
        slots[step.a].style.left = `${((step.a + 0.5) / n) * 100}%`;
        slots[step.b].style.left = `${((step.b + 0.5) / n) * 100}%`;
        return S.swap;
      }
      case 'settle': {
        slots[step.index].classList.add('settled');
        return S.settle(step.value);
      }
      case 'earlybreak': {
        for (let k = 0; k <= step.to; k++) slots[k].classList.add('settled');
        return S.earlybreak;
      }
      case 'done': {
        bubbles.forEach((b, i) => {
          b.classList.add('settled');
          later(() => b.classList.add('win'), i * 70);
        });
        return S.done;
      }
    }
  }

  // ── Player + transporte ────────────────────────────────────────
  const player = new Player({
    steps: buildTrace(VALUES),
    apply,
    reset: resetVisual,
    baseDelay: 760,
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
    infoCard(S.card_algo_title, el('span', { class: 'big' }, 'O(n²)'), S.card_algo_sub),
    infoCard(S.card_input_title, el('code', {}, `[${VALUES.join(', ')}]`), S.card_input_sub),
    infoCard(S.card_trick_title, el('span', { class: 'big' }, 'swapped'), S.card_trick_sub),
  );

  clear(host);
  host.append(stage, aside);

  // posicionamiento inicial
  requestAnimationFrame(() => placeAll(true));

  return {
    destroy: () => {
      sceneTimers.forEach((id) => clearTimeout(id));
      sceneTimers.clear();
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
