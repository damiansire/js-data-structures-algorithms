const { quickSort } = require('./quick-sort');

describe('quickSort', () => {
  test('ordena un array desordenado de forma ascendente', () => {
    const arr = [3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5];
    expect(quickSort(arr)).toEqual([1, 1, 2, 3, 3, 4, 5, 5, 5, 6, 9]);
  });

  test('ordena in-place (modifica el array original)', () => {
    const arr = [5, 2, 8, 1];
    const result = quickSort(arr);
    expect(result).toBe(arr);
    expect(arr).toEqual([1, 2, 5, 8]);
  });

  test('array vacío', () => {
    expect(quickSort([])).toEqual([]);
  });

  test('un solo elemento', () => {
    expect(quickSort([42])).toEqual([42]);
  });

  test('array ya ordenado', () => {
    expect(quickSort([1, 2, 3, 4, 5])).toEqual([1, 2, 3, 4, 5]);
  });

  test('array en orden inverso', () => {
    expect(quickSort([5, 4, 3, 2, 1])).toEqual([1, 2, 3, 4, 5]);
  });

  test('array con todos los elementos iguales', () => {
    expect(quickSort([7, 7, 7, 7])).toEqual([7, 7, 7, 7]);
  });

  test('números negativos', () => {
    expect(quickSort([-3, 5, -1, 0, 2, -8])).toEqual([-8, -3, -1, 0, 2, 5]);
  });
});
