/**
 * Ordena un array de menor a mayor con el algoritmo bubble sort. O(n²) en el
 * peor caso, O(n) si ya está ordenado (corte temprano con la bandera swapped).
 * Ordena in-place y devuelve el mismo array.
 * @param {number[]} arr Array a ordenar (se modifica in-place).
 * @returns {number[]} El mismo array, ya ordenado ascendentemente.
 */
function bubbleSort(arr) {
    // Bubble sort real: compara elementos adyacentes y los burbujea de a
    // pares en pasadas sucesivas. La bandera swapped permite corte temprano
    // cuando el array ya quedo ordenado.
    for (let i = 0; i < arr.length - 1; i++) {
        let swapped = false;
        for (let j = 0; j < arr.length - 1 - i; j++) {
            if (arr[j] > arr[j + 1]) {
                let aux = arr[j];
                arr[j] = arr[j + 1];
                arr[j + 1] = aux;
                swapped = true;
            }
        }
        if (!swapped) {
            break;
        }
    }
    return arr;
}

module.exports = { bubbleSort }