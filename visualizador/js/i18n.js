// Sistema de idiomas. Inglés por defecto; el usuario puede elegir español.
// El idioma se guarda en localStorage. Cuando cambia, los suscriptores
// (el router) re-renderizan; cada escena lee getLang() al montarse, así que
// remontarla la reconstruye en el idioma activo.

const KEY = 'viz-lang';
const SUPPORTED = ['en', 'es'];

let current = localStorage.getItem(KEY);
if (!SUPPORTED.includes(current)) current = 'en'; // inglés por defecto

const listeners = new Set();

export function getLang() {
  return current;
}

export function setLang(lang) {
  if (!SUPPORTED.includes(lang) || lang === current) return;
  current = lang;
  try {
    localStorage.setItem(KEY, lang);
  } catch (_) {
    /* almacenamiento no disponible: seguimos en memoria */
  }
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
    hero_sub:
      'Every algorithm in the repo, told as an animated scene. One visual metaphor per structure and per sort — faithful to the real code.',
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
    footer: 'Vanilla JS · no build · animations faithful to the repo code',
    // transporte
    tp_play: '▶  Play',
    tp_pause: '❚❚  Pause',
    tp_replay: '↺  Replay',
    tp_step: '⤳ Step',
    tp_step_title: 'Advance one step',
    tp_reset_title: 'Reset',
    tp_ready: 'Ready to play.',
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
      'Cada algoritmo del repo, contado como una escena animada. Una metáfora visual por cada estructura y cada ordenamiento — fiel al código real.',
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
    footer: 'Vanilla JS · sin build · animaciones fieles al código del repo',
    // transporte
    tp_play: '▶  Reproducir',
    tp_pause: '❚❚  Pausar',
    tp_replay: '↺  Repetir',
    tp_step: '⤳ Paso',
    tp_step_title: 'Avanzar un paso',
    tp_reset_title: 'Reiniciar',
    tp_ready: 'Listo para reproducir.',
  },
};
