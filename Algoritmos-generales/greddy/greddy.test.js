const { greddyMoney } = require("./greddy");

describe("greddyMoney", () => {
  test("devuelve las monedas que suman el monto objetivo (96)", () => {
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
});
