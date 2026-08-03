// Lista enlazada simple del visualizador — SIN DOM.
//
// ÚNICA copia de la lógica de List en la capa de vista: scenes/list.js la
// importa para animar y list.trace.test.mjs la compara operación por operación
// contra el módulo canónico Estructuras-de-datos/list/list.ts. La copia
// anterior devolvía el Node en push() (el canónico devuelve void) y le faltaban
// find()/getElementByIndex()/getLastElement()/deleteByNode(); el test de
// equivalencia es lo que impide que vuelva a driftear.
//
// Extensiones solo-vista (no existen en el canónico):
//   prepend(data) -> insertar al inicio manteniendo los MISMOS invariantes
//                    (head nuevo, last si estaba vacía, length++), para poder
//                    mostrar inserción "al frente". Cubierta por su propio test.
//   toArray()     -> los NODOS en orden, para mapear nodo -> vagón en pantalla.

/** Nodo de una lista enlazada simple. */
export class Node {
  /** @param {*} data */
  constructor(data) {
    this.data = data;
    /** @type {Node|null} Siguiente nodo, o null si es la cola. */
    this.next = null;
  }
}

/** Lista enlazada simple con puntero a cabeza y cola. */
export class List {
  constructor() {
    /** @type {Node|null} Primer nodo de la lista. */
    this.head = null;
    /** @type {Node|null} Último nodo de la lista. */
    this.last = null;
    /** @type {number} Cantidad de elementos. */
    this.length = 0;
  }

  /**
   * Agrega un elemento al final de la lista. O(1).
   * @param {*} data
   */
  push(data) {
    const node = new Node(data);
    if (this.head == null) {
      this.head = node;
    } else if (this.last) {
      this.last.next = node;
    }
    this.last = node;
    this.length++;
  }

  /**
   * Agrega un elemento al inicio (extensión solo-vista, mismos invariantes que
   * push: head nuevo, last si estaba vacía, length++). O(1).
   * @param {*} data
   */
  prepend(data) {
    const node = new Node(data);
    if (this.head == null) this.last = node;
    node.next = this.head;
    this.head = node;
    this.length++;
  }

  /**
   * Recorre la lista y devuelve el último nodo. O(n).
   * @returns {Node|null}
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
   * @param {number} index
   * @returns {Node|null}
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
   * @param {*} element
   * @returns {Node|null}
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
   * @param {*} element
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
   * @param {Node} node
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

  /**
   * Los NODOS en orden, de head a last (extensión solo-vista: identidad para
   * mapear nodo -> vagón en pantalla). O(n).
   * @returns {Array<Node>}
   */
  toArray() {
    const out = [];
    let aux = this.head;
    while (aux != null) {
      out.push(aux);
      aux = aux.next;
    }
    return out;
  }
}
