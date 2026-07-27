// Sistema de idiomas. Inglés por defecto; el usuario puede elegir español.
// El idioma se guarda en localStorage. Cuando cambia, los suscriptores
// (el router) re-renderizan; cada escena lee getLang() al montarse, así que
// remontarla la reconstruye en el idioma activo.

const KEY = 'viz-lang';
const SUPPORTED = ['en', 'es'];

/**
 * Lee localStorage sin poder tumbar la app. Acceder a `window.localStorage`
 * LANZA (SecurityError) en Safari privado con storage bloqueado, en un iframe
 * con cookies de terceros bloqueadas o con "Block all cookies" en Chrome. Como
 * esta lectura pasa a nivel de módulo, sin guarda dejaba la página en blanco:
 * el import de i18n.js reventaba antes de que el router pudiera renderizar
 * nada. Una preferencia de idioma opcional no puede voltear el arranque.
 * @param {string} key
 * @returns {string|null} El valor guardado, o null si el storage no está.
 */
function safeGet(key) {
  try {
    return localStorage.getItem(key);
  } catch (_) {
    return null; // almacenamiento no disponible: seguimos en memoria
  }
}

/**
 * Escribe en localStorage sin poder tumbar la app (mismo motivo que safeGet,
 * más el QuotaExceededError del modo privado).
 * @param {string} key
 * @param {string} value
 */
function safeSet(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch (_) {
    /* almacenamiento no disponible: seguimos en memoria */
  }
}

let current = safeGet(KEY);
if (!SUPPORTED.includes(current)) current = 'en'; // inglés por defecto

const listeners = new Set();

export function getLang() {
  return current;
}

export function setLang(lang) {
  if (!SUPPORTED.includes(lang) || lang === current) return;
  current = lang;
  safeSet(KEY, lang);
  document.documentElement.lang = lang;
  listeners.forEach((fn) => fn(lang));
}

export function toggleLang() {
  setLang(current === 'en' ? 'es' : 'en');
}

/** Suscribe a cambios de idioma. Devuelve función para desuscribir. */
export function onLang(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/**
 * Dado un objeto { en, es } devuelve el texto del idioma actual (fallback en).
 * Útil para metadatos bilingües (catálogo, escenas).
 */
export function pick(obj) {
  if (obj == null) return '';
  if (typeof obj === 'string') return obj;
  return obj[current] ?? obj.en ?? '';
}

/** Traducción de una clave de UI a nivel app. */
export function t(key) {
  const dict = UI[current] || UI.en;
  return dict[key] ?? UI.en[key] ?? key;
}

// ── Diccionario de strings a nivel app (no escenas) ──────────────
export const UI = {
  en: {
    brand_sub: 'The Scene Catalog',
    nav_repo: 'Repo ↗',
    lang_name: 'EN',
    lang_switch_to: 'Español',
    hero_pre: 'Watch how algorithms ',
    hero_accent: 'think',
    hero_post: '',
    // El claim está acotado a propósito: sólo las escenas cuya lógica tiene un
    // módulo canónico en el repo están atadas a él por un test de equivalencia.
    // Prometer fidelidad para las 42 sería falso (la mitad del catálogo vive
    // sólo en la capa de vista) y el repo ya shipeó drift por eso.
    hero_sub:
      'Every algorithm in the repo, told as an animated scene. One visual metaphor per structure and per sort. Where a canonical module exists, a test checks the scene against it.',
    stat_scenes: 'scenes',
    stat_animated: 'animated',
    stat_categories: 'categories',
    stat_vanilla: 'Vanilla JS · 0 dependencies',
    scroll_hint: 'Pick a scene',
    count_scene: 'scene',
    count_scenes: 'scenes',
    badge_ready: 'Ready',
    badge_soon: 'Soon',
    back_title: 'Back to the catalog',
    soon_title: 'Scene under construction',
    soon_body: 'This metaphor is not animated yet.',
    error_title: 'Could not load the scene',
    error_body: 'Check the console.',
    footer:
      'Vanilla JS · no build · scenes checked against the repo code where a canonical module exists',
    // transporte
    tp_play: '▶  Play',
    tp_pause: '❚❚  Pause',
    tp_replay: '↺  Replay',
    tp_step: '⤳ Step',
    tp_step_title: 'Advance one step',
    tp_reset_title: 'Reset',
    tp_ready: 'Ready to play.',
    tp_speed_label: 'Playback speed',
    tp_play_hint: 'Play / Pause (Space)',
    tp_progress_label: 'Step progress',
    // nombres accesibles (catálogo y narración)
    card_open: 'open the scene',
    card_soon: 'scene not animated yet',
    narrator_label: 'Step-by-step narration',
  },
  es: {
    brand_sub: 'El Catálogo de Escenas',
    nav_repo: 'Repo ↗',
    lang_name: 'ES',
    lang_switch_to: 'English',
    hero_pre: 'Mirá cómo ',
    hero_accent: 'piensan',
    hero_post: ' los algoritmos',
    hero_sub:
      'Cada algoritmo del repo, contado como una escena animada. Una metáfora visual por cada estructura y cada ordenamiento. Donde hay módulo canónico, un test verifica que la escena coincida.',
    stat_scenes: 'escenas',
    stat_animated: 'animadas',
    stat_categories: 'categorías',
    stat_vanilla: 'Vanilla JS · 0 dependencias',
    scroll_hint: 'Elegí una escena',
    count_scene: 'escena',
    count_scenes: 'escenas',
    badge_ready: 'Listo',
    badge_soon: 'Próximamente',
    back_title: 'Volver al catálogo',
    soon_title: 'Escena en construcción',
    soon_body: 'Esta metáfora todavía no está animada.',
    error_title: 'No se pudo cargar la escena',
    error_body: 'Revisá la consola.',
    footer:
      'Vanilla JS · sin build · escenas verificadas contra el código del repo donde hay módulo canónico',
    // transporte
    tp_play: '▶  Reproducir',
    tp_pause: '❚❚  Pausar',
    tp_replay: '↺  Repetir',
    tp_step: '⤳ Paso',
    tp_step_title: 'Avanzar un paso',
    tp_reset_title: 'Reiniciar',
    tp_ready: 'Listo para reproducir.',
    tp_speed_label: 'Velocidad de reproducción',
    tp_play_hint: 'Reproducir / Pausar (barra espaciadora)',
    tp_progress_label: 'Progreso de pasos',
    // nombres accesibles (catálogo y narración)
    card_open: 'abrir la escena',
    card_soon: 'escena todavía no animada',
    narrator_label: 'Narración paso a paso',
  },
};
