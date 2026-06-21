//Precondicion: Las modificaciones de hacen sobre el array original

/**
 * Ordena un array de menor a mayor con merge sort in-place sobre el array
 * original (divide y vencerás). O(n log n).
 * @param {number[]} arr Array a ordenar (se modifica in-place).
 * @param {number} beginSubArray Índice inicial del subarray a ordenar.
 * @param {number} endSubArray Índice final del subarray a ordenar.
 * @returns {void}
 */
function mergeSort(arr, beginSubArray, endSubArray) {
    if (beginSubArray < endSubArray) {
        const endSubArr1 = Math.trunc((beginSubArray + endSubArray - 1) / 2);
        mergeSort(arr, beginSubArray, endSubArr1)
        mergeSort(arr, endSubArr1 + 1, endSubArray)
        merge(arr, beginSubArray, endSubArr1, endSubArray);
    }
}

/**
 * Mezcla in-place dos subarrays contiguos ya ordenados de `arr`:
 * [beginSubArr1, endSubArr1] y [endSubArr1+1, endSubArr2].
 * @param {number[]} arr Array sobre el que operar (se modifica in-place).
 * @param {number} beginSubArr1 Índice inicial del primer subarray.
 * @param {number} endSubArr1 Índice final del primer subarray.
 * @param {number} endSubArr2 Índice final del segundo subarray.
 * @returns {void}
 */
function merge(arr, beginSubArr1, endSubArr1, endSubArr2) {
    const beginSubArr2 = endSubArr1 + 1;
    const subArr1Length = endSubArr1 - beginSubArr1 + 1;
    const subArr1 = new Array(subArr1Length)
    for (let index = 0; index < subArr1Length; index++) {
        subArr1[index] = arr[beginSubArr1 + index]
    }

    const subArr2Length = endSubArr2 - beginSubArr2 + 1;
    const subArr2 = new Array(subArr2Length)
    for (let index = 0; index < subArr2Length; index++) {
        subArr2[index] = arr[beginSubArr2 + index]
    }

    let indexSubArr1 = 0;
    let indexSubArr2 = 0;

    for (let index = beginSubArr1; index <= endSubArr2; index++) {
        if (subArr1[indexSubArr1] <= subArr2[indexSubArr2]) {
            arr[index] = subArr1[indexSubArr1];
            indexSubArr1++;
        }
        else if (subArr1[indexSubArr1] > subArr2[indexSubArr2]) {
            arr[index] = subArr2[indexSubArr2];
            indexSubArr2++;
        }
        else if (subArr1[indexSubArr1] === undefined) {
            arr[index] = subArr2[indexSubArr2];
            indexSubArr2++;
        }
        else if (subArr2[indexSubArr2] === undefined) {
            arr[index] = subArr1[indexSubArr1];
            indexSubArr1++;
        }
    }
}

module.exports = {
    merge,
    mergeSort
}