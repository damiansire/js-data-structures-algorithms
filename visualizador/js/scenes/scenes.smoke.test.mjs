/**
 * @jest-environment jsdom
 */
// Smoke test de montaje: TODA escena registrada en SCENE_MODULES se monta y se
// destruye sin excepción, y cumple el contrato de montaje (default export que
// recibe (host, meta) y devuelve un objeto con destroy()).
//
// Antes de esto, la mayoría de las escenas llegaba a GitHub Pages sin haberse
// ejecutado nunca fuera del navegador del autor: un error de runtime no rompía
// ni el build ni CI (el router lo atrapa y muestra "Could not load the scene").
// Este gate hace que un throw en el montaje de cualquier escena falle en CI, y
// fija el contrato que hoy se cumplía por disciplina.

import { jest } from '@jest/globals';

import { SCENE_MODULES } from '../scene-loaders.js';
import { SCENES_BY_ID } from '../catalog.js';

// Varios ids comparten módulo (merge-sort x2, pachinko x2): probamos cada id
// del catálogo, que es lo que el router efectivamente monta.
const CASES = Object.entries(SCENE_MODULES);

describe('smoke: todas las escenas montan y destruyen sin excepción', () => {
  // Timers falsos: varias escenas agendan setTimeout/rAF al montar y sus
  // destroy() todavía no los cancelan todos (deuda conocida); sin esto el
  // worker de jest queda vivo esperando timers reales.
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  test.each(CASES)('escena %s (módulo %s.js)', async (id, moduleName) => {
    const mod = await import(`./${moduleName}.js`);
    expect(typeof mod.default).toBe('function');

    const host = document.createElement('div');
    document.body.append(host);
    let scene;
    try {
      scene = mod.default(host, SCENES_BY_ID[id]);
      // Contrato de montaje: devuelve { destroy() } y deja contenido en el host.
      expect(scene).toBeTruthy();
      expect(typeof scene.destroy).toBe('function');
      expect(host.children.length).toBeGreaterThan(0);
    } finally {
      if (scene && typeof scene.destroy === 'function') {
        expect(() => scene.destroy()).not.toThrow();
      }
      host.remove();
    }
  });
});
