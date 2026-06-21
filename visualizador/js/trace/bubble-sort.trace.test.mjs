// Test de equivalencia (linkage): el estado final de la TRAZA que anima la
// escena debe coincidir con la salida del módulo canónico testeado
// Ordenamiento/bubble-sort/bubble-sort.js.

import { createRequire } from 'module';
import { buildTrace, finalArray } from './bubble-sort.trace.mjs';

const require = createRequire(import.meta.url);
const { bubbleSort } = require('../../../Ordenamiento/bubble-sort/bubble-sort.js');

const CASES = {
  vacío: [],
  'un elemento': [42],
  ordenado: [1, 2, 3, 4, 5],
  inverso: [5, 4, 3, 2, 1],
  duplicados: [3, 1, 3, 2, 1, 2],
  'todos iguales': [7, 7, 7, 7],
  negativos: [-3, 5, -1, 0, -8, 2],
  'el del visualizador': [6, 3, 8, 2, 7, 4, 9, 1, 5],
};

describe('bubble-sort: traza del visualizador == módulo canónico', () => {
  for (const [name, input] of Object.entries(CASES)) {
    test(`estado final coincide — ${name}`, () => {
      const canonical = bubbleSort(input.slice());
      expect(finalArray(input)).toEqual(canonical);
    });
  }

  test('no muta la entrada', () => {
    const input = [6, 3, 8, 2, 7, 4, 9, 1, 5];
    const copy = input.slice();
    buildTrace(input);
    finalArray(input);
    expect(input).toEqual(copy);
  });

  test('invariante por paso: swap siempre referencia índices adyacentes', () => {
    const input = [6, 3, 8, 2, 7, 4, 9, 1, 5];
    for (const step of buildTrace(input)) {
      if (step.type === 'swap') {
        expect(step.b).toBe(step.a + 1);
      }
    }
  });
});
