// Test de equivalencia (linkage): la List que anima el visualizador debe
// comportarse EXACTAMENTE como el módulo canónico
// Estructuras-de-datos/list/list.ts, operación por operación.
//
// Existe porque la copia de la escena devolvía el Node en push() (el canónico
// devuelve void) y le faltaban find()/getElementByIndex()/getLastElement()/
// deleteByNode(). Si el canónico cambia, esto falla antes del merge.
//
// prepend() y toArray() son extensiones solo-vista: no se comparan contra el
// canónico (no existen ahí); prepend se fija con su propio test de invariantes.

import { List as VizList } from './list.trace.mjs';

// El canónico es TypeScript: jest lo transforma con ts-jest y lo entrega como
// módulo importable desde este .mjs (mismo puente que usa stack.trace.test.mjs).
const { List: CanonicalList } = await import('../../../Estructuras-de-datos/list/list.ts');

/** Los DATOS de la lista en orden, recorriendo head→next (sin depender de toArray). */
function toDataArray(list) {
  const out = [];
  let aux = list.head;
  while (aux != null) {
    out.push(aux.data);
    aux = aux.next;
  }
  return out;
}

/** Estado observable de la lista, comparando datos (los Node son clases distintas). */
function observable(list) {
  return {
    length: list.length,
    items: toDataArray(list),
    headData: list.head ? list.head.data : null,
    lastData: list.last ? list.last.data : null,
    lastElementData: (() => {
      const node = list.getLastElement();
      return node ? node.data : null;
    })(),
  };
}

/** Normaliza el retorno de una operación que puede devolver un Node. */
function asData(ret) {
  return ret && typeof ret === 'object' && 'data' in ret ? { nodeData: ret.data } : ret;
}

/** Corre la misma secuencia sobre ambas listas y loguea retorno + estado por paso. */
function run(ops) {
  const viz = new VizList();
  const canon = new CanonicalList();
  const log = [];
  for (const op of ops) {
    const applied = (l) => {
      if (op.kind === 'push') return l.push(op.value);
      if (op.kind === 'delete') return l.delete(op.value);
      if (op.kind === 'find') return l.find(op.value);
      if (op.kind === 'getByIndex') return l.getElementByIndex(op.index);
      throw new Error(`operación desconocida: ${op.kind}`);
    };
    log.push({
      op,
      viz: { ret: asData(applied(viz)), state: observable(viz) },
      canon: { ret: asData(applied(canon)), state: observable(canon) },
    });
  }
  return { log, viz, canon };
}

const SEQUENCES = {
  'la de la escena (4 vagones precargados)': [
    { kind: 'push', value: 3 },
    { kind: 'push', value: 7 },
    { kind: 'push', value: 9 },
    { kind: 'push', value: 5 },
    { kind: 'find', value: 9 },
    { kind: 'getByIndex', index: 2 },
  ],
  'borrar head, cola y del medio': [
    { kind: 'push', value: 1 },
    { kind: 'push', value: 2 },
    { kind: 'push', value: 3 },
    { kind: 'push', value: 4 },
    { kind: 'delete', value: 1 },
    { kind: 'delete', value: 4 },
    { kind: 'delete', value: 3 },
    { kind: 'delete', value: 2 },
    { kind: 'delete', value: 99 },
  ],
  'borrar hasta vaciar y volver a cargar': [
    { kind: 'push', value: 'a' },
    { kind: 'delete', value: 'a' },
    { kind: 'push', value: 'b' },
    { kind: 'push', value: 'c' },
    { kind: 'delete', value: 'c' },
    { kind: 'push', value: 'd' },
  ],
  'lecturas sobre lista vacía': [
    { kind: 'find', value: 1 },
    { kind: 'getByIndex', index: 0 },
    { kind: 'getByIndex', index: -1 },
    { kind: 'delete', value: 1 },
  ],
};

describe('list: lista del visualizador == módulo canónico', () => {
  for (const [name, ops] of Object.entries(SEQUENCES)) {
    test(`misma secuencia, mismos retornos y mismo estado — ${name}`, () => {
      const { log } = run(ops);
      for (const entry of log) {
        expect(entry.viz.ret).toEqual(entry.canon.ret);
        expect(entry.viz.state).toEqual(entry.canon.state);
      }
    });
  }

  test('deleteByNode(): mismo efecto sobre un nodo del medio y null sobre la cola', () => {
    const viz = new VizList();
    const canon = new CanonicalList();
    for (const v of [10, 20, 30]) {
      viz.push(v);
      canon.push(v);
    }
    expect(viz.deleteByNode(viz.getElementByIndex(1))).toBe(
      canon.deleteByNode(canon.getElementByIndex(1)),
    );
    expect(observable(viz)).toEqual(observable(canon));
    // Sobre la cola no hay nodo siguiente del cual copiar: devuelve null.
    expect(viz.deleteByNode(viz.getLastElement())).toBeNull();
    expect(canon.deleteByNode(canon.getLastElement())).toBeNull();
    expect(observable(viz)).toEqual(observable(canon));
  });

  test('prepend() (extensión solo-vista) mantiene los invariantes de la lista', () => {
    const viz = new VizList();
    viz.prepend(2);
    // Primer elemento: head y last son el MISMO nodo (mismo invariante que push).
    expect(viz.head).toBe(viz.last);
    expect(viz.length).toBe(1);
    viz.prepend(1);
    viz.push(3);
    expect(toDataArray(viz)).toEqual([1, 2, 3]);
    expect(viz.length).toBe(3);
    expect(viz.last.data).toBe(3);
    // Tras prepend, delete() del head sigue funcionando como en el canónico.
    expect(viz.delete(1)).toBe(1);
    expect(toDataArray(viz)).toEqual([2, 3]);
  });

  test('toArray() (extensión solo-vista) devuelve los NODOS en orden head→last', () => {
    const viz = new VizList();
    for (const v of ['x', 'y']) viz.push(v);
    const nodes = viz.toArray();
    expect(nodes.map((n) => n.data)).toEqual(['x', 'y']);
    expect(nodes[0]).toBe(viz.head);
    expect(nodes[1]).toBe(viz.last);
  });

  test('la superficie pública de la copia cubre la del canónico', () => {
    const vizApi = Object.getOwnPropertyNames(VizList.prototype).sort();
    const canonApi = Object.getOwnPropertyNames(CanonicalList.prototype).sort();
    // print() es solo salida por consola: no aporta a la animación.
    const missing = canonApi.filter((m) => m !== 'print' && !vizApi.includes(m));
    expect(missing).toEqual([]);
  });
});
