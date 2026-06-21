// Test de equivalencia (linkage): el índice que la TRAZA termina señalando debe
// coincidir con el retorno del módulo canónico testeado
// Busqueda/binary-search/binary-search.js (índice encontrado, o -1).

import { createRequire } from 'module';
import { buildTrace, finalResult } from './binary-search.trace.mjs';

const require = createRequire(import.meta.url);
const { binarySearch } = require('../../../Busqueda/binary-search/binary-search.js');

const ARRAY = [3, 7, 12, 18, 21, 26, 33, 41, 55, 64, 72, 88];

describe('binary-search: traza del visualizador == módulo canónico', () => {
  // Cada valor presente debe encontrarse en su índice exacto.
  test.each(ARRAY.map((v, i) => [v, i]))('encuentra %i en su índice', (target, expectedIndex) => {
    expect(finalResult(ARRAY, target)).toBe(binarySearch(ARRAY, target));
    expect(finalResult(ARRAY, target)).toBe(expectedIndex);
  });

  const MISSING = {
    'menor que el mínimo': 1,
    'mayor que el máximo': 99,
    'hueco intermedio': 30,
    'array vacío': 5,
  };

  for (const [name, target] of Object.entries(MISSING)) {
    test(`devuelve -1 cuando no está — ${name}`, () => {
      const arr = name === 'array vacío' ? [] : ARRAY;
      expect(finalResult(arr, target)).toBe(binarySearch(arr, target));
      expect(finalResult(arr, target)).toBe(-1);
    });
  }

  test('invariante por paso: cada probe usa el medio del rango activo', () => {
    for (const step of buildTrace(ARRAY, 33)) {
      if (step.type === 'probe') {
        expect(step.mid).toBe(Math.floor((step.lo + step.hi) / 2));
      }
    }
  });
});
