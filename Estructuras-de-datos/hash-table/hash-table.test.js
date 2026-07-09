const { HashTable } = require('./hash-table');

describe('HashTable', () => {
  test('rechaza una capacidad inválida', () => {
    expect(() => new HashTable(0)).toThrow(RangeError);
    expect(() => new HashTable(-1)).toThrow(RangeError);
    expect(() => new HashTable(3.5)).toThrow(RangeError);
  });

  test('una tabla nueva está vacía', () => {
    const h = new HashTable();
    expect(h.size()).toBe(0);
    expect(h.get('x')).toBeUndefined();
    expect(h.has('x')).toBe(false);
  });

  test('set/get almacena y recupera valores', () => {
    const h = new HashTable();
    expect(h.set('a', 1)).toBe(true);
    h.set('b', 2);
    expect(h.get('a')).toBe(1);
    expect(h.get('b')).toBe(2);
    expect(h.has('a')).toBe(true);
    expect(h.size()).toBe(2);
  });

  test('set sobre una clave existente actualiza sin crecer', () => {
    const h = new HashTable();
    h.set('a', 1);
    expect(h.set('a', 99)).toBe(false); // actualización, no inserción
    expect(h.get('a')).toBe(99);
    expect(h.size()).toBe(1);
  });

  test('hash es determinista y cae dentro del rango', () => {
    const h = new HashTable(8);
    expect(h.hash('hola')).toBe(h.hash('hola'));
    for (const k of ['a', 'b', 'clave-larga', 42, 'zzz']) {
      const i = h.hash(k);
      expect(Number.isInteger(i)).toBe(true);
      expect(i).toBeGreaterThanOrEqual(0);
      expect(i).toBeLessThan(8);
    }
  });

  test('las colisiones se encadenan y ambas claves se recuperan', () => {
    // Con capacidad 1, TODAS las claves colisionan en el bucket 0.
    const h = new HashTable(1);
    h.set('a', 1);
    h.set('b', 2);
    h.set('c', 3);
    expect(h.buckets[0]).toHaveLength(3); // encadenadas
    expect(h.size()).toBe(3);
    expect(h.get('a')).toBe(1);
    expect(h.get('b')).toBe(2);
    expect(h.get('c')).toBe(3);
  });

  test('delete quita una clave y respeta las colisiones del bucket', () => {
    const h = new HashTable(1); // todo colisiona en el bucket 0
    h.set('a', 1);
    h.set('b', 2);
    expect(h.delete('a')).toBe(true);
    expect(h.has('a')).toBe(false);
    expect(h.get('b')).toBe(2); // el vecino de bucket sigue intacto
    expect(h.size()).toBe(1);
    expect(h.delete('a')).toBe(false); // ya no está
  });
});
