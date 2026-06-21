/**
 * Nodo de un árbol binario de búsqueda.
 */
class BinarySearchTreeNode {
    /**
     * @param {*} value Valor almacenado en el nodo.
     */
    constructor(value) {
        this.value = value;
        /** @type {BinarySearchTreeNode|null} Hijo izquierdo (valores menores). */
        this.left = null;
        /** @type {BinarySearchTreeNode|null} Hijo derecho (valores mayores). */
        this.right = null;
    }
}

/**
 * Árbol binario de búsqueda (BST): para cada nodo, los valores menores van a la
 * izquierda y los mayores a la derecha. No admite duplicados.
 */
class BinarySearchTree {

    constructor() {
        /** @type {BinarySearchTreeNode|null} Nodo raíz del árbol. */
        this.root = null
    }

    /**
     * Inserta un valor respetando el invariante del BST. Promedio O(log n).
     * Los valores duplicados se ignoran.
     * @param {*} value Valor a insertar.
     * @returns {BinarySearchTreeNode} El nodo insertado, o el existente si el valor estaba duplicado.
     */
    insert(value) {
        let node = new BinarySearchTreeNode(value);
        if (this.root === null) {
            this.root = node;
            return node;
        }
        let current = this.root;
        while (current !== null) {
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

    /**
     * Busca un nodo por su valor aprovechando el orden del BST. Promedio O(log n).
     * @param {*} value Valor a buscar (comparación estricta ===).
     * @returns {BinarySearchTreeNode|null} El nodo encontrado, o null si no existe.
     */
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

    /**
     * Devuelve el nodo de menor valor del árbol (o del subárbol indicado).
     * @param {BinarySearchTreeNode|null} [node=this.root] Nodo desde el cual empezar a descender.
     * @returns {BinarySearchTreeNode|null} El nodo más a la izquierda, o null si está vacío.
     */
    findMinNode(node = this.root) {
        if (node === null) { return null; }
        while (node.left !== null) {
            node = node.left;
        }
        return node;
    }

    /**
     * Devuelve la raíz del árbol.
     * @returns {BinarySearchTreeNode|null} El nodo raíz, o null si el árbol está vacío.
     */
    getRootNode() {
        return this.root;
    }

    /**
     * Recorrido in-order (izquierda, raíz, derecha): devuelve los valores
     * ordenados ascendentemente.
     * @param {BinarySearchTreeNode|null} [node=this.root] Nodo desde el cual recorrer.
     * @param {Array} [result=[]] Acumulador donde se vuelcan los valores.
     * @returns {Array} Los valores del árbol en orden ascendente.
     */
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
