/**
 * Intercambia in-place los elementos de las posiciones i y j.
 * @param {Array} arr Array sobre el que operar.
 * @param {number} i Primera posición.
 * @param {number} j Segunda posición.
 * @returns {void}
 */
function swap(arr, i, j) {
  let aux = arr[i];
  arr[i] = arr[j];
  arr[j] = aux;
}

// Particion de Lomuto: usa arr[end] como pivote y deja todos los
// menores o iguales a la izquierda. Devuelve el indice final del pivote.
/**
 * Particiona el subarray [start, end] usando arr[end] como pivote (esquema de
 * Lomuto): deja los elementos menores o iguales al pivote a su izquierda.
 * @param {number[]} arr Array a particionar (se modifica in-place).
 * @param {number} start Índice inicial del subarray.
 * @param {number} end Índice final del subarray (posición del pivote).
 * @returns {number} La posición final del pivote tras la partición.
 */
function partition(arr, start, end) {
  let pivot = arr[end];
  let i = start - 1;
  for (let j = start; j < end; j++) {
    if (arr[j] <= pivot) {
      i++;
      swap(arr, i, j);
    }
  }
  swap(arr, i + 1, end);
  return i + 1;
}

/**
 * Ordena un array de menor a mayor con quicksort (partición de Lomuto).
 * Promedio O(n log n), peor caso O(n²). Ordena in-place.
 * @param {number[]} arr Array a ordenar (se modifica in-place).
 * @param {number} [start=0] Índice inicial del subarray a ordenar.
 * @param {number} [end=arr.length-1] Índice final del subarray a ordenar.
 * @returns {number[]} El mismo array, ya ordenado ascendentemente.
 */
function quickSort(arr, start = 0, end = arr.length - 1) {
  if (start >= end) {
    return arr;
  }
  let pivotIndex = partition(arr, start, end);
  quickSort(arr, start, pivotIndex - 1);
  quickSort(arr, pivotIndex + 1, end);
  return arr;
}

module.exports = { quickSort };
