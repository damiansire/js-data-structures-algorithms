const { removeDuplicates } = require('./remove-duplicates');

describe('removeDuplicates', () => {
  test('elimina duplicados conservando el primer orden de aparición', () => {
    expect(removeDuplicates([6, 6, 9, 9, 13, 14, 13, 9, 3, 1])).toEqual([6, 9, 13, 14, 3, 1]);
  });

  test('array sin duplicados queda igual', () => {
    expect(removeDuplicates([1, 2, 3])).toEqual([1, 2, 3]);
  });

  test('array vacío', () => {
    expect(removeDuplicates([])).toEqual([]);
  });

  test('todos los elementos iguales', () => {
    expect(removeDuplicates([5, 5, 5, 5])).toEqual([5]);
  });

  test('funciona con strings', () => {
    expect(removeDuplicates(['a', 'b', 'a', 'c', 'b'])).toEqual(['a', 'b', 'c']);
  });
});
