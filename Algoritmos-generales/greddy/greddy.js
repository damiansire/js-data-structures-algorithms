// Problema de las monedas
/**
 * Resuelve el problema del cambio de monedas con una estrategia greedy
 * (voraz): siempre toma la moneda de mayor denominación que no se pase del
 * monto restante. Con un set de denominaciones canónico (que incluye la
 * moneda 1), la solución greedy es óptima (usa la menor cantidad de monedas).
 *
 * @param {number} [amount=96] Monto a cambiar (entero no negativo).
 * @param {number[]} [coins=[1, 2, 5, 10, 20, 50]] Denominaciones disponibles.
 * @throws {Error} Si el monto no se puede representar con las monedas dadas
 *   (p. ej. un set sin la moneda 1 y un monto que no es múltiplo exacto).
 * @returns {number[]} Lista de monedas elegidas, de mayor a menor, que suman `amount`.
 */
function greddyMoney(amount = 96, coins = [1, 2, 5, 10, 20, 50]) {
    // Ordenar ascendente para recorrer de mayor a menor con index decreciente.
    const money = [...coins].sort((a, b) => a - b);
    let residualMoney = amount;
    let index = money.length - 1;
    const selectedMoney = [];
    while (residualMoney > 0) {
        if (index < 0) {
            // No queda ninguna denominación que entre en el resto: el monto
            // no es representable con este set de monedas.
            throw new Error(
                `No se puede representar el monto ${amount} con las monedas [${coins}]`
            );
        }
        const pay = residualMoney - money[index];
        if (pay >= 0) {
            residualMoney = pay;
            selectedMoney.push(money[index]);
        } else {
            index = index - 1;
        }
    }
    return selectedMoney;
}

// Alias con el nombre correcto (greedy) para mejorar la descubribilidad.
const greedyMoney = greddyMoney;

module.exports = { greddyMoney, greedyMoney };
