const { greddyMoney, greedyMoney } = require("./greddy");

describe("greddyMoney", () => {
  test("devuelve las monedas que suman el monto objetivo por defecto (96)", () => {
    const result = greddyMoney();
    const total = result.reduce((acc, coin) => acc + coin, 0);
    expect(total).toBe(96);
  });

  test("elige de mayor a menor denominación (estrategia voraz)", () => {
    // 96 = 50 + 20 + 20 + 5 + 1
    expect(greddyMoney()).toEqual([50, 20, 20, 5, 1]);
  });

  test("usa únicamente denominaciones válidas", () => {
    const validas = [1, 2, 5, 10, 20, 50];
    greddyMoney().forEach((coin) => expect(validas).toContain(coin));
  });

  test("acepta un monto parametrizado y suma exactamente ese monto", () => {
    const amount = 37;
    const result = greddyMoney(amount);
    expect(result.reduce((a, c) => a + c, 0)).toBe(amount);
  });

  test("monto 0 devuelve un array vacío", () => {
    expect(greddyMoney(0)).toEqual([]);
  });

  test("acepta un set de monedas personalizado", () => {
    // 7 = 4 + 3 (greedy: mayor denominación que entra en cada paso)
    expect(greddyMoney(7, [1, 3, 4])).toEqual([4, 3]);
  });

  test("set sin la moneda 1 y monto no representable lanza Error sin colgarse", () => {
    // [2, 5] no puede representar 3; debe lanzar, no entrar en loop infinito.
    expect(() => greddyMoney(3, [2, 5])).toThrow(/No se puede representar el monto 3/);
  });

  test("greedyMoney es un alias de greddyMoney", () => {
    expect(greedyMoney).toBe(greddyMoney);
    expect(greedyMoney(10)).toEqual([10]);
  });
});
