// Escena: Counting Sort — "Casilleros tipo palomar (pigeonhole mailboxes)".
//
// Trace FIEL a counting sort estándar para un rango chico de valores 0..K:
//   for value of input:        count[value]++              // FASE 1: contar
//   for v in 0..K:                                          // FASE 2: emitir
//     repeat count[v] times: output.push(v)                // en orden ascendente
//
// Visual: arriba, los ítems de entrada en fila. En el medio, una fila de
// casilleros/palomares etiquetados 0..K, cada uno con un CONTADOR LED.
//   · FASE 1 (count): cada ítem de entrada "vuela" a su casillero numerado y el
//     contador de ese casillero incrementa.
//   · FASE 2 (output): se vacían los casilleros de izquierda a derecha
//     (v = 0..K), soltando count[v] copias de v en una fila de salida ORDENADA
//     abajo. La salida final es el array ordenado.

import { el, clear, setStyle } from '../dom.js';
import { Player, buildTransport } from '../player.js';
import { getLang } from '../i18n.js';

// Entrada fija con valores en el rango 0..5 (K = 5).
const INPUT = [3, 1, 4, 1, 5, 2, 3, 0, 4, 1];
const K = Math.max(...INPUT); // valor máximo → cantidad de casilleros = K + 1

// ── Strings bilingües (inglés por defecto, español opcional) ──────────────
const STRINGS = {
  en: {
    ready: 'Ready to play.',
    phaseCount: 'Phase 1 — Counting',
    phaseEmit: 'Phase 2 — Output',
    inputLabel: 'INPUT',
    mailboxLabel: 'MAILBOXES · 0…' + K,
    outputLabel: 'SORTED OUTPUT',
    count: (value, n) =>
      `Item <span class="mono">${value}</span> flies into mailbox ` +
      `<span class="mono">${value}</span> → <span class="mono">count[${value}] = ${n}</span>`,
    emit: (value, n) =>
      `Emptying mailbox <span class="mono">${value}</span> → release a ` +
      `<span class="mono">${value}</span> into the sorted row (copy ${n})`,
    done: (out) =>
      `All mailboxes emptied left-to-right. Sorted output ` +
      `<span class="mono">[${out}]</span> ✨`,
    cardAlgoTitle: 'Algorithm',
    cardAlgoSub: 'counting sort · range 0…' + K,
    cardComplexityTitle: 'Complexity',
    cardComplexitySub: 'O(n + k) · stable',
    cardInputTitle: 'Input',
    cardInputSub: (n) => `${n} items`,
    cardOutputTitle: 'Output',
    cardOutputSub: 'sorted ascending',
  },
  es: {
    ready: 'Listo para reproducir.',
    phaseCount: 'Fase 1 — Conteo',
    phaseEmit: 'Fase 2 — Salida',
    inputLabel: 'ENTRADA',
    mailboxLabel: 'CASILLEROS · 0…' + K,
    outputLabel: 'SALIDA ORDENADA',
    count: (value, n) =>
      `El ítem <span class="mono">${value}</span> vuela al casillero ` +
      `<span class="mono">${value}</span> → <span class="mono">count[${value}] = ${n}</span>`,
    emit: (value, n) =>
      `Vaciando el casillero <span class="mono">${value}</span> → suelto un ` +
      `<span class="mono">${value}</span> a la fila ordenada (copia ${n})`,
    done: (out) =>
      `Casilleros vaciados de izquierda a derecha. Salida ordenada ` +
      `<span class="mono">[${out}]</span> ✨`,
    cardAlgoTitle: 'Algoritmo',
    cardAlgoSub: 'counting sort · rango 0…' + K,
    cardComplexityTitle: 'Complejidad',
    cardComplexitySub: 'O(n + k) · estable',
    cardInputTitle: 'Entrada',
    cardInputSub: (n) => `${n} ítems`,
    cardOutputTitle: 'Salida',
    cardOutputSub: 'orden ascendente',
  },
};

// CSS propio de la escena, autoinyectado una sola vez (no editamos index.html).
const CSS_HREF = './css/scene-counting-sort.css';
if (!document.querySelector(`link[data-scene="counting-sort"]`)) {
  document.head.append(
    el('link', { rel: 'stylesheet', href: CSS_HREF, dataset: { scene: 'counting-sort' } })
  );
}

/**
 * Construye los pasos corriendo el counting sort real.
 *   FASE 1: count[value]++ por cada ítem de entrada (en orden de entrada).
 *   FASE 2: para v = 0..K, soltar count[v] copias de v a la salida.
 * El array de salida acumulado es el orden ascendente final.
 */
function buildTrace(input, k) {
  const count = new Array(k + 1).fill(0);
  const steps = [];
  // FASE 1 — contar
  input.forEach((value, i) => {
    count[value] += 1;
    steps.push({ type: 'count', index: i, value, n: count[value] });
  });
  // FASE 2 — emitir en orden ascendente
  let outPos = 0;
  for (let v = 0; v <= k; v++) {
    for (let c = 1; c <= count[v]; c++) {
      steps.push({ type: 'emit', value: v, copy: c, remaining: count[v] - c, outPos });
      outPos += 1;
    }
  }
  steps.push({ type: 'done' });
  // salida ordenada de referencia (réplica fiel del algoritmo)
  const output = [];
  for (let v = 0; v <= k; v++) for (let c = 0; c < count[v]; c++) output.push(v);
  return { steps, count, output };
}

export default function mountCountingSort(host, meta = {}) {
  const S = STRINGS[getLang()] || STRINGS.en;
  const { steps, output } = buildTrace(INPUT, K);

  // ── Fila de entrada (los ítems a ordenar) ───────────────────────────────
  const inItems = INPUT.map((v, i) => {
    const it = el('div', { class: 'cs-item' }, String(v));
    it._value = v;
    it._index = i;
    return it;
  });
  const inputRow = el('div', { class: 'cs-input-row' }, ...inItems);
  const inputWrap = el(
    'div',
    { class: 'cs-zone cs-input-wrap' },
    el('span', { class: 'cs-zone-label' }, S.inputLabel),
    inputRow
  );

  // ── Casilleros / palomares etiquetados 0..K, cada uno con LED ───────────
  const boxes = [];
  const ledEls = [];
  for (let v = 0; v <= K; v++) {
    const led = el('span', { class: 'cs-led' }, '0');
    const box = el(
      'div',
      { class: 'cs-box' },
      el('div', { class: 'cs-box-led' }, led),
      el('div', { class: 'cs-box-hole' }, el('span', { class: 'cs-box-label' }, String(v))),
      el('div', { class: 'cs-box-lip' })
    );
    box._value = v;
    boxes.push(box);
    ledEls.push(led);
  }
  const boxRow = el('div', { class: 'cs-box-row' }, ...boxes);
  const boxWrap = el(
    'div',
    { class: 'cs-zone cs-box-wrap' },
    el('span', { class: 'cs-zone-label' }, S.mailboxLabel),
    boxRow
  );

  // ── Fila de salida ordenada (se llena en la fase 2) ─────────────────────
  const outputRow = el('div', { class: 'cs-output-row' });
  const outputWrap = el(
    'div',
    { class: 'cs-zone cs-output-wrap' },
    el('span', { class: 'cs-zone-label cs-zone-ok' }, S.outputLabel),
    outputRow
  );

  // ── Indicador de fase ───────────────────────────────────────────────────
  const phaseTag = el('div', { class: 'cs-phase' }, '');

  // ── Ítem que "vuela" entre zonas ────────────────────────────────────────
  const flyer = el('div', { class: 'cs-flyer' }, el('span', {}, ''));

  const narrator = el('div', { class: 'narrator' }, S.ready);
  const canvas = el(
    'div',
    { class: 'stage-canvas cs-stage' },
    phaseTag,
    inputWrap,
    boxWrap,
    outputWrap,
    flyer,
    narrator
  );

  function setNarration(html) {
    narrator.innerHTML = html;
  }
  function setPhase(text, kind) {
    phaseTag.textContent = text;
    phaseTag.className = 'cs-phase' + (kind ? ' cs-phase-' + kind : '');
  }

  // Anima un ítem volando desde `fromEl` hacia `toEl` (centros).
  function flyBetween(fromEl, toEl, value, kind) {
    const stage = canvas.getBoundingClientRect();
    const a = fromEl.getBoundingClientRect();
    const b = toEl.getBoundingClientRect();
    const x0 = a.left - stage.left + a.width / 2;
    const y0 = a.top - stage.top + a.height / 2;
    const x1 = b.left - stage.left + b.width / 2;
    const y1 = b.top - stage.top + b.height / 2;
    flyer.querySelector('span').textContent = String(value);
    flyer.className = 'cs-flyer cs-' + kind;
    setStyle(flyer, {
      '--x0': x0 + 'px',
      '--y0': y0 + 'px',
      '--x1': x1 + 'px',
      '--y1': y1 + 'px',
    });
    flyer.classList.remove('cs-go');
    void flyer.offsetWidth; // fuerza reflow
    flyer.classList.add('cs-go');
  }

  function bumpBox(v, n) {
    const box = boxes[v];
    box.classList.add('cs-receive');
    setTimeout(() => box.classList.remove('cs-receive'), 420);
    const led = ledEls[v];
    led.textContent = String(n);
    led.classList.remove('cs-tick');
    void led.offsetWidth;
    led.classList.add('cs-tick');
  }

  function resetVisual() {
    inItems.forEach((it) => it.classList.remove('cs-active', 'cs-done'));
    boxes.forEach((box, v) => {
      box.classList.remove('cs-receive', 'cs-emptying', 'cs-empty');
      ledEls[v].textContent = '0';
      ledEls[v].classList.remove('cs-tick');
    });
    clear(outputRow);
    flyer.classList.remove('cs-go');
    setPhase('', null);
    setNarration(S.ready);
  }

  function apply(step) {
    switch (step.type) {
      case 'count': {
        setPhase(S.phaseCount, 'count');
        const item = inItems[step.index];
        inItems.forEach((it) => it.classList.remove('cs-active'));
        item.classList.add('cs-active');
        flyBetween(item, boxes[step.value], step.value, 'count');
        setTimeout(() => item.classList.add('cs-done'), 200);
        bumpBox(step.value, step.n);
        return S.count(step.value, step.n);
      }
      case 'emit': {
        setPhase(S.phaseEmit, 'emit');
        const v = step.value;
        const box = boxes[v];
        box.classList.add('cs-emptying');
        setTimeout(() => box.classList.remove('cs-emptying'), 360);
        // decrementa el LED del casillero a medida que se vacía
        ledEls[v].textContent = String(step.remaining);
        if (step.remaining === 0) box.classList.add('cs-empty');
        // suelta una copia de v en la fila ordenada
        const outItem = el('div', { class: 'cs-out-item' }, String(v));
        outputRow.append(outItem);
        flyBetween(box, outItem, v, 'emit');
        requestAnimationFrame(() => outItem.classList.add('cs-out-in'));
        return S.emit(v, step.copy);
      }
      case 'done': {
        setPhase(S.phaseEmit, 'emit');
        inItems.forEach((it) => it.classList.remove('cs-active'));
        const items = Array.from(outputRow.children);
        items.forEach((it, i) => setTimeout(() => it.classList.add('cs-out-win'), i * 50));
        return S.done(output.join(', '));
      }
    }
  }

  const player = new Player({ steps, apply, reset: resetVisual, baseDelay: 720 });
  const { bar, sync } = buildTransport(player);
  player.onChange = (s) => {
    sync(s);
    if (s.narration) setNarration(s.narration);
  };

  const stage = el('div', { class: 'stage' }, canvas, bar);
  const aside = el(
    'div',
    { class: 'scene-aside' },
    infoCard(S.cardAlgoTitle, el('span', { class: 'big' }, 'O(n+k)'), S.cardAlgoSub),
    infoCard(S.cardComplexityTitle, el('span', { class: 'big' }, 'stable'), S.cardComplexitySub),
    infoCard(S.cardInputTitle, el('code', {}, `[${INPUT.join(', ')}]`), S.cardInputSub(INPUT.length)),
    infoCard(S.cardOutputTitle, el('code', {}, `[${output.join(', ')}]`), S.cardOutputSub)
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
    sub ? el('div', { style: { marginTop: '6px', fontSize: '12px', color: '#76749a' } }, sub) : null
  );
}
