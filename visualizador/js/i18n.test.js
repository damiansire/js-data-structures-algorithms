/**
 * @jest-environment jsdom
 */
// Regresión: `i18n.js` leía localStorage a nivel de módulo, sin guarda. En
// cualquier contexto donde acceder a `window.localStorage` LANZA (Safari
// privado con storage bloqueado, iframe con cookies de terceros bloqueadas,
// "Block all cookies" en Chrome), la evaluación del módulo tiraba SecurityError,
// la cadena de imports de app.js fallaba y la página quedaba EN BLANCO: el
// try/catch de renderScene nunca llegaba a correr porque el fallo era en tiempo
// de import. Estos tests fijan que una preferencia de idioma opcional no puede
// voltear el arranque de la SPA.
import { jest } from '@jest/globals';

// jsdom instala `localStorage` como propiedad de window; se guarda el descriptor
// original para devolverlo tal cual entre tests (borrarlo deja el entorno roto).
const ORIGINAL_LOCAL_STORAGE = Object.getOwnPropertyDescriptor(window, 'localStorage');

function restoreLocalStorage() {
  if (ORIGINAL_LOCAL_STORAGE) {
    Object.defineProperty(window, 'localStorage', ORIGINAL_LOCAL_STORAGE);
  }
}

/** Deja `window.localStorage` lanzando, como en Safari privado con storage bloqueado. */
function breakLocalStorage() {
  Object.defineProperty(window, 'localStorage', {
    configurable: true,
    get() {
      throw new DOMException('The operation is insecure.', 'SecurityError');
    },
  });
}

/** Reemplaza localStorage por un stub en memoria con el idioma ya guardado. */
function stubLocalStorage(stored) {
  const data = new Map(stored ? [['viz-lang', stored]] : []);
  Object.defineProperty(window, 'localStorage', {
    configurable: true,
    value: {
      getItem: (k) => (data.has(k) ? data.get(k) : null),
      setItem: (k, v) => data.set(k, String(v)),
    },
  });
  return data;
}

describe('i18n con localStorage inaccesible', () => {
  afterEach(() => {
    // Primero se restaura el storage: jest.resetModules() recorre los globals y
    // dispararía el getter que lanza, tirando el hook en vez del test.
    restoreLocalStorage();
    jest.resetModules();
  });

  test('importar el módulo no lanza y cae al idioma por defecto', async () => {
    breakLocalStorage();
    // Sin la guarda, este import rechaza con SecurityError (página en blanco).
    const i18n = await import('./i18n.js');
    expect(i18n.getLang()).toBe('en');
  });

  test('el toggle de idioma sigue funcionando en memoria', async () => {
    breakLocalStorage();
    const i18n = await import('./i18n.js');
    expect(() => i18n.setLang('es')).not.toThrow();
    expect(i18n.getLang()).toBe('es');
    expect(document.documentElement.lang).toBe('es');
  });

  test('leer el acceso a localStorage sigue lanzando (el fixture es fiel)', () => {
    breakLocalStorage();
    expect(() => window.localStorage.getItem('viz-lang')).toThrow();
  });
});

describe('i18n con localStorage disponible', () => {
  afterEach(() => {
    // Primero se restaura el storage: jest.resetModules() recorre los globals y
    // dispararía el getter que lanza, tirando el hook en vez del test.
    restoreLocalStorage();
    jest.resetModules();
  });

  test('respeta el idioma guardado y persiste el cambio', async () => {
    const data = stubLocalStorage('es');
    jest.resetModules();
    const i18n = await import('./i18n.js');
    expect(i18n.getLang()).toBe('es');
    i18n.setLang('en');
    expect(data.get('viz-lang')).toBe('en');
  });
});
