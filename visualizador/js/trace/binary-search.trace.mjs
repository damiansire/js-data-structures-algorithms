// Traza pura de Binary Search (recursiva) — SIN DOM.
//
// Única fuente de verdad de la animación: scenes/binary-search.js la importa
// para dibujar y binary-search.trace.test.mjs la compara contra el módulo
// canónico Busqueda/binary-search/binary-search.js. Replica recursiveSearch:
//   middle = floor((lo+hi)/2)
//   if arr[middle] === element → encontrado (índice middle)
//   if arr[middle] >  element  → hi = middle - 1
//   else                       → lo = middle + 1

/**
 * Genera la traza paso a paso de la búsqueda binaria de `target` en `arr`.
 * @param {number[]} arr Array ordenado ascendentemente donde buscar.
 * @param {number} target Valor buscado (comparación estricta ===).
 * @returns {Array<object>} Pasos de la animación.
 */
export function buildTrace(arr, target) {
  const steps = [];
  let lo = 0;
  let hi = arr.length - 1;
  steps.push({ type: 'range', lo, hi });
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    steps.push({ type: 'probe', mid, value: arr[mid], lo, hi });
    if (arr[mid] === target) {
      steps.push({ type: 'found', mid });
      return steps;
    }
    if (arr[mid] > target) {
      steps.push({ type: 'discard', from: mid, to: hi, side: 'right' });
      hi = mid - 1;
    } else {
      steps.push({ type: 'discard', from: lo, to: mid, side: 'left' });
      lo = mid + 1;
    }
    steps.push({ type: 'range', lo, hi });
  }
  steps.push({ type: 'notfound' });
  return steps;
}

/**
 * Devuelve el índice que la animación termina señalando: el `mid` del paso
 * `found`, o -1 si la traza acaba en `notfound`. Permite asertar que la
 * animación coincide con el retorno del módulo canónico sin reimplementarlo.
 * @param {number[]} arr Array ordenado donde buscar.
 * @param {number} target Valor buscado.
 * @returns {number} Índice encontrado, o -1.
 */
export function finalResult(arr, target) {
  for (const step of buildTrace(arr, target)) {
    if (step.type === 'found') return step.mid;
  }
  return -1;
}
