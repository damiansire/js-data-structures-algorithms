// Test de equivalencia (linkage): la TRAZA que anima la escena debe narrar los
// MISMOS pasos que ejecuta el módulo canónico testeado
// Ordenamiento/quick-sort/quick-sort.js, no solo llegar al mismo array final.
//
// El estado final solo demuestra que "algo ordena": cualquier secuencia de
// swaps que ordene pasa. Acá además se instrumenta el canónico SIN tocarlo,
// con un Proxy que registra cada lectura y escritura por índice, y se
// reconstruye desde la traza el stream exacto de lecturas/escrituras que ese
// código debería producir. Si la escena narra un compare o un swap que el
// canónico no hace (o al revés), esto falla.
//
// Es un test ESM (.mjs) porque la traza es ESM (la consume el browser); el
// módulo de dominio es CommonJS y se carga con createRequire.

import { createRequire } from 'module';
import { buildTrace, finalArray } from './quick-sort.trace.mjs';

const require = createRequire(import.meta.url);
const { quickSort } = require('../../../Ordenamiento/quick-sort/quick-sort.js');

/** Corre el canónico sobre un Proxy y devuelve sus accesos por índice. */
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
      if (typeof prop === 'string' && /^\d+$/.test(prop)) sets.push(Number(prop));
      return Reflect.set(target, prop, value, receiver);
    },
  });
  quickSort(proxy);
  return { gets, sets, resultado: data };
}

/**
 * Reconstruye, paso a paso de la traza, los accesos que el canónico debe hacer.
 *
 * Correspondencia con quick-sort.js (partición de Lomuto):
 *   pivot {index}  -> lee arr[end] una vez                      (get index)
 *   scan {j}       -> compara arr[j] <= pivot                   (get j)
 *   swap {a,b}     -> swap(a,b): aux=arr[a]; arr[a]=arr[b];...  (get a, get b, set a, set b)
 *   keep {index}   -> swap(i,j) con i===j: mismos 4 accesos     (get i, get i, set i, set i)
 *   place {a,b}    -> swap(i+1,end), incluso si a===b           (get a, get b, set a, set b)
 *   settled / done -> ningún acceso
 */
function accesosSegunLaTraza(input) {
  const gets = [];
  const sets = [];
  for (const step of buildTrace(input)) {
    if (step.type === 'pivot') gets.push(step.index);
    else if (step.type === 'scan') gets.push(step.j);
    else if (step.type === 'swap' || step.type === 'place') {
      gets.push(step.a, step.b);
      sets.push(step.a, step.b);
    } else if (step.type === 'keep') {
      gets.push(step.index, step.index);
      sets.push(step.index, step.index);
    }
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

describe('quick-sort: la traza narra los MISMOS pasos que ejecuta el canónico', () => {
  for (const [name, input] of Object.entries(CASES)) {
    test(`mismo stream de lecturas y escrituras por índice — ${name}`, () => {
      const canon = accesosDelCanonico(input);
      const traza = accesosSegunLaTraza(input);
      expect(traza.sets).toEqual(canon.sets);
      expect(traza.gets).toEqual(canon.gets);
    });
  }

  test('el instrumentado ordena igual que el canónico sin instrumentar (el Proxy no altera nada)', () => {
    for (const input of Object.values(CASES)) {
      expect(accesosDelCanonico(input).resultado).toEqual(quickSort(input.slice()));
    }
  });
});
