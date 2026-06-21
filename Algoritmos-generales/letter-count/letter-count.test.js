const {
  countLetter,
  countLetterMap,
  revertPosition,
  getLetterAmountArray,
} = require("./letter-count");

describe("getLetterAmountArray", () => {
  test("mapea cada letra minúscula a su índice (a -> 0)", () => {
    expect(getLetterAmountArray("a")).toBe(0);
    expect(getLetterAmountArray("b")).toBe(1);
    expect(getLetterAmountArray("z")).toBe(25);
  });
});

describe("revertPosition", () => {
  test("convierte un índice de vuelta a su letra (0 -> a)", () => {
    expect(revertPosition(0)).toBe("a");
    expect(revertPosition(25)).toBe("z");
  });

  test("es la inversa de getLetterAmountArray", () => {
    expect(revertPosition(getLetterAmountArray("m"))).toBe("m");
  });
});

describe("countLetter", () => {
  test("cuenta letras posicionándolas por índice", () => {
    // "aab" -> indice 0 (a) = 2, indice 1 (b) = 1
    const result = countLetter("aab");
    expect(result[0]).toBe(2);
    expect(result[1]).toBe(1);
  });

  test("cadena vacía devuelve un array vacío", () => {
    expect(countLetter("")).toEqual([]);
  });

  test("una sola letra repetida", () => {
    const result = countLetter("ccc");
    expect(result[getLetterAmountArray("c")]).toBe(3);
  });
});

describe("countLetterMap", () => {
  test("cuenta letras en un objeto, ignorando espacios", () => {
    expect(countLetterMap("aab")).toEqual({ a: 2, b: 1 });
  });

  test("elimina espacios internos y de los bordes", () => {
    expect(countLetterMap("  a a  ")).toEqual({ a: 2 });
  });

  test("texto con varias letras distintas", () => {
    expect(countLetterMap("banana")).toEqual({ b: 1, a: 3, n: 2 });
  });

  test("cadena vacía devuelve un objeto vacío", () => {
    expect(countLetterMap("")).toEqual({});
  });
});
