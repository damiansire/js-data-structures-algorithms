// Test de equivalencia (linkage): la PriorityQueue que anima el visualizador
// debe comportarse EXACTAMENTE como el módulo canónico
// Estructuras-de-datos/priority-queue/priority-queue.ts, operación por
// operación, INCLUIDO el layout del heap: la escena dibuja el árbol y el
// arreglo aplanado, así que no alcanza con que salga el mismo mínimo; cada
// sift-up/sift-down tiene que dejar el MISMO arreglo.
//
// Existe porque la copia de la escena guardaba prioridades peladas en vez de
// entradas {value, priority} y lanzaba otro Error. Si el canónico cambia (por
// ejemplo, el criterio de desempate), esto falla antes del merge.

import { PriorityQueue as VizPQ } from './priority-queue.trace.mjs';

// El canónico es TypeScript: jest lo transforma con ts-jest y lo entrega como
// módulo importable desde este .mjs (mismo puente que usa stack.trace.test.mjs).
const { PriorityQueue: CanonicalPQ } =
  await import('../../../Estructuras-de-datos/priority-queue/priority-queue.ts');

/**
 * Estado observable: API pública + el heap aplanado. En el canónico `heap` es
 * `private` de TypeScript (compile-time): en runtime la propiedad existe y es
 * exactamente el layout que la escena dibuja, por eso se compara acá.
 */
function observable(pq) {
  return {
    size: pq.size(),
    isEmpty: pq.isEmpty(),
    peek: pq.peek(),
    heap: (pq.entries ? pq.entries() : pq.heap).map((e) => ({
      value: e.value,
      priority: e.priority,
    })),
  };
}

/** Corre la misma secuencia sobre ambas colas y loguea retorno + estado por paso. */
function run(ops) {
  const viz = new VizPQ();
  const canon = new CanonicalPQ();
  const log = [];
  for (const op of ops) {
    const applied = (q) => {
      if (op.kind === 'enqueue') return q.enqueue(op.value, op.priority);
      if (op.kind === 'dequeue') return q.dequeue();
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

// La misma secuencia determinista que la escena genera con su PRNG al montar
// (seed 41, seed = (seed * 73 + 41) % 100: 34, 23, 20, 1, 14).
const SCENE_PRIORITIES = [34, 23, 20, 1, 14];

const SEQUENCES = {
  'la de la escena (5 enqueue del PRNG)': SCENE_PRIORITIES.map((p) => ({
    kind: 'enqueue',
    value: p,
    priority: p,
  })),
  'sift-down profundo: vaciar un heap de 7': [
    ...[50, 30, 70, 20, 40, 60, 10].map((p) => ({ kind: 'enqueue', value: `v${p}`, priority: p })),
    ...Array.from({ length: 7 }, () => ({ kind: 'dequeue' })),
  ],
  'prioridades repetidas': [
    { kind: 'enqueue', value: 'a', priority: 5 },
    { kind: 'enqueue', value: 'b', priority: 5 },
    { kind: 'enqueue', value: 'c', priority: 1 },
    { kind: 'dequeue' },
    { kind: 'dequeue' },
  ],
  'intercalar enqueue y dequeue': [
    { kind: 'enqueue', value: 'x', priority: 9 },
    { kind: 'enqueue', value: 'y', priority: 3 },
    { kind: 'dequeue' },
    { kind: 'enqueue', value: 'z', priority: 1 },
    { kind: 'dequeue' },
    { kind: 'dequeue' },
  ],
};

describe('priority-queue: heap del visualizador == módulo canónico', () => {
  for (const [name, ops] of Object.entries(SEQUENCES)) {
    test(`misma secuencia, mismos retornos y mismo heap — ${name}`, () => {
      const { log } = run(ops);
      for (const entry of log) {
        expect(entry.viz.ret).toEqual(entry.canon.ret);
        expect(entry.viz.state).toEqual(entry.canon.state);
      }
    });
  }

  test('dequeue() sobre cola vacía lanza el MISMO Error en ambas', () => {
    let vizError = null;
    let canonError = null;
    try {
      new VizPQ().dequeue();
    } catch (e) {
      vizError = e;
    }
    try {
      new CanonicalPQ().dequeue();
    } catch (e) {
      canonError = e;
    }
    expect(vizError).toBeInstanceOf(Error);
    expect(canonError).toBeInstanceOf(Error);
    expect(vizError.message).toBe(canonError.message);
  });

  test('el min-heap ordena: dequeue sucesivos salen por prioridad ascendente', () => {
    const viz = new VizPQ();
    const canon = new CanonicalPQ();
    for (const p of [8, 3, 5, 1, 9, 2]) {
      viz.enqueue(p, p);
      canon.enqueue(p, p);
    }
    const vizOut = [];
    const canonOut = [];
    while (!viz.isEmpty()) {
      vizOut.push(viz.dequeue());
      canonOut.push(canon.dequeue());
    }
    expect(vizOut).toEqual([1, 2, 3, 5, 8, 9]);
    expect(vizOut).toEqual(canonOut);
  });

  test('la superficie pública de la copia cubre la del canónico', () => {
    const vizApi = Object.getOwnPropertyNames(VizPQ.prototype).sort();
    const canonApi = Object.getOwnPropertyNames(CanonicalPQ.prototype).sort();
    const missing = canonApi.filter((m) => !vizApi.includes(m));
    expect(missing).toEqual([]);
  });
});
