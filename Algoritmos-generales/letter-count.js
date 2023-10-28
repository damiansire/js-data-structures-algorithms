//Used only array and for, and letter to ASCII convert
function countLetter(text) {
    for (let index = 0; index < text.length; index++) {
        let amountArrayIndex = getLetterAmountArray(text[index])
        if (letterAmountArray[amountArrayIndex] === undefined) {
            letterAmountArray[amountArrayIndex] = 1;
        } else {
            letterAmountArray[amountArrayIndex]++;
        }
    }
    return letterAmountArray;
}

function revertPosition(num) {
    return String.fromCharCode(num + 97)
}

function getLetterAmountArray(letter) {
    return letter.charCodeAt() - 97
}


//Used EM6
let text = "hola como estas"
let textWithout = "hola como estas".trim().replaceAll(" ", "")
let countLetter = {};
[...textWithout].map(letter => {
    if (countLetter[letter] !== undefined) {
        countLetter[letter]++;
    } else {
        countLetter[letter] = 1
    }
})