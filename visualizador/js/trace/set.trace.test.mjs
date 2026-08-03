// Test de equivalencia (linkage): el HashSet que anima el visualizador debe
// comportarse EXACTAMENTE como el módulo canónico
// Estructuras-de-datos/set/set.js, operación por operación, INCLUIDA la
// distribución de buckets (la escena dibuja en qué bucket cae cada valor).
//
// Existe porque la copia de la escena no validaba capacity y le faltaban
// has()/size(). Si el canónico cambia (por ejemplo, suma rehash y la forma de
// los buckets deja de ser estable), esto falla antes del merge.

import { createRequire } from 'module';
import { HashSet as VizSet } from './set.trace.mjs';

const require = createRequire(import.meta.url);
const { HashSet: CanonicalSet } = require('../../../Estructuras-de-datos/set/set.js');

/** Estado observable del set: tamaño, valores y el LAYOUT exacto de los buckets. */
function observable(set) {
  return {
    size: set.size(),
    values: [...set.values()].sort(),
    buckets: set.buckets.map((bucket) => [...bucket]),
  };
}

/** Corre la misma secuencia sobre ambos sets y loguea retorno + estado por paso. */
function run(ops, capacity = 8) {
  const viz = new VizSet(capacity);
  const canon = new CanonicalSet(capacity);
  const log = [];
  for (const op of ops) {
    const applied = (s) => {
      if (op.kind === 'add') return s.add(op.value);
      if (op.kind === 'has') return s.has(op.value);
      if (op.kind === 'delete') return s.delete(op.value);
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

// El pool real de la escena.
const POOL = ['apple', 'banana', 'cherry', 'date', 'fig', 'grape', 'kiwi', 'lemon'];

const SEQUENCES = {
  'agregar el pool de la escena': POOL.map((v) => ({ kind: 'add', value: v })),
  'duplicado devuelve false y no cambia nada': [
    { kind: 'add', value: 'apple' },
    { kind: 'add', value: 'apple' },
    { kind: 'has', value: 'apple' },
  ],
  'borrar presente y ausente': [
    { kind: 'add', value: 'fig' },
    { kind: 'add', value: 'kiwi' },
    { kind: 'delete', value: 'fig' },
    { kind: 'has', value: 'fig' },
    { kind: 'delete', value: 'fig' },
    { kind: 'add', value: 'fig' },
  ],
  'vaciar de a uno (la operación de clear de la escena)': [
    ...POOL.map((v) => ({ kind: 'add', value: v })),
    ...POOL.map((v) => ({ kind: 'delete', value: v })),
  ],
};

describe('set: hash set del visualizador == módulo canónico', () => {
  for (const [name, ops] of Object.entries(SEQUENCES)) {
    test(`misma secuencia, mismos retornos y mismos buckets — ${name}`, () => {
      const { log } = run(ops);
      for (const entry of log) {
        expect(entry.viz.ret).toEqual(entry.canon.ret);
        expect(entry.viz.state).toEqual(entry.canon.state);
      }
    });
  }

  test('hash(): mismo índice de bucket para cada valor, en varias capacidades', () => {
    for (const capacity of [2, 3, 8, 13]) {
      const viz = new VizSet(capacity);
      const canon = new CanonicalSet(capacity);
      for (const value of [...POOL, '', 'a', 42, 'ñandú']) {
        expect(viz.hash(value)).toBe(canon.hash(value));
      }
    }
  });

  test('con capacity chica las colisiones se encadenan igual', () => {
    const { log } = run(
      POOL.map((v) => ({ kind: 'add', value: v })),
      2,
    );
    const final = log[log.length - 1];
    expect(final.viz.state).toEqual(final.canon.state);
  });

  test('capacity inválida lanza RangeError en ambas', () => {
    for (const bad of [0, -1, 1.5, NaN]) {
      expect(() => new VizSet(bad)).toThrow(RangeError);
      expect(() => new CanonicalSet(bad)).toThrow(RangeError);
    }
  });

  test('la superficie pública de la copia cubre la del canónico', () => {
    const vizApi = Object.getOwnPropertyNames(VizSet.prototype).sort();
    const canonApi = Object.getOwnPropertyNames(CanonicalSet.prototype).sort();
    const missing = canonApi.filter((m) => !vizApi.includes(m));
    expect(missing).toEqual([]);
  });
});
