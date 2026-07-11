/**
 * Benchmark chico de tiempo (performance.now()) que compara las estructuras
 * propias contra sus equivalentes nativos de V8. No es un framework de
 * benchmarking (no hace estadística de percentiles ni descarta outliers a
 * fondo): corre cada caso varias veces y reporta la mediana, que alcanza
 * para ver el orden de magnitud real de cada trade-off documentado en
 * `docs/design-notes.md`.
 *
 * Uso: node benchmarks/index.js
 * Los números reales de la última corrida están volcados en
 * `docs/design-notes.md` (sección "Benchmarks").
 */
// priority-queue.ts es TypeScript (jsda-2): ts-node/register habilita requerir
// .ts directo desde este script CommonJS sin paso de compilación aparte.
require('ts-node/register');

const { performance } = require('perf_hooks');
const { HashTable } = require('../Estructuras-de-datos/hash-table/hash-table');
const { PriorityQueue } = require('../Estructuras-de-datos/priority-queue/priority-queue');
const {
  BinarySearchTree,
} = require('../Estructuras-de-datos/binary-search-tree/binary-search-tree');

const SIZES = [1000, 10000, 100000];
const RUNS = 5; // corridas por caso; se reporta la mediana

function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

function time(fn) {
  const start = performance.now();
  fn();
  return performance.now() - start;
}

function bench(label, fn) {
  const samples = [];
  for (let i = 0; i < RUNS; i++) {
    samples.push(time(fn));
  }
  return { label, ms: median(samples) };
}

function randomInts(n, max = n * 10) {
  const arr = new Array(n);
  for (let i = 0; i < n; i++) arr[i] = Math.floor(Math.random() * max);
  return arr;
}

function sortedInts(n) {
  const arr = new Array(n);
  for (let i = 0; i < n; i++) arr[i] = i;
  return arr;
}

function fmt(ms) {
  return `${ms.toFixed(2)} ms`;
}

function printRow(name, results) {
  const cells = results.map((r) => `${r.label}: ${fmt(r.ms)}`).join('  |  ');
  console.log(`  ${name.padEnd(28)} ${cells}`);
}

// --- hash-table vs Map ---------------------------------------------------
function benchHashTable(n) {
  const keys = randomInts(n).map((k) => `k${k}`);

  const insertHashTable = bench('HashTable', () => {
    const ht = new HashTable(n); // capacidad dimensionada al dataset (peor
    // caso justo: con capacidad default=8 la tabla degrada a O(n) por bucket,
    // ver docs/design-notes.md)
    for (const k of keys) ht.set(k, 1);
  });
  const insertMap = bench('Map nativo', () => {
    const m = new Map();
    for (const k of keys) m.set(k, 1);
  });

  const htFilled = new HashTable(n);
  for (const k of keys) htFilled.set(k, 1);
  const mapFilled = new Map();
  for (const k of keys) mapFilled.set(k, 1);

  const getHashTable = bench('HashTable', () => {
    for (const k of keys) htFilled.get(k);
  });
  const getMap = bench('Map nativo', () => {
    for (const k of keys) mapFilled.get(k);
  });

  const htDefaultCapacity = bench('HashTable cap=8 (default)', () => {
    const ht = new HashTable(); // capacidad fija chica: expone el costo real
    // de no tener resize automático (ver docs/design-notes.md)
    for (const k of keys) ht.set(k, 1);
  });

  console.log(`\nhash-table vs Map — n=${n}`);
  printRow('set/insert', [insertHashTable, insertMap]);
  printRow('get', [getHashTable, getMap]);
  printRow('set con capacidad default', [htDefaultCapacity]);
}

// --- priority-queue vs alternativa naive (array ordenado) ----------------
function insertSorted(arr, value) {
  let lo = 0;
  let hi = arr.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (arr[mid] < value) lo = mid + 1;
    else hi = mid;
  }
  arr.splice(lo, 0, value); // O(n) por el shift del array
}

function benchPriorityQueue(n) {
  const values = randomInts(n);

  const heap = bench('PriorityQueue (heap)', () => {
    const pq = new PriorityQueue();
    for (const v of values) pq.enqueue(v, v);
    while (!pq.isEmpty()) pq.dequeue();
  });

  const sortedArray = bench('Array ordenado (naive)', () => {
    const arr = [];
    for (const v of values) insertSorted(arr, v);
    while (arr.length > 0) arr.shift();
  });

  console.log(`\npriority-queue (heap) vs array ordenado — n=${n}`);
  printRow('enqueue-todo + dequeue-todo', [heap, sortedArray]);
}

// --- binary-search-tree vs Set nativo -------------------------------------
function benchBst(n, data, tag) {
  const insertBst = bench('BinarySearchTree', () => {
    const bst = new BinarySearchTree();
    for (const v of data) bst.insert(v);
  });
  const insertSet = bench('Set nativo', () => {
    const s = new Set();
    for (const v of data) s.add(v);
  });

  const bstFilled = new BinarySearchTree();
  for (const v of data) bstFilled.insert(v);
  const setFilled = new Set(data);

  const findBst = bench('BinarySearchTree', () => {
    for (const v of data) bstFilled.find(v);
  });
  const findSet = bench('Set nativo', () => {
    for (const v of data) setFilled.has(v);
  });

  console.log(`\nbinary-search-tree vs Set — n=${n} (${tag})`);
  printRow('insert', [insertBst, insertSet]);
  printRow('find/has', [findBst, findSet]);
}

function main() {
  console.log('Benchmark: estructuras propias vs nativos de V8');
  console.log(`Node ${process.version} — ${RUNS} corridas por caso, se reporta la mediana\n`);
  console.log('='.repeat(70));

  for (const n of SIZES) {
    benchHashTable(n);
  }

  console.log('\n' + '='.repeat(70));
  // el array ordenado es O(n) por inserción: limitamos el tamaño grande para
  // que la corrida completa termine en tiempo razonable
  for (const n of [1000, 10000, 20000]) {
    benchPriorityQueue(n);
  }

  console.log('\n' + '='.repeat(70));
  for (const n of SIZES) {
    benchBst(n, randomInts(n), 'datos aleatorios');
  }
  // Caso degenerado documentado en design-notes.md: insertar ya ordenado
  // convierte el BST en una lista enlazada (O(n) por operación).
  for (const n of [1000, 5000]) {
    benchBst(n, sortedInts(n), 'datos ya ordenados: caso degenerado');
  }

  console.log('\n' + '='.repeat(70));
}

main();
