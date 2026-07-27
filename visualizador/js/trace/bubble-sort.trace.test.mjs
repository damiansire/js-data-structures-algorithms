// Test de equivalencia (linkage) entre la TRAZA que anima la escena y el módulo
// canónico testeado Ordenamiento/bubble-sort/bubble-sort.js.
//
// El test se llamaba "traza == canónico" pero sólo comparaba el ARRAY FINAL, y
// ese array se reconstruía aplicando únicamente los steps `swap` de la propia
// traza. O sea: cualquier secuencia de swaps que ordenara el array pasaba,
// incluido un selection sort disfrazado o un corte temprano que nunca se emite.
// Los steps `compare` / `settle` / `earlybreak`, que son literalmente lo que la
// escena dibuja y narra, no se comparaban contra nada.
//
// Ahora se compara la SECUENCIA de operaciones. El canónico se instrumenta sin
// tocarlo: se le pasa un Proxy del array que registra cada lectura y cada
// escritura por índice, así los compares y swaps que realmente ejecuta salen del
// módulo real, no de una copia transcrita a mano que podría driftear.

import { createRequire } from 'module';
import { buildTrace, finalArray } from './bubble-sort.trace.mjs';

const require = createRequire(import.meta.url);
const { bubbleSort } = require('../../../Ordenamiento/bubble-sort/bubble-sort.js');

/**
 * Corre el módulo canónico sobre un Proxy y devuelve las operaciones que hizo.
 *
 * El cuerpo del bucle es, por iteración interna:
 *   sin swap  -> get(j), get(j+1)
 *   con swap  -> get(j), get(j+1), get(j), get(j+1), set(j), set(j+1)
 * Las escrituras vienen siempre de a pares consecutivos (j, j+1), así que la
 * secuencia de swaps se lee directo; y como cada swap agrega exactamente dos
 * lecturas extra, la cantidad de comparaciones sale de las lecturas restantes.
 */
function opsDelCanonico(input) {
  const data = input.slice();
  const gets = [];
  const sets = [];
  const proxy = new Proxy(data, {
    get(target, prop, receiver) {
      if (typeof prop === 'string' && /^\d+$/.test(prop)) gets.push(Number(prop));
      return Reflect.get(target, prop, receiver);
    },
    set(target, prop, value, receiver) {
      if (typeof prop === 'string' && /^\d+$/.test(prop)) sets.push(Number(prop));
      return Reflect.set(target, prop, value, receiver);
    },
  });
  bubbleSort(proxy);

  const swaps = [];
  for (let i = 0; i + 1 < sets.length; i += 2) {
    swaps.push({ a: sets[i], b: sets[i + 1] });
  }
  const compares = (gets.length - 2 * swaps.length) / 2;
  return { swaps, compares, resultado: data };
}

/** Los mismos datos, pero leídos de la traza que consume la escena. */
function opsDeLaTraza(input) {
  const steps = buildTrace(input);
  return {
    swaps: steps.filter((s) => s.type === 'swap').map((s) => ({ a: s.a, b: s.b })),
    compares: steps.filter((s) => s.type === 'compare').length,
    earlybreaks: steps.filter((s) => s.type === 'earlybreak').length,
  };
}

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

describe('bubble-sort: la traza narra los MISMOS pasos que ejecuta el canónico', () => {
  for (const [name, input] of Object.entries(CASES)) {
    test(`misma secuencia exacta de intercambios — ${name}`, () => {
      expect(opsDeLaTraza(input).swaps).toEqual(opsDelCanonico(input).swaps);
    });

    test(`misma cantidad de comparaciones — ${name}`, () => {
      expect(opsDeLaTraza(input).compares).toBe(opsDelCanonico(input).compares);
    });
  }

  test('el instrumentado ordena igual que el canónico sin instrumentar (el Proxy no altera nada)', () => {
    for (const input of Object.values(CASES)) {
      expect(opsDelCanonico(input).resultado).toEqual(bubbleSort(input.slice()));
    }
  });

  test('corte temprano: un array ya ordenado son n-1 comparaciones y un earlybreak', () => {
    const input = [1, 2, 3, 4, 5];
    const traza = opsDeLaTraza(input);
    expect(opsDelCanonico(input).compares).toBe(input.length - 1);
    expect(traza.compares).toBe(input.length - 1);
    expect(traza.swaps).toEqual([]);
    expect(traza.earlybreaks).toBe(1);
  });

  test('sin corte temprano no se emite earlybreak (caso peor)', () => {
    expect(opsDeLaTraza([5, 4, 3, 2, 1]).earlybreaks).toBe(0);
  });
});
