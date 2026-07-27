// Test de equivalencia (linkage): la Stack que anima el visualizador debe
// comportarse EXACTAMENTE como el módulo canónico
// Estructuras-de-datos/stack/stack.ts, operación por operación.
//
// Existe porque el drift ya ocurrió: el canónico cambió peek() (devuelve el
// dato, no el Node), sumó peekNode() y pop() pasó a devolver el dato, y la
// copia de la escena se quedó con la API vieja. Nada en CI lo detectó y la app
// enseñaba una API de Stack que el repo ya no tiene. Este test es el gate que
// faltaba: si el canónico vuelve a cambiar, esto falla antes del merge.

import { Stack as VizStack } from './stack.trace.mjs';

// El canónico es TypeScript: jest lo transforma con ts-jest y lo entrega como
// módulo importable desde este .mjs (mismo puente que usan las otras trazas
// para los módulos CommonJS, sin necesidad de createRequire acá).
const { Stack: CanonicalStack } = await import('../../../Estructuras-de-datos/stack/stack.ts');

/** Estado observable de una pila, sin depender de su representación interna. */
function observable(stack) {
  return {
    length: stack.length(),
    peek: stack.peek(),
    isEmpty: stack.isEmpty(),
    hasElement5: stack.hasElement(5),
  };
}

/**
 * Corre la misma secuencia de operaciones sobre ambas pilas y devuelve, para
 * cada paso, el estado observable y lo que devolvió la operación.
 */
function run(ops) {
  const viz = new VizStack();
  const canon = new CanonicalStack();
  const log = [];
  for (const op of ops) {
    const applied = (s) => {
      if (op.kind === 'push') return s.push(op.value);
      if (op.kind === 'pop') return s.pop();
      if (op.kind === 'peek') return s.peek();
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
  'la de la escena (3 push iniciales)': [
    { kind: 'push', value: 1 },
    { kind: 'push', value: 2 },
    { kind: 'push', value: 3 },
    { kind: 'peek' },
    { kind: 'pop' },
    { kind: 'peek' },
  ],
  'llenar y vaciar': [
    { kind: 'push', value: 5 },
    { kind: 'push', value: 7 },
    { kind: 'pop' },
    { kind: 'pop' },
    { kind: 'peek' },
  ],
  'push tras vaciar': [
    { kind: 'push', value: 'a' },
    { kind: 'pop' },
    { kind: 'push', value: 'b' },
    { kind: 'push', value: 'c' },
    { kind: 'pop' },
    { kind: 'peek' },
  ],
  'un solo elemento': [{ kind: 'push', value: 42 }, { kind: 'peek' }],
};

describe('stack: pila del visualizador == módulo canónico', () => {
  for (const [name, ops] of Object.entries(SEQUENCES)) {
    test(`misma secuencia, mismos retornos y mismo estado — ${name}`, () => {
      const { log } = run(ops);
      for (const entry of log) {
        expect(entry.viz.ret).toEqual(entry.canon.ret);
        expect(entry.viz.state).toEqual(entry.canon.state);
      }
    });
  }

  test('peek() devuelve el DATO del tope, no el Node (regresión del drift)', () => {
    const viz = new VizStack();
    const canon = new CanonicalStack();
    viz.push(9);
    canon.push(9);
    expect(viz.peek()).toBe(9);
    expect(viz.peek()).toBe(canon.peek());
    // Y el nodo sigue disponible por su método propio, que es lo que la
    // animación necesita para mapear nodo -> plato en pantalla.
    expect(viz.peekNode().data).toBe(canon.peekNode().data);
  });

  test('pop() devuelve el dato desapilado (regresión del drift)', () => {
    const viz = new VizStack();
    const canon = new CanonicalStack();
    for (const v of ['a', 'b']) {
      viz.push(v);
      canon.push(v);
    }
    expect(viz.pop()).toBe(canon.pop()); // 'b'
    expect(canon.pop()).toBe('a');
    expect(viz.pop()).toBe('a');
  });

  test('peek() sobre pila vacía devuelve null en ambas', () => {
    expect(new VizStack().peek()).toBeNull();
    expect(new CanonicalStack().peek()).toBeNull();
  });

  test('pop() sobre pila vacía lanza en ambas', () => {
    expect(() => new VizStack().pop()).toThrow();
    expect(() => new CanonicalStack().pop()).toThrow();
  });

  test('la superficie pública de la copia cubre la del canónico', () => {
    const vizApi = Object.getOwnPropertyNames(VizStack.prototype).sort();
    const canonApi = Object.getOwnPropertyNames(CanonicalStack.prototype).sort();
    // print() es solo salida por consola: no aporta a la animación.
    const missing = canonApi.filter((m) => m !== 'print' && !vizApi.includes(m));
    expect(missing).toEqual([]);
  });
});
