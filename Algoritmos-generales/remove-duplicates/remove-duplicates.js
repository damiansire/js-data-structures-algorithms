/**
 * Elimina los elementos duplicados de un array conservando el orden de primera
 * aparición, apoyándose en un Set. O(n).
 * @param {Array} array Array de entrada (puede tener duplicados).
 * @returns {Array} Un array nuevo sin duplicados.
 */
function removeDuplicates(array) {
    let mySet = new Set(array)
    return Array.from(mySet)
}

// removeDuplicates([6, 6, 9, 9, 13, 14, 13, 9, 3, 1]) => [6, 9, 13, 14, 3, 1]

module.exports = { removeDuplicates };
