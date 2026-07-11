/**
 * Nodo de la cola; apunta al elemento que tiene detrás (hacia la cola).
 */
export class Node<T> {
  data: T;
  /** Nodo siguiente (más cerca de la cola). */
  next: Node<T> | null;

  constructor(data: T) {
    this.data = data;
    this.next = null;
  }
}

/**
 * Cola (FIFO) implementada con nodos enlazados. Mantiene punteros al frente y a
 * la cola para que enqueue() y dequeue() sean O(1).
 */
export class Queue<T> {
  /** Nodo al frente (el primero en salir). */
  head: Node<T> | null;
  /** Nodo al final (el último en entrar). */
  tail: Node<T> | null;

  constructor() {
    this.head = null;
    this.tail = null;
  }

  /**
   * Cuenta los elementos de la cola. O(n).
   */
  length(): number {
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
   */
  isEmpty(): boolean {
    return this.head === null;
  }

  /**
   * Devuelve el valor del frente sin sacarlo. O(1).
   */
  peek(): T | null {
    return this.head === null ? null : this.head.data;
  }

  /**
   * Indica si algún elemento de la cola coincide con el valor. O(n).
   */
  hasElement(element: T): boolean {
    let aux = this.head;
    while (aux != null && aux.data != element) {
      aux = aux.next;
    }
    return aux !== null;
  }

  /**
   * Imprime por consola los elementos desde el frente hacia la cola.
   */
  print(): void {
    let aux = this.head;
    while (aux !== null) {
      console.log(aux.data);
      aux = aux.next;
    }
  }

  /**
   * Encola un elemento al final. O(1).
   */
  enqueue(element: T): void {
    const node = new Node<T>(element);
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
   * @throws Si la cola está vacía.
   */
  dequeue(): T {
    if (this.head === null) {
      throw new Error('No se puede hacer dequeue() sobre una cola vacia');
    }
    const data = this.head.data;
    this.head = this.head.next;
    if (this.head === null) this.tail = null;
    return data;
  }
}
