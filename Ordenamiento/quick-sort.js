let arr = [2, -1, 4, 5, 1, -7, 0, -14, 14]

/*
function quickSort(arr) {
    if (arr.length == 0) { return [] }
    let mediumIndex = Math.floor(arr.length / 2)
    let pivot = arr[mediumIndex];
    let leftArr = [];
    let rightArr = [];
    for (let index = 0; index < arr.length; index++) {
        if (index != mediumIndex) {
            if (arr[index] > pivot) {
                rightArr.push(arr[index])
            } else {
                leftArr.push(arr[index])
            }
        }
    }
    leftArr = quickSort(leftArr)
    rightArr = quickSort(rightArr)
    return leftArr.concat(pivot).concat(rightArr);
}

*/

function swap(arr, start, end) {
    let aux = arr[start];
    arr[start] = arr[end];
    arr[end] = aux;
}

function quickSort(arr, start = 0, end) {
    start++;
    end = end ? end : arr.length - 1;
    if (end - start <= 0) {
        return null;
    }
    let partitionData = partition(arr, start, end);
    quickSort(arr, start - 1, partitionData)
    quickSort(arr, partitionData + 1, end)
}

function partition(arr, start, end) {
    let indexPivot = start - 1;
    let pivot = arr[indexPivot];
    while (start < end) {
        while (arr[start] < pivot) {
            start++;
            console.log("problema");
        }
        while (arr[end] > pivot) {
            end--;
            console.log("problema");
        }
        if (start <= end) {
            swap(arr, start, end)
        } else {
            swap(arr, indexPivot, end)
        }
    }
    return end;
}