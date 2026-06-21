const { bubbleSort } = require('./bubble-sort');

describe('bubbleSort', () => {
    it('ordena un array desordenado de forma ascendente', () => {
        const unsortedArray = [3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5];
        const sortedArray = bubbleSort([...unsortedArray]);
        expect(sortedArray).toEqual([1, 1, 2, 3, 3, 4, 5, 5, 5, 6, 9]);
    });

    it('array vacío', () => {
        expect(bubbleSort([])).toEqual([]);
    });

    it('un solo elemento', () => {
        expect(bubbleSort([42])).toEqual([42]);
    });

    it('array ya ordenado', () => {
        expect(bubbleSort([1, 2, 3, 4, 5])).toEqual([1, 2, 3, 4, 5]);
    });

    it('array en orden inverso', () => {
        expect(bubbleSort([5, 4, 3, 2, 1])).toEqual([1, 2, 3, 4, 5]);
    });

    it('array con todos los elementos iguales', () => {
        expect(bubbleSort([7, 7, 7, 7])).toEqual([7, 7, 7, 7]);
    });

    it('números negativos', () => {
        expect(bubbleSort([-3, 5, -1, 0, 2, -8])).toEqual([-8, -3, -1, 0, 2, 5]);
    });

    it('duplicados', () => {
        expect(bubbleSort([2, 1, 2, 1, 2])).toEqual([1, 1, 2, 2, 2]);
    });

    it('ordena in-place (devuelve el mismo array)', () => {
        const arr = [5, 2, 8, 1];
        const result = bubbleSort(arr);
        expect(result).toBe(arr);
        expect(arr).toEqual([1, 2, 5, 8]);
    });
});
