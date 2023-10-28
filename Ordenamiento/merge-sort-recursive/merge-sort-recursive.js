function merge(arr1, arr2) {
    //Declaramos un array vacio
    let combinedArray = [];
    while (arr1.length && arr2.length) {
        let firstElement
        if (arr1[0] < arr2[0]) {
            firstElement = arr1.shift();
        } else {
            firstElement = arr2.shift();
        }
        combinedArray.push(firstElement)
    }
    combinedArray = combinedArray.concat(arr1).concat(arr2);
    return combinedArray;
}

function mergeSort(arr) {
    if (arr.length === 1) { return arr }
    let mediumArray = Math.trunc(arr.length / 2);
    let leftArray = arr.splice(0, mediumArray)
    let rightArray = arr;
    let mergLeft = mergeSort(leftArray)
    let mergRight = mergeSort(rightArray)
    return merge(mergLeft, mergRight)
}