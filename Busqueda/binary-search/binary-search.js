//No se puede usar la propia binary search
//porque necesito tener el maximo y minimo
//Entonces, defino una funcion auxiliar
/**
 * Busca un elemento en un array ordenado ascendentemente mediante búsqueda
 * binaria recursiva. O(log n).
 * @param {number[]} arr Array ordenado de menor a mayor donde buscar.
 * @param {number} element Valor a buscar (comparación estricta ===).
 * @returns {number} El índice del elemento, o -1 si no se encuentra.
 */
function binarySearch(arr, element) {
    return recursiveSearch(arr, element, 0, arr.length - 1);
}

/**
 * Paso recursivo de la búsqueda binaria dentro del rango [bottonIndex, topIndex].
 * @param {number[]} arr Array ordenado donde buscar.
 * @param {number} element Valor a buscar.
 * @param {number} bottonIndex Límite inferior del rango actual.
 * @param {number} topIndex Límite superior del rango actual.
 * @returns {number} El índice del elemento, o -1 si no se encuentra.
 */
function recursiveSearch(arr, element, bottonIndex, topIndex) {
    if (bottonIndex > topIndex) {
        return -1;
    }

    var middle = Math.floor((bottonIndex + topIndex) / 2);

    if (arr[middle] === element) {
        return middle;
    }

    if (arr[middle] > element) {
        topIndex = middle - 1;
    } else {
        bottonIndex = middle + 1;
    }

    return recursiveSearch(arr, element, bottonIndex, topIndex);
}

module.exports = { binarySearch };