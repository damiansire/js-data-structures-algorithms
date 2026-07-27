// Registro id de catálogo -> módulo de escena, y la única función que las carga.
//
// Vive en su propio módulo (y no dentro de app.js) para que el gate de
// catalog.test.js pueda cruzarlo con el catálogo sin arrastrar los efectos de
// arranque del router, que toca el DOM y monta la app al importarse.
//
// Es la mitad consumidora de un contrato de dos fuentes paralelas: el catálogo
// dice qué escenas existen y están `built`, esto dice cómo cargarlas. Si se
// desalinean, la tarjeta del home muestra el badge "Ready" y el click cae en la
// pantalla de "Scene under construction". `catalog.test.js` cruza las dos listas
// para que esa desalineación falle en CI y no en la cara del usuario.
//
// Es DATA, no un mapa de closures: eran 42 arrow functions escritas a mano
// (`bfs: () => import('./scenes/bfs.js')`), o sea 42 lugares donde equivocarse
// de ruta y ningún test capaz de verificarlas sin cargar las 42 escenas. Con el
// nombre del módulo como dato, el test verifica contra el DISCO que cada archivo
// referenciado existe, que es el chequeo que de verdad importa: un rename de
// escena rompe un `import()` en producción y nada lo detectaba.
//
// Varios ids comparten módulo a propósito (merge-sort tiene dos variantes, y
// binary-tree / binary-search-tree comparten la escena de pachinko).

/** @type {Record<string, string>} id de escena -> nombre de archivo en ./scenes/ */
export const SCENE_MODULES = {
  'bubble-sort': 'bubble-sort',
  'quick-sort': 'quick-sort',
  'merge-sort-recursive': 'merge-sort',
  'merge-sort-in-place': 'merge-sort',
  'binary-search': 'binary-search',
  stack: 'stack',
  'bounded-stack': 'bounded-stack',
  queue: 'queue',
  'circular-buffer': 'circular-buffer',
  'hash-table': 'hash-table',
  'priority-queue': 'priority-queue',
  deque: 'deque',
  set: 'set',
  graph: 'graph',
  list: 'list',
  'binary-tree': 'pachinko',
  'binary-search-tree': 'pachinko',
  tree: 'tree',
  fibonacci: 'fibonacci',
  greddy: 'greddy',
  'letter-count': 'letter-count',
  'remove-duplicates': 'remove-duplicates',
  // ── clásicos añadidos ──
  'insertion-sort': 'insertion-sort',
  'selection-sort': 'selection-sort',
  'heap-sort': 'heap-sort',
  'counting-sort': 'counting-sort',
  'radix-sort': 'radix-sort',
  'linear-search': 'linear-search',
  'jump-search': 'jump-search',
  'interpolation-search': 'interpolation-search',
  bfs: 'bfs',
  dfs: 'dfs',
  dijkstra: 'dijkstra',
  'topological-sort': 'topological-sort',
  'kruskal-mst': 'kruskal-mst',
  'kmp-search': 'kmp-search',
  levenshtein: 'levenshtein',
  'caesar-cipher': 'caesar-cipher',
  'euclid-gcd': 'euclid-gcd',
  'sieve-eratosthenes': 'sieve-eratosthenes',
  'tower-of-hanoi': 'tower-of-hanoi',
  'n-queens': 'n-queens',
};

/**
 * Indica si un id del catálogo tiene escena cargable.
 * @param {string} id
 * @returns {boolean}
 */
export function hasScene(id) {
  return Object.prototype.hasOwnProperty.call(SCENE_MODULES, id);
}

/**
 * Carga bajo demanda el módulo de una escena (una escena por request).
 * @param {string} id Id del catálogo.
 * @returns {Promise<{default: Function}>} Módulo con `default(host, meta)`.
 */
export function loadScene(id) {
  return import(`./scenes/${SCENE_MODULES[id]}.js`);
}
