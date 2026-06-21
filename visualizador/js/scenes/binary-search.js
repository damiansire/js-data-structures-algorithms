// Escena: Binary Search — "Un pasillo de puertas cerradas".
//
// La traza viene de ../trace/binary-search.trace.mjs (única fuente de verdad,
// verificada contra Busqueda/binary-search/binary-search.js por su test de
// equivalencia). Esta escena solo la dibuja.
//
// Visual: el array ordenado es un pasillo de puertas numeradas. El rango activo
// está iluminado; el algoritmo "abre" la puerta del medio. La mitad descartada
// colapsa al abismo. La puerta del tesoro brilla en dorado.

import { el, clear } from '../dom.js';
import { Player, buildTransport } from '../player.js';
import { getLang } from '../i18n.js';
import { buildTrace } from '../trace/binary-search.trace.mjs';

const ARRAY = [3, 7, 12, 18, 21, 26, 33, 41, 55, 64, 72, 88];
const TARGET = 33; // está en el array (índice 6)

const STRINGS = {
  en: {
    ready: 'Ready to play.',
    searching: 'Searching ',
    rangeEmpty: 'Empty range…',
    rangeActive: (lo, hi) => `Active range: indices <span class="mono">${lo}…${hi}</span>`,
    probe: (mid, value) => `Opening the middle door (#${mid}) → <span class="mono">${value}</span>`,
    discard: (value, side) =>
      `<span class="mono">${value}</span> isn't it: the <b>${side}</b> half collapses into the void 🕳️`,
    sideLeft: 'left',
    sideRight: 'right',
    found: (mid) => `Treasure found at index <span class="mono">${mid}</span>! 🏆`,
    notfound: () => `The value isn't in the hallway. Returns <span class="mono">-1</span>.`,
    cxTitle: 'Complexity',
    cxSub: 'discards half the list per step',
    preTitle: 'Precondition',
    preBig: 'sorted',
    preSub: 'requires an ascending array',
    targetTitle: 'Target',
    targetSub: (list) => `in [${list}]`,
  },
  es: {
    ready: 'Listo para reproducir.',
    searching: 'Buscando ',
    rangeEmpty: 'Rango vacío…',
    rangeActive: (lo, hi) => `Rango activo: índices <span class="mono">${lo}…${hi}</span>`,
    probe: (mid, value) =>
      `Abro la puerta del medio (#${mid}) → <span class="mono">${value}</span>`,
    discard: (value, side) =>
      `<span class="mono">${value}</span> no es: la mitad de la <b>${side}</b> colapsa al abismo 🕳️`,
    sideLeft: 'izquierda',
    sideRight: 'derecha',
    found: (mid) => `¡Tesoro hallado en el índice <span class="mono">${mid}</span>! 🏆`,
    notfound: () => `El valor no está en el pasillo. Devuelve <span class="mono">-1</span>.`,
    cxTitle: 'Complejidad',
    cxSub: 'descarta media lista por paso',
    preTitle: 'Precondición',
    preBig: 'ordenado',
    preSub: 'requiere array ascendente',
    targetTitle: 'Objetivo',
    targetSub: (list) => `en [${list}]`,
  },
};

export default function mountBinarySearch(host, meta) {
  const S = STRINGS[getLang()] || STRINGS.en;
  const hall = el('div', { class: 'bsr-hall' });
  const doors = ARRAY.map((v, i) =>
    el(
      'div',
      { class: 'bsr-door', dataset: { idx: String(i) } },
      el('div', { class: 'bsr-door-leaf' }, el('span', {}, String(v))),
      el('div', { class: 'bsr-door-frame' }, el('span', { class: 'bsr-treasure' }, '🏆')),
      el('span', { class: 'bsr-idx' }, '#' + i),
    ),
  );
  doors.forEach((d) => hall.append(d));

  const canvas = el(
    'div',
    { class: 'stage-canvas bsr-stage' },
    el('div', { class: 'bsr-target' }, S.searching, el('span', { class: 'mono' }, String(TARGET))),
    hall,
  );
  const narrator = el('div', { class: 'narrator' }, S.ready);
  canvas.append(narrator);

  function setNarration(html) {
    narrator.innerHTML = html;
  }

  function resetVisual() {
    doors.forEach((d) => d.classList.remove('in-range', 'probing', 'collapsed', 'found', 'fail'));
    setNarration(S.ready);
  }

  function markRange(lo, hi) {
    doors.forEach((d, i) => {
      const inside = i >= lo && i <= hi && !d.classList.contains('collapsed');
      d.classList.toggle('in-range', inside);
      d.classList.remove('probing');
    });
  }

  function apply(step) {
    switch (step.type) {
      case 'range':
        markRange(step.lo, step.hi);
        if (step.lo > step.hi) return S.rangeEmpty;
        return S.rangeActive(step.lo, step.hi);
      case 'probe': {
        doors.forEach((d) => d.classList.remove('probing'));
        doors[step.mid].classList.add('probing');
        return S.probe(step.mid, step.value);
      }
      case 'discard': {
        for (let k = step.from; k <= step.to; k++) {
          doors[k].classList.remove('in-range', 'probing');
          doors[k].classList.add('collapsed');
        }
        const sideLabel = step.side === 'right' ? S.sideRight : S.sideLeft;
        return S.discard(ARRAY[step.from > step.to ? step.from : step.to], sideLabel);
      }
      case 'found':
        doors[step.mid].classList.remove('probing');
        doors[step.mid].classList.add('found');
        return S.found(step.mid);
      case 'notfound':
        doors.forEach((d) => d.classList.add('fail'));
        return S.notfound();
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
  const aside = el(
    'div',
    { class: 'scene-aside' },
    infoCard(S.cxTitle, el('span', { class: 'big' }, 'O(log n)'), S.cxSub),
    infoCard(S.preTitle, el('span', { class: 'big' }, S.preBig), S.preSub),
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
