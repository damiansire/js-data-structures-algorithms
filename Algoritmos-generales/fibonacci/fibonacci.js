/**
 * Genera la secuencia de Fibonacci de forma iterativa hasta el índice n.
 * @param {number} n Índice (base 0) del último elemento a generar.
 * @returns {number[]} La secuencia [0, 1, 1, 2, ...] hasta el índice n inclusive.
 */
function fibIterative(n) {
  if (n == 0) {
    return [0];
  }
  let fib = [0, 1];
  for (let index = 2; index <= n; index++) {
    let element = fib[index - 1] + fib[index - 2];
    fib.push(element);
  }
  return fib;
}

/**
 * Calcula el n-ésimo número de Fibonacci con recursión simple (sin memoización).
 * O(2^n): didáctico, ineficiente para n grandes.
 * @param {number} n Índice (base 0) del número a calcular.
 * @returns {number} El n-ésimo número de Fibonacci.
 */
function fibElementRecursive(n) {
  if (n == 0) {
    return 0;
  }
  if (n == 1) {
    return 1;
  }
  return fibElementRecursive(n - 1) + fibElementRecursive(n - 2);
}

/**
 * Calcula el n-ésimo número de Fibonacci con programación dinámica
 * (memoización top-down). O(n).
 * @param {number} n Índice (base 0) del número a calcular.
 * @returns {number} El n-ésimo número de Fibonacci.
 */
function fib(n) {
  return fibProgDin(n, []);
}

/**
 * Paso recursivo memoizado del cálculo de Fibonacci.
 * @param {number} n Índice (base 0) del número a calcular.
 * @param {number[]} mem Memoria de resultados ya calculados (cache).
 * @returns {number} El n-ésimo número de Fibonacci.
 */
function fibProgDin(n, mem) {
  if (n == 0) {
    return 0;
  }
  if (n == 1) {
    return 1;
  }
  if (mem[n] === undefined) {
    mem[n] = fibProgDin(n - 1, mem) + fibProgDin(n - 2, mem);
  }
  return mem[n];
}

module.exports = { fibIterative, fibElementRecursive, fib };
