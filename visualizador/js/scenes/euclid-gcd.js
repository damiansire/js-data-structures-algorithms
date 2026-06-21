// Escena: Euclid's GCD — "Tiling a rectangle with the biggest square".
//
// Vista geométrica clásica del algoritmo de Euclides (versión sustractiva por
// teselado, equivalente al de módulo):
//   while (b) { [a, b] = [b, a % b] }  →  gcd = a
//
// Un rectángulo W×H (48×36) se rellena recortando el CUADRADO MÁS GRANDE posible
// de lado = min(W, H), tantas veces como entre a lo largo del lado más largo.
// Eso es justo la división W÷H:  count = floor(W/H),  remainder = W mod H.
// El sobrante (H × remainder) pasa a ser el nuevo rectángulo y se repite con
// cuadrados más chicos hasta que el resto es 0. El último lado es el GCD (oro).
//
// Trace FIEL: se corre el algoritmo real sobre (48, 36) y se emiten los pasos.

import { el, clear } from '../dom.js';
import { Player, buildTransport } from '../player.js';
import { getLang } from '../i18n.js';

const A0 = 48;
const B0 = 36;

// ── Strings bilingües (inglés por defecto, español opcional) ───────────────
const STRINGS = {
  en: {
    ready: 'Ready to play.',
    carve: (step) =>
      `<span class="mono">${step.w} ÷ ${step.h}</span> → I carve <span class="mono">${step.count}</span> ` +
      `square${step.count === 1 ? '' : 's'} of side <span class="mono">${step.side}</span> along the rectangle.`,
    remainder: (step) =>
      `<span class="mono">${step.w} mod ${step.h} = ${step.rem}</span> → leftover strip ` +
      `<span class="mono">${step.h} × ${step.rem}</span> becomes the new rectangle.`,
    exact: (step) =>
      `<span class="mono">${step.w} mod ${step.h} = 0</span> → it tiles perfectly. ` +
      `The square of side <span class="mono">${step.side}</span> IS the GCD.`,
    done: (g) =>
      `Rectangle fully tiled with squares of side <span class="mono">${g}</span> → ` +
      `<span class="mono">gcd(${A0}, ${B0}) = ${g}</span> ✨`,
    cardATitle: 'a',
    cardASub: 'longer side (W)',
    cardBTitle: 'b',
    cardBSub: 'shorter side (H)',
    cardRemTitle: 'remainder',
    cardRemSub: 'a mod b',
    cardGcdTitle: 'GCD',
    cardGcdSub: 'last square side',
  },
  es: {
    ready: 'Listo para reproducir.',
    carve: (step) =>
      `<span class="mono">${step.w} ÷ ${step.h}</span> → recorto <span class="mono">${step.count}</span> ` +
      `cuadrado${step.count === 1 ? '' : 's'} de lado <span class="mono">${step.side}</span> a lo largo del rectángulo.`,
    remainder: (step) =>
      `<span class="mono">${step.w} mod ${step.h} = ${step.rem}</span> → la tira sobrante ` +
      `<span class="mono">${step.h} × ${step.rem}</span> pasa a ser el nuevo rectángulo.`,
    exact: (step) =>
      `<span class="mono">${step.w} mod ${step.h} = 0</span> → tesela perfecto. ` +
      `El cuadrado de lado <span class="mono">${step.side}</span> ES el GCD.`,
    done: (g) =>
      `Rectángulo teselado por completo con cuadrados de lado <span class="mono">${g}</span> → ` +
      `<span class="mono">mcd(${A0}, ${B0}) = ${g}</span> ✨`,
    cardATitle: 'a',
    cardASub: 'lado mayor (W)',
    cardBTitle: 'b',
    cardBSub: 'lado menor (H)',
    cardRemTitle: 'resto',
    cardRemSub: 'a mod b',
    cardGcdTitle: 'GCD',
    cardGcdSub: 'lado del último cuadrado',
  },
};

// ── Inyección de la hoja de estilos propia (no se toca index.html) ─────────
const CSS_HREF = new URL('../../css/scene-euclid-gcd.css', import.meta.url).href;
function ensureStyles() {
  if (document.querySelector('link[data-scene="euclid-gcd"]')) return;
  const link = el('link', { rel: 'stylesheet', href: CSS_HREF, dataset: { scene: 'euclid-gcd' } });
  document.head.append(link);
}

const SVGNS = 'http://www.w3.org/2000/svg';

/**
 * Corre el algoritmo real y construye el trace geométrico.
 *
 * Trabajamos siempre en coordenadas del rectángulo ORIGINAL (W0 × H0) para
 * poder dibujar cada cuadrado en su lugar absoluto. En cada vuelta el "marco"
 * activo es un rectángulo (x, y, w, h) con w ≥ h; recortamos `count` cuadrados
 * de lado `h` desde un extremo y el sobrante (de ancho `rem`) queda como nuevo
 * marco, rotando la orientación de avance.
 */
function buildTrace(A, B) {
  const W0 = Math.max(A, B);
  const H0 = Math.min(A, B);

  const steps = [];
  const squares = []; // {x, y, side, level} — todos los cuadrados, en orden

  // Marco activo en coordenadas absolutas. Empezamos con el lado mayor en X.
  let frame = { x: 0, y: 0, w: W0, h: H0 };
  // Dirección en la que avanzamos colocando cuadrados: 'x' (a lo ancho) o 'y'.
  let axis = 'x';
  let level = 0;
  let gcd = W0;

  // Algoritmo: mientras el lado corto del marco no divida exacto, recortamos.
  // (a, b) = (lado largo, lado corto) del marco actual.
  while (true) {
    const long = Math.max(frame.w, frame.h);
    const short = Math.min(frame.w, frame.h);
    const count = Math.floor(long / short);
    const rem = long % short;
    gcd = short; // candidato a GCD: el último lado con resto 0

    // Calcula los cuadrados de este nivel y el sobrante.
    const levelSquares = [];
    let cx = frame.x;
    let cy = frame.y;
    for (let k = 0; k < count; k++) {
      levelSquares.push({ x: cx, y: cy, side: short, level });
      if (axis === 'x') cx += short;
      else cy += short;
    }
    const baseIndex = squares.length;
    squares.push(...levelSquares);

    // El sobrante: la tira restante del marco, perpendicular al avance.
    let leftover = null;
    if (rem > 0) {
      if (axis === 'x') {
        // recortamos a lo ancho; sobra una franja a la derecha (de ancho rem)
        // que es más ALTA que ancha → próximo avance en Y.
        leftover = { x: cx, y: frame.y, w: rem, h: short };
      } else {
        // recortamos a lo alto; sobra una franja abajo (de alto rem)
        leftover = { x: frame.x, y: cy, w: short, h: rem };
      }
    }

    steps.push({
      type: 'carve',
      side: short,
      count,
      w: long,
      h: short,
      level,
      from: baseIndex,
      to: baseIndex + count, // [from, to)
    });

    if (rem === 0) {
      steps.push({ type: 'exact', side: short, w: long, h: short });
      break;
    }

    steps.push({
      type: 'remainder',
      w: long,
      h: short,
      rem,
      rect: leftover,
    });

    // Próxima vuelta: el sobrante es el nuevo marco; alternamos el eje.
    frame = leftover;
    axis = axis === 'x' ? 'y' : 'x';
    level += 1;
  }

  steps.push({ type: 'done', gcd });
  return { steps, squares, W0, H0, gcd };
}

export default function mountEuclidGcd(host, meta) {
  ensureStyles();
  const S = STRINGS[getLang()] || STRINGS.en;

  const { steps, squares, W0, H0, gcd } = buildTrace(A0, B0);

  // ── SVG con viewBox = proporciones del rectángulo (W0 × H0) ──────────────
  const pad = Math.max(W0, H0) * 0.04;
  const svg = document.createElementNS(SVGNS, 'svg');
  svg.setAttribute('class', 'gcd-svg');
  svg.setAttribute('viewBox', `${-pad} ${-pad} ${W0 + pad * 2} ${H0 + pad * 2}`);
  svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
  svg.innerHTML = `
    <defs>
      <linearGradient id="gcdGradSq" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%"   stop-color="var(--cyan)"   stop-opacity="0.30"/>
        <stop offset="100%" stop-color="var(--violet)" stop-opacity="0.12"/>
      </linearGradient>
      <linearGradient id="gcdGradGold" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%"   stop-color="var(--amber)" stop-opacity="0.85"/>
        <stop offset="100%" stop-color="var(--amber)" stop-opacity="0.45"/>
      </linearGradient>
    </defs>`;

  // Contorno del rectángulo original (siempre visible).
  const outline = document.createElementNS(SVGNS, 'rect');
  outline.setAttribute('class', 'gcd-outline');
  outline.setAttribute('x', '0');
  outline.setAttribute('y', '0');
  outline.setAttribute('width', String(W0));
  outline.setAttribute('height', String(H0));
  svg.append(outline);

  // Rectángulo "sobrante" resaltado (se mueve por la escena).
  const leftoverRect = document.createElementNS(SVGNS, 'rect');
  leftoverRect.setAttribute('class', 'gcd-leftover');
  leftoverRect.setAttribute('width', '0');
  leftoverRect.setAttribute('height', '0');
  svg.append(leftoverRect);

  // Un <g> por cuadrado: rect + etiqueta con el lado.
  const isGcdSide = (side) => side === gcd;
  const cells = squares.map((sq) => {
    const g = document.createElementNS(SVGNS, 'g');
    g.setAttribute('class', 'gcd-cell' + (isGcdSide(sq.side) ? ' gcd-gold' : ''));

    const rect = document.createElementNS(SVGNS, 'rect');
    rect.setAttribute('class', 'gcd-square');
    rect.setAttribute('x', String(sq.x));
    rect.setAttribute('y', String(sq.y));
    rect.setAttribute('width', String(sq.side));
    rect.setAttribute('height', String(sq.side));

    const label = document.createElementNS(SVGNS, 'text');
    label.setAttribute('class', 'gcd-num');
    label.setAttribute('x', String(sq.x + sq.side / 2));
    label.setAttribute('y', String(sq.y + sq.side / 2));
    label.setAttribute('font-size', String(Math.max(sq.side * 0.32, 1.4)));
    label.textContent = String(sq.side);

    g.append(rect, label);
    svg.append(g);
    return { g, sq };
  });

  const canvas = el('div', { class: 'stage-canvas gcd-stage' }, svg);
  const narrator = el('div', { class: 'narrator' }, S.ready);
  canvas.append(narrator);

  function setNarration(html) {
    narrator.innerHTML = html;
  }

  // ── Info card (valores dinámicos) ────────────────────────────────────────
  const aOut = el('span', { class: 'big mono' }, String(W0));
  const bOut = el('span', { class: 'big mono' }, String(H0));
  const remOut = el('span', { class: 'big mono' }, '—');
  const gcdOut = el('span', { class: 'big mono' }, '—');

  function showCells(from, to, animate) {
    for (let i = from; i < to; i++) {
      const c = cells[i];
      c.g.classList.add('show');
      if (animate) {
        c.g.classList.remove('anim');
        void c.g.getBoundingClientRect();
        // escalonamos para que se vean "apareciendo" en fila
        const delay = (i - from) * 0.12;
        c.g.style.setProperty('--gcd-delay', `${delay}s`);
        c.g.classList.add('anim');
      } else {
        c.g.classList.add('anim');
        c.g.style.removeProperty('--gcd-delay');
      }
    }
  }

  function showLeftover(rect) {
    if (!rect) {
      leftoverRect.classList.remove('show');
      return;
    }
    leftoverRect.setAttribute('x', String(rect.x));
    leftoverRect.setAttribute('y', String(rect.y));
    leftoverRect.setAttribute('width', String(rect.w));
    leftoverRect.setAttribute('height', String(rect.h));
    leftoverRect.classList.add('show');
  }

  function apply(step, ctx) {
    const animate = ctx && ctx.animate;
    switch (step.type) {
      case 'carve':
        showLeftover(null);
        showCells(step.from, step.to, animate);
        aOut.textContent = String(step.w);
        bOut.textContent = String(step.h);
        return S.carve(step);
      case 'remainder':
        showLeftover(step.rect);
        remOut.textContent = String(step.rem);
        return S.remainder(step);
      case 'exact':
        showLeftover(null);
        remOut.textContent = '0';
        gcdOut.textContent = String(step.side);
        gcdOut.classList.add('gcd-gold-text');
        return S.exact(step);
      case 'done':
        cells.forEach((c) => {
          if (isGcdSide(c.sq.side)) c.g.classList.add('gcd-win');
        });
        gcdOut.textContent = String(step.gcd);
        gcdOut.classList.add('gcd-gold-text');
        return S.done(step.gcd);
    }
  }

  function resetVisual() {
    cells.forEach((c) => {
      c.g.classList.remove('show', 'anim', 'gcd-win');
      c.g.style.removeProperty('--gcd-delay');
    });
    showLeftover(null);
    aOut.textContent = String(W0);
    bOut.textContent = String(H0);
    remOut.textContent = '—';
    gcdOut.textContent = '—';
    gcdOut.classList.remove('gcd-gold-text');
    setNarration(S.ready);
  }

  const player = new Player({
    steps,
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
    infoCard(S.cardATitle, aOut, S.cardASub),
    infoCard(S.cardBTitle, bOut, S.cardBSub),
    infoCard(S.cardRemTitle, remOut, S.cardRemSub),
    infoCard(S.cardGcdTitle, gcdOut, S.cardGcdSub),
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
    sub
      ? el('div', { style: { marginTop: '6px', fontSize: '12px', color: '#76749a' } }, sub)
      : null,
  );
}
