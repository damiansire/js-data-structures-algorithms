// Traza pura de Bubble Sort (con corte temprano) — SIN DOM.
//
// Única fuente de verdad de la animación: scenes/bubble-sort.js la importa para
// dibujar y bubble-sort.trace.test.mjs la compara contra el módulo canónico
// Ordenamiento/bubble-sort/bubble-sort.js. Replica su bucle:
//   - compara adyacentes j y j+1, intercambia si arr[j] > arr[j+1]
//   - bandera `swapped` → corte temprano si una pasada no intercambia nada

/**
 * Genera la traza paso a paso del bubble sort sobre una copia de `input`.
 * @param {number[]} input Array de entrada (no se muta).
 * @returns {Array<object>} Pasos de la animación.
 */
export function buildTrace(input) {
  const a = input.slice();
  const n = a.length;
  const steps = [];
  for (let i = 0; i < n - 1; i++) {
    let swapped = false;
    for (let j = 0; j < n - 1 - i; j++) {
      steps.push({ type: 'compare', a: j, b: j + 1, va: a[j], vb: a[j + 1] });
      if (a[j] > a[j + 1]) {
        const aux = a[j];
        a[j] = a[j + 1];
        a[j + 1] = aux;
        steps.push({ type: 'swap', a: j, b: j + 1 });
        swapped = true;
      }
    }
    steps.push({ type: 'settle', index: n - 1 - i, value: a[n - 1 - i] });
    if (!swapped) {
      steps.push({ type: 'earlybreak', to: n - 2 - i });
      break;
    }
  }
  steps.push({ type: 'done' });
  return steps;
}

/**
 * Reconstruye el array final aplicando los swaps de la traza sobre `input`.
 * @param {number[]} input Array de entrada (no se muta).
 * @returns {number[]} Array tras aplicar todos los swaps de la traza.
 */
export function finalArray(input) {
  const a = input.slice();
  for (const step of buildTrace(input)) {
    if (step.type === 'swap') {
      const t = a[step.a];
      a[step.a] = a[step.b];
      a[step.b] = t;
    }
  }
  return a;
}
