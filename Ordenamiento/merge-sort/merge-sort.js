//Precondicion: Las modificaciones de hacen sobre el array original

function mergeSort(arr, beginSubArray, endSubArray) {
    const endSubArr1 = Math.trunc((beginSubArray + endSubArray) / 2);
    mergeSort(arr, beginSubArray, endSubArr1)
    mergeSort(arr, endSubArr1 + 1, endSubArray)
    merge(arr, beginSubArr1, endSubArr1, endSubArr2);
}

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