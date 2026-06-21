// Test de equivalencia (linkage): el estado final de la TRAZA que anima la
// escena debe coincidir con la salida del módulo canónico testeado
// Ordenamiento/quick-sort/quick-sort.js. Así la "fidelidad" del visualizador
// deja de ser un comentario y pasa a ser un gate.
//
// Es un test ESM (.mjs) porque la traza es ESM (la consume el browser); el
// módulo de dominio es CommonJS y se carga con createRequire.

import { createRequire } from 'module';
import { buildTrace, finalArray } from './quick-sort.trace.mjs';

const require = createRequire(import.meta.url);
const { quickSort } = require('../../../Ordenamiento/quick-sort/quick-sort.js');

const CASES = {
  vacío: [],
  'un elemento': [42],
  ordenado: [1, 2, 3, 4, 5],
  inverso: [5, 4, 3, 2, 1],
  duplicados: [3, 1, 3, 2, 1, 2],
  'todos iguales': [7, 7, 7, 7],
  negativos: [-3, 5, -1, 0, -8, 2],
  'el del visualizador': [7, 2, 9, 4, 1, 8, 5, 3],
};

describe('quick-sort: traza del visualizador == módulo canónico', () => {
  for (const [name, input] of Object.entries(CASES)) {
    test(`estado final coincide — ${name}`, () => {
      // quickSort ordena in-place; se le pasa una copia para no mutar el caso.
      const canonical = quickSort(input.slice());
      expect(finalArray(input)).toEqual(canonical);
    });
  }

  test('no muta la entrada', () => {
    const input = [7, 2, 9, 4, 1, 8, 5, 3];
    const copy = input.slice();
    buildTrace(input);
    finalArray(input);
    expect(input).toEqual(copy);
  });

  test('invariante por paso: swap/place siempre referencian índices válidos', () => {
    const input = [7, 2, 9, 4, 1, 8, 5, 3];
    const n = input.length;
    for (const step of buildTrace(input)) {
      if (step.type === 'swap' || step.type === 'place') {
        expect(step.a).toBeGreaterThanOrEqual(0);
        expect(step.b).toBeLessThan(n);
        expect(step.a).toBeLessThanOrEqual(step.b);
      }
    }
  });
});
