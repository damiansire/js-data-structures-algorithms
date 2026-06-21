//Used only array and for, and letter to ASCII convert
/**
 * Cuenta la frecuencia de cada letra minúscula (a-z) usando un array indexado
 * por posición (a=0, b=1, ...) calculada con códigos ASCII.
 * @param {string} text Texto a analizar (se asume con minúsculas a-z).
 * @returns {number[]} Array disperso donde el índice i guarda la cantidad de la letra i-ésima.
 */
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

/**
 * Convierte un índice de posición (0-25) de vuelta a su letra minúscula.
 * Inversa de {@link getLetterAmountArray}.
 * @param {number} num Índice de la letra (0 = 'a', 25 = 'z').
 * @returns {string} La letra correspondiente.
 */
function revertPosition(num) {
    return String.fromCharCode(num + 97)
}

/**
 * Convierte una letra minúscula en su índice de posición (a=0, b=1, ...).
 * @param {string} letter Una letra minúscula (a-z).
 * @returns {number} El índice 0-25 correspondiente.
 */
function getLetterAmountArray(letter) {
    return letter.charCodeAt() - 97
}

//Used EM6
/**
 * Cuenta la frecuencia de cada carácter de un texto en un objeto, ignorando
 * los espacios (internos y de los bordes).
 * @param {string} text Texto a analizar.
 * @returns {Object<string, number>} Mapa carácter -> cantidad de apariciones.
 */
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
