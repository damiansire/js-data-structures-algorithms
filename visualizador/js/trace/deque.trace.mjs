// Deque (double-ended queue) del visualizador — SIN DOM.
//
// ÚNICA copia de la lógica de Deque en la capa de vista: scenes/deque.js la
// importa para animar y deque.trace.test.mjs la compara operación por operación
// contra el módulo canónico Estructuras-de-datos/deque/deque.ts. La copia
// anterior ya había drifteado: no tenía size()/peekFront()/peekBack() y sus
// popFront()/popBack() NO lanzaban sobre deque vacía (el canónico sí). El test
// de equivalencia es lo que impide que vuelva a pasar.

/** Nodo de la deque; doblemente enlazado (apunta al anterior y al siguiente). */
export class Node {
  /** @param {*} data */
  constructor(data) {
    this.data = data;
    /** @type {Node|null} */
    this.prev = null;
    /** @type {Node|null} */
    this.next = null;
  }
}

/**
 * Cola doblemente terminada (double-ended queue): se puede agregar y sacar por
 * AMBOS extremos en O(1), implementada con una lista doblemente enlazada.
 */
export class Deque {
  constructor() {
    /** @type {Node|null} Extremo frontal. */
    this.head = null;
    /** @type {Node|null} Extremo trasero. */
    this.tail = null;
    /** @type {number} */
    this.length = 0;
  }

  /**
   * Cantidad de elementos. O(1).
   * @returns {number}
   */
  size() {
    return this.length;
  }

  /**
   * Indica si está vacía. O(1).
   * @returns {boolean}
   */
  isEmpty() {
    return this.length === 0;
  }

  /**
   * Agrega un elemento al frente. O(1).
   * @param {*} element
   */
  pushFront(element) {
    const node = new Node(element);
    if (this.head === null) {
      this.head = this.tail = node;
    } else {
      node.next = this.head;
      this.head.prev = node;
      this.head = node;
    }
    this.length++;
  }

  /**
   * Agrega un elemento al final. O(1).
   * @param {*} element
   */
  pushBack(element) {
    const node = new Node(element);
    if (this.tail === null) {
      this.head = this.tail = node;
    } else {
      node.prev = this.tail;
      this.tail.next = node;
      this.tail = node;
    }
    this.length++;
  }

  /**
   * Saca y devuelve el elemento del frente. O(1).
   * @returns {*}
   * @throws {Error} Si está vacía.
   */
  popFront() {
    if (this.head === null) throw new Error('No se puede popFront() sobre una deque vacia');
    const node = this.head;
    this.head = node.next;
    if (this.head === null) this.tail = null;
    else this.head.prev = null;
    this.length--;
    return node.data;
  }

  /**
   * Saca y devuelve el elemento del final. O(1).
   * @returns {*}
   * @throws {Error} Si está vacía.
   */
  popBack() {
    if (this.tail === null) throw new Error('No se puede popBack() sobre una deque vacia');
    const node = this.tail;
    this.tail = node.prev;
    if (this.tail === null) this.head = null;
    else this.tail.next = null;
    this.length--;
    return node.data;
  }

  /**
   * Devuelve (sin sacar) el elemento del frente. O(1).
   * @returns {*} El dato del frente, o null si está vacía.
   */
  peekFront() {
    return this.head === null ? null : this.head.data;
  }

  /**
   * Devuelve (sin sacar) el elemento del final. O(1).
   * @returns {*} El dato del final, o null si está vacía.
   */
  peekBack() {
    return this.tail === null ? null : this.tail.data;
  }

  /**
   * Vuelca el contenido del frente al final, en orden. O(n).
   * @returns {Array<*>}
   */
  toArray() {
    const out = [];
    for (let aux = this.head; aux !== null; aux = aux.next) out.push(aux.data);
    return out;
  }
}
