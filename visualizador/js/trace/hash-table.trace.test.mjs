// Test de equivalencia (linkage): la HashTable que anima el visualizador debe
// comportarse EXACTAMENTE como el módulo canónico
// Estructuras-de-datos/hash-table/hash-table.js, operación por operación,
// INCLUIDA la distribución de buckets: la animación dibuja en qué bucket cae
// cada clave, así que un cambio en la función hash canónica que la copia no
// siga es una animación mintiendo.
//
// Existe porque la copia de la escena no validaba capacity y le faltaban
// has()/delete()/size(). Si el canónico cambia, esto falla antes del merge.

import { createRequire } from 'module';
import { HashTable as VizTable } from './hash-table.trace.mjs';

const require = createRequire(import.meta.url);
const {
  HashTable: CanonicalTable,
} = require('../../../Estructuras-de-datos/hash-table/hash-table.js');

/**
 * Estado observable de la tabla: tamaño y el LAYOUT exacto de los buckets
 * (que es lo que la escena dibuja), como arrays de pares [key, value].
 */
function observable(table) {
  return {
    size: table.size(),
    buckets: table.buckets.map((bucket) => bucket.map((e) => [e.key, e.value])),
  };
}

/** Corre la misma secuencia sobre ambas tablas y loguea retorno + estado por paso. */
function run(ops, capacity = 8) {
  const viz = new VizTable(capacity);
  const canon = new CanonicalTable(capacity);
  const log = [];
  for (const op of ops) {
    const applied = (t) => {
      if (op.kind === 'set') return t.set(op.key, op.value);
      if (op.kind === 'get') return t.get(op.key);
      if (op.kind === 'has') return t.has(op.key);
      if (op.kind === 'delete') return t.delete(op.key);
      throw new Error(`operación desconocida: ${op.kind}`);
    };
    log.push({
      op,
      viz: { ret: applied(viz), state: observable(viz) },
      canon: { ret: applied(canon), state: observable(canon) },
    });
  }
  return { log, viz, canon };
}

// El pool de palabras real de la escena, más claves que colisionan.
const WORDS = ['apple', 'banana', 'cherry', 'date', 'fig', 'grape', 'kiwi', 'lemon', 'mango'];

const SEQUENCES = {
  'insertar el pool de la escena': WORDS.map((w, i) => ({ kind: 'set', key: w, value: i })),
  'actualizar una clave existente (set devuelve false)': [
    { kind: 'set', key: 'apple', value: 1 },
    { kind: 'set', key: 'apple', value: 2 },
    { kind: 'get', key: 'apple' },
  ],
  'borrar y volver a insertar': [
    { kind: 'set', key: 'fig', value: 10 },
    { kind: 'set', key: 'kiwi', value: 20 },
    { kind: 'delete', key: 'fig' },
    { kind: 'has', key: 'fig' },
    { kind: 'delete', key: 'fig' },
    { kind: 'set', key: 'fig', value: 30 },
    { kind: 'get', key: 'fig' },
  ],
  'get/has de clave inexistente': [
    { kind: 'get', key: 'nope' },
    { kind: 'has', key: 'nope' },
    { kind: 'delete', key: 'nope' },
  ],
};

describe('hash-table: tabla del visualizador == módulo canónico', () => {
  for (const [name, ops] of Object.entries(SEQUENCES)) {
    test(`misma secuencia, mismos retornos y mismos buckets — ${name}`, () => {
      const { log } = run(ops);
      for (const entry of log) {
        expect(entry.viz.ret).toEqual(entry.canon.ret);
        expect(entry.viz.state).toEqual(entry.canon.state);
      }
    });
  }

  test('hash(): mismo índice de bucket para cada clave, en varias capacidades', () => {
    for (const capacity of [2, 3, 8, 13]) {
      const viz = new VizTable(capacity);
      const canon = new CanonicalTable(capacity);
      for (const key of [...WORDS, '', 'a', '0', 42, 'colisión-ñ']) {
        expect(viz.hash(key)).toBe(canon.hash(key));
      }
    }
  });

  test('con capacity chica las colisiones se encadenan igual', () => {
    const { log } = run(
      WORDS.map((w, i) => ({ kind: 'set', key: w, value: i })),
      2,
    );
    const final = log[log.length - 1];
    expect(final.viz.state).toEqual(final.canon.state);
  });

  test('capacity inválida lanza RangeError en ambas', () => {
    for (const bad of [0, -1, 1.5, NaN]) {
      expect(() => new VizTable(bad)).toThrow(RangeError);
      expect(() => new CanonicalTable(bad)).toThrow(RangeError);
    }
  });

  test('la superficie pública de la copia cubre la del canónico', () => {
    const vizApi = Object.getOwnPropertyNames(VizTable.prototype).sort();
    const canonApi = Object.getOwnPropertyNames(CanonicalTable.prototype).sort();
    const missing = canonApi.filter((m) => !vizApi.includes(m));
    expect(missing).toEqual([]);
  });
});
