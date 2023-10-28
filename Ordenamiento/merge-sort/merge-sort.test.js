const { merge, mergeSort } = require('./merge-sort');

describe('mergeSort', () => {
    it('debería ordenar un array de números en orden ascendente', () => {
        const arr = [4, 2, 7, 1, 9];
        mergeSort(arr, 0, arr.length - 1);
        expect(arr).toEqual([1, 2, 4, 7, 9]);
    });

    it('debería manejar un array vacío', () => {
        const arr = [];
        mergeSort(arr, 0, arr.length - 1);
        expect(arr).toEqual([]);
    });

    it('debería manejar un array con un solo elemento', () => {
        const arr = [42];
        mergeSort(arr, 0, arr.length - 1);
        expect(arr).toEqual([42]);
    });

    it('debería manejar un array que ya está ordenado', () => {
        const arr = [1, 2, 3, 4, 5];
        mergeSort(arr, 0, arr.length - 1);
        expect(arr).toEqual([1, 2, 3, 4, 5]);
    });
});

describe('merge', () => {
    it('Fusiona dos partes ordenadas de un array en un nuevo array completamente ordenado', () => {
        // Arrange
        const unsortedArray = [1, 4, 7, 9, 3, 4, 8, 9];

        // Act
        merge(unsortedArray, 0, 3, 7)
        // Assert
        expect(unsortedArray).toEqual([1, 3, 4, 4, 7, 8, 9, 9]);
    });

    it('Funciona con el array vacio', () => {
        // Arrange
        const unsortedArray = [];

        // Act
        merge(unsortedArray, 0, 0, 0)
        // Assert
        expect(unsortedArray).toEqual([]);
    });

    it('Funciona con un elemento', () => {
        // Arrange
        const unsortedArray = [1];

        // Act
        merge(unsortedArray, 0, 0, 0)
        // Assert
        expect(unsortedArray).toEqual([1]);
    });

    it('Funciona con una cantidad par de elementos', () => {
        // Arrange
        const unsortedArray = [1, 3, 6, 2, 4, 5];
        // Act
        merge(unsortedArray, 0, 2, 5)
        // Assert
        expect(unsortedArray).toEqual([1, 2, 3, 4, 5, 6]);
    });

    it('Funciona con una cantidad impar de elementos', () => {
        // Arrange
        const unsortedArray = [1, 3, 6, 2, 4, 5, 8];
        // Act
        merge(unsortedArray, 0, 2, 6)
        // Assert
        expect(unsortedArray).toEqual([1, 2, 3, 4, 5, 6, 8]);
    });
});