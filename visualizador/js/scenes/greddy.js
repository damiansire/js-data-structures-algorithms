// Escena: Greedy / Cambio de monedas — "Una caja registradora dando vuelto".
//
// Trace FIEL a Algoritmos-generales/greddy/greddy.js (estrategia voraz):
//   money = [1, 2, 5, 10, 20, 50]; residualMoney = 188; index = money.length - 1
//   while (residualMoney > 0) {
//     pay = residualMoney - money[index]
//     if (pay >= 0) { residualMoney = pay; selectedMoney.push(money[index]) }
//     else          { index = index - 1 }
//   }
// Siempre toma la denominación MAYOR que entra en el restante; cuando ya no
// entra, baja a la siguiente denominación. Mismo criterio, exacto.
//
// Visual: una caja registradora con un display LED que muestra el RESTANTE.
// A la izquierda, las denominaciones disponibles (mayor a menor). El algoritmo
// elige siempre la mayor que entra: esa pieza cae a la bandeja de "vuelto
// entregado" y el display baja con el descuento. Cuando una denominación deja
// de entrar, se resalta el salto a la siguiente (menor).

import { el, clear } from '../dom.js';
import { Player, buildTransport } from '../player.js';
import { getLang } from '../i18n.js';

// ── Strings bilingües (inglés por defecto, español opcional) ────────────────
// Las interpolaciones son funciones; conservan el markup <span class="mono">…</span>
// idéntico en ambos idiomas. La lógica greedy, denominaciones y class-names no
// dependen del idioma.
const STRINGS = {
  en: {
    ledLabel: 'REMAINING',
    trayLabel: 'Change handed out',
    emptyCounts: 'No pieces yet',
    ready: 'Ready to play.',
    bill: 'bill',
    coin: 'coin',
    give: ({ from, kind, denom, to }) =>
      `Remaining <span class="mono">${from}</span> → I hand out ` +
      `a ${kind} of <span class="mono">${denom}</span>` +
      ` · remaining <span class="mono">${to}</span>`,
    skip: ({ denom, residual, next }) =>
      `<span class="mono">${denom}</span> no longer fits in ` +
      `<span class="mono">${residual}</span> → I drop to ` +
      `<span class="mono">${next}</span>`,
    done: ({ pieces, total }) =>
      `Change complete! <span class="mono">${pieces}</span> pieces add up to <span class="mono">${total}</span> ✨`,
    cardTargetTitle: 'Target total',
    cardTargetSub: 'change to give',
    cardRemainingTitle: 'Remaining',
    cardRemainingSub: 'drops with each handout',
    cardPiecesTitle: 'Pieces handed out',
  },
  es: {
    ledLabel: 'RESTANTE',
    trayLabel: 'Vuelto entregado',
    emptyCounts: 'Sin piezas todavía',
    ready: 'Listo para reproducir.',
    bill: 'billete',
    coin: 'moneda',
    give: ({ from, kind, denom, to }) =>
      `Restante <span class="mono">${from}</span> → entrego ` +
      `${kind} de <span class="mono">${denom}</span>` +
      ` · queda <span class="mono">${to}</span>`,
    skip: ({ denom, residual, next }) =>
      `<span class="mono">${denom}</span> ya no entra en ` +
      `<span class="mono">${residual}</span> → bajo a ` +
      `<span class="mono">${next}</span>`,
    done: ({ pieces, total }) =>
      `¡Vuelto completo! <span class="mono">${pieces}</span> piezas suman <span class="mono">${total}</span> ✨`,
    cardTargetTitle: 'Total objetivo',
    cardTargetSub: 'vuelto a dar',
    cardRemainingTitle: 'Restante',
    cardRemainingSub: 'baja en cada entrega',
    cardPiecesTitle: 'Piezas entregadas',
  },
};

// CSS propio de la escena (no se toca index.html): se inyecta una sola vez.
const CSS_HREF = new URL('../../css/scene-greddy.css', import.meta.url).href;
function ensureCss() {
  if (document.querySelector(`link[data-scene="greddy"]`)) return;
  const link = el('link', { rel: 'stylesheet', href: CSS_HREF, 'data-scene': 'greddy' });
  document.head.append(link);
}

// Denominaciones EXACTAS de greddy.js (ordenadas de menor a mayor en el repo).
const MONEY = [1, 2, 5, 10, 20, 50];
// Billetes vs monedas: por convención, ≥10 es billete (rectángulo), el resto
// moneda (círculo). Solo afecta la metáfora visual, no el algoritmo.
const IS_BILL = (v) => v >= 10;
const TARGET = 188; // vuelto variado: usa las 6 denominaciones

// Reconstruye el trace replicando greddy.js paso a paso.
function buildTrace(target) {
  const money = MONEY.slice();
  let residual = target;
  let index = money.length - 1;
  const steps = [];
  while (residual > 0) {
    const denom = money[index];
    const pay = residual - denom;
    if (pay >= 0) {
      steps.push({ type: 'give', denom, from: residual, to: pay });
      residual = pay;
    } else {
      steps.push({ type: 'skip', denom, next: money[index - 1], residual });
      index = index - 1;
    }
  }
  steps.push({ type: 'done', total: target });
  return steps;
}

const fmtDenom = (v) => (IS_BILL(v) ? `$${v}` : `${v}¢`);

export default function mountGreddy(host, meta) {
  ensureCss();

  const S = STRINGS[getLang()] || STRINGS.en;
  // Etiqueta del tipo de pieza (billete/moneda) en el idioma activo.
  const kindOf = (v) => (IS_BILL(v) ? S.bill : S.coin);

  // ── Display LED del restante ──────────────────────────────────────────────
  const ledValue = el('span', { class: 'gr-led-value mono' }, String(TARGET));
  const display = el(
    'div',
    { class: 'gr-display' },
    el('span', { class: 'gr-led-label' }, S.ledLabel),
    el('span', { class: 'gr-led-cur mono' }, '$'),
    ledValue
  );

  // ── Columna de denominaciones disponibles (mayor a menor) ─────────────────
  const denomEls = new Map(); // denom -> nodo
  const denomList = el('div', { class: 'gr-denoms' });
  [...MONEY].reverse().forEach((v) => {
    const piece = el(
      'div',
      { class: `gr-piece gr-${IS_BILL(v) ? 'bill' : 'coin'}`, dataset: { denom: String(v) } },
      el('span', { class: 'gr-piece-face mono' }, fmtDenom(v))
    );
    const row = el(
      'div',
      { class: 'gr-denom-row', dataset: { denom: String(v) } },
      piece,
      el('span', { class: 'gr-denom-tag' }, kindOf(v))
    );
    denomEls.set(v, row);
    denomList.append(row);
  });

  // ── Bandeja de vuelto entregado ───────────────────────────────────────────
  const trayInner = el('div', { class: 'gr-tray-inner' });
  const tray = el(
    'div',
    { class: 'gr-tray' },
    el('span', { class: 'gr-tray-label' }, S.trayLabel),
    trayInner
  );

  // ── Caja registradora (display + denominaciones + bandeja) ────────────────
  const register = el(
    'div',
    { class: 'gr-register' },
    display,
    el('div', { class: 'gr-register-body' }, denomList, tray)
  );

  const narrator = el('div', { class: 'narrator' }, S.ready);
  const canvas = el('div', { class: 'stage-canvas gr-stage' }, register);
  canvas.append(narrator);

  // ── Estado contable para el aside ─────────────────────────────────────────
  const counts = new Map(MONEY.map((v) => [v, 0]));

  function setNarration(html) {
    narrator.innerHTML = html;
  }

  function clearActive() {
    denomEls.forEach((row) => row.classList.remove('gr-active', 'gr-exhausted'));
  }

  function dropPiece(denom) {
    const piece = el(
      'div',
      { class: `gr-piece gr-${IS_BILL(denom) ? 'bill' : 'coin'} gr-drop` },
      el('span', { class: 'gr-piece-face mono' }, fmtDenom(denom))
    );
    trayInner.append(piece);
    // mantené la bandeja mostrando lo último entregado
    trayInner.scrollTop = trayInner.scrollHeight;
  }

  function renderCounts() {
    clear(countList);
    const given = [];
    MONEY.slice()
      .reverse()
      .forEach((v) => {
        const n = counts.get(v);
        if (n > 0) given.push({ v, n });
      });
    if (!given.length) {
      countList.append(el('span', { class: 'gr-count-empty' }, S.emptyCounts));
      return;
    }
    given.forEach(({ v, n }) => {
      countList.append(
        el(
          'span',
          { class: 'gr-count-pill' },
          el('span', { class: `gr-dot gr-dot-${IS_BILL(v) ? 'bill' : 'coin'}` }),
          el('span', { class: 'mono' }, `${fmtDenom(v)} ×${n}`)
        )
      );
    });
  }

  function totalPieces() {
    let t = 0;
    counts.forEach((n) => (t += n));
    return t;
  }

  function setRemaining(value) {
    ledValue.textContent = String(value);
    // verde mientras queda algo, ámbar/cero al terminar
    display.classList.toggle('gr-zero', value === 0);
  }

  // ── reset ─────────────────────────────────────────────────────────────────
  function resetVisual() {
    clear(trayInner);
    clearActive();
    MONEY.forEach((v) => counts.set(v, 0));
    setRemaining(TARGET);
    remainEl.textContent = String(TARGET);
    piecesEl.textContent = '0';
    renderCounts();
    setNarration(S.ready);
  }

  // ── apply (un step) ───────────────────────────────────────────────────────
  function apply(step) {
    switch (step.type) {
      case 'give': {
        clearActive();
        const row = denomEls.get(step.denom);
        row.classList.add('gr-active');
        dropPiece(step.denom);
        counts.set(step.denom, counts.get(step.denom) + 1);
        setRemaining(step.to);
        remainEl.textContent = String(step.to);
        piecesEl.textContent = String(totalPieces());
        renderCounts();
        return S.give({
          from: step.from,
          kind: kindOf(step.denom),
          denom: fmtDenom(step.denom),
          to: step.to,
        });
      }
      case 'skip': {
        clearActive();
        const row = denomEls.get(step.denom);
        row.classList.add('gr-exhausted');
        return S.skip({
          denom: fmtDenom(step.denom),
          residual: step.residual,
          next: fmtDenom(step.next),
        });
      }
      case 'done': {
        clearActive();
        display.classList.add('gr-done');
        return S.done({ pieces: totalPieces(), total: step.total });
      }
    }
  }

  const player = new Player({
    steps: buildTrace(TARGET),
    apply,
    reset: () => {
      display.classList.remove('gr-done');
      resetVisual();
    },
    baseDelay: 720,
  });
  const { bar, sync } = buildTransport(player);
  player.onChange = (s) => {
    sync(s);
    if (s.narration) setNarration(s.narration);
  };

  const stage = el('div', { class: 'stage' }, canvas, bar);

  // ── aside (infoCard copiado de quick-sort.js) ─────────────────────────────
  const remainEl = el('span', { class: 'big mono' }, String(TARGET));
  const piecesEl = el('span', { class: 'big mono' }, '0');
  const countList = el('div', { class: 'gr-count-list' });

  const aside = el(
    'div',
    { class: 'scene-aside' },
    infoCard(S.cardTargetTitle, el('span', { class: 'big mono' }, `$${TARGET}`), S.cardTargetSub),
    infoCard(S.cardRemainingTitle, remainEl, S.cardRemainingSub),
    infoCard(S.cardPiecesTitle, piecesEl, countList)
  );

  renderCounts();

  clear(host);
  host.append(stage, aside);

  return { destroy: () => player.destroy() };
}

// Copiado de quick-sort.js (mismo patrón de tarjeta de info).
function infoCard(title, big, sub) {
  return el(
    'div',
    { class: 'info-card' },
    el('h4', {}, title),
    big,
    sub
      ? typeof sub === 'string'
        ? el('div', { style: { marginTop: '6px', fontSize: '12px', color: '#76749a' } }, sub)
        : el('div', { style: { marginTop: '8px' } }, sub)
      : null
  );
}
