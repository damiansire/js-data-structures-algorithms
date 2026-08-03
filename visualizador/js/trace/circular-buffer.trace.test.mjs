// Test de equivalencia (linkage): el CircularBuffer que anima el visualizador
// debe comportarse EXACTAMENTE como el módulo canónico
// Estructuras-de-datos/circular-buffer/circular-buffer.js, operación por
// operación.
//
// Existe porque el drift ya ocurrió: la copia de la escena devolvía
// `{at, overwritten}` en write() y `{at, value}` en read() (el canónico
// devuelve el valor pelado), no validaba capacity y le faltaban
// size()/peek()/toArray(). Si el canónico cambia, esto falla antes del merge.

import { createRequire } from 'module';
import { CircularBuffer as VizBuffer } from './circular-buffer.trace.mjs';

const require = createRequire(import.meta.url);
const {
  CircularBuffer: CanonicalBuffer,
} = require('../../../Estructuras-de-datos/circular-buffer/circular-buffer.js');

/** Estado observable de un ring buffer, incluida la posición de sus punteros
 *  (la animación dibuja head/tail, así que también deben coincidir). */
function observable(cb) {
  return {
    size: cb.size(),
    isEmpty: cb.isEmpty(),
    isFull: cb.isFull(),
    peek: cb.peek(),
    toArray: cb.toArray(),
    head: cb.head,
    tail: cb.tail,
  };
}

/** Corre la misma secuencia sobre ambos buffers y loguea retorno + estado por paso. */
function run(capacity, ops) {
  const viz = new VizBuffer(capacity);
  const canon = new CanonicalBuffer(capacity);
  const log = [];
  for (const op of ops) {
    const applied = (b) => {
      if (op.kind === 'write') return b.write(op.value);
      if (op.kind === 'read') return b.read();
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

const writes = (...values) => values.map((value) => ({ kind: 'write', value }));

const SEQUENCES = {
  'llenar sin dar la vuelta': { capacity: 4, ops: writes(1, 2, 3) },
  'dar la vuelta (sobrescribe el más viejo)': {
    capacity: 3,
    ops: writes(1, 2, 3, 4, 5),
  },
  'intercalar write y read': {
    capacity: 3,
    ops: [
      { kind: 'write', value: 'a' },
      { kind: 'write', value: 'b' },
      { kind: 'read' },
      { kind: 'write', value: 'c' },
      { kind: 'write', value: 'd' },
      { kind: 'read' },
      { kind: 'read' },
    ],
  },
  'vaciar por completo y volver a escribir': {
    capacity: 2,
    ops: [
      { kind: 'write', value: 1 },
      { kind: 'write', value: 2 },
      { kind: 'read' },
      { kind: 'read' },
      { kind: 'write', value: 3 },
    ],
  },
};

describe('circular-buffer: ring buffer del visualizador == módulo canónico', () => {
  for (const [name, { capacity, ops }] of Object.entries(SEQUENCES)) {
    test(`misma secuencia, mismos retornos y mismo estado — ${name}`, () => {
      const { log } = run(capacity, ops);
      for (const entry of log) {
        expect(entry.viz.ret).toEqual(entry.canon.ret);
        expect(entry.viz.state).toEqual(entry.canon.state);
      }
    });
  }

  test('write() devuelve el valor pisado (no un objeto posicional) — regresión del drift', () => {
    const viz = new VizBuffer(2);
    const canon = new CanonicalBuffer(2);
    for (const b of [viz, canon]) {
      expect(b.write(1)).toBeUndefined();
      expect(b.write(2)).toBeUndefined();
      expect(b.write(3)).toBe(1); // lleno: pisa el más viejo y lo devuelve
    }
  });

  test('read() devuelve el valor pelado (no un objeto posicional) — regresión del drift', () => {
    const viz = new VizBuffer(2);
    const canon = new CanonicalBuffer(2);
    for (const b of [viz, canon]) {
      b.write('x');
      expect(b.read()).toBe('x');
    }
  });

  test('read() sobre buffer vacío lanza en ambos', () => {
    expect(() => new VizBuffer(3).read()).toThrow();
    expect(() => new CanonicalBuffer(3).read()).toThrow();
  });

  test('capacity inválida lanza RangeError en ambos (regresión del drift)', () => {
    for (const bad of [0, -1, 1.5, NaN]) {
      expect(() => new VizBuffer(bad)).toThrow(RangeError);
      expect(() => new CanonicalBuffer(bad)).toThrow(RangeError);
    }
  });

  test('la superficie pública de la copia cubre la del canónico', () => {
    const vizApi = Object.getOwnPropertyNames(VizBuffer.prototype).sort();
    const canonApi = Object.getOwnPropertyNames(CanonicalBuffer.prototype).sort();
    const missing = canonApi.filter((m) => !vizApi.includes(m));
    expect(missing).toEqual([]);
  });
});
