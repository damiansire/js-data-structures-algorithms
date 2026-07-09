/**
 * Grafo no dirigido representado con lista de adyacencia: cada nodo mapea al
 * conjunto de sus vecinos. Es la representación compacta para grafos ralos
 * (pocos ejes por nodo) y la base de BFS, DFS, Dijkstra y compañía. Como es no
 * dirigido, un eje a–b guarda a en los vecinos de b y b en los de a.
 */
class Graph {
  constructor() {
    /** @type {Map<*, Set<*>>} nodo → conjunto de vecinos. */
    this.adj = new Map();
  }

  /**
   * Agrega un nodo aislado si no existía. O(1).
   * @param {*} node
   * @returns {boolean} true si lo agregó; false si ya existía.
   */
  addNode(node) {
    if (this.adj.has(node)) return false;
    this.adj.set(node, new Set());
    return true;
  }

  /**
   * Agrega un eje no dirigido entre `a` y `b` (creando los nodos si faltan). O(1).
   * @param {*} a
   * @param {*} b
   * @returns {boolean} true si el eje es nuevo; false si ya existía (o es un lazo a=b).
   */
  addEdge(a, b) {
    if (a === b) return false; // sin lazos
    this.addNode(a);
    this.addNode(b);
    if (this.adj.get(a).has(b)) return false;
    this.adj.get(a).add(b);
    this.adj.get(b).add(a);
    return true;
  }

  /**
   * Indica si existe un eje entre `a` y `b`. O(1).
   * @param {*} a
   * @param {*} b
   * @returns {boolean}
   */
  hasEdge(a, b) {
    return this.adj.has(a) && this.adj.get(a).has(b);
  }

  /**
   * Vecinos de un nodo. O(grado).
   * @param {*} node
   * @returns {Array<*>} Lista de vecinos (vacía si el nodo no existe).
   */
  neighbors(node) {
    return this.adj.has(node) ? [...this.adj.get(node)] : [];
  }

  /**
   * Todos los nodos. O(n).
   * @returns {Array<*>}
   */
  nodes() {
    return [...this.adj.keys()];
  }

  /**
   * Cantidad de nodos. O(1).
   * @returns {number}
   */
  size() {
    return this.adj.size;
  }

  /**
   * Cantidad de ejes (no dirigidos, sin doble conteo). O(n).
   * @returns {number}
   */
  edgeCount() {
    let e = 0;
    for (const set of this.adj.values()) e += set.size;
    return e / 2;
  }
}

module.exports = { Graph };
