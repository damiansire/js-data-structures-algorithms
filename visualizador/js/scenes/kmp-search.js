// Escena: KMP String Matching — "Una regla que nunca retrocede".
//
// Trace FIEL al algoritmo KMP estándar:
//   1) buildLps(pattern): para cada j, lps[j] = longitud del prefijo propio más
//      largo que también es sufijo de pattern[0..j]. Se construye con dos
//      punteros (len = longitud del candidato; i recorre el patrón):
//        if p[i] === p[len]  → len++, lps[i] = len, i++
//        else if len > 0     → len = lps[len-1]   (no avanza i)
//        else                → lps[i] = 0, i++
//   2) match(text, pattern, lps): i recorre el texto, j el patrón.
//        if t[i] === p[j]    → i++, j++         (ambos avanzan)
//        if j === m          → ¡match en i-j!, j = lps[j-1]
//        else (mismatch)     → if j > 0 j = lps[j-1]   (la regla "salta" hacia
//                              adelante; i NUNCA retrocede)
//                              else i++          (j ya está en 0)
//
// Metáfora: el texto es una fila de tiles-letra. El patrón es una "regla" más
// corta debajo que se desliza hacia la DERECHA. Los caracteres que coinciden
// brillan en verde; ante un MISMATCH la regla salta hacia adelante por la
// cantidad que indica el LPS (NO vuelve al inicio) y el puntero i del texto
// NUNCA retrocede. Mostramos el array LPS y los punteros i (texto) y j (patrón).

import { el, clear } from '../dom.js';
import { Player, buildTransport } from '../player.js';
import { getLang } from '../i18n.js';

const TEXT = 'ABABCABABA';
const PATTERN = 'ABABA';

// ── Strings bilingües (inglés por defecto, español opcional) ──────────
const STRINGS = {
  en: {
    ready: 'Ready to play.',
    textLabel: 'TEXT',
    patternLabel: 'PATTERN · the ruler',
    lpsLabel: 'LPS · failure function',
    buildIntro:
      'First I build the <span class="mono">LPS</span> table: for each position, the longest prefix that is also a suffix.',
    lpsMatch: (i, len) =>
      `<span class="mono">p[${i}]</span> extends the prefix → <span class="mono">lps[${i}] = ${len}</span>.`,
    lpsFallback: (len) =>
      `Mismatch building LPS → fall back to <span class="mono">lps[len-1] = ${len}</span> (without moving forward).`,
    lpsZero: (i) => `No prefix here → <span class="mono">lps[${i}] = 0</span>.`,
    lpsDone: 'LPS table ready. Now the ruler can <b>slide forward</b> without ever sliding back.',
    charMatch: (ch, i, j) =>
      `<span class="mono">text[${i}]=${ch}</span> = <span class="mono">pat[${j}]=${ch}</span> ✓ both pointers advance.`,
    mismatchShift: (newJ, i) =>
      `Mismatch. The ruler jumps forward to <span class="mono">j = ${newJ}</span> — <span class="mono">i = ${i}</span> never moves back.`,
    mismatchZero: (i) =>
      `Mismatch with <span class="mono">j = 0</span> → just advance <span class="mono">i = ${i}</span>.`,
    found: (pos) => `Full match! Pattern found at index <span class="mono">${pos}</span> 🎯`,
    done: (n) =>
      n === 1
        ? 'Scan complete — <b>1</b> match found. The ruler never slid back. ✨'
        : `Scan complete — <b>${n}</b> matches found. The ruler never slid back. ✨`,
    cardComplexityTitle: 'Complexity',
    cardComplexitySub: 'i never backtracks',
    cardLpsTitle: 'LPS array',
    cardLpsSub: 'longest prefix = suffix',
    cardPointersTitle: 'Pointers',
    cardPointersSub: 'i = text · j = pattern',
  },
  es: {
    ready: 'Listo para reproducir.',
    textLabel: 'TEXTO',
    patternLabel: 'PATRÓN · la regla',
    lpsLabel: 'LPS · función de fallo',
    buildIntro:
      'Primero construyo la tabla <span class="mono">LPS</span>: para cada posición, el prefijo más largo que también es sufijo.',
    lpsMatch: (i, len) =>
      `<span class="mono">p[${i}]</span> extiende el prefijo → <span class="mono">lps[${i}] = ${len}</span>.`,
    lpsFallback: (len) =>
      `Desajuste armando LPS → retrocedo a <span class="mono">lps[len-1] = ${len}</span> (sin avanzar).`,
    lpsZero: (i) => `Acá no hay prefijo → <span class="mono">lps[${i}] = 0</span>.`,
    lpsDone:
      'Tabla LPS lista. Ahora la regla puede <b>deslizarse hacia adelante</b> sin volver atrás nunca.',
    charMatch: (ch, i, j) =>
      `<span class="mono">texto[${i}]=${ch}</span> = <span class="mono">pat[${j}]=${ch}</span> ✓ ambos punteros avanzan.`,
    mismatchShift: (newJ, i) =>
      `Desajuste. La regla salta hacia adelante a <span class="mono">j = ${newJ}</span> — <span class="mono">i = ${i}</span> nunca retrocede.`,
    mismatchZero: (i) =>
      `Desajuste con <span class="mono">j = 0</span> → solo avanzo <span class="mono">i = ${i}</span>.`,
    found: (pos) =>
      `¡Coincidencia completa! Patrón encontrado en el índice <span class="mono">${pos}</span> 🎯`,
    done: (n) =>
      n === 1
        ? 'Recorrido completo — <b>1</b> coincidencia. La regla nunca volvió atrás. ✨'
        : `Recorrido completo — <b>${n}</b> coincidencias. La regla nunca volvió atrás. ✨`,
    cardComplexityTitle: 'Complejidad',
    cardComplexitySub: 'i nunca retrocede',
    cardLpsTitle: 'Array LPS',
    cardLpsSub: 'prefijo más largo = sufijo',
    cardPointersTitle: 'Punteros',
    cardPointersSub: 'i = texto · j = patrón',
  },
};

// CSS propio de la escena, autoinyectado una sola vez (no editamos index.html).
const CSS_HREF = './css/scene-kmp-search.css';
if (!document.querySelector(`link[data-scene="kmp-search"]`)) {
  document.head.append(
    el('link', { rel: 'stylesheet', href: CSS_HREF, dataset: { scene: 'kmp-search' } }),
  );
}

/**
 * Construye la tabla LPS para `pattern`, emitiendo un paso por cada decisión.
 * Devuelve { lps, steps }.
 */
function buildLpsTrace(pattern) {
  const m = pattern.length;
  const lps = new Array(m).fill(0);
  const steps = [];
  let len = 0;
  let i = 1;
  steps.push({ type: 'buildIntro' });
  while (i < m) {
    if (pattern[i] === pattern[len]) {
      len++;
      lps[i] = len;
      steps.push({ type: 'lpsMatch', i, len, lps: lps.slice() });
      i++;
    } else if (len > 0) {
      len = lps[len - 1];
      steps.push({ type: 'lpsFallback', len });
    } else {
      lps[i] = 0;
      steps.push({ type: 'lpsZero', i, lps: lps.slice() });
      i++;
    }
  }
  steps.push({ type: 'lpsDone' });
  return { lps, steps };
}

/**
 * Recorre el texto con KMP usando `lps`, emitiendo un paso por cada decisión.
 * Fiel al algoritmo: i sobre el texto, j sobre el patrón; i nunca retrocede.
 */
function buildMatchTrace(text, pattern, lps) {
  const n = text.length;
  const m = pattern.length;
  const steps = [];
  let i = 0;
  let j = 0;
  let matches = 0;
  while (i < n) {
    if (text[i] === pattern[j]) {
      steps.push({ type: 'charMatch', i, j, ch: text[i] });
      i++;
      j++;
      if (j === m) {
        matches++;
        const pos = i - j;
        steps.push({ type: 'found', pos, i, j });
        j = lps[j - 1];
        steps.push({ type: 'shift', newJ: j, i });
      }
    } else if (j > 0) {
      const newJ = lps[j - 1];
      j = newJ;
      steps.push({ type: 'mismatchShift', newJ, i, j });
    } else {
      i++;
      steps.push({ type: 'mismatchZero', i, j });
    }
  }
  steps.push({ type: 'done', matches });
  return steps;
}

export default function mountKmpSearch(host, meta = {}) {
  const S = STRINGS[getLang()] || STRINGS.en;
  const { lps, steps: lpsSteps } = buildLpsTrace(PATTERN);
  const matchSteps = buildMatchTrace(TEXT, PATTERN, lps);
  const steps = lpsSteps.concat(matchSteps);

  const n = TEXT.length;
  const m = PATTERN.length;

  // ── Fila de tiles del TEXTO ──────────────────────────────────────────
  const textTiles = [];
  for (let k = 0; k < n; k++) {
    const tile = el(
      'div',
      { class: 'kmp-tile' },
      el('span', { class: 'kmp-tile-ch' }, TEXT[k]),
      el('span', { class: 'kmp-tile-idx mono' }, String(k)),
    );
    textTiles.push(tile);
  }
  const textRow = el('div', { class: 'kmp-row kmp-text-row' }, ...textTiles);
  const textWrap = el(
    'div',
    { class: 'kmp-rowwrap' },
    el('span', { class: 'kmp-rowlabel' }, S.textLabel),
    textRow,
  );

  // Puntero i (texto): un cursor que se mueve sobre la fila del texto.
  const iCursor = el(
    'div',
    { class: 'kmp-cursor kmp-cursor-i' },
    el('span', { class: 'kmp-cursor-tag mono' }, 'i'),
  );

  // ── La REGLA (el patrón) que se desliza ──────────────────────────────
  const patTiles = [];
  for (let k = 0; k < m; k++) {
    const tile = el(
      'div',
      { class: 'kmp-tile kmp-pat-tile' },
      el('span', { class: 'kmp-tile-ch' }, PATTERN[k]),
      el('span', { class: 'kmp-tile-idx mono' }, String(k)),
    );
    patTiles.push(tile);
  }
  const ruler = el('div', { class: 'kmp-ruler' }, ...patTiles);
  const patRow = el('div', { class: 'kmp-row kmp-pat-row' }, ruler);
  const patWrap = el(
    'div',
    { class: 'kmp-rowwrap' },
    el('span', { class: 'kmp-rowlabel' }, S.patternLabel),
    patRow,
  );

  // Puntero j (patrón): cursor sobre la regla.
  const jCursor = el(
    'div',
    { class: 'kmp-cursor kmp-cursor-j' },
    el('span', { class: 'kmp-cursor-tag mono' }, 'j'),
  );
  ruler.append(jCursor);

  const narrator = el('div', { class: 'narrator' }, S.ready);
  const canvas = el(
    'div',
    { class: 'stage-canvas kmp-stage' },
    textWrap,
    iCursor,
    patWrap,
    narrator,
  );
  // el cursor i vive en la fila del texto para alinearse con sus tiles
  textRow.append(iCursor);

  // ── Tabla LPS en el aside ────────────────────────────────────────────
  const lpsCells = [];
  for (let k = 0; k < m; k++) {
    const valEl = el('span', { class: 'kmp-lps-val mono' }, '–');
    const cell = el(
      'div',
      { class: 'kmp-lps-cell' },
      el('span', { class: 'kmp-lps-key mono' }, PATTERN[k]),
      valEl,
    );
    cell._val = valEl;
    lpsCells.push(cell);
  }
  const lpsGrid = el('div', { class: 'kmp-lps-grid' }, ...lpsCells);

  // ── Helpers de render ────────────────────────────────────────────────
  function setNarration(html) {
    narrator.innerHTML = html;
  }

  // Posiciona la regla bajo el texto: su tile 0 se alinea con text[i - j].
  // Devuelve el offset (en índices del texto) donde arranca el patrón.
  function placeRuler(textStart, instant = false) {
    if (instant) ruler.classList.add('kmp-no-anim');
    ruler.style.setProperty('--kmp-shift', String(textStart));
    if (instant) requestAnimationFrame(() => ruler.classList.remove('kmp-no-anim'));
  }

  // Marca los tiles del patrón hasta j-1 como "matched" (verdes).
  function markPatMatched(upTo) {
    patTiles.forEach((t, k) => t.classList.toggle('kmp-matched', k < upTo));
  }
  // Marca los tiles del texto que están confirmados como coincidentes.
  function markTextMatched(start, count) {
    textTiles.forEach((t) => t.classList.remove('kmp-matched', 'kmp-compare'));
    for (let k = start; k < start + count && k < n; k++) {
      textTiles[k].classList.add('kmp-matched');
    }
  }

  function moveCursorI(i) {
    // i puede llegar a n (fuera de rango): lo clampeamos al borde derecho.
    const clamped = Math.min(i, n);
    iCursor.style.setProperty('--kmp-i', String(clamped));
    iCursor.classList.toggle('kmp-cursor-end', i >= n);
  }
  function moveCursorJ(j) {
    const clamped = Math.min(j, m);
    jCursor.style.setProperty('--kmp-j', String(clamped));
    jCursor.classList.toggle('kmp-cursor-end', j >= m);
  }

  function setLpsCell(k, value) {
    lpsCells[k]._val.textContent = String(value);
    lpsCells[k].classList.add('kmp-lps-set');
    lpsCells[k].classList.remove('kmp-lps-fresh');
    requestAnimationFrame(() => lpsCells[k].classList.add('kmp-lps-fresh'));
  }

  function highlightCompare(ti, on) {
    textTiles.forEach((t) => t.classList.remove('kmp-compare'));
    patTiles.forEach((t) => t.classList.remove('kmp-compare'));
    if (on && ti >= 0 && ti < n) textTiles[ti].classList.add('kmp-compare');
  }

  function resetVisual() {
    textTiles.forEach((t) => t.classList.remove('kmp-matched', 'kmp-compare', 'kmp-found'));
    patTiles.forEach((t) => t.classList.remove('kmp-matched', 'kmp-compare'));
    lpsCells.forEach((c) => {
      c._val.textContent = '–';
      c.classList.remove('kmp-lps-set', 'kmp-lps-fresh');
    });
    ruler.classList.remove('kmp-shifting');
    markPatMatched(0);
    placeRuler(0, true);
    moveCursorI(0);
    moveCursorJ(0);
    setNarration(S.ready);
  }

  function apply(step, ctx) {
    const animate = ctx && ctx.animate;
    switch (step.type) {
      // ── Fase 1: construcción del LPS ──────────────────────────────────
      case 'buildIntro':
        return S.buildIntro;
      case 'lpsMatch':
        setLpsCell(step.i, step.len);
        return S.lpsMatch(step.i, step.len);
      case 'lpsFallback':
        return S.lpsFallback(step.len);
      case 'lpsZero':
        setLpsCell(step.i, 0);
        return S.lpsZero(step.i);
      case 'lpsDone':
        return S.lpsDone;

      // ── Fase 2: matching ──────────────────────────────────────────────
      case 'charMatch': {
        const start = step.i - step.j; // dónde empieza el patrón en el texto
        placeRuler(start, !animate);
        moveCursorI(step.i + 1); // i avanza tras coincidir
        moveCursorJ(step.j + 1);
        highlightCompare(step.i, false);
        markPatMatched(step.j + 1);
        markTextMatched(start, step.j + 1);
        return S.charMatch(step.ch, step.i, step.j);
      }
      case 'found': {
        const start = step.pos;
        for (let k = start; k < start + m && k < n; k++) {
          textTiles[k].classList.add('kmp-found');
        }
        return S.found(step.pos);
      }
      case 'shift': {
        // tras un match, j retrocede a lps[m-1]; la regla salta hacia adelante.
        const start = step.i - step.newJ;
        if (animate) ruler.classList.add('kmp-shifting');
        placeRuler(start, !animate);
        markPatMatched(step.newJ);
        markTextMatched(start, step.newJ);
        moveCursorJ(step.newJ);
        if (animate) setTimeout(() => ruler.classList.remove('kmp-shifting'), 460);
        return null; // narración la dio 'found'
      }
      case 'mismatchShift': {
        const start = step.i - step.newJ; // la regla salta hacia adelante
        if (animate) ruler.classList.add('kmp-shifting');
        placeRuler(start, !animate);
        markPatMatched(step.newJ);
        markTextMatched(start, step.newJ);
        moveCursorJ(step.newJ);
        highlightCompare(step.i, true);
        if (animate) setTimeout(() => ruler.classList.remove('kmp-shifting'), 460);
        return S.mismatchShift(step.newJ, step.i);
      }
      case 'mismatchZero': {
        // j == 0: el patrón se desliza una posición y solo avanza i.
        const start = step.i; // j es 0, así que el patrón arranca en i
        placeRuler(start, !animate);
        moveCursorI(step.i);
        moveCursorJ(0);
        markPatMatched(0);
        markTextMatched(start, 0);
        highlightCompare(step.i, true);
        return S.mismatchZero(step.i);
      }
      case 'done': {
        highlightCompare(-1, false);
        patTiles.forEach((t) => t.classList.remove('kmp-compare'));
        return S.done(step.matches);
      }
    }
  }

  const player = new Player({ steps, apply, reset: resetVisual, baseDelay: 760 });
  const { bar, sync } = buildTransport(player);
  player.onChange = (s) => {
    sync(s);
    if (s.narration) setNarration(s.narration);
  };

  const stage = el('div', { class: 'stage' }, canvas, bar);
  const aside = el(
    'div',
    { class: 'scene-aside' },
    infoCard(S.cardComplexityTitle, el('span', { class: 'big' }, 'O(n + m)'), S.cardComplexitySub),
    infoCard(S.cardLpsTitle, lpsGrid, S.cardLpsSub),
    infoCard(S.cardPointersTitle, el('code', {}, `"${TEXT}" · "${PATTERN}"`), S.cardPointersSub),
  );

  clear(host);
  host.append(stage, aside);
  requestAnimationFrame(() => resetVisual());

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
