const { Deque, Node } = require('./deque');

describe('Deque', () => {
  test('una deque nueva está vacía', () => {
    const d = new Deque();
    expect(d.isEmpty()).toBe(true);
    expect(d.size()).toBe(0);
    expect(d.peekFront()).toBeNull();
    expect(d.peekBack()).toBeNull();
    expect(d.toArray()).toEqual([]);
  });

  test('pushBack agrega al final y pushFront al frente', () => {
    const d = new Deque();
    d.pushBack(2);
    d.pushBack(3);
    d.pushFront(1);
    expect(d.toArray()).toEqual([1, 2, 3]);
    expect(d.peekFront()).toBe(1);
    expect(d.peekBack()).toBe(3);
    expect(d.size()).toBe(3);
  });

  test('popFront saca del frente y popBack del final', () => {
    const d = new Deque();
    [1, 2, 3, 4].forEach((n) => d.pushBack(n));
    expect(d.popFront()).toBe(1);
    expect(d.popBack()).toBe(4);
    expect(d.toArray()).toEqual([2, 3]);
    expect(d.size()).toBe(2);
  });

  test('se comporta como stack (LIFO) usando un solo extremo', () => {
    const d = new Deque();
    d.pushBack('a');
    d.pushBack('b');
    expect(d.popBack()).toBe('b');
    expect(d.popBack()).toBe('a');
    expect(d.isEmpty()).toBe(true);
  });

  test('se comporta como cola (FIFO) empujando atrás y sacando adelante', () => {
    const d = new Deque();
    d.pushBack('a');
    d.pushBack('b');
    expect(d.popFront()).toBe('a');
    expect(d.popFront()).toBe('b');
    expect(d.isEmpty()).toBe(true);
  });

  test('vaciar desde ambos extremos deja la deque reutilizable', () => {
    const d = new Deque();
    d.pushFront(1);
    expect(d.popFront()).toBe(1);
    expect(d.isEmpty()).toBe(true);
    d.pushBack(2);
    d.pushFront(1);
    expect(d.toArray()).toEqual([1, 2]);
    expect(d.peekFront()).toBe(1);
    expect(d.peekBack()).toBe(2);
  });

  test('popFront / popBack sobre vacía lanzan Error', () => {
    const d = new Deque();
    expect(() => d.popFront()).toThrow('No se puede popFront() sobre una deque vacia');
    expect(() => d.popBack()).toThrow('No se puede popBack() sobre una deque vacia');
  });

  test('Node se construye con prev y next en null', () => {
    const n = new Node(5);
    expect(n.data).toBe(5);
    expect(n.prev).toBeNull();
    expect(n.next).toBeNull();
  });
});
