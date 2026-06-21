// Escena: Sieve of Eratosthenes — "Tachar múltiplos en una grilla de números".
//
// Criba estándar (N = 60, números 2..60):
//   for (p = 2; p*p <= N; p++)
//     if (!composite[p])            // p sobrevivió → es primo
//       for (m = p*p; m <= N; m += p) composite[m] = true  // tacha múltiplos
//   los números no tachados al final son primos.
//
// Visual: los números 2..60 son celdas de una grilla (10 columnas). En cada
// paso el primo actual p BRILLA en dorado; luego sus múltiplos (p², p²+p, …) se
// TACHAN en barrido (rojo con una X). Los números que sobreviven quedan dorados.
// La tarjeta lateral muestra el primo actual y el conteo de primos hallados.

import { el, clear } from '../dom.js';
import { Player, buildTransport } from '../player.js';
import { getLang } from '../i18n.js';

const N = 60;
const FIRST = 2; // primer número de la grilla

// ── Strings bilingües (inglés por defecto, español opcional) ──────────
const STRINGS = {
  en: {
    ready: 'Ready to play.',
    reset: 'Ready to play. We cross out multiples on the number grid.',
    prime: (p) =>
      `<span class="mono">${p}</span> survived → it is <b>prime</b>. Now I cross out its multiples ✨`,
    cross: (m, p) =>
      `<span class="mono">${m}</span> = multiple of <span class="mono">${p}</span> → crossed out 🚫`,
    done: (count) =>
      `Sieve complete. The survivors are the <b>${count}</b> primes ≤ <span class="mono">${N}</span> ✨`,
    currentPrime: 'Current prime',
    none: '—',
    cardSieveTitle: 'Sieve',
    cardSieveSub: 'mark composites',
    cardComplexityTitle: 'Complexity',
    cardComplexitySub: 'O(n log log n)',
    cardRangeTitle: 'Range',
    cardRangeSub: (lo, hi) => `numbers ${lo}…${hi}`,
    cardPrimesTitle: 'Primes found',
    cardPrimesSub: (n) => `${n} so far`,
  },
  es: {
    ready: 'Listo para reproducir.',
    reset: 'Listo para reproducir. Tachamos los múltiplos en la grilla de números.',
    prime: (p) =>
      `<span class="mono">${p}</span> sobrevivió → es <b>primo</b>. Ahora tacho sus múltiplos ✨`,
    cross: (m, p) =>
      `<span class="mono">${m}</span> = múltiplo de <span class="mono">${p}</span> → tachado 🚫`,
    done: (count) =>
      `Criba completa. Los sobrevivientes son los <b>${count}</b> primos ≤ <span class="mono">${N}</span> ✨`,
    currentPrime: 'Primo actual',
    none: '—',
    cardSieveTitle: 'Criba',
    cardSieveSub: 'marca compuestos',
    cardComplexityTitle: 'Complejidad',
    cardComplexitySub: 'O(n log log n)',
    cardRangeTitle: 'Rango',
    cardRangeSub: (lo, hi) => `números ${lo}…${hi}`,
    cardPrimesTitle: 'Primos hallados',
    cardPrimesSub: (n) => `${n} hasta ahora`,
  },
};

// CSS propio de la escena, autoinyectado una sola vez (no editamos index.html).
const CSS_HREF = './css/scene-sieve-eratosthenes.css';
if (!document.querySelector(`link[data-scene="sieve-eratosthenes"]`)) {
  document.head.append(
    el('link', { rel: 'stylesheet', href: CSS_HREF, dataset: { scene: 'sieve-eratosthenes' } }),
  );
}

/**
 * Construye los pasos corriendo la criba real.
 *   prime(p)        → p es primo (sobrevivió)
 *   cross(m, p)     → m es múltiplo de p, se tacha como compuesto
 *   done            → fin; los no tachados son primos
 */
function buildTrace() {
  const composite = new Array(N + 1).fill(false);
  const steps = [];
  for (let p = 2; p * p <= N; p++) {
    if (composite[p]) continue;
    steps.push({ type: 'prime', p });
    for (let m = p * p; m <= N; m += p) {
      if (!composite[m]) {
        composite[m] = true;
        steps.push({ type: 'cross', m, p });
      }
    }
  }
  // Primos que sobreviven sin entrar al bucle externo (p donde p*p > N).
  for (let p = 2; p <= N; p++) {
    if (!composite[p] && !steps.some((s) => s.type === 'prime' && s.p === p)) {
      steps.push({ type: 'prime', p, late: true });
    }
  }
  steps.push({ type: 'done' });
  return steps;
}

// Réplica fiel del algoritmo: lista final de primos ≤ N (para el aside).
function realPrimes() {
  const composite = new Array(N + 1).fill(false);
  for (let p = 2; p * p <= N; p++) {
    if (composite[p]) continue;
    for (let m = p * p; m <= N; m += p) composite[m] = true;
  }
  const primes = [];
  for (let p = 2; p <= N; p++) if (!composite[p]) primes.push(p);
  return primes;
}

export default function mountSieveEratosthenes(host, meta) {
  const S = STRINGS[getLang()] || STRINGS.en;

  // ── Grilla de celdas (números 2..60) ────────────────────────────────
  const cells = new Map(); // value → cell node
  const grid = el('div', { class: 'sve-grid' });
  for (let v = FIRST; v <= N; v++) {
    const cell = el('div', { class: 'sve-cell mono' }, String(v));
    cell._value = v;
    cells.set(v, cell);
    grid.append(cell);
  }

  const narrator = el('div', { class: 'narrator' }, S.ready);
  const canvas = el('div', { class: 'stage-canvas sve-stage' }, grid, narrator);

  // ── Tarjeta de estado: primo actual + conteo ────────────────────────
  const currentPrimeBig = el('span', { class: 'big' }, S.none);
  const primesCountBig = el('span', { class: 'big' }, '0');
  const currentCard = infoCard(S.currentPrime, currentPrimeBig, '');
  const primesCard = infoCard(S.cardPrimesTitle, primesCountBig, S.cardPrimesSub(0));

  // ── Helpers de render ───────────────────────────────────────────────
  function setNarration(html) {
    narrator.innerHTML = html;
  }
  let primesFound = 0;
  function updateCount() {
    primesCountBig.textContent = String(primesFound);
    const sub = primesCard.querySelector('.info-card-sub');
    if (sub) sub.textContent = S.cardPrimesSub(primesFound);
  }

  function resetVisual() {
    cells.forEach((cell) => {
      cell.classList.remove('sve-prime', 'sve-glow', 'sve-crossing', 'sve-composite');
    });
    primesFound = 0;
    currentPrimeBig.textContent = S.none;
    updateCount();
    setNarration(S.reset);
  }

  function apply(step, ctx) {
    const animate = ctx && ctx.animate;

    if (step.type === 'done') {
      cells.forEach((cell) => cell.classList.remove('sve-glow'));
      return S.done(primesFound);
    }

    if (step.type === 'prime') {
      // quita el brillo del primo anterior
      cells.forEach((cell) => cell.classList.remove('sve-glow'));
      const cell = cells.get(step.p);
      cell.classList.remove('sve-composite', 'sve-crossing');
      cell.classList.add('sve-prime', 'sve-glow');
      currentPrimeBig.textContent = String(step.p);
      primesFound += 1;
      updateCount();
      return S.prime(step.p);
    }

    // cross: tacha un múltiplo como compuesto
    const cell = cells.get(step.m);
    cell.classList.remove('sve-prime', 'sve-glow');
    if (animate) {
      cell.classList.add('sve-crossing');
      cell.classList.add('sve-composite');
    } else {
      cell.classList.add('sve-composite');
    }
    return S.cross(step.m, step.p);
  }

  // ── Player + transporte ─────────────────────────────────────────────
  const player = new Player({
    steps: buildTrace(),
    apply,
    reset: resetVisual,
    baseDelay: 220,
  });
  const { bar, sync } = buildTransport(player);
  player.onChange = (s) => {
    sync(s);
    if (s.narration) setNarration(s.narration);
  };

  const primes = realPrimes();
  const stage = el('div', { class: 'stage' }, canvas, bar);
  const aside = el(
    'div',
    { class: 'scene-aside' },
    currentCard,
    primesCard,
    infoCard(S.cardSieveTitle, el('span', { class: 'big' }, 'Criba'), S.cardSieveSub),
    infoCard(
      S.cardComplexityTitle,
      el('span', { class: 'big' }, 'O(n log log n)'),
      S.cardComplexitySub,
    ),
    infoCard(S.cardRangeTitle, el('code', {}, `2…${N}`), S.cardRangeSub(FIRST, N)),
  );

  clear(host);
  host.append(stage, aside);
  resetVisual();

  return {
    destroy() {
      player.destroy();
    },
    // expuesto para pruebas/depuración: lista real de primos ≤ N
    _primes: primes,
  };
}

function infoCard(title, big, sub) {
  return el(
    'div',
    { class: 'info-card' },
    el('h4', {}, title),
    big,
    sub
      ? el(
          'div',
          {
            class: 'info-card-sub',
            style: { marginTop: '6px', fontSize: '12px', color: '#76749a' },
          },
          sub,
        )
      : null,
  );
}
