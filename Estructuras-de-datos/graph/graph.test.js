const { Graph } = require('./graph');

describe('Graph (lista de adyacencia, no dirigido)', () => {
  test('un grafo nuevo está vacío', () => {
    const g = new Graph();
    expect(g.size()).toBe(0);
    expect(g.edgeCount()).toBe(0);
    expect(g.nodes()).toEqual([]);
    expect(g.neighbors('a')).toEqual([]);
  });

  test('addNode agrega nodos únicos', () => {
    const g = new Graph();
    expect(g.addNode('a')).toBe(true);
    expect(g.addNode('a')).toBe(false); // ya existía
    g.addNode('b');
    expect(g.size()).toBe(2);
    expect(g.nodes().sort()).toEqual(['a', 'b']);
  });

  test('addEdge es no dirigido: aparece en ambos lados', () => {
    const g = new Graph();
    expect(g.addEdge('a', 'b')).toBe(true);
    expect(g.hasEdge('a', 'b')).toBe(true);
    expect(g.hasEdge('b', 'a')).toBe(true);
    expect(g.neighbors('a')).toEqual(['b']);
    expect(g.neighbors('b')).toEqual(['a']);
    expect(g.edgeCount()).toBe(1);
  });

  test('addEdge crea los nodos que falten', () => {
    const g = new Graph();
    g.addEdge('x', 'y');
    expect(g.size()).toBe(2);
    expect(g.nodes().sort()).toEqual(['x', 'y']);
  });

  test('un eje repetido no se duplica', () => {
    const g = new Graph();
    expect(g.addEdge('a', 'b')).toBe(true);
    expect(g.addEdge('a', 'b')).toBe(false); // ya existía
    expect(g.addEdge('b', 'a')).toBe(false); // mismo eje, otro orden
    expect(g.edgeCount()).toBe(1);
    expect(g.neighbors('a')).toEqual(['b']);
  });

  test('rechaza lazos (a–a)', () => {
    const g = new Graph();
    expect(g.addEdge('a', 'a')).toBe(false);
    expect(g.edgeCount()).toBe(0);
  });

  test('cuenta bien nodos y ejes de un grafo con varios vecinos', () => {
    const g = new Graph();
    g.addEdge('a', 'b');
    g.addEdge('a', 'c');
    g.addEdge('b', 'c');
    g.addNode('d'); // aislado
    expect(g.size()).toBe(4);
    expect(g.edgeCount()).toBe(3);
    expect(g.neighbors('a').sort()).toEqual(['b', 'c']);
    expect(g.neighbors('d')).toEqual([]);
  });
});
