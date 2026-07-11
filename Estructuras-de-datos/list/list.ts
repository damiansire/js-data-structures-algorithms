/**
 * Nodo de una lista enlazada simple.
 */
export class Node<T> {
  data: T;
  /** Siguiente nodo, o null si es la cola. */
  next: Node<T> | null;

  constructor(data: T) {
    this.data = data;
    this.next = null;
  }
}

/**
 * Lista enlazada simple con puntero a cabeza y cola.
 */
export class List<T> {
  /** Primer nodo de la lista. */
  head: Node<T> | null;
  /** Último nodo de la lista. */
  last: Node<T> | null;
  /** Cantidad de elementos. */
  length: number;

  constructor() {
    this.head = null;
    this.last = null;
    this.length = 0;
  }

  /**
   * Agrega un elemento al final de la lista. O(1).
   */
  push(data: T): void {
    const node = new Node<T>(data);
    if (this.head == null) {
      this.head = node;
    } else if (this.last) {
      this.last.next = node;
    }
    this.last = node;
    this.length++;
  }

  /**
   * Imprime por consola el valor de cada nodo, en orden.
   */
  print(): void {
    let aux = this.head;
    while (aux != null) {
      console.log(aux.data);
      aux = aux.next;
    }
  }

  /**
   * Recorre la lista y devuelve el último nodo. O(n).
   */
  getLastElement(): Node<T> | null {
    let aux = this.head;
    while (aux != null && aux.next != null) {
      aux = aux.next;
    }
    return aux;
  }

  /**
   * Devuelve el nodo en la posición indicada (base 0). O(n).
   */
  getElementByIndex(index: number): Node<T> | null {
    if (index < 0) {
      return null;
    }
    let aux = this.head;
    let actualIndex = 0;
    while (aux != null && actualIndex != index) {
      aux = aux.next;
      actualIndex++;
    }
    return aux;
  }

  /**
   * Busca el primer nodo cuyo dato coincide con el elemento. O(n).
   */
  find(element: T): Node<T> | null {
    let aux = this.head;
    while (aux != null && aux.data != element) {
      aux = aux.next;
    }
    return aux;
  }

  /**
   * Elimina el primer nodo cuyo dato coincide con el elemento. O(n).
   * @returns El dato eliminado, o null si no se encontró.
   */
  delete(element: T): T | null {
    let aux = this.head;
    if (aux == null) {
      return null;
    }
    if (aux.data == element) {
      this.head = aux.next;
      if (aux == this.last) {
        this.last = this.head;
      }
      this.length--;
      return aux.data;
    }
    while (aux.next != null && aux.next.data != element) {
      aux = aux.next;
    }
    if (aux.next == null) {
      return null;
    }
    const removed = aux.next;
    aux.next = aux.next.next;
    if (removed == this.last) {
      this.last = aux;
    }
    this.length--;
    return removed.data;
  }

  /**
   * Elimina un nodo copiando el dato del siguiente sobre él. O(1).
   * No funciona sobre la cola (no hay nodo siguiente del cual copiar).
   * @returns null si el nodo es la cola; void en caso contrario.
   */
  deleteByNode(node: Node<T>): null | void {
    if (node.next == null) {
      return null;
    }
    node.data = node.next.data;
    node.next = node.next.next;
    if (node.next == null) {
      this.last = node;
    }
    this.length--;
  }
}

// Demo de uso: solo corre si se ejecuta este archivo directamente
// (node list.js), no al importarlo como módulo.
if (require.main === module) {
  const myList = new List<number>();
  myList.push(1);
  myList.push(4);
  myList.push(6);
  myList.push(8);
  myList.push(3);
  myList.push(2);
  myList.print();
}
