//Used only array and for, and letter to ASCII convert
function countLetter(text) {
    let letterAmountArray = [];
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
function countLetterMap(text) {
    let textWithout = text.trim().replaceAll(" ", "")
    let counts = {};
    [...textWithout].forEach(letter => {
        if (counts[letter] !== undefined) {
            counts[letter]++;
        } else {
            counts[letter] = 1
        }
    })
    return counts;
}

module.exports = { countLetter, countLetterMap, revertPosition, getLetterAmountArray };
