/**
 * Nodo de la cola; apunta al elemento que tiene detrás (hacia la cola).
 */
class Node {
  /**
   * @param {*} data Valor almacenado en el nodo.
   */
  constructor(data) {
    this.data = data;
    /** @type {Node|null} Nodo siguiente (más cerca de la cola). */
    this.next = null;
  }
}

/**
 * Cola (FIFO) implementada con nodos enlazados. Mantiene punteros al frente y a
 * la cola para que enqueue() y dequeue() sean O(1).
 */
class Queue {
  constructor() {
    /** @type {Node|null} Nodo al frente (el primero en salir). */
    this.head = null;
    /** @type {Node|null} Nodo al final (el último en entrar). */
    this.tail = null;
  }

  /**
   * Cuenta los elementos de la cola. O(n).
   * @returns {number} Cantidad de elementos.
   */
  length() {
    let aux = this.head;
    let count = 0;
    while (aux !== null) {
      count++;
      aux = aux.next;
    }
    return count;
  }

  /**
   * Indica si la cola está vacía. O(1).
   * @returns {boolean} true si no hay elementos.
   */
  isEmpty() {
    return this.head === null;
  }

  /**
   * Devuelve el valor del frente sin sacarlo. O(1).
   * @returns {*} El dato al frente, o null si la cola está vacía.
   */
  peek() {
    return this.head === null ? null : this.head.data;
  }

  /**
   * Indica si algún elemento de la cola coincide con el valor. O(n).
   * @param {*} element Valor a buscar (comparación con ==).
   * @returns {boolean} true si existe; false en caso contrario.
   */
  hasElement(element) {
    let aux = this.head;
    while (aux != null && aux.data != element) {
      aux = aux.next;
    }
    return aux !== null;
  }

  /**
   * Imprime por consola los elementos desde el frente hacia la cola.
   * @returns {void}
   */
  print() {
    let aux = this.head;
    while (aux !== null) {
      console.log(aux.data);
      aux = aux.next;
    }
  }

  /**
   * Encola un elemento al final. O(1).
   * @param {*} element Valor a encolar.
   * @returns {void}
   */
  enqueue(element) {
    const node = new Node(element);
    if (this.tail === null) {
      this.head = node;
      this.tail = node;
    } else {
      this.tail.next = node;
      this.tail = node;
    }
  }

  /**
   * Saca el elemento del frente y devuelve su dato. O(1).
   * @throws {Error} Si la cola está vacía.
   * @returns {*} El dato que estaba al frente.
   */
  dequeue() {
    if (this.head === null) {
      throw new Error('No se puede hacer dequeue() sobre una cola vacia');
    }
    const data = this.head.data;
    this.head = this.head.next;
    if (this.head === null) this.tail = null;
    return data;
  }
}

module.exports = { Queue, Node };
