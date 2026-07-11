/**
 * Cola de prioridad (min-heap binario) sobre un arreglo. El elemento de MENOR
 * prioridad numérica sale primero. El heap se mantiene con las operaciones
 * clásicas sift-up (al insertar) y sift-down (al extraer), ambas O(log n): un
 * árbol binario casi completo aplanado en un arreglo, donde el hijo de `i` está
 * en `2i+1` y `2i+2`, y el padre de `i` en `(i-1)/2`.
 */

interface HeapEntry<T> {
  value: T;
  priority: number;
}

export class PriorityQueue<T> {
  /** Heap aplanado; heap[0] es el mínimo. */
  private heap: HeapEntry<T>[];

  constructor() {
    this.heap = [];
  }

  /**
   * Cantidad de elementos. O(1).
   */
  size(): number {
    return this.heap.length;
  }

  /**
   * Indica si la cola está vacía. O(1).
   */
  isEmpty(): boolean {
    return this.heap.length === 0;
  }

  /**
   * Devuelve (sin sacar) el valor de menor prioridad. O(1).
   */
  peek(): T | null {
    return this.heap.length === 0 ? null : this.heap[0].value;
  }

  /**
   * Inserta un valor con una prioridad. Menor prioridad = sale antes. O(log n).
   */
  enqueue(value: T, priority: number): void {
    this.heap.push({ value, priority });
    this.siftUp(this.heap.length - 1);
  }

  /**
   * Saca y devuelve el valor de menor prioridad. O(log n).
   * @throws Si la cola está vacía.
   */
  dequeue(): T {
    if (this.heap.length === 0) {
      throw new Error('No se puede hacer dequeue() sobre una cola de prioridad vacia');
    }
    const min = this.heap[0];
    const last = this.heap.pop() as HeapEntry<T>;
    if (this.heap.length > 0) {
      this.heap[0] = last;
      this.siftDown(0);
    }
    return min.value;
  }

  /**
   * Sube el elemento en `i` mientras sea menor que su padre. O(log n).
   */
  private siftUp(i: number): void {
    while (i > 0) {
      const parent = (i - 1) >> 1;
      if (this.heap[i].priority >= this.heap[parent].priority) break;
      this.swap(i, parent);
      i = parent;
    }
  }

  /**
   * Baja el elemento en `i` mientras sea mayor que su hijo más chico. O(log n).
   */
  private siftDown(i: number): void {
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
   */
  private swap(a: number, b: number): void {
    const tmp = this.heap[a];
    this.heap[a] = this.heap[b];
    this.heap[b] = tmp;
  }
}
