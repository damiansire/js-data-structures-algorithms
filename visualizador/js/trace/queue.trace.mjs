// Cola (FIFO) del visualizador — SIN DOM.
//
// ÚNICA copia de la lógica de Queue en la capa de vista: scenes/queue.js la
// importa para animar y queue.trace.test.mjs la compara operación por operación
// contra el módulo canónico Estructuras-de-datos/queue/queue.ts. La copia
// anterior ya había drifteado: enqueue() devolvía el Node y dequeue() devolvía
// el Node en vez del dato, una API que el canónico no tiene. El test de
// equivalencia es lo que impide que vuelva a pasar.
//
// La API replica exactamente la del canónico:
//   peek()    -> el DATO del frente (o null si está vacía)
//   enqueue() -> void
//   dequeue() -> el DATO desencolado; lanza Error si la cola está vacía
// Extensión solo-vista (no existe en el canónico, la animación la necesita
// para mapear nodo -> tarjeta en pantalla):
//   peekNode() -> el NODO del frente

/** Nodo de la cola; apunta al elemento que tiene detrás (hacia la cola). */
export class Node {
  /** @param {*} data */
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
export class Queue {
  constructor() {
    /** @type {Node|null} Nodo al frente (el primero en salir). */
    this.head = null;
    /** @type {Node|null} Nodo al final (el último en entrar). */
    this.tail = null;
  }

  /**
   * Cuenta los elementos de la cola. O(n).
   * @returns {number}
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
   * @returns {boolean}
   */
  isEmpty() {
    return this.head === null;
  }

  /**
   * Devuelve el valor del frente sin sacarlo. O(1).
   * @returns {*} El dato del frente, o null si la cola está vacía.
   */
  peek() {
    return this.head === null ? null : this.head.data;
  }

  /**
   * Devuelve el nodo del frente sin sacarlo (extensión solo-vista). O(1).
   * @returns {Node|null}
   */
  peekNode() {
    return this.head;
  }

  /**
   * Indica si algún elemento de la cola coincide con el valor. O(n).
   * @param {*} element
   * @returns {boolean}
   */
  hasElement(element) {
    let aux = this.head;
    while (aux != null && aux.data != element) {
      aux = aux.next;
    }
    return aux !== null;
  }

  /**
   * Encola un elemento al final. O(1).
   * @param {*} element
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
   * @returns {*} El dato desencolado.
   * @throws {Error} Si la cola está vacía.
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
