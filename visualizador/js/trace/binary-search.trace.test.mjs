// Test de equivalencia (linkage): la TRAZA que anima la escena debe recorrer
// los MISMOS probes que el módulo canónico testeado
// Busqueda/binary-search/binary-search.js, no solo terminar en el mismo índice.
//
// El canónico se instrumenta sin tocarlo: un Proxy del array registra cada
// lectura por índice. recursiveSearch lee arr[middle] una vez si encuentra
// (===) y dos veces si sigue buscando (=== y luego >), así que el stream de
// lecturas esperado se reconstruye exacto desde los pasos `probe`/`found` de
// la traza. Si la escena señala un medio que el canónico no visita, esto falla.

import { createRequire } from 'module';
import { buildTrace, finalResult } from './binary-search.trace.mjs';

const require = createRequire(import.meta.url);
const { binarySearch } = require('../../../Busqueda/binary-search/binary-search.js');

const ARRAY = [3, 7, 12, 18, 21, 26, 33, 41, 55, 64, 72, 88];

/** Corre el canónico sobre un Proxy y devuelve sus lecturas por índice. */
function lecturasDelCanonico(arr, target) {
  const gets = [];
  const proxy = new Proxy(arr.slice(), {
    get(target_, prop, receiver) {
      if (typeof prop === 'string' && /^\d+$/.test(prop)) gets.push(Number(prop));
      return Reflect.get(target_, prop, receiver);
    },
  });
  const resultado = binarySearch(proxy, target);
  return { gets, resultado };
}

/**
 * Reconstruye las lecturas que el canónico debe hacer según la traza:
 * cada `probe` que termina en `found` lee arr[mid] una vez (el ===); cada
 * `probe` que sigue con `discard` la lee dos veces (=== y luego >).
 */
function lecturasSegunLaTraza(arr, target) {
  const steps = buildTrace(arr, target);
  const gets = [];
  steps.forEach((step, i) => {
    if (step.type !== 'probe') return;
    const next = steps[i + 1];
    gets.push(step.mid);
    if (!next || next.type !== 'found') gets.push(step.mid);
  });
  return gets;
}

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

describe('binary-search: la traza visita los MISMOS medios que el canónico', () => {
  const TARGETS = [...ARRAY, 1, 99, 30, 20, 63];

  test.each(TARGETS.map((t) => [t]))('mismo stream de lecturas buscando %i', (target) => {
    expect(lecturasSegunLaTraza(ARRAY, target)).toEqual(lecturasDelCanonico(ARRAY, target).gets);
  });

  test('array vacío: ninguna lectura en ambos', () => {
    expect(lecturasSegunLaTraza([], 5)).toEqual([]);
    expect(lecturasDelCanonico([], 5).gets).toEqual([]);
  });

  test('el instrumentado devuelve lo mismo que el canónico sin instrumentar (el Proxy no altera nada)', () => {
    for (const target of TARGETS) {
      expect(lecturasDelCanonico(ARRAY, target).resultado).toBe(binarySearch(ARRAY, target));
    }
  });
});
