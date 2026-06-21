// Escena: Levenshtein edit distance — "Autocorrector transformando una palabra en otra".
//
// Trace FIEL al DP estándar de distancia de edición:
//   dp[i][0] = i ; dp[0][j] = j
//   dp[i][j] = (a[i-1] === b[j-1])
//                ? dp[i-1][j-1]                                  // coinciden
//                : 1 + min(dp[i-1][j]   delete,                  // arriba
//                          dp[i][j-1]   insert,                  // izquierda
//                          dp[i-1][j-1] replace)                 // diagonal
//   respuesta = dp[m][n]
//
// Visual: la GRILLA de DP como tabla. Las dos palabras viven en los ejes
// (letras como cabeceras). Se rellena celda por celda (row-major). Por cada
// celda se iluminan las TRES vecinas de las que depende (arriba=borrar,
// izquierda=insertar, diagonal=reemplazar/coincidir) y se marca el mínimo
// elegido. Las celdas de coincidencia (letras iguales) quedan verdes. Al final
// se ilumina la celda inferior-derecha (la distancia) y se reconstruye el
// camino óptimo (backtrack).

import { el, clear } from '../dom.js';
import { Player, buildTransport } from '../player.js';
import { getLang } from '../i18n.js';

const WORD_A = 'KITTEN'; // filas (eje vertical)
const WORD_B = 'SITTING'; // columnas (eje horizontal)
const A = WORD_A.split('');
const B = WORD_B.split('');
const M = A.length; // 6
const N = B.length; // 7

// ── Strings bilingües (inglés por defecto, español opcional) ──────────
const STRINGS = {
  en: {
    ready: 'Ready to play. The autocorrect morphs one word into the other.',
    seedRow: (i) =>
      `Base case: to build the first <span class="mono">${i}</span> letter${i === 1 ? '' : 's'} from nothing costs <span class="mono">${i}</span> insertion${i === 1 ? '' : 's'}.`,
    seedCol: (j) =>
      `Base case: deleting <span class="mono">${j}</span> letter${j === 1 ? '' : 's'} down to nothing costs <span class="mono">${j}</span>.`,
    seedCorner: 'Top-left corner is <span class="mono">0</span>: empty → empty, no edits needed.',
    match: (a, value) =>
      `Letters match (<span class="mono">${a}</span>). Carry the diagonal straight through → <span class="mono">${value}</span>, free.`,
    pick: (a, b, op, value) =>
      `<span class="mono">${a}</span> ≠ <span class="mono">${b}</span> → cheapest neighbor + 1 = <span class="mono">${value}</span> (${op}).`,
    done: (d) =>
      `Done. The edit distance from <span class="mono">${WORD_A}</span> to <span class="mono">${WORD_B}</span> is <span class="mono">${d}</span> ✨`,
    path: 'Backtracking the optimal path of edits 🪄',
    opDelete: 'delete',
    opInsert: 'insert',
    opReplace: 'replace',
    opMatch: 'keep',
    legendUp: 'up = delete',
    legendLeft: 'left = insert',
    legendDiag: 'diag = replace / match',
    cardDistTitle: 'Edit distance',
    cardDistSub: 'bottom-right cell',
    cardAlgoTitle: 'Algorithm',
    cardAlgoSub: 'DP grid, row-major',
    cardComplexityTitle: 'Complexity',
    cardComplexitySub: 'O(m·n) time & space',
    cardWordsTitle: 'Words',
    cardWordsSub: `${M}×${N} grid`,
    opsTitle: 'Operations',
    opsWaiting: 'computing…',
  },
  es: {
    ready: 'Listo para reproducir. El autocorrector transforma una palabra en la otra.',
    seedRow: (i) =>
      `Caso base: construir las primeras <span class="mono">${i}</span> letra${i === 1 ? '' : 's'} desde la nada cuesta <span class="mono">${i}</span> inserción${i === 1 ? '' : 'es'}.`,
    seedCol: (j) =>
      `Caso base: borrar <span class="mono">${j}</span> letra${j === 1 ? '' : 's'} hasta la nada cuesta <span class="mono">${j}</span>.`,
    seedCorner:
      'La esquina superior izquierda es <span class="mono">0</span>: vacío → vacío, sin ediciones.',
    match: (a, value) =>
      `Las letras coinciden (<span class="mono">${a}</span>). Paso la diagonal de largo → <span class="mono">${value}</span>, gratis.`,
    pick: (a, b, op, value) =>
      `<span class="mono">${a}</span> ≠ <span class="mono">${b}</span> → vecino más barato + 1 = <span class="mono">${value}</span> (${op}).`,
    done: (d) =>
      `Listo. La distancia de edición de <span class="mono">${WORD_A}</span> a <span class="mono">${WORD_B}</span> es <span class="mono">${d}</span> ✨`,
    path: 'Reconstruyendo el camino óptimo de ediciones 🪄',
    opDelete: 'borrar',
    opInsert: 'insertar',
    opReplace: 'reemplazar',
    opMatch: 'conservar',
    legendUp: 'arriba = borrar',
    legendLeft: 'izquierda = insertar',
    legendDiag: 'diagonal = reemplazar / coincide',
    cardDistTitle: 'Distancia de edición',
    cardDistSub: 'celda inferior derecha',
    cardAlgoTitle: 'Algoritmo',
    cardAlgoSub: 'grilla DP, por filas',
    cardComplexityTitle: 'Complejidad',
    cardComplexitySub: 'O(m·n) tiempo y espacio',
    cardWordsTitle: 'Palabras',
    cardWordsSub: `grilla ${M}×${N}`,
    opsTitle: 'Operaciones',
    opsWaiting: 'calculando…',
  },
};

// CSS propio de la escena, autoinyectado una sola vez (no editamos index.html).
const CSS_HREF = './css/scene-levenshtein.css';
if (!document.querySelector(`link[data-scene="levenshtein"]`)) {
  document.head.append(
    el('link', { rel: 'stylesheet', href: CSS_HREF, dataset: { scene: 'levenshtein' } }),
  );
}

/**
 * Construye los pasos del DP real. Cada celda interior produce un paso `fill`
 * que registra el valor, la operación elegida y las celdas vecinas. También
 * sembramos la fila/columna base, marcamos la respuesta y el camino óptimo.
 */
function buildTrace(a, b) {
  const m = a.length;
  const n = b.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  const steps = [];

  // Esquina + sembrado de bordes (dp[i][0]=i, dp[0][j]=j)
  steps.push({ type: 'seed', i: 0, j: 0, value: 0, kind: 'corner' });
  for (let j = 1; j <= n; j++) {
    dp[0][j] = j;
    steps.push({ type: 'seed', i: 0, j, value: j, kind: 'row' });
  }
  for (let i = 1; i <= m; i++) {
    dp[i][0] = i;
    steps.push({ type: 'seed', i, j: 0, value: i, kind: 'col' });
  }

  // Relleno row-major de las celdas interiores
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const matched = a[i - 1] === b[j - 1];
      const up = dp[i - 1][j]; // delete
      const left = dp[i][j - 1]; // insert
      const diag = dp[i - 1][j - 1]; // replace / match
      let value;
      let op;
      if (matched) {
        value = diag;
        op = 'match';
      } else {
        value = 1 + Math.min(up, left, diag);
        if (diag <= up && diag <= left) op = 'replace';
        else if (left <= up) op = 'insert';
        else op = 'delete';
      }
      dp[i][j] = value;
      steps.push({
        type: 'fill',
        i,
        j,
        value,
        op,
        matched,
        a: a[i - 1],
        b: b[j - 1],
        up,
        left,
        diag,
      });
    }
  }

  // Marca la respuesta (celda inferior derecha)
  steps.push({ type: 'answer', i: m, j: n, value: dp[m][n] });

  // Backtrack del camino óptimo (de la esquina inferior-derecha al origen)
  const path = [];
  let i = m;
  let j = n;
  while (i > 0 || j > 0) {
    path.push({ i, j });
    if (i > 0 && j > 0) {
      const matched = a[i - 1] === b[j - 1];
      const diag = dp[i - 1][j - 1];
      if (matched && dp[i][j] === diag) {
        i--;
        j--;
        continue;
      }
      const up = dp[i - 1][j];
      const left = dp[i][j - 1];
      const best = Math.min(up, left, diag);
      if (diag === best) {
        i--;
        j--;
      } else if (up === best) {
        i--;
      } else {
        j--;
      }
    } else if (i > 0) {
      i--;
    } else {
      j--;
    }
  }
  path.push({ i: 0, j: 0 });
  path.reverse();
  steps.push({ type: 'path', cells: path });

  return { steps, distance: dp[m][n] };
}

export default function mountLevenshtein(host, meta) {
  const S = STRINGS[getLang()] || STRINGS.en;
  const { steps } = buildTrace(A, B);

  // ── Construcción de la grilla DP como tabla ─────────────────────────
  // Fila 0: esquina vacía + cabecera "∅" + letras de B.
  // Filas: cabecera "∅"/letras de A + celdas dp.
  const cells = {}; // clave `${i}_${j}` → elemento de celda interior/borde
  const grid = el('div', { class: 'lev-grid' });

  // Cabecera de columnas (palabra B)
  grid.append(el('div', { class: 'lev-corner-head' })); // esquina vacía
  grid.append(el('div', { class: 'lev-col-head lev-empty-head' }, '∅'));
  B.forEach((ch, idx) => {
    grid.append(el('div', { class: 'lev-col-head', dataset: { col: String(idx + 1) } }, ch));
  });

  // Cuerpo
  for (let i = 0; i <= M; i++) {
    // Cabecera de fila (palabra A)
    const rowLabel = i === 0 ? '∅' : A[i - 1];
    grid.append(
      el('div', { class: 'lev-row-head' + (i === 0 ? ' lev-empty-head' : '') }, rowLabel),
    );
    for (let j = 0; j <= N; j++) {
      const cell = el(
        'div',
        { class: 'lev-cell', dataset: { i: String(i), j: String(j) } },
        el('span', { class: 'lev-val' }, ''),
      );
      if (i === 0 || j === 0) cell.classList.add('lev-border');
      cells[`${i}_${j}`] = cell;
      grid.append(cell);
    }
  }
  grid.style.setProperty('--lev-cols', String(N + 1));

  const gridWrap = el('div', { class: 'lev-grid-wrap' }, grid);

  // Leyenda de dependencias
  const legend = el(
    'div',
    { class: 'lev-legend' },
    el('span', { class: 'lev-leg lev-leg-up' }, S.legendUp),
    el('span', { class: 'lev-leg lev-leg-left' }, S.legendLeft),
    el('span', { class: 'lev-leg lev-leg-diag' }, S.legendDiag),
  );

  const narrator = el('div', { class: 'narrator' }, S.ready);
  const canvas = el(
    'div',
    { class: 'stage-canvas lev-stage' },
    el(
      'div',
      { class: 'lev-words' },
      el('span', { class: 'lev-word lev-word-a mono' }, WORD_A),
      el('span', { class: 'lev-arrow' }, '→'),
      el('span', { class: 'lev-word lev-word-b mono' }, WORD_B),
    ),
    gridWrap,
    legend,
    narrator,
  );

  // ── Panel de distancia / operaciones en el aside ────────────────────
  const distValue = el('span', { class: 'lev-dist-num mono' }, '·');
  const opsList = el(
    'div',
    { class: 'lev-ops' },
    el('span', { class: 'lev-ops-wait' }, S.opsWaiting),
  );

  // ── Helpers de render ───────────────────────────────────────────────
  function setNarration(html) {
    narrator.innerHTML = html;
  }
  const cellOf = (i, j) => cells[`${i}_${j}`];
  function setCellValue(i, j, value) {
    const c = cellOf(i, j);
    c.querySelector('.lev-val').textContent = String(value);
  }
  function clearDeps() {
    Object.values(cells).forEach((c) =>
      c.classList.remove('lev-dep-up', 'lev-dep-left', 'lev-dep-diag', 'lev-active'),
    );
  }

  function opLabel(op) {
    if (op === 'delete') return S.opDelete;
    if (op === 'insert') return S.opInsert;
    if (op === 'replace') return S.opReplace;
    return S.opMatch;
  }

  function resetVisual() {
    clearDeps();
    Object.values(cells).forEach((c) => {
      c.classList.remove('lev-filled', 'lev-match', 'lev-answer', 'lev-path', 'lev-seeded');
      c.querySelector('.lev-val').textContent = '';
    });
    distValue.textContent = '·';
    distValue.classList.remove('lev-dist-live');
    clear(opsList);
    opsList.append(el('span', { class: 'lev-ops-wait' }, S.opsWaiting));
    setNarration(S.ready);
  }

  function apply(step) {
    if (step.type === 'seed') {
      clearDeps();
      const c = cellOf(step.i, step.j);
      setCellValue(step.i, step.j, step.value);
      c.classList.add('lev-seeded');
      if (step.kind === 'corner') return S.seedCorner;
      if (step.kind === 'row') return S.seedRow(step.j);
      return S.seedCol(step.i);
    }

    if (step.type === 'fill') {
      clearDeps();
      const c = cellOf(step.i, step.j);
      c.classList.add('lev-active');
      // resalta las tres vecinas de las que depende
      cellOf(step.i - 1, step.j).classList.add('lev-dep-up');
      cellOf(step.i, step.j - 1).classList.add('lev-dep-left');
      cellOf(step.i - 1, step.j - 1).classList.add('lev-dep-diag');

      setCellValue(step.i, step.j, step.value);
      c.classList.add('lev-filled');
      if (step.matched) {
        c.classList.add('lev-match');
        return S.match(step.a, step.value);
      }
      return S.pick(step.a, step.b, opLabel(step.op), step.value);
    }

    if (step.type === 'answer') {
      clearDeps();
      const c = cellOf(step.i, step.j);
      c.classList.add('lev-answer');
      distValue.textContent = String(step.value);
      distValue.classList.add('lev-dist-live');
      return S.done(step.value);
    }

    if (step.type === 'path') {
      clearDeps();
      step.cells.forEach((p) => cellOf(p.i, p.j).classList.add('lev-path'));
      // reconstruye la lista de operaciones a partir del camino
      renderOps(step.cells);
      return S.path;
    }
  }

  // A partir de las celdas del camino, deduce las operaciones legibles.
  function renderOps(pathCells) {
    clear(opsList);
    const ops = [];
    for (let k = 1; k < pathCells.length; k++) {
      const prev = pathCells[k - 1];
      const cur = pathCells[k];
      const di = cur.i - prev.i;
      const dj = cur.j - prev.j;
      if (di === 1 && dj === 1) {
        const same = A[cur.i - 1] === B[cur.j - 1];
        ops.push(
          same
            ? { kind: 'match', text: A[cur.i - 1] }
            : { kind: 'replace', from: A[cur.i - 1], to: B[cur.j - 1] },
        );
      } else if (di === 1) {
        ops.push({ kind: 'delete', text: A[cur.i - 1] });
      } else if (dj === 1) {
        ops.push({ kind: 'insert', text: B[cur.j - 1] });
      }
    }
    ops.forEach((o) => {
      let body;
      let cls;
      if (o.kind === 'match') {
        cls = 'lev-op-match';
        body = `${opLabel('match')} ${o.text}`;
      } else if (o.kind === 'replace') {
        cls = 'lev-op-replace';
        body = `${opLabel('replace')} ${o.from}→${o.to}`;
      } else if (o.kind === 'delete') {
        cls = 'lev-op-delete';
        body = `${opLabel('delete')} ${o.text}`;
      } else {
        cls = 'lev-op-insert';
        body = `${opLabel('insert')} ${o.text}`;
      }
      opsList.append(el('span', { class: `lev-op ${cls} mono` }, body));
    });
  }

  // ── Player + transporte ─────────────────────────────────────────────
  const player = new Player({
    steps,
    apply,
    reset: resetVisual,
    baseDelay: 560,
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
    infoCard(S.cardDistTitle, distValue, S.cardDistSub),
    el('div', { class: 'info-card lev-ops-card' }, el('h4', {}, S.opsTitle), opsList),
    infoCard(S.cardAlgoTitle, el('span', { class: 'big' }, 'DP'), S.cardAlgoSub),
    infoCard(S.cardComplexityTitle, el('span', { class: 'big' }, 'O(m·n)'), S.cardComplexitySub),
    infoCard(S.cardWordsTitle, el('code', {}, `${WORD_A} → ${WORD_B}`), S.cardWordsSub),
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
