// Escena: Remove Duplicates — "El guardia de un club VIP con su lista (Set)".
//
// Trace FIEL a Algoritmos-generales/remove-duplicates/remove-duplicates.js:
//   function removeDuplicates(array) {
//     let mySet = new Set(array)   // dedup por inserción, conserva 1ª aparición
//     return Array.from(mySet)     // array nuevo, en orden de entrada al Set
//   }
//
// El Set guarda la PRIMERA aparición de cada valor y descarta las repetidas,
// preservando el orden. Eso es exactamente lo que hace el guardia: recorre la
// fila de izquierda a derecha y, por cada persona, consulta su lista (el Set).
//   · valor NUEVO  → no estaba en el Set → lo agrega y la persona ENTRA (puerta
//                    verde). Queda en la zona de "admitidos" = el array de salida.
//   · valor REPETIDO → ya estaba en el Set → puerta ROJA y la persona es
//                    EXPULSADA de una patada. El Set no cambia.
// La salida deduplicada es el recorrido de los admitidos = Array.from(Set).

import { el, clear, replay } from '../dom.js';
import { Player, buildTransport } from '../player.js';
import { getLang } from '../i18n.js';

const INPUT = [3, 7, 3, 1, 7, 9, 1, 5];

// ── Strings bilingües (inglés por defecto, español opcional) ──────────
const STRINGS = {
  en: {
    setEmpty: 'empty list',
    setHeadIcon: '📋',
    setHeadText: "Guard's list ",
    setTag: 'Set',
    doorLabel: 'VIP',
    queueLabel: 'QUEUE',
    admittedLabel: 'ADMITTED · CLUB',
    narratorReady: 'Ready to play.',
    narratorReset: 'Ready to play. The guard checks the queue one by one.',
    done: (count, out) =>
      `Queue processed. The list (Set) ended up with <span class="mono">${count}</span> uniques → output <span class="mono">[${out}]</span> ✨`,
    enters: (value) =>
      `The <span class="mono">${value}</span> is new → not in the list. Green door 🟢 <b>enters</b> and I note it in the Set.`,
    thrownOut: (value) =>
      `The <span class="mono">${value}</span> is already in the list (Set) → duplicate. Red light 🔴 <b>thrown out</b> 🦵`,
    cardStructureTitle: 'Structure',
    cardStructureSub: 'order of 1st appearance',
    cardComplexityTitle: 'Complexity',
    cardComplexitySub: 'single pass',
    cardInputTitle: 'Input',
    cardInputSub: (n) => `${n} in the queue`,
    cardOutputTitle: 'Output',
    cardOutputSub: (n) => `${n} uniques`,
  },
  es: {
    setEmpty: 'lista vacía',
    setHeadIcon: '📋',
    setHeadText: 'Lista del guardia ',
    setTag: 'Set',
    doorLabel: 'VIP',
    queueLabel: 'FILA',
    admittedLabel: 'ADMITIDOS · CLUB',
    narratorReady: 'Listo para reproducir.',
    narratorReset: 'Listo para reproducir. El guardia revisa la fila uno por uno.',
    done: (count, out) =>
      `Fila procesada. La lista (Set) quedó con <span class="mono">${count}</span> únicos → salida <span class="mono">[${out}]</span> ✨`,
    enters: (value) =>
      `El <span class="mono">${value}</span> es nuevo → no está en la lista. Puerta verde 🟢 <b>entra</b> y lo anoto en el Set.`,
    thrownOut: (value) =>
      `El <span class="mono">${value}</span> ya está en la lista (Set) → duplicado. Luz roja 🔴 <b>expulsado</b> 🦵`,
    cardStructureTitle: 'Estructura',
    cardStructureSub: 'orden de 1ª aparición',
    cardComplexityTitle: 'Complejidad',
    cardComplexitySub: 'una pasada',
    cardInputTitle: 'Entrada',
    cardInputSub: (n) => `${n} en la fila`,
    cardOutputTitle: 'Salida',
    cardOutputSub: (n) => `${n} únicos`,
  },
};

// CSS propio de la escena, autoinyectado una sola vez (no editamos index.html).
const CSS_HREF = './css/scene-remove-duplicates.css';
if (!document.querySelector(`link[data-scene="remove-duplicates"]`)) {
  document.head.append(
    el('link', { rel: 'stylesheet', href: CSS_HREF, dataset: { scene: 'remove-duplicates' } })
  );
}

/**
 * Construye los pasos: el guardia evalúa UN elemento de la fila por paso,
 * replicando `new Set(array)`.
 */
function buildTrace(input) {
  const seen = new Set();
  const steps = [];
  input.forEach((value, i) => {
    const isNew = !seen.has(value);
    if (isNew) seen.add(value);
    steps.push({
      type: 'evaluate',
      index: i,
      value,
      isNew,
      setSize: seen.size,
    });
  });
  steps.push({ type: 'done' });
  return steps;
}

export default function mountRemoveDuplicates(host, meta) {
  const S = STRINGS[getLang()] || STRINGS.en;

  // ── Zona del Set (la lista del guardia) ─────────────────────────────
  const setChips = el('div', { class: 'rd-set-chips' });
  const setEmpty = el('span', { class: 'rd-set-empty' }, S.setEmpty);
  setChips.append(setEmpty);
  const setPanel = el(
    'div',
    { class: 'rd-set' },
    el('div', { class: 'rd-set-head' }, el('span', { class: 'rd-set-icon' }, S.setHeadIcon), S.setHeadText,
      el('span', { class: 'rd-set-tag mono' }, S.setTag)),
    setChips
  );

  // ── El guardia + la puerta ──────────────────────────────────────────
  const guard = el('div', { class: 'rd-guard' }, '🕴️');
  const doorLight = el('div', { class: 'rd-door-light' });
  const door = el(
    'div',
    { class: 'rd-door' },
    doorLight,
    el('div', { class: 'rd-door-label' }, S.doorLabel)
  );
  const gate = el('div', { class: 'rd-gate' }, guard, door);

  // ── La fila de entrada (personas con un número) ─────────────────────
  const people = INPUT.map((v, i) => {
    const p = el(
      'div',
      { class: 'rd-person' },
      el('span', { class: 'rd-person-val mono' }, String(v)),
      el('span', { class: 'rd-person-body' }, '🧍')
    );
    p._value = v;
    p._index = i;
    return p;
  });
  const queue = el('div', { class: 'rd-queue' }, ...people);
  const queueWrap = el('div', { class: 'rd-queue-wrap' },
    el('span', { class: 'rd-zone-label' }, S.queueLabel), queue);

  // ── Zona de admitidos (la salida deduplicada) ───────────────────────
  const admitted = el('div', { class: 'rd-admitted' });
  const admittedWrap = el('div', { class: 'rd-admitted-wrap' },
    el('span', { class: 'rd-zone-label rd-zone-ok' }, S.admittedLabel), admitted);

  // ── Lienzo ──────────────────────────────────────────────────────────
  const narrator = el('div', { class: 'narrator' }, S.narratorReady);
  const canvas = el(
    'div',
    { class: 'stage-canvas rd-stage' },
    setPanel,
    queueWrap,
    gate,
    admittedWrap,
    narrator
  );

  // ── Helpers de render ───────────────────────────────────────────────
  function setNarration(html) {
    narrator.innerHTML = html;
  }

  function clearEvalMarks() {
    people.forEach((p) => p.classList.remove('rd-evaluating'));
    door.classList.remove('rd-open-ok', 'rd-open-bad');
    guard.classList.remove('rd-guard-ok', 'rd-guard-bad');
  }

  function renderSet(values) {
    clear(setChips);
    if (!values.length) {
      setChips.append(setEmpty);
      return;
    }
    values.forEach((v, i) => {
      const chip = el('span', { class: 'rd-chip mono' }, String(v));
      setChips.append(chip);
      // resalta la última agregada
      if (i === values.length - 1) requestAnimationFrame(() => chip.classList.add('rd-chip-new'));
    });
  }

  // Estado del Set reconstruido a partir del trace (idempotente para reset).
  let setValues = [];

  function resetVisual() {
    clearEvalMarks();
    setValues = [];
    renderSet(setValues);
    clear(admitted);
    people.forEach((p) => {
      p.classList.remove('rd-admitted-in', 'rd-expelled', 'no-anim');
      p.style.removeProperty('opacity');
      // re-inyecta a la fila si fue movido
      if (p.parentNode !== queue) queue.append(p);
    });
    // restablece orden original de la fila
    people
      .slice()
      .sort((a, b) => a._index - b._index)
      .forEach((p) => queue.append(p));
    setNarration(S.narratorReset);
  }

  function apply(step, ctx) {
    const animate = ctx && ctx.animate;
    if (step.type === 'done') {
      clearEvalMarks();
      door.classList.add('rd-done');
      setTimeout(() => door.classList.remove('rd-done'), 600);
      const out = setValues.join(', ');
      return S.done(setValues.length, out);
    }

    clearEvalMarks();
    const person = people[step.index];
    person.classList.add('rd-evaluating');

    if (step.isNew) {
      // NUEVO: puerta verde, entra al club, se agrega al Set.
      door.classList.add('rd-open-ok');
      guard.classList.add('rd-guard-ok');
      setValues = setValues.concat(step.value); // setSize === setValues.length tras agregar
      renderSet(setValues);

      // mueve la persona a admitidos
      const move = () => {
        person.classList.add('rd-admitted-in');
        admitted.append(person);
      };
      if (animate) setTimeout(move, 220);
      else move();

      return S.enters(step.value);
    }

    // REPETIDO: puerta roja, expulsado de una patada.
    door.classList.add('rd-open-bad');
    guard.classList.add('rd-guard-bad');
    if (animate) replay(person, 'rd-expelled');
    else {
      person.classList.add('rd-expelled');
      person.style.opacity = '0';
    }
    return S.thrownOut(step.value);
  }

  // ── Player + transporte ─────────────────────────────────────────────
  const player = new Player({
    steps: buildTrace(INPUT),
    apply,
    reset: resetVisual,
    baseDelay: 760,
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
    infoCard(S.cardStructureTitle, el('span', { class: 'big' }, 'Set'), S.cardStructureSub),
    infoCard(S.cardComplexityTitle, el('span', { class: 'big' }, 'O(n)'), S.cardComplexitySub),
    infoCard(S.cardInputTitle, el('code', {}, `[${INPUT.join(', ')}]`), S.cardInputSub(INPUT.length)),
    infoCard(S.cardOutputTitle, el('code', {}, `[${dedupe(INPUT).join(', ')}]`), S.cardOutputSub(dedupe(INPUT).length))
  );

  clear(host);
  host.append(stage, aside);
  resetVisual();

  return {
    destroy() {
      player.destroy();
    },
  };
}

// Réplica fiel del algoritmo real (para mostrar la salida en el aside).
function dedupe(array) {
  return Array.from(new Set(array));
}

function infoCard(title, big, sub) {
  return el(
    'div',
    { class: 'info-card' },
    el('h4', {}, title),
    big,
    sub ? el('div', { style: { marginTop: '6px', fontSize: '12px', color: '#76749a' } }, sub) : null
  );
}
