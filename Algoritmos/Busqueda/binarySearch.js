//No se puede usar la propia binary search 
//porque necesito tener el maximo y minimo
//Entonces, defino una funcion auxiliar
function binarySearch(arr, element) {
    return recursiveSearch(arr, element, 0, arr.length - 1);
}

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