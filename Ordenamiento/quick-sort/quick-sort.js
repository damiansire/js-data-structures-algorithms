function swap(arr, i, j) {
    let aux = arr[i];
    arr[i] = arr[j];
    arr[j] = aux;
}

// Particion de Lomuto: usa arr[end] como pivote y deja todos los
// menores o iguales a la izquierda. Devuelve el indice final del pivote.
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
