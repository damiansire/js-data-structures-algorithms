const { HashSet } = require('./set');

describe('HashSet', () => {
  test('rechaza una capacidad inválida', () => {
    expect(() => new HashSet(0)).toThrow(RangeError);
    expect(() => new HashSet(-2)).toThrow(RangeError);
    expect(() => new HashSet(1.5)).toThrow(RangeError);
  });

  test('un conjunto nuevo está vacío', () => {
    const s = new HashSet();
    expect(s.size()).toBe(0);
    expect(s.has('x')).toBe(false);
    expect(s.values()).toEqual([]);
  });

  test('add guarda valores y has los encuentra', () => {
    const s = new HashSet();
    expect(s.add('a')).toBe(true);
    expect(s.add('b')).toBe(true);
    expect(s.has('a')).toBe(true);
    expect(s.has('b')).toBe(true);
    expect(s.has('c')).toBe(false);
    expect(s.size()).toBe(2);
  });

  test('add de un duplicado no crece y devuelve false', () => {
    const s = new HashSet();
    s.add('a');
    expect(s.add('a')).toBe(false); // ya estaba
    expect(s.size()).toBe(1);
  });

  test('deduplica una secuencia con repetidos', () => {
    const s = new HashSet();
    for (const v of ['a', 'b', 'a', 'c', 'b', 'a']) s.add(v);
    expect(s.size()).toBe(3);
    expect(s.values().sort()).toEqual(['a', 'b', 'c']);
  });

  test('delete quita un valor y respeta colisiones del bucket', () => {
    const s = new HashSet(1); // todo colisiona en el bucket 0
    s.add('a');
    s.add('b');
    expect(s.delete('a')).toBe(true);
    expect(s.has('a')).toBe(false);
    expect(s.has('b')).toBe(true);
    expect(s.size()).toBe(1);
    expect(s.delete('a')).toBe(false); // ya no está
  });

  test('las colisiones no rompen la unicidad', () => {
    const s = new HashSet(1); // todas las claves colisionan
    s.add('x');
    s.add('y');
    expect(s.add('x')).toBe(false);
    expect(s.buckets[0]).toHaveLength(2);
    expect(s.size()).toBe(2);
  });
});
