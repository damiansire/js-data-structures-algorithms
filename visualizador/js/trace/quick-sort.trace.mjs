// Traza pura de Quick Sort (partición de Lomuto) — SIN DOM.
//
// Única fuente de verdad de la animación: la escena (scenes/quick-sort.js) la
// importa para dibujar, y el test de equivalencia
// (quick-sort.trace.test.mjs) la compara contra el módulo canónico
// Ordenamiento/quick-sort/quick-sort.js. Replica exactamente su lógica:
//   pivot = arr[end]; i = start-1
//   for j in [start, end): if arr[j] <= pivot { i++; swap(i, j) }
//   swap(i+1, end); pivote queda en i+1
//
// `buildTrace` devuelve la lista de pasos que consume la escena; `finalArray`
// reconstruye el array ordenado aplicando los swaps del trace (lo que permite
// asertar trace == salida canónica sin reimplementar el algoritmo en el test).

/**
 * Genera la traza paso a paso del quicksort de Lomuto sobre una copia de `input`.
 * @param {number[]} input Array de entrada (no se muta).
 * @returns {Array<object>} Pasos de la animación.
 */
export function buildTrace(input) {
  const a = input.slice();
  const steps = [];
  const swap = (i, j) => {
    const t = a[i];
    a[i] = a[j];
    a[j] = t;
  };
  function partition(start, end) {
    const pivot = a[end];
    steps.push({ type: 'pivot', index: end, value: pivot, lo: start, hi: end });
    let i = start - 1;
    for (let j = start; j < end; j++) {
      steps.push({ type: 'scan', j, pivot, lo: start, hi: end });
      if (a[j] <= pivot) {
        i++;
        if (i !== j) {
          swap(i, j);
          steps.push({ type: 'swap', a: i, b: j });
        } else {
          steps.push({ type: 'keep', index: i });
        }
      }
    }
    swap(i + 1, end);
    steps.push({ type: 'place', a: i + 1, b: end, value: pivot });
    steps.push({ type: 'settled', index: i + 1 });
    return i + 1;
  }
  function qs(start, end) {
    if (start >= end) {
      if (start === end) steps.push({ type: 'settled', index: start });
      return;
    }
    const p = partition(start, end);
    qs(start, p - 1);
    qs(p + 1, end);
  }
  qs(0, a.length - 1);
  steps.push({ type: 'done' });
  return steps;
}

/**
 * Reconstruye el array final aplicando los swaps de la traza sobre `input`.
 * Sirve para verificar, sin reimplementar el algoritmo, que el estado final que
 * la animación muestra coincide con la salida del módulo canónico.
 * @param {number[]} input Array de entrada (no se muta).
 * @returns {number[]} Array tras aplicar todos los swaps/place de la traza.
 */
export function finalArray(input) {
  const a = input.slice();
  for (const step of buildTrace(input)) {
    if (step.type === 'swap' || step.type === 'place') {
      const t = a[step.a];
      a[step.a] = a[step.b];
      a[step.b] = t;
    }
  }
  return a;
}
