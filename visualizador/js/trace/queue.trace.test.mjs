// Test de equivalencia (linkage): la Queue que anima el visualizador debe
// comportarse EXACTAMENTE como el módulo canónico
// Estructuras-de-datos/queue/queue.ts, operación por operación.
//
// Existe porque el drift ya ocurrió: la copia de la escena devolvía el Node en
// enqueue() y dequeue() (el canónico devuelve void y el DATO respectivamente) y
// nada en CI lo detectaba. Si el canónico cambia, esto falla antes del merge.

import { Queue as VizQueue } from './queue.trace.mjs';

// El canónico es TypeScript: jest lo transforma con ts-jest y lo entrega como
// módulo importable desde este .mjs (mismo puente que usa stack.trace.test.mjs).
const { Queue: CanonicalQueue } = await import('../../../Estructuras-de-datos/queue/queue.ts');

/** Estado observable de una cola, sin depender de su representación interna. */
function observable(queue) {
  return {
    length: queue.length(),
    peek: queue.peek(),
    isEmpty: queue.isEmpty(),
    hasElement2: queue.hasElement(2),
  };
}

/** Corre la misma secuencia sobre ambas colas y loguea retorno + estado por paso. */
function run(ops) {
  const viz = new VizQueue();
  const canon = new CanonicalQueue();
  const log = [];
  for (const op of ops) {
    const applied = (q) => {
      if (op.kind === 'enqueue') return q.enqueue(op.value);
      if (op.kind === 'dequeue') return q.dequeue();
      if (op.kind === 'peek') return q.peek();
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
  'la de la escena (3 enqueue iniciales)': [
    { kind: 'enqueue', value: 1 },
    { kind: 'enqueue', value: 2 },
    { kind: 'enqueue', value: 3 },
    { kind: 'peek' },
    { kind: 'dequeue' },
    { kind: 'peek' },
  ],
  'llenar y vaciar': [
    { kind: 'enqueue', value: 5 },
    { kind: 'enqueue', value: 7 },
    { kind: 'dequeue' },
    { kind: 'dequeue' },
    { kind: 'peek' },
  ],
  'enqueue tras vaciar': [
    { kind: 'enqueue', value: 'a' },
    { kind: 'dequeue' },
    { kind: 'enqueue', value: 'b' },
    { kind: 'enqueue', value: 'c' },
    { kind: 'dequeue' },
    { kind: 'peek' },
  ],
  'un solo elemento': [{ kind: 'enqueue', value: 42 }, { kind: 'peek' }],
};

describe('queue: cola del visualizador == módulo canónico', () => {
  for (const [name, ops] of Object.entries(SEQUENCES)) {
    test(`misma secuencia, mismos retornos y mismo estado — ${name}`, () => {
      const { log } = run(ops);
      for (const entry of log) {
        expect(entry.viz.ret).toEqual(entry.canon.ret);
        expect(entry.viz.state).toEqual(entry.canon.state);
      }
    });
  }

  test('dequeue() devuelve el DATO desencolado, no el Node (regresión del drift)', () => {
    const viz = new VizQueue();
    const canon = new CanonicalQueue();
    for (const v of ['a', 'b']) {
      viz.enqueue(v);
      canon.enqueue(v);
    }
    expect(viz.dequeue()).toBe('a');
    expect(canon.dequeue()).toBe('a');
    expect(viz.dequeue()).toBe(canon.dequeue());
  });

  test('enqueue() devuelve void en ambas (regresión del drift)', () => {
    expect(new VizQueue().enqueue(1)).toBeUndefined();
    expect(new CanonicalQueue().enqueue(1)).toBeUndefined();
  });

  test('FIFO de punta a punta: se desencola en el orden de llegada', () => {
    const viz = new VizQueue();
    const canon = new CanonicalQueue();
    for (const v of [3, 1, 4, 1, 5]) {
      viz.enqueue(v);
      canon.enqueue(v);
    }
    while (!canon.isEmpty()) {
      expect(viz.dequeue()).toBe(canon.dequeue());
    }
    expect(viz.isEmpty()).toBe(true);
  });

  test('peek() sobre cola vacía devuelve null en ambas', () => {
    expect(new VizQueue().peek()).toBeNull();
    expect(new CanonicalQueue().peek()).toBeNull();
  });

  test('dequeue() sobre cola vacía lanza en ambas', () => {
    expect(() => new VizQueue().dequeue()).toThrow();
    expect(() => new CanonicalQueue().dequeue()).toThrow();
  });

  test('la superficie pública de la copia cubre la del canónico', () => {
    const vizApi = Object.getOwnPropertyNames(VizQueue.prototype).sort();
    const canonApi = Object.getOwnPropertyNames(CanonicalQueue.prototype).sort();
    // print() es solo salida por consola: no aporta a la animación.
    const missing = canonApi.filter((m) => m !== 'print' && !vizApi.includes(m));
    expect(missing).toEqual([]);
  });
});
