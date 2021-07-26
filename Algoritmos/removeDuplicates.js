function removeDuplicates(array) {
    let mySet = new Set(array)
    return Array.from(mySet)
}

let numbers = [6, 6, 9, 9, 13, 14, 13, 9, 3, 1];
let myList = list(set(numbers));
// [6, 9, 13, 14, 3, 1]