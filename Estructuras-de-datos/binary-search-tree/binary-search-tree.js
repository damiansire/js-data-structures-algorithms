class BinarySearchTreeNode {
    constructor(value) {
        this.value = value;
        this.left = null;
        this.right = null;
    }
}

class BinarySearchTree {

    constructor() {
        this.root = null
    }

    insert(value) {
        let node = new BinarySearchTreeNode(value);
        if (this.root === null) {
            this.root = node;
            return node;
        }
        let current = this.root;
        while (true) {
            if (value < current.value) {
                if (current.left === null) {
                    current.left = node;
                    return node;
                }
                current = current.left;
            } else if (value > current.value) {
                if (current.right === null) {
                    current.right = node;
                    return node;
                }
                current = current.right;
            } else {
                // valor duplicado: no se inserta
                return current;
            }
        }
    }

    find(value) {
        let current = this.root;
        while (current !== null) {
            if (value === current.value) {
                return current;
            }
            current = value < current.value ? current.left : current.right;
        }
        return null;
    }

    findMinNode(node = this.root) {
        if (node === null) { return null; }
        while (node.left !== null) {
            node = node.left;
        }
        return node;
    }

    getRootNode() {
        return this.root;
    }

    inOrder(node = this.root, result = []) {
        if (node !== null) {
            this.inOrder(node.left, result);
            result.push(node.value);
            this.inOrder(node.right, result);
        }
        return result;
    }
}

module.exports = { BinarySearchTree, BinarySearchTreeNode };
