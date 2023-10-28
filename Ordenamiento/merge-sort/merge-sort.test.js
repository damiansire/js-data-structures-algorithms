const { merge } = require('./merge-sort');

/*
describe('mergeSort', () => {
    it('should sort an array in ascending order', () => {
        // Arrange
        const unsortedArray = [3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5];

        // Act
        const sortedArray = mergeSort([...unsortedArray]);
        // Assert
        expect(sortedArray).toEqual([1, 1, 2, 3, 3, 4, 5, 5, 5, 6, 9]);
    });
});
*/

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
        debugger
        // Act
        merge(unsortedArray, 0, 2, 5)
        // Assert
        expect(unsortedArray).toEqual([1, 2, 3, 4, 5, 6]);
    });

    it('Funciona con una cantidad impar de elementos', () => {
        // Arrange
        const unsortedArray = [1, 3, 6, 2, 4, 5, 8];
        debugger
        // Act
        merge(unsortedArray, 0, 2, 6)
        // Assert
        expect(unsortedArray).toEqual([1, 2, 3, 4, 5, 6, 8]);
    });
});