const { mergeSort, merge } = require("./merge-sort-recursive");

describe("merge", () => {
  test("combina dos arrays ordenados en uno ordenado", () => {
    expect(merge([1, 3, 5], [2, 4, 6])).toEqual([1, 2, 3, 4, 5, 6]);
  });

  test("uno de los arrays vacío", () => {
    expect(merge([], [1, 2, 3])).toEqual([1, 2, 3]);
    expect(merge([1, 2, 3], [])).toEqual([1, 2, 3]);
  });

  test("longitudes desiguales", () => {
    expect(merge([1], [2, 3, 4, 5])).toEqual([1, 2, 3, 4, 5]);
  });
});

describe("mergeSort", () => {
  test("ordena un array desordenado de forma ascendente", () => {
    expect(mergeSort([3, 1, 4, 1, 5, 9, 2, 6])).toEqual([1, 1, 2, 3, 4, 5, 6, 9]);
  });

  test("no muta el array original (retorna uno nuevo)", () => {
    const arr = [3, 2, 1];
    const result = mergeSort(arr);
    expect(result).toEqual([1, 2, 3]);
    expect(arr).toEqual([3, 2, 1]);
  });

  test("array vacío", () => {
    expect(mergeSort([])).toEqual([]);
  });

  test("un solo elemento", () => {
    expect(mergeSort([9])).toEqual([9]);
  });

  test("array ya ordenado", () => {
    expect(mergeSort([1, 2, 3, 4])).toEqual([1, 2, 3, 4]);
  });

  test("array en orden inverso", () => {
    expect(mergeSort([4, 3, 2, 1])).toEqual([1, 2, 3, 4]);
  });

  test("números negativos y duplicados", () => {
    expect(mergeSort([-2, 3, -2, 0, 1])).toEqual([-2, -2, 0, 1, 3]);
  });
});
