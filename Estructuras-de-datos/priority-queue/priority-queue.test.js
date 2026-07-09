const { PriorityQueue } = require('./priority-queue');

describe('PriorityQueue (min-heap)', () => {
  test('una cola nueva está vacía', () => {
    const pq = new PriorityQueue();
    expect(pq.isEmpty()).toBe(true);
    expect(pq.size()).toBe(0);
    expect(pq.peek()).toBeNull();
  });

  test('dequeue devuelve los elementos en orden de prioridad (menor primero)', () => {
    const pq = new PriorityQueue();
    pq.enqueue('media', 5);
    pq.enqueue('urgente', 1);
    pq.enqueue('baja', 9);
    pq.enqueue('alta', 2);
    expect(pq.size()).toBe(4);
    expect(pq.peek()).toBe('urgente');
    expect(pq.dequeue()).toBe('urgente'); // prioridad 1
    expect(pq.dequeue()).toBe('alta'); // 2
    expect(pq.dequeue()).toBe('media'); // 5
    expect(pq.dequeue()).toBe('baja'); // 9
    expect(pq.isEmpty()).toBe(true);
  });

  test('mantiene el orden con inserciones y extracciones intercaladas', () => {
    const pq = new PriorityQueue();
    pq.enqueue('a', 3);
    pq.enqueue('b', 1);
    expect(pq.dequeue()).toBe('b'); // 1
    pq.enqueue('c', 2);
    pq.enqueue('d', 0);
    expect(pq.dequeue()).toBe('d'); // 0
    expect(pq.dequeue()).toBe('c'); // 2
    expect(pq.dequeue()).toBe('a'); // 3
    expect(pq.isEmpty()).toBe(true);
  });

  test('dequeue sobre cola vacía lanza Error', () => {
    const pq = new PriorityQueue();
    expect(() => pq.dequeue()).toThrow(
      'No se puede hacer dequeue() sobre una cola de prioridad vacia',
    );
  });

  test('ordena una secuencia aleatoria como un heapsort', () => {
    const pq = new PriorityQueue();
    const nums = [7, 3, 9, 1, 4, 8, 2, 6, 5, 0];
    for (const n of nums) pq.enqueue(`n${n}`, n);
    const out = [];
    while (!pq.isEmpty()) out.push(pq.dequeue());
    expect(out).toEqual(['n0', 'n1', 'n2', 'n3', 'n4', 'n5', 'n6', 'n7', 'n8', 'n9']);
  });

  test('prioridades iguales no rompen el heap (todas salen)', () => {
    const pq = new PriorityQueue();
    pq.enqueue('x', 2);
    pq.enqueue('y', 2);
    pq.enqueue('z', 2);
    const out = [pq.dequeue(), pq.dequeue(), pq.dequeue()].sort();
    expect(out).toEqual(['x', 'y', 'z']);
    expect(pq.isEmpty()).toBe(true);
  });
});
