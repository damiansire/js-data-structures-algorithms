// Escena: Caesar Cipher — "Un anillo decodificador giratorio".
//
// Cifrado César estándar sobre el mensaje "HELLO WORLD" con desplazamiento 3.
// Para cada letra c:  ((c - 'A' + shift) mod 26) + 'A'  (espacios y signos
// quedan intactos). "HELLO WORLD" + shift 3 → "KHOOR ZRUOG".
//
// Metáfora: dos anillos concéntricos con el alfabeto. El anillo EXTERNO es el
// texto plano; el INTERNO está rotado `shift` posiciones. Al avanzar el Player
// por cada carácter del mensaje, se resalta la letra en el anillo externo y la
// rueda muestra a qué letra del anillo interno mapea; el texto cifrado se va
// construyendo letra por letra abajo.

import { el, clear } from '../dom.js';
import { Player, buildTransport } from '../player.js';
import { getLang } from '../i18n.js';

const MESSAGE = 'HELLO WORLD';
const SHIFT = 3;
const ALPHA = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const A_CODE = 'A'.charCodeAt(0);

// CSS propio de la escena, autoinyectado una sola vez (no editamos index.html).
const CSS_HREF = './css/scene-caesar-cipher.css';
if (!document.querySelector(`link[data-scene="caesar-cipher"]`)) {
  document.head.append(
    el('link', { rel: 'stylesheet', href: CSS_HREF, dataset: { scene: 'caesar-cipher' } }),
  );
}

// ── Strings bilingües (inglés por defecto, español opcional) ──────────
const STRINGS = {
  en: {
    ready: 'Ready to play. Spin the ring to read the secret message.',
    reset:
      'Ready to play. The outer ring is the plaintext; the inner ring is rotated by the shift.',
    ringOuterLabel: 'PLAINTEXT',
    ringInnerLabel: `+${SHIFT} CIPHER`,
    plaintextLabel: 'Plaintext',
    shiftLabel: 'Shift',
    ciphertextLabel: 'Ciphertext',
    cardWheelTitle: 'Decoder ring',
    cardWheelSub: 'rotate the alphabet',
    cardFormulaTitle: 'Formula',
    cardFormulaSub: '(c − A + shift) mod 26',
    cardComplexityTitle: 'Complexity',
    cardComplexitySub: 'one pass',
    encode: (plain, cipher) =>
      `Letter <span class="mono">${plain}</span> on the outer ring lines up with <span class="mono">${cipher}</span> on the inner ring → cipher <span class="mono">${cipher}</span>.`,
    skip: () => `A space stays a space — only letters ride the ring.`,
    done: (out) => `Message encoded → <span class="mono">${out}</span> ✨`,
  },
  es: {
    ready: 'Listo para reproducir. Girá el anillo para leer el mensaje secreto.',
    reset:
      'Listo para reproducir. El anillo externo es el texto plano; el interno está rotado por el desplazamiento.',
    ringOuterLabel: 'TEXTO PLANO',
    ringInnerLabel: `+${SHIFT} CIFRADO`,
    plaintextLabel: 'Texto plano',
    shiftLabel: 'Desplazamiento',
    ciphertextLabel: 'Texto cifrado',
    cardWheelTitle: 'Anillo decodificador',
    cardWheelSub: 'rotar el alfabeto',
    cardFormulaTitle: 'Fórmula',
    cardFormulaSub: '(c − A + shift) mod 26',
    cardComplexityTitle: 'Complejidad',
    cardComplexitySub: 'una pasada',
    encode: (plain, cipher) =>
      `La letra <span class="mono">${plain}</span> del anillo externo se alinea con <span class="mono">${cipher}</span> del anillo interno → cifra <span class="mono">${cipher}</span>.`,
    skip: () => `Un espacio sigue siendo espacio — solo las letras viajan en el anillo.`,
    done: (out) => `Mensaje cifrado → <span class="mono">${out}</span> ✨`,
  },
};

// Réplica fiel del cifrado César (también para mostrar la salida en el aside).
function caesar(text, shift) {
  let out = '';
  for (const ch of text) {
    if (ch >= 'A' && ch <= 'Z') {
      const code = ((ch.charCodeAt(0) - A_CODE + shift) % 26) + A_CODE;
      out += String.fromCharCode(code);
    } else {
      out += ch;
    }
  }
  return out;
}

// Pasos: un carácter del mensaje por paso (encode / skip / done).
function buildTrace(text, shift) {
  const steps = [];
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch >= 'A' && ch <= 'Z') {
      const cipher = String.fromCharCode(((ch.charCodeAt(0) - A_CODE + shift) % 26) + A_CODE);
      steps.push({ type: 'encode', index: i, plain: ch, cipher });
    } else {
      steps.push({ type: 'skip', index: i, plain: ch });
    }
  }
  steps.push({ type: 'done' });
  return steps;
}

export default function mountCaesarCipher(host, meta) {
  const S = STRINGS[getLang()] || STRINGS.en;
  const CIPHERTEXT = caesar(MESSAGE, SHIFT);

  // ── La rueda decodificadora (dos anillos concéntricos) ──────────────
  const RADIUS_OUTER = 168;
  const RADIUS_INNER = 120;
  const outerLetters = [];
  const innerLetters = [];

  function ringLetter(letter, i, radius, cls) {
    const angle = (i / 26) * 360 - 90; // 'A' arriba
    const node = el('span', { class: cls }, letter);
    node.style.setProperty('--ang', `${angle}deg`);
    node.style.setProperty('--rad', `${radius}px`);
    return node;
  }

  const outerRing = el('div', { class: 'cae-ring cae-ring-outer' });
  for (let i = 0; i < 26; i++) {
    const n = ringLetter(ALPHA[i], i, RADIUS_OUTER, 'cae-letter cae-letter-outer');
    outerLetters.push(n);
    outerRing.append(n);
  }
  // El anillo interno gira; sus letras se colocan rotadas por shift.
  const innerRing = el('div', { class: 'cae-ring cae-ring-inner' });
  for (let i = 0; i < 26; i++) {
    const n = ringLetter(ALPHA[i], i, RADIUS_INNER, 'cae-letter cae-letter-inner');
    innerLetters.push(n);
    innerRing.append(n);
  }
  // Rota el anillo interno físicamente para que 'A' externo apunte a su cifra.
  const ringRotation = -(SHIFT / 26) * 360;
  innerRing.style.setProperty('--ring-rot', `${ringRotation}deg`);

  const hub = el(
    'div',
    { class: 'cae-hub' },
    el('span', { class: 'cae-hub-shift mono' }, `+${SHIFT}`),
    el('span', { class: 'cae-hub-label' }, S.shiftLabel),
  );
  const pointer = el('div', { class: 'cae-pointer' });

  const wheel = el(
    'div',
    { class: 'cae-wheel' },
    el('span', { class: 'cae-ring-tag cae-tag-outer' }, S.ringOuterLabel),
    el('span', { class: 'cae-ring-tag cae-tag-inner' }, S.ringInnerLabel),
    outerRing,
    innerRing,
    hub,
    pointer,
  );

  // ── Tira del mensaje + salida cifrada (letra por letra) ─────────────
  const plainCells = [];
  const cipherCells = [];
  const plainRow = el('div', { class: 'cae-strip-row' });
  const cipherRow = el('div', { class: 'cae-strip-row' });
  for (let i = 0; i < MESSAGE.length; i++) {
    const isSpace = MESSAGE[i] === ' ';
    const pc = el(
      'span',
      { class: 'cae-cell cae-cell-plain mono' + (isSpace ? ' cae-cell-space' : '') },
      isSpace ? '␣' : MESSAGE[i],
    );
    const cc = el(
      'span',
      { class: 'cae-cell cae-cell-cipher mono' + (isSpace ? ' cae-cell-space' : '') },
      '·',
    );
    plainCells.push(pc);
    cipherCells.push(cc);
    plainRow.append(pc);
    cipherRow.append(cc);
  }
  const strip = el(
    'div',
    { class: 'cae-strip' },
    el(
      'div',
      { class: 'cae-strip-line' },
      el('span', { class: 'cae-strip-label' }, S.plaintextLabel),
      plainRow,
    ),
    el('div', { class: 'cae-strip-arrow' }, '↓'),
    el(
      'div',
      { class: 'cae-strip-line' },
      el('span', { class: 'cae-strip-label cae-strip-label-out' }, S.ciphertextLabel),
      cipherRow,
    ),
  );

  // ── Lienzo ──────────────────────────────────────────────────────────
  const narrator = el('div', { class: 'narrator' }, S.ready);
  const canvas = el('div', { class: 'stage-canvas cae-stage' }, wheel, strip, narrator);

  // ── Helpers de render ───────────────────────────────────────────────
  function setNarration(html) {
    narrator.innerHTML = html;
  }
  function clearMarks() {
    outerLetters.forEach((n) => n.classList.remove('cae-hot'));
    innerLetters.forEach((n) => n.classList.remove('cae-hot'));
    plainCells.forEach((n) => n.classList.remove('cae-active'));
    pointer.classList.remove('cae-pointer-on');
  }

  function resetVisual() {
    clearMarks();
    cipherCells.forEach((c, i) => {
      c.classList.remove('cae-filled', 'cae-pop');
      c.textContent = MESSAGE[i] === ' ' ? '␣' : '·';
      if (MESSAGE[i] === ' ') c.classList.add('cae-filled');
    });
    setNarration(S.reset);
  }

  function spotlight(index, plain, cipher) {
    clearMarks();
    plainCells[index].classList.add('cae-active');
    // resalta letra en el anillo externo
    const oi = ALPHA.indexOf(plain);
    if (oi >= 0) outerLetters[oi].classList.add('cae-hot');
    // resalta la letra cifrada en el anillo interno
    const ii = ALPHA.indexOf(cipher);
    if (ii >= 0) innerLetters[ii].classList.add('cae-hot');
    pointer.classList.add('cae-pointer-on');
  }

  function apply(step, ctx) {
    const animate = ctx && ctx.animate;
    if (step.type === 'done') {
      clearMarks();
      return S.done(CIPHERTEXT);
    }

    if (step.type === 'skip') {
      clearMarks();
      plainCells[step.index].classList.add('cae-active');
      const cell = cipherCells[step.index];
      cell.textContent = '␣';
      cell.classList.add('cae-filled');
      return S.skip();
    }

    // encode
    spotlight(step.index, step.plain, step.cipher);
    const cell = cipherCells[step.index];
    cell.textContent = step.cipher;
    cell.classList.add('cae-filled');
    if (animate) {
      cell.classList.remove('cae-pop');
      void cell.offsetWidth; // reflow para reiniciar la animación
      cell.classList.add('cae-pop');
    }
    return S.encode(step.plain, step.cipher);
  }

  // ── Player + transporte ─────────────────────────────────────────────
  const player = new Player({
    steps: buildTrace(MESSAGE, SHIFT),
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
    infoCard(S.cardWheelTitle, el('span', { class: 'big' }, `ROT${SHIFT}`), S.cardWheelSub),
    infoCard(S.cardFormulaTitle, el('span', { class: 'big' }, `+${SHIFT}`), S.cardFormulaSub),
    infoCard(S.cardComplexityTitle, el('span', { class: 'big' }, 'O(n)'), S.cardComplexitySub),
    infoCard(S.plaintextLabel, el('code', {}, MESSAGE), null),
    infoCard(S.ciphertextLabel, el('code', {}, CIPHERTEXT), null),
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
