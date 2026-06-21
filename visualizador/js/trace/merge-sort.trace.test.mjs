// Test de equivalencia (linkage): el estado final de la TRAZA que anima la
// escena debe coincidir con la salida de AMBOS módulos canónicos de merge sort:
//   - Ordenamiento/merge-sort-recursive (devuelve array nuevo)
//   - Ordenamiento/merge-sort-in-place  (ordena in-place)

import { createRequire } from 'module';
import { buildTrace, finalArray } from './merge-sort.trace.mjs';

const require = createRequire(import.meta.url);
const {
  mergeSort: mergeSortRecursive,
} = require('../../../Ordenamiento/merge-sort-recursive/merge-sort-recursive.js');
const {
  mergeSort: mergeSortInPlace,
} = require('../../../Ordenamiento/merge-sort-in-place/merge-sort-in-place.js');

const CASES = {
  vacío: [],
  'un elemento': [42],
  ordenado: [1, 2, 3, 4, 5],
  inverso: [5, 4, 3, 2, 1],
  duplicados: [3, 1, 3, 2, 1, 2],
  'todos iguales': [7, 7, 7, 7],
  negativos: [-3, 5, -1, 0, -8, 2],
  'el del visualizador': [5, 2, 8, 1, 9, 3, 7, 4],
};

describe('merge-sort: traza del visualizador == módulos canónicos', () => {
  for (const [name, input] of Object.entries(CASES)) {
    test(`estado final coincide con merge-sort-recursive — ${name}`, () => {
      const canonical = mergeSortRecursive(input.slice());
      expect(finalArray(input)).toEqual(canonical);
    });

    test(`estado final coincide con merge-sort-in-place — ${name}`, () => {
      const arr = input.slice();
      mergeSortInPlace(arr, 0, arr.length - 1); // ordena in-place
      expect(finalArray(input)).toEqual(arr);
    });
  }

  test('no muta la entrada', () => {
    const input = [5, 2, 8, 1, 9, 3, 7, 4];
    const copy = input.slice();
    buildTrace(input);
    finalArray(input);
    expect(input).toEqual(copy);
  });

  test('invariante por paso: cada merge produce un resultado ordenado', () => {
    const input = [5, 2, 8, 1, 9, 3, 7, 4];
    for (const step of buildTrace(input)) {
      if (step.type === 'merge') {
        const sorted = step.result.slice().sort((a, b) => a - b);
        expect(step.result).toEqual(sorted);
      }
    }
  });
});
