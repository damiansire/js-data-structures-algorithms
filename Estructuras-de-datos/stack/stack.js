/**
 * Nodo de la pila; apunta al elemento que tiene debajo.
 */
class Node {
    /**
     * @param {*} data Valor almacenado en el nodo.
     */
    constructor(data) {
        this.data = data;
        /** @type {Node|null} Nodo que está debajo en la pila. */
        this.prev = null;
    }
}

/**
 * Pila (LIFO) implementada con nodos enlazados.
 */
class Stack {
    constructor() {
        /** @type {Node|null} Nodo en el tope de la pila. */
        this.top = null;
    }

    /**
     * Cuenta los elementos de la pila. O(n).
     * @returns {number} Cantidad de elementos.
     */
    length() {
        let aux = this.top;
        let count = 0;
        while (aux !== null) {
            count++;
            aux = aux.prev;
        }
        return count;
    }

    /**
     * Indica si algún elemento de la pila coincide con el valor. O(n).
     * @param {*} element Valor a buscar (comparación con ==).
     * @returns {boolean} true si existe; false en caso contrario.
     */
    hasElement(element) {
        let aux = this.top;
        while (aux != null && aux.data != element) {
            aux = aux.prev;
        }
        return aux !== null;
    }

    /**
     * Devuelve el nodo del tope sin desapilarlo. O(1).
     * @returns {Node|null} El nodo en el tope, o null si la pila está vacía.
     */
    peek() {
        return this.top;
    }

    /**
     * Indica si la pila está vacía. O(1).
     * @returns {boolean} true si no hay elementos.
     */
    isEmpty() {
        return this.top === null;
    }

    /**
     * Imprime por consola los elementos desde el tope hacia el fondo.
     * @returns {void}
     */
    print() {
        let aux = this.top;
        while (aux !== null) {
            console.log(aux.data)
            aux = aux.prev;
        }
    }

    /**
     * Apila un elemento en el tope. O(1).
     * @param {*} element Valor a apilar.
     * @returns {void}
     */
    push(element) {
        let aux = new Node(element)
        aux.prev = this.top;
        this.top = aux;
    }

    /**
     * Desapila el elemento del tope. O(1).
     * @throws {Error} Si la pila está vacía.
     * @returns {void}
     */
    pop() {
        if (this.top != null) {
            this.top = this.top.prev
        } else {
            throw new Error("No se puede hacer pop() sobre una pila vacia")
        }
    }

}

module.exports = { Stack, Node };