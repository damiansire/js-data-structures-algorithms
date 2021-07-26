for (let indexA = 0; indexA < arr.length; indexA++) {
    for (let indexB = indexA + 1; indexB < arr.length; indexB++)
        if (arr[indexB] < arr[indexA]) {
            let aux = arr[indexA];
            arr[indexA] = arr[indexB]
            arr[indexB] = aux;
        }
}