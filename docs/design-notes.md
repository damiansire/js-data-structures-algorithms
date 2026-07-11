# Notas de diseño por módulo

Por qué cada estructura está implementada como está, y qué alternativa se
dejó afuera a propósito. Pensado para responder "¿por qué este árbol
balanceado y no otro?" sin tener que leer el código fuente para cada módulo.

## TypeScript (migración parcial, jsda-2)

De las 15 implementaciones del repo (11 en `Estructuras-de-datos` + 4 en
`Ordenamiento`), **5 están migradas a TypeScript con genéricos estrictos**
(`strict: true`, sin `any` en ningún archivo): `list`, `stack`, `queue`,
`deque` y `priority-queue`. Las **10 restantes siguen en JavaScript puro**
(`binary-search-tree`, `binary-tree`, `circular-buffer`, `graph`,
`hash-table`, `set`, `tree` y los 4 algoritmos de `Ordenamiento`).

La elección no es arbitraria: las 5 migradas son **contenedores genéricos**
(estructuras que envuelven un tipo `T` arbitrario sin asumir nada sobre él:
comparación por igualdad, orden lineal FIFO/LIFO/deque, o una prioridad
numérica separada del valor), el caso donde `class List<T>` da valor real:
el compilador garantiza que lo que sale de `pop()`/`dequeue()`/`peek()` es
del mismo tipo que entró, sin casteos en el call-site. Las que quedan afuera
son, o bien algoritmos de forma fija sobre arrays/números (los 4 de
`Ordenamiento`, y en igual medida `hash-table`/`set` que ya asumen claves
hasheables), o estructuras con invariantes propios del dominio (BST, árbol,
grafo) que se beneficiarían de tipado pero no eran el foco de esta pasada:
se prioriza profundidad (genéricos reales, cero `any`) sobre cobertura total,
según el propio criterio de jsda-2. `tsc --noEmit` (`npm run build`) tipa en
CI sin emitir; en runtime, `ts-jest` transforma los `.ts` on-the-fly para los
tests y `ts-node/register` habilita requerirlos desde `benchmarks/index.js`
(CommonJS puro, sin paso de compilación aparte).

## Estructuras-de-datos

- **binary-search-tree**: BST clásico, **sin auto-balanceo** (no es AVL ni
  Red-Black). Inserción/búsqueda O(log n) en el caso promedio, pero **O(n) en
  el peor caso** si se insertan valores ya ordenados (el árbol degenera en una
  lista enlazada). Se eligió la versión simple porque el objetivo del repo es
  material de estudio de la estructura base — un AVL/Red-Black agrega
  rotaciones que son un tema aparte. Si se necesita la garantía O(log n)
  worst-case, ésa es la extensión natural, no una reescritura.
- **hash-table**: resolución de colisiones por **encadenamiento separado**
  (separate chaining: cada bucket es una lista), no open addressing (linear
  probing / double hashing). Chaining es más simple de razonar (no hay
  "tombstones" al borrar, no hay clustering primario) a costa de una
  indirección extra por colisión; open addressing es más cache-friendly pero
  complica el borrado. Capacidad fija en el constructor — no hay resize/rehash
  automático al crecer el load factor, así que con muchos elementos sobre una
  capacidad chica el rendimiento degrada a O(n) por bucket sobrecargado.
- **priority-queue**: **min-heap binario sobre un arreglo aplanado** (hijo de
  `i` en `2i+1`/`2i+2`), no una lista ordenada ni un árbol de nodos con
  punteros. El arreglo aplanado evita el overhead de punteros/objetos-nodo y
  tiene mejor localidad de cache; el costo es que insertar/extraer son O(log n)
  en vez de O(1) que tendría una lista ya ordenada en el caso de solo-insertar,
  pero una lista ordenada paga O(n) en la inserción — el heap es el balance
  estándar cuando ambas operaciones (insertar y extraer-mínimo) son frecuentes.
- **binary-tree / tree**: árbol genérico sin invariante de orden (no es un BST)
  — pensado para representar jerarquías arbitrarias, no para búsqueda eficiente.
- **circular-buffer**: buffer de tamaño fijo con wraparound (índices módulo
  capacidad) en vez de un array que crece — trade-off clásico de estructura de
  tamaño acotado: escritura O(1) sin realloc, a cambio de descartar el dato
  más viejo cuando se llena (FIFO con overwrite), no un error de "lleno".
- **deque**: doble punta (push/pop en ambos extremos O(1)) — superset de stack
  y queue; se paga algo de complejidad extra en la implementación para no
  tener que mantener dos estructuras separadas cuando el caso de uso necesita
  ambos extremos.
- **graph**: representación por lista de adyacencia (no matriz de adyacencia)
  — mejor para grafos dispersos (la mayoría de los casos de estudio), O(V+E)
  en espacio en vez de O(V²); el costo es que chequear si una arista específica
  existe es O(grado del nodo) en vez de O(1).
- **list**: lista enlazada simple — inserción/borrado O(1) en los extremos
  conocidos, a cambio de acceso indexado O(n) (no hay random access como en un
  array).
- **queue / stack**: implementaciones directas de las estructuras lineales
  clásicas (FIFO / LIFO) — sirven de base conceptual para deque/priority-queue.
- **set**: set propio (no `Set` nativo de JS) — el propósito es de estudio: la
  implementación expone cómo se resuelve membership/unicidad por debajo, algo
  que el `Set` nativo esconde.

## Ordenamiento

- **bubble-sort**: O(n²), incluido como referencia didáctica del caso "peor
  algoritmo razonable" — nunca la elección para datasets reales, y el propio
  módulo no pretende serlo.
- **quick-sort**: partición in-place, O(n log n) promedio, **O(n²) en el peor
  caso** (pivote mal elegido sobre datos ya ordenados o adversariales) — el
  trade-off clásico de quicksort frente a mergesort: más rápido en la práctica
  y con mejor uso de memoria (in-place), pero sin garantía de peor caso ni
  estabilidad.
- **merge-sort-recursive / merge-sort-in-place**: O(n log n) garantizado
  (no depende de la distribución de los datos como quicksort) y estable — el
  costo es memoria O(n) extra en la variante recursiva clásica; la variante
  in-place existe en este repo específicamente para mostrar ese trade-off
  memoria-vs-simplicidad del lado a lado con la recursiva.

## Benchmarks

Medición real de tiempo (`node benchmarks/index.js`, `perf_hooks.performance.now()`,
mediana de 5 corridas), corrida en esta máquina con Node v26.2.0. El script no
es un framework de benchmarking: alcanza para ver el orden de magnitud de
cada trade-off descripto arriba, no para comparar micro-optimizaciones.

### hash-table vs `Map` nativo

| n       | set/insert (HashTable) | set/insert (Map) | get (HashTable) | get (Map) |
| ------- | ---------------------- | ---------------- | --------------- | --------- |
| 1.000   | 3.66 ms                | 1.13 ms          | 2.34 ms         | 0.71 ms   |
| 10.000  | 17.42 ms               | 1.41 ms          | 2.98 ms         | 0.78 ms   |
| 100.000 | 101.38 ms              | 31.08 ms         | 100.74 ms       | 10.73 ms  |

Con la capacidad de bucket dimensionada al dataset (`new HashTable(n)`),
`HashTable` queda entre 3x y 9x más lento que `Map` nativo (esperable: `Map`
está implementado en C++ dentro de V8, no en JS). El punto real lo muestra la
capacidad **default** (`new HashTable()`, 8 buckets fijos, sin resize
automático, tal como está documentado arriba): insertar 100.000 claves tardó
**15.664 ms** (15.6 segundos) contra 101 ms con capacidad dimensionada, porque
cada bucket termina con miles de entradas encadenadas y cada `set` pasa a ser
O(n). Este número es la evidencia concreta de la limitación "sin resize
automático" que la nota de diseño menciona en teoría.

### priority-queue (heap) vs array ordenado (naive)

| n      | heap (enqueue+dequeue todo) | array ordenado (naive) |
| ------ | --------------------------- | ---------------------- |
| 1.000  | 4.45 ms                     | 0.51 ms                |
| 10.000 | 5.97 ms                     | 11.17 ms               |
| 20.000 | 12.78 ms                    | 136.55 ms              |

Con pocos elementos el array ordenado (inserción por búsqueda binaria +
`splice`, que es O(n) por el corrimiento) gana por overhead bajo. El cruce
pasa entre 1.000 y 10.000 elementos: a partir de ahí el heap (O(log n) por
operación) se despega, y en 20.000 elementos ya es 10.7x más rápido que la
alternativa naive. Confirma en números el trade-off que documenta la nota de
diseño: el heap es la elección correcta cuando insertar y extraer-mínimo son
ambas frecuentes sobre datasets no triviales.

### binary-search-tree vs `Set` nativo

| n       | caso        | insert (BST) | insert (Set) | find/has (BST) | find/has (Set) |
| ------- | ----------- | ------------ | ------------ | -------------- | -------------- |
| 1.000   | aleatorio   | 0.71 ms      | 0.15 ms      | 0.21 ms        | 0.12 ms        |
| 10.000  | aleatorio   | 2.19 ms      | 1.11 ms      | 1.97 ms        | 0.68 ms        |
| 100.000 | aleatorio   | 65.06 ms     | 13.84 ms     | 70.18 ms       | 8.00 ms        |
| 1.000   | ya ordenado | 0.96 ms      | 0.06 ms      | 0.94 ms        | 0.00 ms        |
| 5.000   | ya ordenado | 26.88 ms     | 0.41 ms      | 37.37 ms       | 0.01 ms        |

Con datos aleatorios el BST queda entre 4x y 8x más lento que `Set` (mismo
motivo que `Map`: `Set` es nativo de V8). El caso interesante es el
degenerado: insertar 5.000 valores ya ordenados hace que el BST se convierta
en una lista enlazada (cada nodo cuelga solo del anterior), y tanto `insert`
como `find` pasan a ser O(n) por operación. El resultado: 65x más lento en
insert y ~3.700x más lento en find que `Set`, sobre apenas 5.000 elementos.
Esto es la confirmación empírica exacta de lo que la nota de diseño advierte
arriba ("O(n) en el peor caso si se insertan valores ya ordenados").

## Cómo mantener esto al día

Si se agrega una estructura nueva o se cambia la estrategia interna de una
existente (por ejemplo, agregar resize automático a `hash-table`), actualizar
la entrada correspondiente acá — este archivo documenta la decisión, no
reemplaza los comentarios de JSDoc del código fuente. Si el cambio afecta el
rendimiento de una estructura ya benchmarkeada, correr `npm run benchmark` de
nuevo y actualizar la sección "Benchmarks" con los números reales de esa
corrida (no reescribirlos a mano).
