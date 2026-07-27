// Test de equivalencia (linkage): la TRAZA que anima la escena debe coincidir
// con AMBOS módulos canónicos de merge sort, y no solo en el array final:
//   - Ordenamiento/merge-sort-recursive (devuelve array nuevo) ancla el estado
//     final de cada caso.
//   - Ordenamiento/merge-sort-in-place  (ordena in-place) se instrumenta con un
//     Proxy que registra sus lecturas/escrituras reales, y se comparan contra
//     el stream que la SECUENCIA de merges de la traza implica. Así cada mezcla
//     que la escena narra (rango y valores escritos, en orden de recursión) es
//     exactamente la que el módulo real ejecuta.

import { createRequire } from 'module';
import { buildTrace, finalArray } from './merge-sort.trace.mjs';

const require = createRequire(import.meta.url);
const {
  mergeSort: mergeSortRecursive,
} = require('../../../Ordenamiento/merge-sort-recursive/merge-sort-recursive.js');
const {
  mergeSort: mergeSortInPlace,
} = require('../../../Ordenamiento/merge-sort-in-place/merge-sort-in-place.js');

/** Corre el canónico in-place sobre un Proxy y devuelve sus accesos por índice. */
function accesosDelCanonico(input) {
  const data = input.slice();
  const gets = [];
  const sets = [];
  const proxy = new Proxy(data, {
    get(target, prop, receiver) {
      if (typeof prop === 'string' && /^\d+$/.test(prop)) gets.push(Number(prop));
      return Reflect.get(target, prop, receiver);
    },
    set(target, prop, value, receiver) {
      if (typeof prop === 'string' && /^\d+$/.test(prop)) {
        sets.push({ index: Number(prop), value });
      }
      return Reflect.set(target, prop, value, receiver);
    },
  });
  mergeSortInPlace(proxy, 0, data.length - 1);
  return { gets, sets, resultado: data };
}

/**
 * Reconstruye, desde los pasos `merge` de la traza, los accesos que el módulo
 * in-place debe hacer sobre el array original.
 *
 * Correspondencia con merge-sort-in-place.js: cada merge sobre [lo, hi) primero
 * COPIA los dos subarrays (lee lo..hi-1 en orden) y después vuelca la mezcla
 * (escribe lo..hi-1 en orden, con los valores ya ordenados del resultado). Las
 * comparaciones ocurren sobre las copias, así que no tocan el array original.
 * El orden de los merges (post-orden de la recursión) también queda fijado.
 */
function accesosSegunLaTraza(input) {
  const gets = [];
  const sets = [];
  for (const step of buildTrace(input)) {
    if (step.type !== 'merge') continue;
    for (let i = step.lo; i < step.hi; i++) gets.push(i);
    step.result.forEach((value, offset) => {
      sets.push({ index: step.lo + offset, value });
    });
  }
  return { gets, sets };
}

const CASES = {
  vacío: [],
  'un elemento': [42],
  ordenado: [1, 2, 3, 4, 5],
  inverso: [5, 4, 3, 2, 1],
  duplicados: [3, 1, 3, 2, 1, 2],
  'todos iguales': [7, 7, 7, 7],
  negativos: [-3, 5, -1, 0, -8, 2],
  'el del visualizador': [5, 2, 8, 1, 9, 3, 7, 4],
  'largo impar': [9, 1, 5, 3, 7, 2, 6],
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

describe('merge-sort: la traza narra las MISMAS mezclas que ejecuta el canónico', () => {
  for (const [name, input] of Object.entries(CASES)) {
    test(`mismo stream de lecturas y escrituras, en el mismo orden de recursión — ${name}`, () => {
      const canon = accesosDelCanonico(input);
      const traza = accesosSegunLaTraza(input);
      expect(traza.sets).toEqual(canon.sets);
      expect(traza.gets).toEqual(canon.gets);
    });
  }

  test('cada merge de la traza tiene su split con el mismo rango', () => {
    const steps = buildTrace([5, 2, 8, 1, 9, 3, 7, 4]);
    const key = (s) => `${s.lo}:${s.mid}:${s.hi}`;
    const splits = steps
      .filter((s) => s.type === 'split')
      .map(key)
      .sort();
    const merges = steps
      .filter((s) => s.type === 'merge')
      .map(key)
      .sort();
    expect(merges).toEqual(splits);
  });

  test('el instrumentado ordena igual que el canónico sin instrumentar (el Proxy no altera nada)', () => {
    for (const input of Object.values(CASES)) {
      const arr = input.slice();
      mergeSortInPlace(arr, 0, arr.length - 1);
      expect(accesosDelCanonico(input).resultado).toEqual(arr);
    }
  });
});
