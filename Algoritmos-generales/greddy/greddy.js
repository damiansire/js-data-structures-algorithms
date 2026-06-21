// Problema de las monedas
/**
 * Resuelve el problema del cambio de monedas con una estrategia greedy
 * (voraz): siempre toma la moneda de mayor denominación que no se pase del
 * monto restante. Con el set de denominaciones canónico usado aquí, la
 * solución greedy es óptima (usa la menor cantidad de monedas).
 * @returns {number[]} Lista de monedas elegidas, de mayor a menor, que suman 96.
 */
function greddyMoney() {
    let money = [1, 2, 5, 10, 20, 50]
    let residualMoney = 96
    let index = money.length - 1
    let selectedMoney = []
    while (residualMoney > 0) {
        let pay = residualMoney - money[index]
        if (pay >= 0) {
            residualMoney = pay
            selectedMoney.push(money[index])
        } else {
            index = index - 1
        }
    }
    return selectedMoney;
}

module.exports = { greddyMoney };