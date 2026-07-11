import { Queue, Node } from './queue';

describe('Queue', () => {
  test('una cola recién creada está vacía', () => {
    const q = new Queue<number>();
    expect(q.isEmpty()).toBe(true);
    expect(q.length()).toBe(0);
    expect(q.peek()).toBeNull();
  });

  test('enqueue agrega elementos al final (FIFO)', () => {
    const q = new Queue<number>();
    q.enqueue(1);
    q.enqueue(2);
    q.enqueue(3);
    expect(q.isEmpty()).toBe(false);
    expect(q.length()).toBe(3);
    expect(q.peek()).toBe(1); // el primero en entrar sigue al frente
  });

  test('dequeue devuelve y quita el primer elemento encolado (FIFO)', () => {
    const q = new Queue<string>();
    q.enqueue('a');
    q.enqueue('b');
    expect(q.dequeue()).toBe('a');
    expect(q.length()).toBe(1);
    expect(q.peek()).toBe('b');
  });

  test('dequeue hasta vaciar deja la cola reutilizable', () => {
    const q = new Queue<number>();
    q.enqueue(10);
    expect(q.dequeue()).toBe(10);
    expect(q.isEmpty()).toBe(true);
    expect(q.peek()).toBeNull();
    q.enqueue(20);
    expect(q.peek()).toBe(20);
    expect(q.length()).toBe(1);
  });

  test('dequeue sobre cola vacía lanza Error', () => {
    const q = new Queue<number>();
    expect(() => q.dequeue()).toThrow('No se puede hacer dequeue() sobre una cola vacia');
  });

  test('el orden se preserva a lo largo de encolar y desencolar mezclados', () => {
    const q = new Queue<number>();
    q.enqueue(1);
    q.enqueue(2);
    expect(q.dequeue()).toBe(1);
    q.enqueue(3);
    expect(q.dequeue()).toBe(2);
    expect(q.dequeue()).toBe(3);
    expect(q.isEmpty()).toBe(true);
  });

  test('hasElement encuentra un valor presente y rechaza uno ausente', () => {
    const q = new Queue<number>();
    q.enqueue(1);
    q.enqueue(2);
    q.enqueue(3);
    expect(q.hasElement(1)).toBe(true); // frente
    expect(q.hasElement(3)).toBe(true); // final
    expect(q.hasElement(99)).toBe(false);
  });

  test('hasElement en cola vacía devuelve false', () => {
    const q = new Queue<number>();
    expect(q.hasElement(1)).toBe(false);
  });

  test('print recorre del frente a la cola', () => {
    const q = new Queue<number>();
    q.enqueue(1);
    q.enqueue(2);
    q.enqueue(3);
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    q.print();
    expect(spy.mock.calls.map((c) => c[0])).toEqual([1, 2, 3]);
    spy.mockRestore();
  });

  test('Node se construye con next en null', () => {
    const n = new Node<number>(5);
    expect(n.data).toBe(5);
    expect(n.next).toBeNull();
  });
});
