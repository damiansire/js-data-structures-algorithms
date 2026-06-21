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
