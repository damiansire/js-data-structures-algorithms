/**
 * Nodo de la deque; doblemente enlazado (apunta al anterior y al siguiente).
 */
export class Node<T> {
  data: T;
  prev: Node<T> | null;
  next: Node<T> | null;

  constructor(data: T) {
    this.data = data;
    this.prev = null;
    this.next = null;
  }
}

/**
 * Cola doblemente terminada (double-ended queue): se puede agregar y sacar por
 * AMBOS extremos en O(1), implementada con una lista doblemente enlazada. Es la
 * base de un stack, una cola y también de estructuras como el sliding-window.
 */
export class Deque<T> {
  /** Extremo frontal. */
  head: Node<T> | null;
  /** Extremo trasero. */
  tail: Node<T> | null;
  length: number;

  constructor() {
    this.head = null;
    this.tail = null;
    this.length = 0;
  }

  /**
   * Cantidad de elementos. O(1).
   */
  size(): number {
    return this.length;
  }

  /**
   * Indica si está vacía. O(1).
   */
  isEmpty(): boolean {
    return this.length === 0;
  }

  /**
   * Agrega un elemento al frente. O(1).
   */
  pushFront(element: T): void {
    const node = new Node<T>(element);
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
   */
  pushBack(element: T): void {
    const node = new Node<T>(element);
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
   * @throws Si está vacía.
   */
  popFront(): T {
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
   * @throws Si está vacía.
   */
  popBack(): T {
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
   */
  peekFront(): T | null {
    return this.head === null ? null : this.head.data;
  }

  /**
   * Devuelve (sin sacar) el elemento del final. O(1).
   */
  peekBack(): T | null {
    return this.tail === null ? null : this.tail.data;
  }

  /**
   * Vuelca el contenido del frente al final, en orden. O(n).
   */
  toArray(): T[] {
    const out: T[] = [];
    for (let aux = this.head; aux !== null; aux = aux.next) out.push(aux.data);
    return out;
  }
}
