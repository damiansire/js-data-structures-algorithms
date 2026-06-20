function removeDuplicates(array) {
    let mySet = new Set(array)
    return Array.from(mySet)
}

// removeDuplicates([6, 6, 9, 9, 13, 14, 13, 9, 3, 1]) => [6, 9, 13, 14, 3, 1]

module.exports = { removeDuplicates };
