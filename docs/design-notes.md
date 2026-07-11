# Notas de diseño por módulo

Por qué cada estructura está implementada como está, y qué alternativa se
dejó afuera a propósito. Pensado para responder "¿por qué este árbol
balanceado y no otro?" sin tener que leer el código fuente para cada módulo.

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

## Cómo mantener esto al día

Si se agrega una estructura nueva o se cambia la estrategia interna de una
existente (por ejemplo, agregar resize automático a `hash-table`), actualizar
la entrada correspondiente acá — este archivo documenta la decisión, no
reemplaza los comentarios de JSDoc del código fuente.
