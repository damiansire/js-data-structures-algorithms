// Cola de prioridad (min-heap binario) del visualizador — SIN DOM.
//
// ÚNICA copia de la lógica de PriorityQueue en la capa de vista:
// scenes/priority-queue.js la importa para animar y
// priority-queue.trace.test.mjs la compara operación por operación (incluido el
// LAYOUT del heap, que es el árbol que la animación dibuja) contra el módulo
// canónico Estructuras-de-datos/priority-queue/priority-queue.ts. La copia
// anterior guardaba prioridades peladas en vez de entradas {value, priority} y
// no lanzaba el mismo Error; el test de equivalencia impide que vuelva a pasar.
//
// La API replica exactamente la del canónico. Extensión solo-vista:
//   entries() -> copia del heap aplanado, para dibujar árbol y arreglo.

/**
 * Cola de prioridad (min-heap binario) sobre un arreglo. El elemento de MENOR
 * prioridad numérica sale primero. Sift-up al insertar y sift-down al extraer,
 * ambas O(log n).
 */
export class PriorityQueue {
  constructor() {
    /** @type {Array<{value: *, priority: number}>} Heap aplanado; heap[0] es el mínimo. */
    this.heap = [];
  }

  /**
   * Cantidad de elementos. O(1).
   * @returns {number}
   */
  size() {
    return this.heap.length;
  }

  /**
   * Indica si la cola está vacía. O(1).
   * @returns {boolean}
   */
  isEmpty() {
    return this.heap.length === 0;
  }

  /**
   * Devuelve (sin sacar) el valor de menor prioridad. O(1).
   * @returns {*} El valor del mínimo, o null si está vacía.
   */
  peek() {
    return this.heap.length === 0 ? null : this.heap[0].value;
  }

  /**
   * Inserta un valor con una prioridad. Menor prioridad = sale antes. O(log n).
   * @param {*} value
   * @param {number} priority
   */
  enqueue(value, priority) {
    this.heap.push({ value, priority });
    this.siftUp(this.heap.length - 1);
  }

  /**
   * Saca y devuelve el valor de menor prioridad. O(log n).
   * @returns {*}
   * @throws {Error} Si la cola está vacía.
   */
  dequeue() {
    if (this.heap.length === 0) {
      throw new Error('No se puede hacer dequeue() sobre una cola de prioridad vacia');
    }
    const min = this.heap[0];
    const last = this.heap.pop();
    if (this.heap.length > 0) {
      this.heap[0] = last;
      this.siftDown(0);
    }
    return min.value;
  }

  /**
   * Copia del heap aplanado, en orden de arreglo (extensión solo-vista: es el
   * árbol/arreglo que la escena dibuja). O(n).
   * @returns {Array<{value: *, priority: number}>}
   */
  entries() {
    return this.heap.slice();
  }

  /**
   * Sube el elemento en `i` mientras sea menor que su padre. O(log n).
   * @param {number} i
   */
  siftUp(i) {
    while (i > 0) {
      const parent = (i - 1) >> 1;
      if (this.heap[i].priority >= this.heap[parent].priority) break;
      this.swap(i, parent);
      i = parent;
    }
  }

  /**
   * Baja el elemento en `i` mientras sea mayor que su hijo más chico. O(log n).
   * @param {number} i
   */
  siftDown(i) {
    const n = this.heap.length;
    for (;;) {
      const left = 2 * i + 1;
      const right = 2 * i + 2;
      let smallest = i;
      if (left < n && this.heap[left].priority < this.heap[smallest].priority) smallest = left;
      if (right < n && this.heap[right].priority < this.heap[smallest].priority) smallest = right;
      if (smallest === i) break;
      this.swap(i, smallest);
      i = smallest;
    }
  }

  /**
   * Intercambia dos posiciones del heap. O(1).
   * @param {number} a
   * @param {number} b
   */
  swap(a, b) {
    const tmp = this.heap[a];
    this.heap[a] = this.heap[b];
    this.heap[b] = tmp;
  }
}
