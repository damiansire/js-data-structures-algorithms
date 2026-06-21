// Traza pura de Merge Sort (divide y vencerás) — SIN DOM.
//
// Única fuente de verdad de la animación: scenes/merge-sort.js la importa para
// dibujar AMBAS variantes (recursiva e in-place) y merge-sort.trace.test.mjs la
// compara contra los módulos canónicos Ordenamiento/merge-sort-recursive y
// Ordenamiento/merge-sort-in-place. Parte por la mitad (Math.trunc(n/2)) y
// mezcla dos mitades ordenadas tomando la menor del frente de cada una.

/**
 * Genera la traza paso a paso del merge sort sobre una copia de `input`.
 * @param {number[]} input Array de entrada (no se muta).
 * @returns {Array<object>} Pasos de la animación.
 */
export function buildTrace(input) {
  const steps = [];
  function ms(arr, lo) {
    const hi = lo + arr.length; // [lo, hi)
    if (arr.length <= 1) return arr;
    const mid = Math.trunc(arr.length / 2);
    steps.push({ type: 'split', lo, mid: lo + mid, hi });
    const L = ms(arr.slice(0, mid), lo);
    const R = ms(arr.slice(mid), lo + mid);
    const out = [];
    let i = 0;
    let j = 0;
    while (i < L.length && j < R.length) {
      if (L[i] < R[j]) out.push(L[i++]);
      else out.push(R[j++]);
    }
    while (i < L.length) out.push(L[i++]);
    while (j < R.length) out.push(R[j++]);
    steps.push({
      type: 'merge',
      lo,
      mid: lo + mid,
      hi,
      left: L.slice(),
      right: R.slice(),
      result: out.slice(),
    });
    return out;
  }
  ms(input.slice(), 0);
  steps.push({ type: 'done' });
  return steps;
}

/**
 * Devuelve el array final que muestra la animación: la última mezcla que cubre
 * todo el rango es el resultado ordenado. Para arrays de 0/1 elemento no hay
 * `merge`, así que se devuelve la entrada (que ya está ordenada).
 * @param {number[]} input Array de entrada (no se muta).
 * @returns {number[]} Array ordenado según la traza.
 */
export function finalArray(input) {
  const steps = buildTrace(input);
  let result = input.slice();
  for (const step of steps) {
    if (step.type === 'merge' && step.lo === 0 && step.hi === input.length) {
      result = step.result.slice();
    }
  }
  return result;
}
