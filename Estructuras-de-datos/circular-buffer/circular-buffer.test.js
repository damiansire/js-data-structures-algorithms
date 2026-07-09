const { CircularBuffer } = require('./circular-buffer');

describe('CircularBuffer', () => {
  test('rechaza una capacidad inválida', () => {
    expect(() => new CircularBuffer(0)).toThrow(RangeError);
    expect(() => new CircularBuffer(-3)).toThrow(RangeError);
    expect(() => new CircularBuffer(2.5)).toThrow(RangeError);
  });

  test('un buffer nuevo está vacío', () => {
    const b = new CircularBuffer(3);
    expect(b.isEmpty()).toBe(true);
    expect(b.isFull()).toBe(false);
    expect(b.size()).toBe(0);
    expect(b.peek()).toBeNull();
    expect(b.toArray()).toEqual([]);
  });

  test('write llena hasta la capacidad en orden FIFO', () => {
    const b = new CircularBuffer(3);
    expect(b.write(1)).toBeUndefined();
    b.write(2);
    b.write(3);
    expect(b.isFull()).toBe(true);
    expect(b.size()).toBe(3);
    expect(b.toArray()).toEqual([1, 2, 3]);
    expect(b.peek()).toBe(1);
  });

  test('write sobre lleno sobrescribe el más viejo y lo devuelve', () => {
    const b = new CircularBuffer(3);
    b.write(1);
    b.write(2);
    b.write(3);
    expect(b.write(4)).toBe(1); // pisó al 1
    expect(b.size()).toBe(3);
    expect(b.toArray()).toEqual([2, 3, 4]);
    expect(b.write(5)).toBe(2);
    expect(b.toArray()).toEqual([3, 4, 5]);
  });

  test('read devuelve el más viejo y respeta FIFO', () => {
    const b = new CircularBuffer(3);
    b.write('a');
    b.write('b');
    expect(b.read()).toBe('a');
    expect(b.read()).toBe('b');
    expect(b.isEmpty()).toBe(true);
  });

  test('read sobre vacío lanza Error', () => {
    const b = new CircularBuffer(2);
    expect(() => b.read()).toThrow('No se puede leer de un buffer circular vacio');
  });

  test('los índices dan la vuelta (wrap-around) sin perder el orden', () => {
    const b = new CircularBuffer(3);
    b.write(1);
    b.write(2);
    b.write(3);
    expect(b.read()).toBe(1); // tail avanza
    b.write(4); // head da la vuelta y ocupa el slot liberado
    expect(b.toArray()).toEqual([2, 3, 4]);
    expect(b.read()).toBe(2);
    expect(b.read()).toBe(3);
    expect(b.read()).toBe(4);
    expect(b.isEmpty()).toBe(true);
  });

  test('escribir, sobrescribir y leer mezclados mantienen la coherencia', () => {
    const b = new CircularBuffer(2);
    b.write(1);
    b.write(2);
    b.write(3); // pisa 1 -> [2,3]
    expect(b.read()).toBe(2);
    b.write(4); // -> [3,4]
    expect(b.toArray()).toEqual([3, 4]);
    expect(b.size()).toBe(2);
  });
});
