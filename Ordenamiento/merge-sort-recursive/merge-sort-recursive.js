/**
 * Combina dos arrays ya ordenados en uno solo ordenado ascendentemente.
 * @param {number[]} arr1 Primer array ordenado.
 * @param {number[]} arr2 Segundo array ordenado.
 * @returns {number[]} Un array nuevo con todos los elementos ordenados.
 */
function merge(arr1, arr2) {
    //Declaramos un array vacio
    let combinedArray = [];
    let i = 0;
    let j = 0;
    while (i < arr1.length && j < arr2.length) {
        if (arr1[i] < arr2[j]) {
            combinedArray.push(arr1[i]);
            i++;
        } else {
            combinedArray.push(arr2[j]);
            j++;
        }
    }
    while (i < arr1.length) {
        combinedArray.push(arr1[i]);
        i++;
    }
    while (j < arr2.length) {
        combinedArray.push(arr2[j]);
        j++;
    }
    return combinedArray;
}

/**
 * Ordena un array de menor a mayor con merge sort recursivo (divide y vencerás).
 * O(n log n). No muta el array original: devuelve uno nuevo.
 * @param {number[]} arr Array a ordenar.
 * @returns {number[]} Un array nuevo ordenado ascendentemente.
 */
function mergeSort(arr) {
    if (arr.length <= 1) { return arr }
    let mediumArray = Math.trunc(arr.length / 2);
    let leftArray = arr.slice(0, mediumArray)
    let rightArray = arr.slice(mediumArray)
    let mergLeft = mergeSort(leftArray)
    let mergRight = mergeSort(rightArray)
    return merge(mergLeft, mergRight)
}

module.exports = { mergeSort, merge };
