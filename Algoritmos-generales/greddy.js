// Problema de las monedas
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