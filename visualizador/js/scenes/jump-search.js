// Escena: Jump Search — "Cruzando un río saltando piedras (stepping stones)".
//
// Trace FIEL al algoritmo estándar de jump search (entrada ORDENADA):
//   step = floor(sqrt(n)); prev = 0;
//   while (a[min(step, n) - 1] < target) {
//     prev = step; step += floor(sqrt(n));
//     if (prev >= n) return -1;
//   }
//   while (a[prev] < target) { prev++; if (prev === min(step, n)) return -1; }
//   if (a[prev] === target) return prev; else return -1;
//
// Metáfora: el array ordenado es una hilera de piedras sobre el agua. El buscador
// SALTA √n piedras por vez (resaltamos la piedra de aterrizaje). Cuando un salto
// se PASA del objetivo (valor > objetivo), RETROCEDE piedra por piedra dentro del
// último bloque hasta encontrar el objetivo (dorado) o pasarse. Mostramos los
// límites de bloque y √n. Se ejecuta el algoritmo real.

import { el, clear } from '../dom.js';
import { Player, buildTransport } from '../player.js';
import { getLang } from '../i18n.js';

const ARRAY = [2, 5, 8, 12, 16, 23, 38, 45, 56, 67, 78, 91]; // n = 12
const TARGET = 56; // está en el array (índice 8)

// ── Strings bilingües (inglés por defecto, español opcional) ──────────
const STRINGS = {
  en: {
    ready: 'Ready to play.',
    crossing: 'Crossing for ',
    stepTag: 'step = √n',
    jump: (i, value) =>
      `Jump to stone <span class="mono">#${i}</span> → <span class="mono">${value}</span>`,
    jumpShort: (i, value) =>
      `Stone <span class="mono">#${i}</span> = <span class="mono">${value}</span> &lt; target → leap another √n forward.`,
    blockFound: (lo, hi) =>
      `Overshot! The target lives in the block <span class="mono">[${lo}…${hi}]</span>. Time to step back. 🔙`,
    backstep: (i, value) =>
      `Step back to stone <span class="mono">#${i}</span> → <span class="mono">${value}</span>`,
    found: (i) => `Reached the other side! Treasure at stone <span class="mono">#${i}</span> 🏆`,
    notfound: () => `The target isn't among the stones. Returns <span class="mono">-1</span>.`,
    cxTitle: 'Complexity',
    cxBig: 'O(√n)',
    cxSub: 'jumps of √n, then a short walk',
    preTitle: 'Precondition',
    preBig: 'sorted',
    preSub: 'requires an ascending array',
    targetTitle: 'Target',
    targetSub: (list) => `in [${list}]`,
  },
  es: {
    ready: 'Listo para reproducir.',
    crossing: 'Cruzando por ',
    stepTag: 'paso = √n',
    jump: (i, value) =>
      `Salto a la piedra <span class="mono">#${i}</span> → <span class="mono">${value}</span>`,
    jumpShort: (i, value) =>
      `Piedra <span class="mono">#${i}</span> = <span class="mono">${value}</span> &lt; objetivo → salto otro √n hacia adelante.`,
    blockFound: (lo, hi) =>
      `¡Me pasé! El objetivo está en el bloque <span class="mono">[${lo}…${hi}]</span>. Toca retroceder. 🔙`,
    backstep: (i, value) =>
      `Retrocedo a la piedra <span class="mono">#${i}</span> → <span class="mono">${value}</span>`,
    found: (i) => `¡Llegué al otro lado! Tesoro en la piedra <span class="mono">#${i}</span> 🏆`,
    notfound: () => `El objetivo no está entre las piedras. Devuelve <span class="mono">-1</span>.`,
    cxTitle: 'Complejidad',
    cxBig: 'O(√n)',
    cxSub: 'saltos de √n y una caminata corta',
    preTitle: 'Precondición',
    preBig: 'ordenado',
    preSub: 'requiere array ascendente',
    targetTitle: 'Objetivo',
    targetSub: (list) => `en [${list}]`,
  },
};

// CSS propio de la escena, autoinyectado una sola vez (no editamos index.html).
const CSS_HREF = './css/scene-jump-search.css';
if (!document.querySelector(`link[data-scene="jump-search"]`)) {
  document.head.append(
    el('link', { rel: 'stylesheet', href: CSS_HREF, dataset: { scene: 'jump-search' } }),
  );
}

/**
 * Construye los pasos ejecutando el algoritmo real de jump search.
 * Cada paso lleva la info visual necesaria (bloque activo, piedra resaltada).
 */
function buildTrace(arr, target) {
  const n = arr.length;
  const stepSize = Math.floor(Math.sqrt(n));
  const steps = [];

  let prev = 0;
  let step = stepSize;

  // ── Fase de SALTOS (jump) ──────────────────────────────────────────
  // Avanza mientras la piedra de aterrizaje siga por debajo del objetivo.
  while (arr[Math.min(step, n) - 1] < target) {
    const landing = Math.min(step, n) - 1;
    steps.push({
      type: 'jump',
      index: landing,
      value: arr[landing],
      blockLo: prev,
      blockHi: landing,
    });
    prev = step;
    step += stepSize;
    if (prev >= n) {
      steps.push({ type: 'notfound' });
      return steps;
    }
  }

  // Salto que se "pasa" (o llega justo): la piedra de aterrizaje >= objetivo.
  const landing = Math.min(step, n) - 1;
  steps.push({
    type: 'jump',
    index: landing,
    value: arr[landing],
    blockLo: prev,
    blockHi: landing,
  });

  // El objetivo, de existir, está en el bloque (prev … landing].
  const blockHi = Math.min(step, n) - 1;
  steps.push({ type: 'blockFound', blockLo: prev, blockHi });

  // ── Fase de RETROCESO / caminata lineal (backstep) ─────────────────
  // Camina desde prev mientras el valor sea menor que el objetivo.
  while (arr[prev] < target) {
    steps.push({
      type: 'backstep',
      index: prev,
      value: arr[prev],
      blockLo: prev,
      blockHi,
    });
    prev += 1;
    // si salimos del bloque sin hallarlo, no está
    if (prev === Math.min(step, n)) {
      steps.push({ type: 'notfound' });
      return steps;
    }
  }

  // Piedra final de la caminata.
  steps.push({
    type: 'backstep',
    index: prev,
    value: arr[prev],
    blockLo: prev,
    blockHi,
  });

  if (arr[prev] === target) {
    steps.push({ type: 'found', index: prev });
  } else {
    steps.push({ type: 'notfound' });
  }
  return steps;
}

// Réplica fiel del algoritmo real (para mostrar la salida en el aside).
function jumpSearch(arr, target) {
  const n = arr.length;
  const stepSize = Math.floor(Math.sqrt(n));
  let prev = 0;
  let step = stepSize;
  while (arr[Math.min(step, n) - 1] < target) {
    prev = step;
    step += stepSize;
    if (prev >= n) return -1;
  }
  while (arr[prev] < target) {
    prev += 1;
    if (prev === Math.min(step, n)) return -1;
  }
  return arr[prev] === target ? prev : -1;
}

export default function mountJumpSearch(host, meta) {
  const S = STRINGS[getLang()] || STRINGS.en;
  const stepSize = Math.floor(Math.sqrt(ARRAY.length));

  // ── La hilera de piedras (el array ordenado sobre el río) ───────────
  const stones = ARRAY.map((v, i) =>
    el(
      'div',
      { class: 'jmp-stone', dataset: { idx: String(i) } },
      el('span', { class: 'jmp-val mono' }, String(v)),
      el('span', { class: 'jmp-rock' }, '🪨'),
      el('span', { class: 'jmp-treasure' }, '🏆'),
      el('span', { class: 'jmp-idx mono' }, '#' + i),
    ),
  );
  // El buscador que salta de piedra en piedra.
  const hopper = el('div', { class: 'jmp-hopper' }, '🐸');
  const river = el('div', { class: 'jmp-river' }, ...stones, hopper);

  const head = el(
    'div',
    { class: 'jmp-head' },
    el('span', { class: 'jmp-target' }, S.crossing, el('span', { class: 'mono' }, String(TARGET))),
    el('span', { class: 'jmp-step-tag mono' }, `${S.stepTag} = ⌊√${ARRAY.length}⌋ = ${stepSize}`),
  );

  const narrator = el('div', { class: 'narrator' }, S.ready);
  const canvas = el('div', { class: 'stage-canvas jmp-stage' }, head, river, narrator);

  function setNarration(html) {
    narrator.innerHTML = html;
  }

  function clearMarks() {
    stones.forEach((s) =>
      s.classList.remove(
        'jmp-landed',
        'jmp-block',
        'jmp-probe',
        'jmp-found',
        'jmp-fail',
        'jmp-passed',
      ),
    );
    hopper.classList.remove('jmp-hop', 'jmp-back');
  }

  // Mueve el buscador encima de la piedra `index`.
  function moveHopper(index, animClass) {
    const stone = stones[index];
    // posición relativa dentro del río
    const left = stone.offsetLeft + stone.offsetWidth / 2;
    hopper.style.setProperty('--jmp-x', `${left}px`);
    if (animClass) {
      hopper.classList.remove('jmp-hop', 'jmp-back');
      void hopper.offsetWidth; // reflow para reiniciar la animación
      hopper.classList.add(animClass);
    }
  }

  function markBlock(lo, hi) {
    stones.forEach((s, i) => s.classList.toggle('jmp-block', i >= lo && i <= hi));
  }

  function resetVisual() {
    clearMarks();
    hopper.style.removeProperty('--jmp-x');
    // arranca antes de la primera piedra
    moveHopper(0);
    hopper.style.setProperty('--jmp-x', `0px`);
    setNarration(S.ready);
  }

  function apply(step, ctx) {
    const animate = ctx && ctx.animate;
    switch (step.type) {
      case 'jump': {
        clearMarks();
        markBlock(step.blockLo, step.blockHi);
        const stone = stones[step.index];
        stone.classList.add('jmp-landed', 'jmp-probe');
        moveHopper(step.index, animate ? 'jmp-hop' : null);
        if (!animate) moveHopper(step.index);
        // si el salto se pasó del objetivo lo marcamos como "overshoot"
        if (step.value >= TARGET) stone.classList.add('jmp-passed');
        return step.value >= TARGET
          ? S.jump(step.index, step.value)
          : S.jumpShort(step.index, step.value);
      }
      case 'blockFound': {
        stones.forEach((s) => s.classList.remove('jmp-probe'));
        markBlock(step.blockLo, step.blockHi);
        return S.blockFound(step.blockLo, step.blockHi);
      }
      case 'backstep': {
        stones.forEach((s) => s.classList.remove('jmp-probe', 'jmp-passed'));
        const stone = stones[step.index];
        stone.classList.add('jmp-probe');
        moveHopper(step.index, animate ? 'jmp-back' : null);
        if (!animate) moveHopper(step.index);
        return S.backstep(step.index, step.value);
      }
      case 'found': {
        stones.forEach((s) => s.classList.remove('jmp-probe'));
        stones[step.index].classList.add('jmp-found');
        moveHopper(step.index, animate ? 'jmp-back' : null);
        return S.found(step.index);
      }
      case 'notfound': {
        clearMarks();
        stones.forEach((s) => s.classList.add('jmp-fail'));
        return S.notfound();
      }
    }
  }

  const player = new Player({
    steps: buildTrace(ARRAY, TARGET),
    apply,
    reset: resetVisual,
    baseDelay: 900,
  });

  const { bar, sync } = buildTransport(player);
  player.onChange = (state) => {
    sync(state);
    if (state.narration) setNarration(state.narration);
  };

  const stage = el('div', { class: 'stage' }, canvas, bar);

  const result = jumpSearch(ARRAY, TARGET);
  const aside = el(
    'div',
    { class: 'scene-aside' },
    infoCard(S.cxTitle, el('span', { class: 'big' }, S.cxBig), S.cxSub),
    infoCard(S.preTitle, el('span', { class: 'big' }, S.preBig), S.preSub),
    infoCard(S.targetTitle, el('code', {}, String(TARGET)), S.targetSub(ARRAY.join(', '))),
    infoCard('index', el('span', { class: 'big' }, String(result)), `jumpSearch([…], ${TARGET})`),
  );

  clear(host);
  host.append(stage, aside);
  // posicionar el buscador requiere que el río ya esté en el DOM (offsets reales)
  requestAnimationFrame(resetVisual);

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
