const { fibIterative, fibElementRecursive, fib } = require("./fibonacci");

describe("fibIterative", () => {
  test("n = 0 devuelve [0]", () => {
    expect(fibIterative(0)).toEqual([0]);
  });

  test("n = 1 devuelve la secuencia base [0, 1]", () => {
    expect(fibIterative(1)).toEqual([0, 1]);
  });

  test("genera la secuencia hasta n", () => {
    expect(fibIterative(7)).toEqual([0, 1, 1, 2, 3, 5, 8, 13]);
  });
});

describe("fibElementRecursive", () => {
  test("casos base", () => {
    expect(fibElementRecursive(0)).toBe(0);
    expect(fibElementRecursive(1)).toBe(1);
  });

  test("devuelve el n-ésimo número de Fibonacci", () => {
    expect(fibElementRecursive(2)).toBe(1);
    expect(fibElementRecursive(7)).toBe(13);
    expect(fibElementRecursive(10)).toBe(55);
  });
});

describe("fib (memoizado)", () => {
  test("casos base", () => {
    expect(fib(0)).toBe(0);
    expect(fib(1)).toBe(1);
  });

  test("devuelve el n-ésimo número de Fibonacci", () => {
    expect(fib(7)).toBe(13);
    expect(fib(10)).toBe(55);
    expect(fib(20)).toBe(6765);
  });

  test("las tres implementaciones coinciden en el n-ésimo elemento", () => {
    for (let n = 0; n <= 12; n++) {
      const iterativo = fibIterative(n)[n];
      expect(fibElementRecursive(n)).toBe(iterativo);
      expect(fib(n)).toBe(iterativo);
    }
  });
});
