// Test de equivalencia (linkage): la Deque que anima el visualizador debe
// comportarse EXACTAMENTE como el módulo canónico
// Estructuras-de-datos/deque/deque.ts, operación por operación.
//
// Existe porque el drift ya ocurrió: la copia de la escena no tenía
// size()/peekFront()/peekBack() y sus popFront()/popBack() no lanzaban sobre
// deque vacía (el canónico sí). Si el canónico cambia, esto falla antes del merge.

import { Deque as VizDeque } from './deque.trace.mjs';

const { Deque: CanonicalDeque } = await import('../../../Estructuras-de-datos/deque/deque.ts');

/** Estado observable de una deque, sin depender de su representación interna. */
function observable(dq) {
  return {
    size: dq.size(),
    isEmpty: dq.isEmpty(),
    peekFront: dq.peekFront(),
    peekBack: dq.peekBack(),
    toArray: dq.toArray(),
  };
}

/** Corre la misma secuencia sobre ambas deques y loguea retorno + estado por paso. */
function run(ops) {
  const viz = new VizDeque();
  const canon = new CanonicalDeque();
  const log = [];
  for (const op of ops) {
    const applied = (d) => {
      if (op.kind === 'pushFront') return d.pushFront(op.value);
      if (op.kind === 'pushBack') return d.pushBack(op.value);
      if (op.kind === 'popFront') return d.popFront();
      if (op.kind === 'popBack') return d.popBack();
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

const SEQUENCES = {
  'la de la escena (2 pushBack + 1 pushFront)': [
    { kind: 'pushBack', value: 1 },
    { kind: 'pushBack', value: 2 },
    { kind: 'pushFront', value: 3 },
  ],
  'ambos extremos alternados': [
    { kind: 'pushFront', value: 1 },
    { kind: 'pushBack', value: 2 },
    { kind: 'pushFront', value: 3 },
    { kind: 'popBack' },
    { kind: 'popFront' },
    { kind: 'popFront' },
  ],
  'como stack (solo un extremo)': [
    { kind: 'pushBack', value: 'a' },
    { kind: 'pushBack', value: 'b' },
    { kind: 'popBack' },
    { kind: 'popBack' },
  ],
  'push tras vaciar': [
    { kind: 'pushFront', value: 9 },
    { kind: 'popBack' },
    { kind: 'pushBack', value: 8 },
    { kind: 'popFront' },
  ],
};

describe('deque: deque del visualizador == módulo canónico', () => {
  for (const [name, ops] of Object.entries(SEQUENCES)) {
    test(`misma secuencia, mismos retornos y mismo estado — ${name}`, () => {
      const { log } = run(ops);
      for (const entry of log) {
        expect(entry.viz.ret).toEqual(entry.canon.ret);
        expect(entry.viz.state).toEqual(entry.canon.state);
      }
    });
  }

  test('popFront() sobre deque vacía lanza en ambas (regresión del drift)', () => {
    expect(() => new VizDeque().popFront()).toThrow();
    expect(() => new CanonicalDeque().popFront()).toThrow();
  });

  test('popBack() sobre deque vacía lanza en ambas (regresión del drift)', () => {
    expect(() => new VizDeque().popBack()).toThrow();
    expect(() => new CanonicalDeque().popBack()).toThrow();
  });

  test('peekFront()/peekBack() sobre deque vacía devuelven null en ambas', () => {
    for (const D of [VizDeque, CanonicalDeque]) {
      const d = new D();
      expect(d.peekFront()).toBeNull();
      expect(d.peekBack()).toBeNull();
    }
  });

  test('la superficie pública de la copia cubre la del canónico', () => {
    const vizApi = Object.getOwnPropertyNames(VizDeque.prototype).sort();
    const canonApi = Object.getOwnPropertyNames(CanonicalDeque.prototype).sort();
    const missing = canonApi.filter((m) => !vizApi.includes(m));
    expect(missing).toEqual([]);
  });
});
