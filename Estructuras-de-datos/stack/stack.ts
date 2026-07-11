/**
 * Nodo de la pila; apunta al elemento que tiene debajo.
 */
export class Node<T> {
  data: T;
  /** Nodo que está debajo en la pila. */
  prev: Node<T> | null;

  constructor(data: T) {
    this.data = data;
    this.prev = null;
  }
}

/**
 * Pila (LIFO) implementada con nodos enlazados.
 */
export class Stack<T> {
  /** Nodo en el tope de la pila. */
  top: Node<T> | null;

  constructor() {
    this.top = null;
  }

  /**
   * Cuenta los elementos de la pila. O(n).
   */
  length(): number {
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
   */
  hasElement(element: T): boolean {
    let aux = this.top;
    while (aux != null && aux.data != element) {
      aux = aux.prev;
    }
    return aux !== null;
  }

  /**
   * Devuelve el valor del tope sin desapilarlo. O(1).
   */
  peek(): T | null {
    return this.top === null ? null : this.top.data;
  }

  /**
   * Devuelve el nodo del tope sin desapilarlo. O(1).
   */
  peekNode(): Node<T> | null {
    return this.top;
  }

  /**
   * Indica si la pila está vacía. O(1).
   */
  isEmpty(): boolean {
    return this.top === null;
  }

  /**
   * Imprime por consola los elementos desde el tope hacia el fondo.
   */
  print(): void {
    let aux = this.top;
    while (aux !== null) {
      console.log(aux.data);
      aux = aux.prev;
    }
  }

  /**
   * Apila un elemento en el tope. O(1).
   */
  push(element: T): void {
    const aux = new Node<T>(element);
    aux.prev = this.top;
    this.top = aux;
  }

  /**
   * Desapila el elemento del tope y devuelve su dato. O(1).
   * @throws Si la pila está vacía.
   */
  pop(): T {
    if (this.top != null) {
      const data = this.top.data;
      this.top = this.top.prev;
      return data;
    } else {
      throw new Error('No se puede hacer pop() sobre una pila vacia');
    }
  }
}
