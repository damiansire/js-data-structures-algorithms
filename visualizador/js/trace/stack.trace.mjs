// Pila (LIFO) del visualizador — SIN DOM.
//
// ÚNICA copia de la lógica de Stack en la capa de vista: scenes/stack.js la
// importa para animar y stack.trace.test.mjs la compara operación por operación
// contra el módulo canónico Estructuras-de-datos/stack/stack.ts. Antes cada
// escena traía su propia clase "fiel al repo" sin nada que lo atara: el
// canónico corrigió peek()/pop() y esta copia se quedó con la API vieja
// (peek() devolvía el Node, pop() no devolvía nada) sin que CI dijera una
// palabra. El test de equivalencia es lo que impide que vuelva a pasar.
//
// La API replica exactamente la del canónico:
//   peek()     -> el DATO del tope (o null si está vacía)
//   peekNode() -> el NODO del tope (lo que la animación necesita para mapear
//                 nodo -> plato en pantalla)
//   pop()      -> el DATO desapilado; lanza Error si la pila está vacía

/** Nodo de la pila; apunta al elemento que tiene debajo. */
export class Node {
  /** @param {*} data */
  constructor(data) {
    this.data = data;
    /** @type {Node|null} Nodo que está debajo en la pila. */
    this.prev = null;
  }
}

/** Pila (LIFO) implementada con nodos enlazados. */
export class Stack {
  constructor() {
    /** @type {Node|null} Nodo en el tope de la pila. */
    this.top = null;
  }

  /**
   * Indica si la pila está vacía. O(1).
   * @returns {boolean}
   */
  isEmpty() {
    return this.top === null;
  }

  /**
   * Cuenta los elementos de la pila. O(n).
   * @returns {number}
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
   * Indica si algún elemento coincide con el valor. O(n).
   * @param {*} element
   * @returns {boolean}
   */
  hasElement(element) {
    let aux = this.top;
    while (aux != null && aux.data != element) {
      aux = aux.prev;
    }
    return aux !== null;
  }

  /**
   * Devuelve el valor del tope sin desapilarlo. O(1).
   * @returns {*} El dato del tope, o null si la pila está vacía.
   */
  peek() {
    return this.top === null ? null : this.top.data;
  }

  /**
   * Devuelve el nodo del tope sin desapilarlo. O(1).
   * @returns {Node|null}
   */
  peekNode() {
    return this.top;
  }

  /**
   * Apila un elemento en el tope. O(1).
   * @param {*} element
   */
  push(element) {
    const aux = new Node(element);
    aux.prev = this.top;
    this.top = aux;
  }

  /**
   * Desapila el elemento del tope y devuelve su dato. O(1).
   * @returns {*} El dato desapilado.
   * @throws {Error} Si la pila está vacía.
   */
  pop() {
    if (this.top != null) {
      const data = this.top.data;
      this.top = this.top.prev;
      return data;
    }
    throw new Error('No se puede hacer pop() sobre una pila vacia');
  }
}
