// Test de equivalencia (linkage): el Graph que anima el visualizador debe
// comportarse EXACTAMENTE como el módulo canónico
// Estructuras-de-datos/graph/graph.js, operación por operación.
//
// Existe porque la copia de la escena vivía sin ningún gate: le faltaba
// hasEdge() y nada la ataba al canónico. Si el canónico cambia (por ejemplo,
// admite lazos o pasa a dirigido), esto falla antes del merge.

import { createRequire } from 'module';
import { Graph as VizGraph } from './graph.trace.mjs';

const require = createRequire(import.meta.url);
const { Graph: CanonicalGraph } = require('../../../Estructuras-de-datos/graph/graph.js');

/** Estado observable de un grafo, sin depender de su representación interna. */
function observable(graph) {
  const nodes = [...graph.nodes()].sort();
  return {
    size: graph.size(),
    edgeCount: graph.edgeCount(),
    nodes,
    neighbors: Object.fromEntries(nodes.map((n) => [n, [...graph.neighbors(n)].sort()])),
  };
}

/** Corre la misma secuencia sobre ambos grafos y loguea retorno + estado por paso. */
function run(ops) {
  const viz = new VizGraph();
  const canon = new CanonicalGraph();
  const log = [];
  for (const op of ops) {
    const applied = (g) => {
      if (op.kind === 'addNode') return g.addNode(op.node);
      if (op.kind === 'addEdge') return g.addEdge(op.a, op.b);
      if (op.kind === 'hasEdge') return g.hasEdge(op.a, op.b);
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
  'la de la escena (anillo + diagonales)': [
    { kind: 'addNode', node: 'A' },
    { kind: 'addNode', node: 'B' },
    { kind: 'addNode', node: 'C' },
    { kind: 'addNode', node: 'D' },
    { kind: 'addEdge', a: 'A', b: 'B' },
    { kind: 'addEdge', a: 'B', b: 'C' },
    { kind: 'addEdge', a: 'C', b: 'D' },
    { kind: 'addEdge', a: 'D', b: 'A' },
    { kind: 'addEdge', a: 'A', b: 'C' },
    { kind: 'hasEdge', a: 'A', b: 'C' },
    { kind: 'hasEdge', a: 'B', b: 'D' },
  ],
  'nodo repetido y eje repetido devuelven false': [
    { kind: 'addNode', node: 'X' },
    { kind: 'addNode', node: 'X' },
    { kind: 'addEdge', a: 'X', b: 'Y' },
    { kind: 'addEdge', a: 'X', b: 'Y' },
    { kind: 'addEdge', a: 'Y', b: 'X' },
  ],
  'addEdge crea los nodos que faltan': [
    { kind: 'addEdge', a: 1, b: 2 },
    { kind: 'addEdge', a: 2, b: 3 },
    { kind: 'hasEdge', a: 3, b: 2 },
    { kind: 'hasEdge', a: 1, b: 3 },
  ],
  'sin lazos (a === b)': [
    { kind: 'addNode', node: 'Z' },
    { kind: 'addEdge', a: 'Z', b: 'Z' },
    { kind: 'hasEdge', a: 'Z', b: 'Z' },
  ],
};

describe('graph: grafo del visualizador == módulo canónico', () => {
  for (const [name, ops] of Object.entries(SEQUENCES)) {
    test(`misma secuencia, mismos retornos y mismo estado — ${name}`, () => {
      const { log } = run(ops);
      for (const entry of log) {
        expect(entry.viz.ret).toEqual(entry.canon.ret);
        expect(entry.viz.state).toEqual(entry.canon.state);
      }
    });
  }

  test('hasEdge() sobre nodo inexistente devuelve false en ambos', () => {
    expect(new VizGraph().hasEdge('no', 'existe')).toBe(false);
    expect(new CanonicalGraph().hasEdge('no', 'existe')).toBe(false);
  });

  test('neighbors() de un nodo inexistente devuelve [] en ambos', () => {
    expect(new VizGraph().neighbors('nada')).toEqual([]);
    expect(new CanonicalGraph().neighbors('nada')).toEqual([]);
  });

  test('la superficie pública de la copia cubre la del canónico', () => {
    const vizApi = Object.getOwnPropertyNames(VizGraph.prototype).sort();
    const canonApi = Object.getOwnPropertyNames(CanonicalGraph.prototype).sort();
    const missing = canonApi.filter((m) => !vizApi.includes(m));
    expect(missing).toEqual([]);
  });
});
