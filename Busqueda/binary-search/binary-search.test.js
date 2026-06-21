const { binarySearch } = require("./binary-search");

describe("binarySearch", () => {
  const arr = [1, 3, 5, 7, 9, 11, 13];

  test("encuentra un elemento en el medio", () => {
    expect(binarySearch(arr, 7)).toBe(3);
  });

  test("encuentra el primer elemento", () => {
    expect(binarySearch(arr, 1)).toBe(0);
  });

  test("encuentra el último elemento", () => {
    expect(binarySearch(arr, 13)).toBe(6);
  });

  test("devuelve -1 si el elemento no existe (dentro del rango)", () => {
    expect(binarySearch(arr, 8)).toBe(-1);
  });

  test("devuelve -1 si el elemento es menor que todos", () => {
    expect(binarySearch(arr, -5)).toBe(-1);
  });

  test("devuelve -1 si el elemento es mayor que todos", () => {
    expect(binarySearch(arr, 100)).toBe(-1);
  });

  test("array vacío devuelve -1", () => {
    expect(binarySearch([], 1)).toBe(-1);
  });

  test("array de un elemento: presente y ausente", () => {
    expect(binarySearch([42], 42)).toBe(0);
    expect(binarySearch([42], 7)).toBe(-1);
  });
});
