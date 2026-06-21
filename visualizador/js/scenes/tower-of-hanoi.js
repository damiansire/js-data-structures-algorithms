// Escena: Tower of Hanoi — "Moving golden disks between three pegs".
//
// Recursión estándar de Torres de Hanói (N=4, A→C usando B como auxiliar):
//   hanoi(n, from, to, via) {
//     if (n === 0) return;
//     hanoi(n - 1, from, via, to);   // mueve la torre de arriba al auxiliar
//     move disk n  from → to;        // mueve el disco grande al destino
//     hanoi(n - 1, via, to, from);   // reapila la torre encima
//   }
// Cada MOVE (disk, from, to) es un paso. Para n=4 son 2^4 - 1 = 15 movimientos.
//
// Visual: tres clavijas (A origen, B auxiliar, C destino) con N discos apilados,
// el más ancho abajo y coloreados por tamaño. Cada paso levanta el disco del
// tope de la clavija origen, lo desliza sobre la clavija destino y lo deja caer
// encima (el algoritmo garantiza que todos los movimientos son legales).

import { el, clear } from '../dom.js';
import { Player, buildTransport } from '../player.js';
import { getLang } from '../i18n.js';

const N = 4; // cantidad de discos
const PEGS = ['A', 'B', 'C']; // origen, auxiliar, destino
const MIN_MOVES = Math.pow(2, N) - 1; // 15

// ── Strings bilingües (inglés por defecto, español opcional) ──────────
const STRINGS = {
  en: {
    ready:
      'Ready to play. Move the golden tower from peg <span class="mono">A</span> to peg <span class="mono">C</span>.',
    pegSource: 'SOURCE',
    pegAux: 'AUXILIARY',
    pegTarget: 'TARGET',
    move: (disk, from, to) =>
      `Lift disk <span class="mono">${disk}</span> from peg <span class="mono">${from}</span> and drop it on peg <span class="mono">${to}</span>.`,
    done: `Tower rebuilt on peg <span class="mono">C</span> in <span class="mono">${MIN_MOVES}</span> moves — the minimum! ✨`,
    cardMovesTitle: 'Moves',
    cardMovesSub: (n) => `minimum 2^${n} − 1 = ${Math.pow(2, n) - 1}`,
    cardDisksTitle: 'Disks',
    cardDisksSub: 'largest at the bottom',
    cardRuleTitle: 'Rule',
    cardRuleSub: 'never a bigger disk on a smaller one',
  },
  es: {
    ready:
      'Listo para reproducir. Mové la torre dorada de la clavija <span class="mono">A</span> a la clavija <span class="mono">C</span>.',
    pegSource: 'ORIGEN',
    pegAux: 'AUXILIAR',
    pegTarget: 'DESTINO',
    move: (disk, from, to) =>
      `Levantá el disco <span class="mono">${disk}</span> de la clavija <span class="mono">${from}</span> y dejalo en la clavija <span class="mono">${to}</span>.`,
    done: `Torre reconstruida en la clavija <span class="mono">C</span> en <span class="mono">${MIN_MOVES}</span> movimientos — ¡el mínimo! ✨`,
    cardMovesTitle: 'Movimientos',
    cardMovesSub: (n) => `mínimo 2^${n} − 1 = ${Math.pow(2, n) - 1}`,
    cardDisksTitle: 'Discos',
    cardDisksSub: 'el más grande abajo',
    cardRuleTitle: 'Regla',
    cardRuleSub: 'nunca un disco grande sobre uno chico',
  },
};

// CSS propio de la escena, autoinyectado una sola vez (no editamos index.html).
const CSS_HREF = './css/scene-tower-of-hanoi.css';
if (!document.querySelector(`link[data-scene="tower-of-hanoi"]`)) {
  document.head.append(
    el('link', { rel: 'stylesheet', href: CSS_HREF, dataset: { scene: 'tower-of-hanoi' } }),
  );
}

// Construye la lista de movimientos corriendo la recursión estándar.
// Cada paso es { type:'move', disk, from, to }; cierra con { type:'done' }.
function buildTrace(n) {
  const steps = [];
  function hanoi(k, from, to, via) {
    if (k === 0) return;
    hanoi(k - 1, from, via, to);
    steps.push({ type: 'move', disk: k, from, to });
    hanoi(k - 1, via, to, from);
  }
  hanoi(n, 'A', 'C', 'B');
  steps.push({ type: 'done' });
  return steps;
}

// Colores por tamaño de disco (1 = más chico … N = más grande).
const DISK_COLORS = [
  ['#fde68a', '#f59e0b'], // 1
  ['#7dd3fc', '#0ea5e9'], // 2
  ['#a5b4fc', '#6366f1'], // 3
  ['#5eead4', '#14b8a6'], // 4
];

export default function mountTowerOfHanoi(host, meta) {
  const S = STRINGS[getLang()] || STRINGS.en;

  // Estado lógico: cada clavija es una pila de números de disco (tope = último).
  let pegs = { A: [], B: [], C: [] };

  // ── DOM de las clavijas ─────────────────────────────────────────────
  const pegEls = {}; // letra → { col, stack }
  const diskEls = {}; // número de disco → nodo DOM (identidad estable)

  for (let d = N; d >= 1; d--) {
    const [c1, c2] = DISK_COLORS[(d - 1) % DISK_COLORS.length];
    const widthPct = 30 + (d / N) * 70; // 30%..100% del ancho de clavija
    const disk = el(
      'div',
      {
        class: 'toh-disk',
        style: {
          width: `${widthPct}%`,
          background: `linear-gradient(180deg, ${c1}, ${c2})`,
        },
      },
      el('span', { class: 'toh-disk-cap mono' }, String(d)),
    );
    diskEls[d] = disk;
  }

  const pegLabels = { A: S.pegSource, B: S.pegAux, C: S.pegTarget };
  const pegsRow = el('div', { class: 'toh-pegs' });
  PEGS.forEach((letter) => {
    const stack = el('div', { class: 'toh-stack' });
    const rod = el('div', { class: 'toh-rod' });
    const baseTile = el('div', { class: 'toh-peg-base' });
    const col = el(
      'div',
      { class: 'toh-peg', dataset: { peg: letter } },
      rod,
      stack,
      baseTile,
      el(
        'div',
        { class: 'toh-peg-label' },
        el('span', { class: 'toh-peg-letter mono' }, letter),
        el('span', { class: 'toh-peg-role' }, pegLabels[letter]),
      ),
    );
    pegEls[letter] = { col, stack };
    pegsRow.append(col);
  });

  const moveTag = el(
    'div',
    { class: 'toh-move-tag' },
    el('span', { class: 'toh-move-count mono' }, '0'),
    el('span', { class: 'toh-move-min' }, `/ ${MIN_MOVES}`),
  );
  const moveCountEl = moveTag.querySelector('.toh-move-count');

  const narrator = el('div', { class: 'narrator' }, S.ready);
  const canvas = el('div', { class: 'stage-canvas toh-stage' }, moveTag, pegsRow, narrator);

  // ── Render: redibuja las pilas según el estado lógico ───────────────
  function renderPegs() {
    PEGS.forEach((letter) => {
      const { stack } = pegEls[letter];
      clear(stack);
      // de abajo (índice 0) hacia arriba (tope): el flex apila en columna inversa
      pegs[letter].forEach((d) => stack.append(diskEls[d]));
    });
  }

  function setNarration(html) {
    narrator.innerHTML = html;
  }

  function resetVisual() {
    // estado inicial: torre completa en A, del más grande (N) abajo al 1 arriba
    pegs = { A: [], B: [], C: [] };
    for (let d = N; d >= 1; d--) pegs.A.push(d);
    PEGS.forEach((l) => pegEls[l].col.classList.remove('toh-active'));
    Object.values(diskEls).forEach((dk) =>
      dk.classList.remove('toh-lift', 'toh-land', 'toh-moving'),
    );
    renderPegs();
    moveCountEl.textContent = '0';
    setNarration(S.ready);
  }

  function apply(step, ctx) {
    const animate = ctx && ctx.animate;

    if (step.type === 'done') {
      PEGS.forEach((l) => pegEls[l].col.classList.remove('toh-active'));
      pegEls.C.col.classList.add('toh-active');
      setTimeout(() => pegEls.C.col.classList.remove('toh-active'), 800);
      return S.done;
    }

    // movimiento legal: el disco del tope de `from` va al tope de `to`
    PEGS.forEach((l) => pegEls[l].col.classList.remove('toh-active'));
    pegEls[step.from].col.classList.add('toh-active');
    pegEls[step.to].col.classList.add('toh-active');

    pegs[step.from].pop();
    pegs[step.to].push(step.disk);
    renderPegs();

    moveCountEl.textContent = String(ctx ? ctx.index + 1 : '');

    const disk = diskEls[step.disk];
    if (animate) {
      disk.classList.remove('toh-land');
      void disk.offsetWidth; // reflow
      disk.classList.add('toh-land');
      disk.addEventListener('animationend', () => disk.classList.remove('toh-land'), {
        once: true,
      });
    }

    return S.move(step.disk, step.from, step.to);
  }

  // ── Player + transporte ─────────────────────────────────────────────
  const player = new Player({
    steps: buildTrace(N),
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
    infoCard(S.cardMovesTitle, el('span', { class: 'big' }, String(MIN_MOVES)), S.cardMovesSub(N)),
    infoCard(S.cardDisksTitle, el('span', { class: 'big' }, String(N)), S.cardDisksSub),
    infoCard(S.cardRuleTitle, el('span', { class: 'big' }, 'LIFO'), S.cardRuleSub),
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
