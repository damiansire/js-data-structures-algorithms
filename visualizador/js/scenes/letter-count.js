// Escena: Letter Count — "Una cinta transportadora industrial con cestas".
//
// Trace FIEL a Algoritmos-generales/letter-count/letter-count.js → countLetterMap:
//   textWithout = text.trim().replaceAll(' ', '')       // ignora espacios (bordes e internos)
//   counts = {}                                          // mapa carácter -> cantidad
//   for letter of textWithout:                           // SIN bajar a minúsculas (case-sensitive)
//     counts[letter] = (counts[letter] ?? 0) + 1
//   return counts
//
// Visual: el string viaja por una CINTA TRANSPORTADORA cuya textura rayada se
// mueve. En cada paso, UN carácter es empujado y CAE en la CESTA etiquetada con
// esa letra; el CONTADOR LED de la cesta incrementa. Los espacios se desvían a
// una rejilla de descarte (replicando replaceAll(' ', '')). Como el repo sólo
// devuelve el mapa (no "la más repetida"), al cerrar destacamos la cesta más
// alta sólo como lectura del resultado, no como valor de retorno.

import { el, clear, setStyle } from '../dom.js';
import { Player, buildTransport } from '../player.js';
import { getLang } from '../i18n.js';

// Strings bilingües de la escena. EN por defecto; ES opcional.
const STRINGS = {
  en: {
    ready: 'Ready to play.',
    trashLabel: 'spaces ✕',
    count: (ch, value) =>
      `Letter <span class="mono">${ch}</span> → basket ` +
      `<span class="mono">${ch}</span>: now <span class="mono">${value}</span>`,
    space: `Space <span class="mono">␣</span> → discarded by <span class="mono">replaceAll(' ', '')</span>`,
    done: (mapHtml, winCh, max) =>
      `Count complete. The returned map is ` +
      `<span class="mono">${mapHtml}</span>` +
      (winCh ? ` — most repeated: <span class="mono">${winCh}</span> (${max})` : ''),
    cardStringTitle: 'String',
    cardStringSub: (clean) => `trim() + replaceAll(' ', '') → "${clean}"`,
    cardCharTitle: 'Character',
    cardCharSub: 'current index on the belt',
    cardResultTitle: 'Result (map)',
    cardResultSub: 'countLetterMap(text) → object',
  },
  es: {
    ready: 'Listo para reproducir.',
    trashLabel: 'espacios ✕',
    count: (ch, value) =>
      `Letra <span class="mono">${ch}</span> → cesta ` +
      `<span class="mono">${ch}</span>: ahora <span class="mono">${value}</span>`,
    space: `Espacio <span class="mono">␣</span> → descartado por <span class="mono">replaceAll(' ', '')</span>`,
    done: (mapHtml, winCh, max) =>
      `Conteo completo. El mapa devuelto es ` +
      `<span class="mono">${mapHtml}</span>` +
      (winCh ? ` — la más repetida: <span class="mono">${winCh}</span> (${max})` : ''),
    cardStringTitle: 'String',
    cardStringSub: (clean) => `trim() + replaceAll(' ', '') → "${clean}"`,
    cardCharTitle: 'Carácter',
    cardCharSub: 'índice actual en la cinta',
    cardResultTitle: 'Resultado (mapa)',
    cardResultSub: 'countLetterMap(text) → objeto',
  },
};

// CSS propio de la escena, autoinyectado una sola vez (no editamos index.html).
const CSS_HREF = './css/scene-letter-count.css';
if (!document.querySelector(`link[data-scene="letter-count"]`)) {
  document.head.append(
    el('link', { rel: 'stylesheet', href: CSS_HREF, dataset: { scene: 'letter-count' } }),
  );
}

// String fijo con repeticiones. countLetterMap es case-sensitive y NO toca
// mayúsculas: 'BANANA' → { B:1, A:3, N:2 }. Incluyo un espacio para mostrar el
// descarte que hace replaceAll(' ', '').
const RAW = 'BAN ANA';

/**
 * Construye los pasos replicando countLetterMap.
 * Cada paso procesa UN carácter del string YA recortado/normalizado por trim(),
 * incluyendo los espacios internos (que el algoritmo descarta en el bucle).
 */
function buildTrace(raw) {
  const trimmed = raw.trim(); // trim() de los bordes
  const steps = [];
  const counts = {}; // mapa que devuelve countLetterMap
  for (let i = 0; i < trimmed.length; i++) {
    const ch = trimmed[i];
    if (ch === ' ') {
      // replaceAll(' ', '') elimina los espacios: no entran al conteo.
      steps.push({ type: 'space', index: i, ch });
      continue;
    }
    counts[ch] = (counts[ch] === undefined ? 0 : counts[ch]) + 1;
    steps.push({ type: 'count', index: i, ch, value: counts[ch] });
  }
  steps.push({ type: 'done' });
  return { steps, counts, trimmed };
}

export default function mountLetterCount(host, meta = {}) {
  const S = STRINGS[getLang()] || STRINGS.en;
  const { steps, counts, trimmed } = buildTrace(RAW);

  // Letras distintas que SÍ cuentan (sin espacios), en orden de aparición.
  const letters = [];
  for (const ch of trimmed) if (ch !== ' ' && !letters.includes(ch)) letters.push(ch);

  // ── Cinta transportadora con los caracteres del string ──────────────────
  const beltStrip = el('div', { class: 'lc-belt-strip' });
  const tiles = [];
  for (let i = 0; i < trimmed.length; i++) {
    const ch = trimmed[i];
    const tile = el(
      'div',
      { class: 'lc-tile' + (ch === ' ' ? ' lc-tile-space' : '') },
      el('span', { class: 'lc-tile-ch' }, ch === ' ' ? '␣' : ch),
    );
    tile._ch = ch;
    tiles.push(tile);
    beltStrip.append(tile);
  }
  const belt = el(
    'div',
    { class: 'lc-belt' },
    el('div', { class: 'lc-belt-tread' }),
    beltStrip,
    el('div', { class: 'lc-roller lc-roller-l' }),
    el('div', { class: 'lc-roller lc-roller-r' }),
  );

  // ── Cestas etiquetadas, una por letra distinta, con contador LED ────────
  const basketByChar = {};
  const countEls = {};
  const baskets = letters.map((ch) => {
    const ledEl = el('span', { class: 'lc-led' }, '0');
    const basket = el(
      'div',
      { class: 'lc-basket' },
      el('div', { class: 'lc-basket-led' }, ledEl),
      el('div', { class: 'lc-basket-body' }, el('span', { class: 'lc-basket-label' }, ch)),
      el('div', { class: 'lc-basket-lip' }),
    );
    basket._ch = ch;
    basketByChar[ch] = basket;
    countEls[ch] = ledEl;
    return basket;
  });
  // Rejilla de descarte para los espacios (replaceAll(' ', '')).
  const trash = el(
    'div',
    { class: 'lc-trash' },
    el('div', { class: 'lc-trash-grate' }),
    el('span', { class: 'lc-trash-label' }, S.trashLabel),
  );
  const basketRow = el('div', { class: 'lc-baskets' }, ...baskets, trash);

  // ── Letra que "cae" de la cinta a la cesta ──────────────────────────────
  const falling = el('div', { class: 'lc-falling' }, el('span', {}, ''));

  const narrator = el('div', { class: 'narrator' }, S.ready);
  const canvas = el(
    'div',
    { class: 'stage-canvas lc-stage' },
    el('div', { class: 'lc-chute' }),
    belt,
    falling,
    basketRow,
    narrator,
  );

  function setNarration(html) {
    narrator.innerHTML = html;
  }

  // Mueve la cinta para que el tile del índice quede sobre la boca de descarga.
  function focusTile(index) {
    const total = trimmed.length;
    // desplazamiento en % del ancho de la tira para centrar el tile activo
    const shift = (0.5 - (index + 0.5) / total) * 100;
    beltStrip.style.transform = `translateX(${shift}%)`;
    tiles.forEach((t, k) => t.classList.toggle('lc-active', k === index));
  }

  // Anima una letra cayendo desde la boca de la cinta a la cesta destino.
  function dropTo(targetEl, ch, kind) {
    const stage = canvas.getBoundingClientRect();
    const dst = targetEl.getBoundingClientRect();
    const x = dst.left - stage.left + dst.width / 2;
    const yTop = belt.getBoundingClientRect().bottom - stage.top;
    const yEnd = dst.top - stage.top + 10;
    falling.querySelector('span').textContent = ch === ' ' ? '␣' : ch;
    falling.className = 'lc-falling lc-' + kind;
    setStyle(falling, { left: x + 'px', '--y0': yTop + 'px', '--y1': yEnd + 'px' });
    // reinicia la animación
    falling.classList.remove('lc-go');
    void falling.offsetWidth;
    falling.classList.add('lc-go');
  }

  function bumpBasket(ch, value) {
    const basket = basketByChar[ch];
    basket.classList.add('lc-receive');
    setTimeout(() => basket.classList.remove('lc-receive'), 420);
    const led = countEls[ch];
    led.textContent = String(value);
    led.classList.remove('lc-tick');
    void led.offsetWidth;
    led.classList.add('lc-tick');
  }

  function resetVisual() {
    letters.forEach((ch) => {
      countEls[ch].textContent = '0';
      countEls[ch].classList.remove('lc-tick');
      basketByChar[ch].classList.remove('lc-receive', 'lc-win');
    });
    tiles.forEach((t) => t.classList.remove('lc-active', 'lc-done'));
    falling.classList.remove('lc-go');
    trash.classList.remove('lc-receive');
    beltStrip.style.transform = 'translateX(50%)';
    belt.classList.remove('lc-running');
    setResult();
    setNarration(S.ready);
  }

  function apply(step) {
    switch (step.type) {
      case 'count': {
        belt.classList.add('lc-running');
        focusTile(step.index);
        tiles[step.index].classList.add('lc-done');
        dropTo(basketByChar[step.ch], step.ch, 'count');
        bumpBasket(step.ch, step.value);
        setResult();
        return S.count(step.ch, step.value);
      }
      case 'space': {
        belt.classList.add('lc-running');
        focusTile(step.index);
        tiles[step.index].classList.add('lc-done');
        dropTo(trash, ' ', 'space');
        trash.classList.add('lc-receive');
        setTimeout(() => trash.classList.remove('lc-receive'), 420);
        return S.space;
      }
      case 'done': {
        belt.classList.remove('lc-running');
        tiles.forEach((t) => t.classList.remove('lc-active'));
        // La cesta más alta, sólo como lectura del mapa (no es el retorno).
        let winCh = null;
        let max = -1;
        for (const ch of letters) {
          if (counts[ch] > max) {
            max = counts[ch];
            winCh = ch;
          }
        }
        letters.forEach((ch, i) => {
          if (ch === winCh) setTimeout(() => basketByChar[ch].classList.add('lc-win'), i * 70);
        });
        return S.done(mapStr(counts), winCh, max);
      }
    }
  }

  const player = new Player({ steps, apply, reset: resetVisual, baseDelay: 760 });
  const { bar, sync } = buildTransport(player);

  const stage = el('div', { class: 'stage' }, canvas, bar);

  // ── Aside con tarjetas de info (mostramos string, índice y resultado) ───
  const idxValue = el('span', { class: 'big' }, '—');
  const resultCode = el('code', {}, '{}');
  function setResult() {
    resultCode.textContent = mapStr(currentCounts());
  }
  function currentCounts() {
    // recalcula desde los LED para reflejar el estado visible
    const o = {};
    for (const ch of letters) {
      const v = parseInt(countEls[ch].textContent, 10) || 0;
      if (v > 0) o[ch] = v;
    }
    return o;
  }

  const aside = el(
    'div',
    { class: 'scene-aside' },
    infoCard(
      S.cardStringTitle,
      el('code', {}, `"${RAW}"`),
      S.cardStringSub(trimmed.replace(/ /g, '')),
    ),
    infoCard(S.cardCharTitle, idxValue, S.cardCharSub),
    infoCard(S.cardResultTitle, resultCode, S.cardResultSub),
  );

  // refleja el índice/carácter actual en la tarjeta en cada cambio
  player.onChange = (s) => {
    sync(s);
    if (s.narration) setNarration(s.narration);
    const i = s.index - 1; // último paso aplicado
    if (i >= 0 && i < steps.length && steps[i].type !== 'done') {
      const st = steps[i];
      idxValue.textContent = `${st.ch === ' ' ? '␣' : st.ch} @ ${st.index}`;
    } else if (s.index === 0) {
      idxValue.textContent = '—';
    }
    setResult();
  };

  const origReset = resetVisual;
  // al resetear, también limpiamos la tarjeta de índice
  player._reset = () => {
    origReset();
    idxValue.textContent = '—';
    setResult();
  };

  clear(host);
  host.append(stage, aside);
  requestAnimationFrame(() => {
    beltStrip.style.transform = 'translateX(50%)';
    setResult();
  });

  return { destroy: () => player.destroy() };
}

/** Serializa el mapa como { A:3, N:2, B:1 } en orden de cantidad desc. */
function mapStr(counts) {
  const entries = Object.entries(counts);
  if (!entries.length) return '{}';
  entries.sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1));
  return '{ ' + entries.map(([k, v]) => `${k}:${v}`).join(', ') + ' }';
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
