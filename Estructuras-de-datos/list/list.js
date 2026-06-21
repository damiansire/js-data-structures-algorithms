/**
 * Nodo de una lista enlazada simple.
 */
class Node {
  /**
   * @param {*} data Valor almacenado en el nodo.
   */
  constructor(data) {
    this.data = data;
    /** @type {Node|null} Siguiente nodo, o null si es la cola. */
    this.next = null;
  }
}

/**
 * Lista enlazada simple con puntero a cabeza y cola.
 */
class List {
  constructor() {
    /** @type {Node|null} Primer nodo de la lista. */
    this.head = null;
    /** @type {number} Cantidad de elementos. */
    this.length = 0;
  }
  /**
   * Agrega un elemento al final de la lista. O(1).
   * @param {*} data Valor a agregar.
   * @returns {void}
   */
  push(data) {
    let node = new Node(data);
    if (this.head == null) {
      this.head = node;
    } else {
      this.last.next = node;
    }
    this.last = node;
    this.length++;
  }
  /**
   * Imprime por consola el valor de cada nodo, en orden.
   * @returns {void}
   */
  print() {
    let aux = this.head;
    while (aux != null) {
      console.log(aux.data);
      aux = aux.next;
    }
  }
  /**
   * Recorre la lista y devuelve el último nodo. O(n).
   * @returns {Node|null} El último nodo, o null si la lista está vacía.
   */
  getLastElement() {
    let aux = this.head;
    while (aux != null && aux.next != null) {
      aux = aux.next;
    }
    return aux;
  }
  /**
   * Devuelve el nodo en la posición indicada (base 0). O(n).
   * @param {number} index Índice a buscar.
   * @returns {Node|null} El nodo, o null si el índice es inválido o no existe.
   */
  getElementByIndex(index) {
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
   * @param {*} element Valor a buscar (comparación con ==).
   * @returns {Node|null} El primer nodo coincidente, o null si no existe.
   */
  find(element) {
    let aux = this.head;
    while (aux != null && aux.data != element) {
      aux = aux.next;
    }
    return aux;
  }
  /**
   * Elimina el primer nodo cuyo dato coincide con el elemento. O(n).
   * @param {*} element Valor a eliminar (comparación con ==).
   * @returns {*} El dato eliminado, o null si no se encontró.
   */
  delete(element) {
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
    let removed = aux.next;
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
   * @param {Node} node Nodo a eliminar.
   * @returns {null|void} null si el nodo es la cola; void en caso contrario.
   */
  deleteByNode(node) {
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

module.exports = { List, Node };

// Demo de uso: solo corre si se ejecuta este archivo directamente
// (node list.js), no al importarlo como módulo.
if (require.main === module) {
  const myList = new List();
  myList.push(1);
  myList.push(4);
  myList.push(6);
  myList.push(8);
  myList.push(3);
  myList.push(2);
  myList.print();
}
