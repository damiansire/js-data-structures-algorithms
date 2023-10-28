const { bubbleSort } = require('./bubble-sort');

describe('bubbleSort', () => {
    it('should sort an array in ascending order', () => {
        // Arrange
        const unsortedArray = [3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5];

        // Act
        const sortedArray = bubbleSort([...unsortedArray]);
        // Assert
        expect(sortedArray).toEqual([1, 1, 2, 3, 3, 4, 5, 5, 5, 6, 9]);
    });
});
