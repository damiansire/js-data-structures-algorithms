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

// El JSDoc de la clase declara "O(1) promedio" ACOTADO al factor de carga, y
// declara explicitamente que no hay resize/rehash automatico. Un claim de
// complejidad sin su prueba es humo, asi que estos tests fijan el limite
// declarado: si alguien agrega rehash amortizado, estos tests fallan y obligan
// a actualizar la nota de diseno y el JSDoc en el mismo cambio.
describe('HashSet: limite declarado (capacidad fija, sin rehash)', () => {
  test('la capacidad no cambia al crecer el conjunto', () => {
    const s = new HashSet(4);
    for (let i = 0; i < 200; i++) s.add('k' + i);
    expect(s.capacity).toBe(4);
    expect(s.buckets).toHaveLength(4);
    expect(s.size()).toBe(200);
  });

  test('sin resize, la longitud de bucket crece lineal con n (la degradacion es real)', () => {
    const s = new HashSet(4);
    const n = 400;
    for (let i = 0; i < n; i++) s.add('k' + i);
    const masLargo = Math.max(...s.buckets.map((b) => b.length));
    // con 4 buckets y 400 valores, el bucket mas cargado no puede ser O(1)
    expect(masLargo).toBeGreaterThanOrEqual(n / s.capacity);
  });

  test('dimensionar el conjunto es lo que mantiene el bucket corto', () => {
    const n = 400;
    const s = new HashSet(n);
    for (let i = 0; i < n; i++) s.add('k' + i);
    const masLargo = Math.max(...s.buckets.map((b) => b.length));
    expect(masLargo).toBeLessThan(10);
  });

  test('la correctitud no depende del dimensionado: solo la velocidad', () => {
    const chico = new HashSet(1);
    const grande = new HashSet(256);
    for (let i = 0; i < 100; i++) {
      chico.add(i);
      grande.add(i);
    }
    expect(chico.size()).toBe(grande.size());
    for (let i = 0; i < 100; i++) expect(chico.has(i)).toBe(grande.has(i));
    expect(chico.has(1000)).toBe(false);
  });
});
