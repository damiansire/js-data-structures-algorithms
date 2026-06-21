// Escena: Fibonacci — "La espiral áurea".
//
// Trace FIEL a Algoritmos-generales/fibonacci/fibonacci.js (fibIterative):
//   if (n == 0) return [0]
//   fib = [0, 1]
//   for index = 2 .. n:  fib[index] = fib[index-1] + fib[index-2]
//   -> serie base 0:  [0, 1, 1, 2, 3, 5, 8, 13, 21, 34, ...]
//
// Visual: la teselación clásica de Fibonacci. Por cada término aparece un
// CUADRADO cuyo lado = Fib(n) (en "unidades fib"), colocado enroscándose
// (derecha, arriba, izquierda, abajo, repitiendo). Dentro de cada cuadrado se
// traza un ARCO de cuarto de círculo; encadenados forman la espiral áurea.
// El cociente Fib(n)/Fib(n-1) tiende a φ ≈ 1.618.

import { el, clear } from '../dom.js';
import { Player, buildTransport } from '../player.js';
import { getLang } from '../i18n.js';

// ── Strings bilingües (inglés por defecto) ─────────────────────────────────
const STRINGS = {
  en: {
    ready: 'Ready to play.',
    ratioSubDefault: 'tends to φ ≈ 1.618',
    ratioSubDiff: (diff) => `φ ≈ 1.61803 · Δ ${diff.toFixed(5)}`,
    seed: (step) => `<span class="mono">F(${step.n}) = ${step.side}</span> — series seed.`,
    grow: (step) =>
      `<span class="mono">F(${step.n}) = ${step.side}</span> = ` +
      `<span class="mono">${step.prev}</span> + <span class="mono">${step.prev2}</span> · ` +
      `side ${step.side}, the square coils in and draws its arc.`,
    cardTermTitle: 'Current term',
    cardTermSub: 'square side = Fib(n)',
    cardValueTitle: 'Value',
    cardValueSub: 'base-0 series: 0,1,1,2,3,5,8…',
    cardRatioTitle: 'Ratio Fib(n)/Fib(n-1)',
  },
  es: {
    ready: 'Listo para reproducir.',
    ratioSubDefault: 'tiende a φ ≈ 1.618',
    ratioSubDiff: (diff) => `φ ≈ 1.61803 · Δ ${diff.toFixed(5)}`,
    seed: (step) => `<span class="mono">F(${step.n}) = ${step.side}</span> — semilla de la serie.`,
    grow: (step) =>
      `<span class="mono">F(${step.n}) = ${step.side}</span> = ` +
      `<span class="mono">${step.prev}</span> + <span class="mono">${step.prev2}</span> · ` +
      `lado ${step.side}, el cuadrado se enrosca y traza su arco.`,
    cardTermTitle: 'Término actual',
    cardTermSub: 'lado del cuadrado = Fib(n)',
    cardValueTitle: 'Valor',
    cardValueSub: 'serie base 0: 0,1,1,2,3,5,8…',
    cardRatioTitle: 'Razón Fib(n)/Fib(n-1)',
  },
};

const PHI = (1 + Math.sqrt(5)) / 2; // ≈ 1.618033…
const TERMS = 9; // términos (índices 1..9 de la serie con lado > 0 que entran tras reescalar)

// ── Inyección de la hoja de estilos propia ─────────────────────────────────
// El index.html sólo enlaza styles.css y scenes.css y no hay loader por escena;
// para respetar el contrato (crear sólo 2 archivos) la escena enlaza su CSS.
const CSS_HREF = new URL('../../css/scene-fibonacci.css', import.meta.url).href;
function ensureStyles() {
  if (document.querySelector('link[data-fib-style]')) return;
  const link = el('link', { rel: 'stylesheet', href: CSS_HREF });
  link.setAttribute('data-fib-style', '');
  document.head.append(link);
}

/** fibIterative(n) — réplica exacta del algoritmo del repo (serie base 0). */
function fibIterative(n) {
  if (n === 0) return [0];
  const fib = [0, 1];
  for (let index = 2; index <= n; index++) {
    fib.push(fib[index - 1] + fib[index - 2]);
  }
  return fib;
}

// ── Geometría de la teselación ─────────────────────────────────────────────
// Coloca cuadrados enroscados en un sistema de coordenadas en "unidades fib"
// (eje Y hacia abajo, como en SVG). Cada cuadrado se adosa al lado actual del
// rectángulo envolvente. El arco es el cuarto de círculo opuesto a la esquina
// donde "pivota" la espiral, de modo que los arcos se encadenen.
//
// Direcciones en orden: derecha, arriba, izquierda, abajo (y se repite).
function buildSquares(values) {
  // values: lados (Fib(n)) en orden, ya sin el 0 inicial.
  const dirs = ['right', 'up', 'left', 'down'];
  const sq = [];
  // bounding box actual del bloque ya colocado
  let bb = null;

  values.forEach((side, i) => {
    let x, y;
    if (i === 0) {
      x = 0;
      y = 0;
    } else {
      const dir = dirs[(i - 1) % 4];
      if (dir === 'right') {
        x = bb.maxX;
        y = bb.maxY - side;
      } else if (dir === 'up') {
        x = bb.minX;
        y = bb.minY - side;
      } else if (dir === 'left') {
        x = bb.minX - side;
        y = bb.minY;
      } else {
        // down
        x = bb.maxX - side;
        y = bb.maxY;
      }
    }
    sq.push({ x, y, side, n: i });
    // actualizar bounding box
    if (!bb) bb = { minX: x, minY: y, maxX: x + side, maxY: y + side };
    else {
      bb.minX = Math.min(bb.minX, x);
      bb.minY = Math.min(bb.minY, y);
      bb.maxX = Math.max(bb.maxX, x + side);
      bb.maxY = Math.max(bb.maxY, y + side);
    }
  });

  // Esquina del arco: el centro del cuarto de círculo es la esquina interior
  // (la que mira hacia el centro de la espiral). Recorremos las direcciones
  // para saber qué esquina del cuadrado es el pivote del arco.
  // Para cada cuadrado i (i>=1) la dirección de colocación determina la esquina.
  // El primer cuadrado usa la misma esquina que su sucesor para arrancar.
  const cornerByDir = {
    right: 'tl', // arco con centro en esquina superior-izquierda
    up: 'bl',
    left: 'br',
    down: 'tr',
  };
  sq.forEach((s, i) => {
    const dir = dirs[(Math.max(i, 1) - 1) % 4];
    s.corner = cornerByDir[dir];
  });

  return { squares: sq, bb };
}

// Devuelve el path SVG del cuarto de círculo de un cuadrado, dado su corner.
// El arco va de un extremo al otro pasando por el borde opuesto a la esquina.
function arcPath(s) {
  const { x, y, side: r, corner } = s;
  // puntos de las 4 esquinas
  const tl = [x, y];
  const tr = [x + r, y];
  const bl = [x, y + r];
  const br = [x + r, y + r];
  // El centro del arco es `corner`; el cuarto de círculo conecta los dos
  // vértices adyacentes a esa esquina, con radio = lado.
  // Cuarto de círculo centrado en `corner`, radio = lado, con la curva bombeada
  // hacia la esquina opuesta (parte interior del cuadrado). En coordenadas SVG
  // (y hacia abajo) ese arco corto es sentido horario → sweep-flag = 1.
  let from, to;
  const sweep = 1;
  if (corner === 'tl') {
    from = tr;
    to = bl;
  } else if (corner === 'tr') {
    from = br;
    to = tl;
  } else if (corner === 'br') {
    from = bl;
    to = tr;
  } else {
    // bl
    from = tl;
    to = br;
  }
  return `M ${from[0]} ${from[1]} A ${r} ${r} 0 0 ${sweep} ${to[0]} ${to[1]}`;
}

export default function mountFibonacci(host, meta) {
  ensureStyles();

  const S = STRINGS[getLang()] || STRINGS.en;

  // Serie del repo (base 0). Tomamos índices 1..TERMS (lado > 0).
  const serie = fibIterative(TERMS); // [0,1,1,2,3,5,8,13,21,34] si TERMS=9
  const used = serie.slice(1, TERMS + 1); // lados, sin el 0 inicial
  const { squares, bb } = buildSquares(used);

  // viewBox con un pequeño margen para que el trazo no se corte.
  const pad = Math.max(used[used.length - 1] * 0.06, 1);
  const vb = {
    x: bb.minX - pad,
    y: bb.minY - pad,
    w: bb.maxX - bb.minX + pad * 2,
    h: bb.maxY - bb.minY + pad * 2,
  };

  // ── SVG ───────────────────────────────────────────────────────────────
  const SVGNS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(SVGNS, 'svg');
  svg.setAttribute('class', 'fib-svg');
  svg.setAttribute('viewBox', `${vb.x} ${vb.y} ${vb.w} ${vb.h}`);
  svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');

  // defs: gradiente para los cuadrados y el trazo
  svg.innerHTML = `
    <defs>
      <linearGradient id="fibGradSq" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%"  stop-color="var(--violet)" stop-opacity="0.28"/>
        <stop offset="100%" stop-color="var(--cyan)"  stop-opacity="0.10"/>
      </linearGradient>
      <linearGradient id="fibGradArc" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%"   stop-color="var(--amber)"/>
        <stop offset="55%"  stop-color="var(--violet)"/>
        <stop offset="100%" stop-color="var(--cyan)"/>
      </linearGradient>
    </defs>`;

  // Construir, por cada término, un grupo <g> con el cuadrado, su etiqueta y el arco.
  const groups = squares.map((s) => {
    const g = document.createElementNS(SVGNS, 'g');
    g.setAttribute('class', 'fib-cell');

    const rect = document.createElementNS(SVGNS, 'rect');
    rect.setAttribute('class', 'fib-square');
    rect.setAttribute('x', s.x);
    rect.setAttribute('y', s.y);
    rect.setAttribute('width', s.side);
    rect.setAttribute('height', s.side);
    rect.setAttribute('rx', Math.min(s.side * 0.04, 0.6));

    const path = document.createElementNS(SVGNS, 'path');
    path.setAttribute('class', 'fib-arc');
    path.setAttribute('d', arcPath(s));

    const label = document.createElementNS(SVGNS, 'text');
    label.setAttribute('class', 'fib-num');
    label.setAttribute('x', s.x + s.side / 2);
    label.setAttribute('y', s.y + s.side / 2);
    // escalar el texto al tamaño del cuadrado (legible incluso en los chicos)
    label.setAttribute('font-size', Math.max(s.side * 0.34, 0.9));
    label.textContent = String(s.side);

    g.append(rect, path, label);
    svg.append(g);
    return { g, rect, path, label, s };
  });

  const canvas = el('div', { class: 'stage-canvas fib-stage' }, svg);
  const narrator = el('div', { class: 'narrator' }, S.ready);
  canvas.append(narrator);

  function setNarration(html) {
    narrator.innerHTML = html;
  }

  // ── Pasos: un término nuevo por paso ──────────────────────────────────
  const steps = used.map((side, i) => ({
    n: i + 1, // índice en la serie base 0 (saltamos el 0)
    side,
    prev: i > 0 ? used[i - 1] : null,
    prev2: i > 1 ? used[i - 2] : null,
  }));

  function showGroup(grp, animate) {
    grp.g.classList.add('show');
    if (animate) {
      grp.g.classList.remove('anim');
      void grp.g.getBoundingClientRect();
      grp.g.classList.add('anim');
    } else {
      grp.g.classList.add('anim');
    }
  }
  function hideAll() {
    groups.forEach((grp) => grp.g.classList.remove('show', 'anim'));
  }

  // Info card (lado dinámico): término actual, valor y el ratio → φ.
  const termOut = el('span', { class: 'big' }, '—');
  const valOut = el('span', { class: 'big' }, '—');
  const ratioOut = el('span', { class: 'big' }, '—');
  const ratioSub = el(
    'div',
    { style: { marginTop: '6px', fontSize: '12px', color: '#76749a' } },
    S.ratioSubDefault,
  );

  function updateInfo(step) {
    if (!step) {
      termOut.textContent = '—';
      valOut.textContent = '—';
      ratioOut.textContent = '—';
      ratioSub.textContent = S.ratioSubDefault;
      return;
    }
    termOut.textContent = `F(${step.n})`;
    valOut.textContent = String(step.side);
    if (step.prev) {
      const r = step.side / step.prev;
      ratioOut.textContent = r.toFixed(5);
      const diff = Math.abs(r - PHI);
      ratioSub.textContent = S.ratioSubDiff(diff);
    } else {
      ratioOut.textContent = '—';
      ratioSub.textContent = S.ratioSubDefault;
    }
  }

  function apply(step, ctx) {
    const grp = groups[ctx.index];
    showGroup(grp, ctx.animate);
    updateInfo(step);

    if (step.prev2 == null) {
      // primeros términos: semillas de la serie (0,1)
      return S.seed(step);
    }
    return S.grow(step);
  }

  function resetVisual() {
    hideAll();
    updateInfo(null);
    setNarration(S.ready);
  }

  const player = new Player({
    steps,
    apply,
    reset: resetVisual,
    baseDelay: 780,
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
    infoCard(S.cardTermTitle, termOut, S.cardTermSub),
    infoCard(S.cardValueTitle, valOut, S.cardValueSub),
    infoCard(S.cardRatioTitle, ratioOut, ratioSub),
  );

  clear(host);
  host.append(stage, aside);
  resetVisual();

  return { destroy: () => player.destroy() };
}

function infoCard(title, big, sub) {
  return el(
    'div',
    { class: 'info-card' },
    el('h4', {}, title),
    big,
    sub == null
      ? null
      : typeof sub === 'string'
        ? el('div', { style: { marginTop: '6px', fontSize: '12px', color: '#76749a' } }, sub)
        : sub,
  );
}
