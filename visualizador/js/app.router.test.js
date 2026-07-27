/**
 * @jest-environment jsdom
 */
// El router es la superficie pública de la app publicada en Pages: un link
// compartido apunta a `#/scene/<id>`. Estaba al 0% de cobertura, así que nada
// impedía que un refactor rompiera el deep-link, que un id desconocido dejara
// pantalla en blanco, o que el guard anti-race `renderGen` se borrara por
// parecer código muerto.
//
// app.js no exporta nada y monta la app al importarse, así que se ejercita a
// través del DOM real, igual que lo hace el navegador.
import { jest } from '@jest/globals';
import { SCENES } from './catalog.js';

// El fondo de constelación pinta en un canvas 2D, que jsdom no implementa.
// No es lo que se está probando acá: se reemplaza por un doble con la misma
// forma (start/stop) para que el router sea lo único bajo test.
const bg = { start: jest.fn(), stop: jest.fn() };
jest.unstable_mockModule('./home-bg.js', () => ({ startConstellation: () => bg }));

// El chrome que el index.html trae ya pintado, más el host del router.
document.body.innerHTML = `
  <span id="brand-sub"></span>
  <button id="lang-toggle"><span id="lang-label"></span></button>
  <main id="app"></main>
  <span id="footer-text"></span>
`;
window.scrollTo = () => {};
location.hash = '#/';

await import('./app.js');

const app = document.getElementById('app');

/** Deja correr los microtasks pendientes (los dynamic import de las escenas). */
async function flush(times = 6) {
  for (let i = 0; i < times; i++) await Promise.resolve();
  await new Promise((r) => setTimeout(r, 0));
}

/** Navega como lo hace el navegador: cambia el hash y dispara hashchange. */
async function goto(hash) {
  location.hash = hash;
  window.dispatchEvent(new Event('hashchange'));
  await flush();
}

describe('router: catálogo', () => {
  beforeEach(async () => {
    await goto('#/');
  });

  test('#/ pinta una tarjeta por escena del catálogo', () => {
    expect(app.querySelectorAll('.card')).toHaveLength(SCENES.length);
  });

  test('cada tarjeta se anuncia como control con nombre accesible', () => {
    const cards = app.querySelectorAll('.card');
    for (const card of cards) {
      expect(card.getAttribute('role')).toBe('button');
      expect(card.getAttribute('aria-label')).toBeTruthy();
    }
  });

  test('las escenas no construidas quedan marcadas aria-disabled y sin foco', () => {
    for (const s of SCENES) {
      const card = [...app.querySelectorAll('.card')].find((c) =>
        c.getAttribute('aria-label').startsWith(s.title),
      );
      if (s.built) {
        expect(card.getAttribute('aria-disabled')).toBeNull();
        expect(card.tabIndex).toBe(0);
      } else {
        expect(card.getAttribute('aria-disabled')).toBe('true');
      }
    }
  });

  test('activar una tarjeta con Enter navega a su escena', async () => {
    const card = [...app.querySelectorAll('.card')].find((c) =>
      c.getAttribute('aria-label').startsWith('Bubble Sort'),
    );
    card.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    expect(location.hash).toBe('#/scene/bubble-sort');
    await goto('#/');
  });
});

describe('router: vista de escena', () => {
  test('#/scene/bubble-sort monta la escena real', async () => {
    await goto('#/scene/bubble-sort');
    expect(app.querySelector('.scene-view')).not.toBeNull();
    expect(app.querySelector('.stage')).not.toBeNull();
    expect(app.querySelectorAll('.card')).toHaveLength(0);
  });

  test('la narración de la escena queda anunciada como región live', async () => {
    await goto('#/scene/bubble-sort');
    const narrator = app.querySelector('.narrator');
    expect(narrator).not.toBeNull();
    expect(narrator.getAttribute('role')).toBe('status');
    expect(narrator.getAttribute('aria-live')).toBe('polite');
    expect(narrator.getAttribute('aria-atomic')).toBe('true');
  });

  test('el slider de velocidad tiene nombre accesible propio', async () => {
    await goto('#/scene/bubble-sort');
    const slider = app.querySelector('.transport input[type="range"]');
    expect(slider.getAttribute('aria-label')).toBeTruthy();
    expect(slider.getAttribute('aria-valuetext')).toBe('1.0×');
  });

  test('la barra espaciadora reproduce sin tener que apuntar con el mouse', async () => {
    await goto('#/scene/bubble-sort');
    const primary = app.querySelector('.transport .tbtn.primary');
    const clicked = jest.fn();
    primary.addEventListener('click', clicked);
    document.body.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
    expect(clicked).toHaveBeenCalledTimes(1);
  });

  test('#/scene/no-existe vuelve al catálogo en vez de dejar pantalla en blanco', async () => {
    await goto('#/scene/no-existe');
    expect(app.querySelectorAll('.card')).toHaveLength(SCENES.length);
    expect(app.querySelector('.scene-view')).toBeNull();
  });

  test('volver al catálogo desmonta la escena y reanuda el fondo', async () => {
    await goto('#/scene/bubble-sort');
    bg.start.mockClear();
    await goto('#/');
    expect(app.querySelector('.scene-view')).toBeNull();
    expect(bg.start).toHaveBeenCalled();
  });

  test('A -> B -> A deja montada una sola escena', async () => {
    await goto('#/scene/bubble-sort');
    await goto('#/scene/quick-sort');
    await goto('#/scene/bubble-sort');
    expect(app.querySelectorAll('.scene-view')).toHaveLength(1);
    expect(app.querySelectorAll('.stage')).toHaveLength(1);
  });

  test('el atajo de espacio no sobrevive al desmontaje de la escena', async () => {
    await goto('#/scene/bubble-sort');
    const primary = app.querySelector('.transport .tbtn.primary');
    const clicked = jest.fn();
    primary.addEventListener('click', clicked);
    await goto('#/');
    document.body.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
    expect(clicked).not.toHaveBeenCalled();
  });

  test('dos navegaciones encadenadas dejan sólo la última (guard renderGen)', async () => {
    // Sin awaits intermedios: las dos cargas de módulo compiten por el mismo host.
    location.hash = '#/scene/bubble-sort';
    window.dispatchEvent(new Event('hashchange'));
    location.hash = '#/scene/quick-sort';
    window.dispatchEvent(new Event('hashchange'));
    await flush(20);
    expect(app.querySelectorAll('.scene-view')).toHaveLength(1);
    expect(app.querySelectorAll('.stage')).toHaveLength(1);
  });
});
