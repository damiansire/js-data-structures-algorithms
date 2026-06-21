// Escena: N-Queens — "Colocar reinas en un tablero sin que se ataquen".
//
// Backtracking real con N=6, buscando la PRIMERA solución (traza acotada):
//   placeRow(row):
//     if (row === N) -> ¡resuelto!
//     for (col = 0..N-1):
//       try(row, col)
//       if (isSafe(row, col)) -> place(row, col); placeRow(row+1)
//       else                  -> conflict(row, col)  (misma columna/diagonal)
//     si ningún col sirvió en `row` -> BACKTRACK: se quita la reina de la
//     fila anterior y se prueba su próxima columna.
//
// Visual: tablero 6×6 (patrón de ajedrez). PROBAR una casilla la hace
// parpadear; si choca se pinta de ROJO y se explica el conflicto (misma
// columna o diagonal); COLOCAR fija una ♛ dorada; RETROCEDER desvanece una
// reina ya puesta. Mostramos la fila actual y un contador de backtracks.

import { el, clear } from '../dom.js';
import { Player, buildTransport } from '../player.js';
import { getLang } from '../i18n.js';

const N = 6;

// ── Strings bilingües (inglés por defecto, español opcional) ──────────
const STRINGS = {
  en: {
    ready: 'Ready to play.',
    reset: 'Ready to play. Place one queen per row so none attack each other.',
    try: (row, col) =>
      `Row <span class="mono">${row}</span>: trying column <span class="mono">${col}</span>…`,
    conflictCol: (row, col, qrow) =>
      `❌ Column <span class="mono">${col}</span> clashes: a queen on row <span class="mono">${qrow}</span> shares the <b>same column</b>.`,
    conflictDiag: (row, col, qrow, qcol) =>
      `❌ Square <span class="mono">(${row},${col})</span> clashes: the queen at <span class="mono">(${qrow},${qcol})</span> is on the <b>same diagonal</b>.`,
    place: (row, col) =>
      `✔ Safe! Queen ♛ placed at <span class="mono">(${row},${col})</span>. On to the next row.`,
    backtrack: (row, col) =>
      `↩ Dead end in row <span class="mono">${row + 1}</span>. <b>Backtrack</b>: remove the queen at <span class="mono">(${row},${col})</span> and try its next column.`,
    solved: (out) =>
      `👑 Solved! A valid 6-queens arrangement: columns <span class="mono">[${out}]</span> ✨`,
    cardAlgoTitle: 'Algorithm',
    cardAlgoSub: 'place 1 queen / row',
    cardRowTitle: 'Solving row',
    cardRowSub: 'current depth',
    cardBackTitle: 'Backtracks',
    cardBackSub: 'dead ends undone',
    cardBoardTitle: 'Board',
    cardBoardSub: 'first solution',
    rowIdle: '—',
  },
  es: {
    ready: 'Listo para reproducir.',
    reset: 'Listo para reproducir. Colocá una reina por fila sin que se ataquen.',
    try: (row, col) =>
      `Fila <span class="mono">${row}</span>: probando columna <span class="mono">${col}</span>…`,
    conflictCol: (row, col, qrow) =>
      `❌ La columna <span class="mono">${col}</span> choca: una reina en la fila <span class="mono">${qrow}</span> comparte la <b>misma columna</b>.`,
    conflictDiag: (row, col, qrow, qcol) =>
      `❌ La casilla <span class="mono">(${row},${col})</span> choca: la reina en <span class="mono">(${qrow},${qcol})</span> está en la <b>misma diagonal</b>.`,
    place: (row, col) =>
      `✔ ¡Segura! Reina ♛ colocada en <span class="mono">(${row},${col})</span>. Voy a la próxima fila.`,
    backtrack: (row, col) =>
      `↩ Sin salida en la fila <span class="mono">${row + 1}</span>. <b>Retrocedo</b>: quito la reina de <span class="mono">(${row},${col})</span> y pruebo su próxima columna.`,
    solved: (out) =>
      `👑 ¡Resuelto! Una disposición válida de 6 reinas: columnas <span class="mono">[${out}]</span> ✨`,
    cardAlgoTitle: 'Algoritmo',
    cardAlgoSub: '1 reina / fila',
    cardRowTitle: 'Resolviendo fila',
    cardRowSub: 'profundidad actual',
    cardBackTitle: 'Retrocesos',
    cardBackSub: 'callejones deshechos',
    cardBoardTitle: 'Tablero',
    cardBoardSub: 'primera solución',
    rowIdle: '—',
  },
};

// CSS propio de la escena, autoinyectado una sola vez (no editamos index.html).
const CSS_HREF = './css/scene-n-queens.css';
if (!document.querySelector(`link[data-scene="n-queens"]`)) {
  document.head.append(
    el('link', { rel: 'stylesheet', href: CSS_HREF, dataset: { scene: 'n-queens' } }),
  );
}

/**
 * Corre el backtracking REAL y emite la traza paso a paso. `queens[row]` es la
 * columna ocupada por la reina de esa fila (o undefined). Se detiene en la
 * primera solución completa.
 */
function buildTrace() {
  const steps = [];
  const queens = []; // queens[r] = col

  // ¿Es segura (row, col) contra las reinas ya colocadas? Si no, devuelve la
  // reina que la ataca y el motivo, para narrar el conflicto.
  const conflict = (row, col) => {
    for (let r = 0; r < row; r++) {
      const c = queens[r];
      if (c === col) return { kind: 'col', qrow: r, qcol: c };
      if (Math.abs(c - col) === Math.abs(r - row)) return { kind: 'diag', qrow: r, qcol: c };
    }
    return null;
  };

  let solved = false;
  function placeRow(row) {
    if (row === N) {
      solved = true;
      return true;
    }
    for (let col = 0; col < N; col++) {
      steps.push({ type: 'try', row, col });
      const hit = conflict(row, col);
      if (hit) {
        steps.push({ type: 'conflict', row, col, ...hit });
        continue;
      }
      queens[row] = col;
      steps.push({ type: 'place', row, col });
      if (placeRow(row + 1)) return true;
      // el subárbol falló: retrocede esta reina y sigue con la próxima columna
      steps.push({ type: 'backtrack', row, col });
      queens[row] = undefined;
    }
    return false;
  }
  placeRow(0);

  steps.push({ type: 'solved', solution: queens.slice() });
  return { steps, solution: solved ? queens.slice() : [] };
}

export default function mountNQueens(host, meta) {
  const S = STRINGS[getLang()] || STRINGS.en;
  const accent = (meta && meta.accent) || '#38bdf8';

  // ── Tablero 6×6 (patrón de ajedrez) ─────────────────────────────────
  const cells = []; // cells[row*N + col]
  const board = el('div', { class: 'nq-board' });
  for (let row = 0; row < N; row++) {
    for (let col = 0; col < N; col++) {
      const dark = (row + col) % 2 === 1;
      const cell = el(
        'div',
        { class: `nq-cell ${dark ? 'nq-dark' : 'nq-light'}` },
        el('span', { class: 'nq-queen' }, '♛'),
      );
      cell._row = row;
      cell._col = col;
      cells.push(cell);
      board.append(cell);
    }
  }
  const cellAt = (row, col) => cells[row * N + col];

  // ── Lienzo ──────────────────────────────────────────────────────────
  const narrator = el('div', { class: 'narrator' }, S.ready);
  const canvas = el(
    'div',
    { class: 'stage-canvas nq-stage' },
    el('div', { class: 'nq-board-wrap' }, board),
    narrator,
  );

  // ── Aside: fila actual + contador de backtracks ─────────────────────
  const rowValue = el('span', { class: 'big mono' }, S.rowIdle);
  const backValue = el('span', { class: 'big mono' }, '0');
  let backtracks = 0;

  function setNarration(html) {
    narrator.innerHTML = html;
  }
  function clearTransient() {
    cells.forEach((c) => c.classList.remove('nq-trying', 'nq-conflict', 'nq-attacker'));
  }

  function resetVisual() {
    clearTransient();
    cells.forEach((c) => c.classList.remove('nq-placed', 'nq-removing'));
    backtracks = 0;
    backValue.textContent = '0';
    rowValue.textContent = S.rowIdle;
    setNarration(S.reset);
  }

  function apply(step, ctx) {
    const animate = ctx && ctx.animate;
    clearTransient();

    switch (step.type) {
      case 'try': {
        rowValue.textContent = String(step.row);
        const cell = cellAt(step.row, step.col);
        cell.classList.add('nq-trying');
        return S.try(step.row, step.col);
      }
      case 'conflict': {
        const cell = cellAt(step.row, step.col);
        cell.classList.add('nq-conflict');
        cellAt(step.qrow, step.qcol).classList.add('nq-attacker');
        return step.kind === 'col'
          ? S.conflictCol(step.row, step.col, step.qrow)
          : S.conflictDiag(step.row, step.col, step.qrow, step.qcol);
      }
      case 'place': {
        rowValue.textContent = String(step.row);
        cellAt(step.row, step.col).classList.add('nq-placed');
        return S.place(step.row, step.col);
      }
      case 'backtrack': {
        backtracks += 1;
        backValue.textContent = String(backtracks);
        rowValue.textContent = String(step.row);
        const cell = cellAt(step.row, step.col);
        if (animate) {
          cell.classList.add('nq-removing');
          setTimeout(() => cell.classList.remove('nq-placed', 'nq-removing'), 360);
        } else {
          cell.classList.remove('nq-placed', 'nq-removing');
        }
        return S.backtrack(step.row, step.col);
      }
      case 'solved': {
        clearTransient();
        cells.forEach((c) => {
          if (c.classList.contains('nq-placed')) {
            const k = c._row * N + c._col;
            if (animate) setTimeout(() => c.classList.add('nq-win'), k * 40);
            else c.classList.add('nq-win');
          }
        });
        rowValue.textContent = String(N);
        return S.solved(step.solution.join(', '));
      }
    }
  }

  const { steps, solution } = buildTrace();

  const player = new Player({
    steps,
    apply,
    reset: resetVisual,
    baseDelay: 620,
  });
  const { bar, sync } = buildTransport(player);
  player.onChange = (s) => {
    sync(s);
    if (s.narration) setNarration(s.narration);
  };

  const stage = el('div', { class: 'stage' }, canvas, bar);
  const aside = el(
    'div',
    { class: 'scene-aside', style: { '--card-accent': accent } },
    infoCard(S.cardAlgoTitle, el('span', { class: 'big' }, 'Backtracking'), S.cardAlgoSub),
    infoCard(S.cardRowTitle, rowValue, S.cardRowSub),
    infoCard(S.cardBackTitle, backValue, S.cardBackSub),
    infoCard(S.cardBoardTitle, el('code', {}, `[${solution.join(', ')}]`), S.cardBoardSub),
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
