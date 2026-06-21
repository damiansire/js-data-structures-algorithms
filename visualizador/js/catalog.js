// Catálogo de Escenas — metadatos de cada visualización (bilingües).
// `scene` y `description` son objetos { en, es }; el resto es común.
// `built: true` significa que la escena ya está animada.

export const CATEGORIES = {
  sorting: { label: { en: 'Sorting', es: 'Ordenamiento' }, emoji: '🔀', accent: '#a78bfa' },
  structures: {
    label: { en: 'Data structures', es: 'Estructuras de datos' },
    emoji: '🧱',
    accent: '#22d3ee',
  },
  search: { label: { en: 'Search', es: 'Búsqueda' }, emoji: '🔎', accent: '#34d399' },
  graphs: { label: { en: 'Graphs', es: 'Grafos' }, emoji: '🕸️', accent: '#f472b6' },
  strings: { label: { en: 'Strings', es: 'Cadenas' }, emoji: '🔤', accent: '#fb923c' },
  math: { label: { en: 'Math', es: 'Matemática' }, emoji: '➗', accent: '#38bdf8' },
  general: {
    label: { en: 'General algorithms', es: 'Algoritmos generales' },
    emoji: '✨',
    accent: '#fbbf24',
  },
};

export const SCENES = [
  // ── Ordenamiento ──────────────────────────────────────────────
  {
    id: 'bubble-sort',
    category: 'sorting',
    emoji: '🫧',
    title: 'Bubble Sort',
    scene: { en: 'A glass of sparkling water', es: 'Un vaso de agua con gas' },
    description: {
      en: 'Each value is a bubble of a different size. Comparisons light up two bubbles; if they swap, they spin around each other and the larger one floats toward its place.',
      es: 'Los datos son burbujas de distinto diámetro. Las comparaciones iluminan dos burbujas; si se intercambian, giran una alrededor de la otra y la mayor flota hacia su lugar.',
    },
    repo: 'Ordenamiento/bubble-sort/bubble-sort.js',
    built: true,
  },
  {
    id: 'merge-sort-recursive',
    category: 'sorting',
    emoji: '🃏',
    title: 'Merge Sort (recursive)',
    scene: { en: 'Cards flying to a brand-new deck', es: 'Cartas que vuelan a un mazo nuevo' },
    description: {
      en: "It doesn't mutate the original: cards split and fly off to stack into a NEW, perfectly sorted deck in the center of the table.",
      es: 'No muta el original: las cartas se dividen y vuelan para apilarse en un mazo NUEVO, perfectamente ordenado, en el centro de la mesa.',
    },
    repo: 'Ordenamiento/merge-sort-recursive/merge-sort-recursive.js',
    built: true,
  },
  {
    id: 'merge-sort-in-place',
    category: 'sorting',
    emoji: '♻️',
    title: 'Merge Sort (in-place)',
    scene: {
      en: 'The same row reorders itself',
      es: 'La misma fila se reordena sin mazo nuevo',
    },
    description: {
      en: 'It mutates the original array. The two already-sorted hands fuse along the same line, without a separate deck: the cards rearrange in place.',
      es: 'Muta el array original. Las dos manos ya ordenadas se funden sobre la misma línea, sin crear un mazo aparte: las cartas se reacomodan en su lugar.',
    },
    repo: 'Ordenamiento/merge-sort-in-place/merge-sort-in-place.js',
    built: true,
  },
  {
    id: 'quick-sort',
    category: 'sorting',
    emoji: '🎯',
    title: 'Quick Sort',
    scene: {
      en: 'A teacher lining up students by height',
      es: 'Un profesor ordenando alumnos por altura',
    },
    description: {
      en: 'A pivot is lit by a spotlight. Smaller elements fly to its left and larger ones to its right; the process repeats in each subsection until the line is formed.',
      es: 'Se ilumina un pivote con un foco. Los menores vuelan a su izquierda y los mayores a su derecha; el proceso se repite en cada subsección hasta formar la fila.',
    },
    repo: 'Ordenamiento/quick-sort/quick-sort.js',
    built: true,
  },

  // ── Estructuras de datos ──────────────────────────────────────
  {
    id: 'list',
    category: 'structures',
    emoji: '🚂',
    title: 'Linked List',
    scene: { en: 'A freight train', es: 'Un tren de carga' },
    description: {
      en: 'Each node is a wagon and the next pointers are magnetic couplings. Inserting breaks the chain, a new wagon drops in and re-couples.',
      es: 'Cada nodo es un vagón y los punteros (next) son cadenas magnéticas. Insertar rompe la cadena, cae un vagón nuevo y se reengancha.',
    },
    repo: 'Estructuras-de-datos/list/list.js',
    built: true,
  },
  {
    id: 'stack',
    category: 'structures',
    emoji: '🍽️',
    title: 'Stack',
    scene: { en: 'A stack of plates (LIFO)', es: 'Una pila de platos (LIFO)' },
    description: {
      en: 'push() drops a plate from the ceiling with an elastic bounce. pop() shoots the top plate off to the side. Last in, first out.',
      es: 'push() deja caer un plato desde el techo con rebote elástico. pop() dispara el plato de arriba hacia un costado. Último en entrar, primero en salir.',
    },
    repo: 'Estructuras-de-datos/stack/stack.js',
    built: true,
  },
  {
    id: 'binary-tree',
    category: 'structures',
    emoji: '🎰',
    title: 'Binary Tree',
    scene: { en: 'A Pachinko machine', es: 'Una máquina de Pachinko' },
    description: {
      en: 'Root on top. No ordering rule: each number drops as a ball and hangs in the first free slot, filling the tree level by level (left before right).',
      es: 'La raíz está arriba. Sin regla de orden: cada número cae como bolita y se cuelga en el primer hueco libre, llenando el árbol nivel por nivel (izquierda antes que derecha).',
    },
    repo: 'Estructuras-de-datos/binary-tree/binary-tree.js',
    built: true,
  },
  {
    id: 'binary-search-tree',
    category: 'structures',
    emoji: '🎲',
    title: 'Binary Search Tree',
    scene: { en: 'Pachinko with ordering rules', es: 'Pachinko con reglas de orden' },
    description: {
      en: 'Like the binary tree, but every insertion respects the order invariant: left subtree smaller, right subtree larger.',
      es: 'Igual que el árbol binario, pero cada inserción respeta el invariante de orden: subárbol izquierdo menor, derecho mayor.',
    },
    repo: 'Estructuras-de-datos/binary-search-tree/binary-search-tree.js',
    built: true,
  },
  {
    id: 'tree',
    category: 'structures',
    emoji: '🗂️',
    title: 'Tree (general)',
    scene: { en: 'An org chart that unfolds', es: 'Un organigrama que se despliega' },
    description: {
      en: 'Folders and subfolders that fan open each time a new branch is explored.',
      es: 'Carpetas y subcarpetas que se abren en abanico cada vez que se explora una nueva rama.',
    },
    repo: 'Estructuras-de-datos/tree/tree.js',
    built: true,
  },

  // ── Búsqueda ──────────────────────────────────────────────────
  {
    id: 'binary-search',
    category: 'search',
    emoji: '🚪',
    title: 'Binary Search',
    scene: { en: 'A hallway of closed doors', es: 'Un pasillo de puertas cerradas' },
    description: {
      en: "The algorithm opens the middle door. If the treasure isn't there, the wrong half collapses into the abyss and it repeats with the half that remains.",
      es: 'El algoritmo abre la puerta del medio. Si el tesoro no está, la mitad incorrecta colapsa al abismo y se repite con la mitad que queda.',
    },
    repo: 'Busqueda/binary-search/binary-search.js',
    built: true,
  },

  // ── Algoritmos generales ──────────────────────────────────────
  {
    id: 'fibonacci',
    category: 'general',
    emoji: '🐚',
    title: 'Fibonacci',
    scene: { en: 'The golden spiral', es: 'La espiral áurea' },
    description: {
      en: 'Squares that appear sized as the sum of the two previous ones, tracing a mathematical spiral.',
      es: 'Cuadrados que aparecen con el tamaño de la suma de los dos anteriores, dibujando una espiral matemática.',
    },
    repo: 'Algoritmos-generales/fibonacci/fibonacci.js',
    built: true,
  },
  {
    id: 'greddy',
    category: 'general',
    emoji: '💰',
    title: 'Greedy (change)',
    scene: { en: 'A cash register giving change', es: 'Una caja registradora dando vuelto' },
    description: {
      en: 'It always grabs the largest denomination first, subtracting from the total and filling the rest with smaller coins.',
      es: 'Siempre toma la moneda de mayor valor primero, restando del total y rellenando con monedas menores.',
    },
    repo: 'Algoritmos-generales/greddy/greddy.js',
    built: true,
  },
  {
    id: 'letter-count',
    category: 'general',
    emoji: '🏭',
    title: 'Letter Count',
    scene: { en: 'A conveyor belt', es: 'Una cinta transportadora' },
    description: {
      en: "Letters fall down a conveyor belt into labeled baskets; each basket's counter rises as it receives its letter.",
      es: 'Las letras caen por una cinta hacia cestas etiquetadas; el contador de cada cesta sube al recibir su letra.',
    },
    repo: 'Algoritmos-generales/letter-count/letter-count.js',
    built: true,
  },
  {
    id: 'remove-duplicates',
    category: 'general',
    emoji: '🕴️',
    title: 'Remove Duplicates',
    scene: { en: 'A VIP club bouncer', es: 'El guardia de un club VIP' },
    description: {
      en: 'The data queue up. The bouncer checks the list (the Set): new ones pass the green door, repeats get thrown out.',
      es: 'Los datos hacen fila. El guardia consulta su lista (Set): los nuevos pasan por la puerta verde, los repetidos son expulsados.',
    },
    repo: 'Algoritmos-generales/remove-duplicates/remove-duplicates.js',
    built: true,
  },

  // ═══ Algoritmos clásicos añadidos al visualizador ═══════════════
  // ── Ordenamiento ──────────────────────────────────────────────
  {
    id: 'insertion-sort',
    category: 'sorting',
    emoji: '🤍',
    title: 'Insertion Sort',
    scene: { en: 'Sorting a hand of playing cards', es: 'Ordenando una mano de cartas' },
    description: {
      en: 'Each card is lifted out and slid into its correct place among the already-sorted cards on the left.',
      es: 'Cada carta se levanta y se desliza a su lugar correcto entre las que ya están ordenadas a la izquierda.',
    },
    repo: '★ O(n²)',
    built: true,
  },
  {
    id: 'selection-sort',
    category: 'sorting',
    emoji: '🩰',
    title: 'Selection Sort',
    scene: { en: 'Picking the shortest dancer each round', es: 'Eligiendo al más bajito cada ronda' },
    description: {
      en: 'Each round scans the unsorted part for the minimum and brings it to the front of the line.',
      es: 'Cada ronda busca el mínimo de la parte sin ordenar y lo trae al frente de la fila.',
    },
    repo: '★ O(n²)',
    built: true,
  },
  {
    id: 'heap-sort',
    category: 'sorting',
    emoji: '⛰️',
    title: 'Heap Sort',
    scene: { en: 'A tournament pyramid', es: 'Una pirámide de torneo' },
    description: {
      en: 'Builds a max-heap pyramid, then repeatedly takes the champion at the top to the sorted tail.',
      es: 'Arma una pirámide (max-heap) y repetidamente lleva al campeón de la cima a la cola ordenada.',
    },
    repo: '★ O(n log n)',
    built: true,
  },
  {
    id: 'counting-sort',
    category: 'sorting',
    emoji: '📮',
    title: 'Counting Sort',
    scene: { en: 'Pigeonhole mailboxes', es: 'Casilleros de correo' },
    description: {
      en: 'Tallies each value into its numbered mailbox, then empties them in order to read out the sorted list.',
      es: 'Cuenta cada valor en su casillero numerado y luego los vacía en orden para leer la lista ordenada.',
    },
    repo: '★ O(n + k)',
    built: true,
  },
  {
    id: 'radix-sort',
    category: 'sorting',
    emoji: '📬',
    title: 'Radix Sort',
    scene: { en: 'Sorting mail by digit, pass by pass', es: 'Correo ordenado por dígito, pasada a pasada' },
    description: {
      en: 'Buckets the numbers by one digit at a time (ones, tens, hundreds), gathering between passes.',
      es: 'Agrupa los números por un dígito a la vez (unidades, decenas, centenas), reuniéndolos entre pasadas.',
    },
    repo: '★ O(d·n)',
    built: true,
  },

  // ── Búsqueda ──────────────────────────────────────────────────
  {
    id: 'linear-search',
    category: 'search',
    emoji: '🔦',
    title: 'Linear Search',
    scene: { en: 'A detective checking a lineup', es: 'Un detective revisando una rueda de sospechosos' },
    description: {
      en: 'Checks each suspect one by one, left to right, until the target is found (or nobody matches).',
      es: 'Revisa a cada sospechoso uno por uno, de izquierda a derecha, hasta encontrar el objetivo.',
    },
    repo: '★ O(n)',
    built: true,
  },
  {
    id: 'jump-search',
    category: 'search',
    emoji: '🪨',
    title: 'Jump Search',
    scene: { en: 'Stepping stones across a river', es: 'Piedras para cruzar un río' },
    description: {
      en: 'Hops √n stones at a time over the sorted array, then steps back one by one inside the right block.',
      es: 'Salta √n piedras a la vez sobre el array ordenado y luego retrocede de a una dentro del bloque correcto.',
    },
    repo: '★ O(√n)',
    built: true,
  },
  {
    id: 'interpolation-search',
    category: 'search',
    emoji: '📖',
    title: 'Interpolation Search',
    scene: { en: "Guessing a name's page in a phone book", es: 'Adivinando la página en una guía telefónica' },
    description: {
      en: 'Estimates where the target likely sits (proportional to its value) instead of always probing the middle.',
      es: 'Estima dónde está probablemente el objetivo (proporcional a su valor) en vez de probar siempre el medio.',
    },
    repo: '★ O(log log n)',
    built: true,
  },

  // ── Grafos ────────────────────────────────────────────────────
  {
    id: 'bfs',
    category: 'graphs',
    emoji: '🌊',
    title: 'Breadth-First Search',
    scene: { en: 'Ripples spreading on a pond', es: 'Ondas expandiéndose en un estanque' },
    description: {
      en: 'Explores the graph level by level from the source, like concentric ripples, using a queue.',
      es: 'Explora el grafo nivel por nivel desde el origen, como ondas concéntricas, usando una cola.',
    },
    repo: '★ O(V + E)',
    built: true,
  },
  {
    id: 'dfs',
    category: 'graphs',
    emoji: '🧶',
    title: 'Depth-First Search',
    scene: { en: 'A maze with Ariadne’s thread', es: 'Un laberinto con el hilo de Ariadna' },
    description: {
      en: 'Dives deep down one branch following a thread, backtracking whenever it hits a dead end.',
      es: 'Se hunde por una rama siguiendo un hilo y retrocede cada vez que llega a un callejón sin salida.',
    },
    repo: '★ O(V + E)',
    built: true,
  },
  {
    id: 'dijkstra',
    category: 'graphs',
    emoji: '🛰️',
    title: 'Dijkstra',
    scene: { en: 'A GPS finding the shortest route', es: 'Un GPS buscando la ruta más corta' },
    description: {
      en: 'Cities light up by growing distance: it finalizes the closest unvisited node and relaxes its edges.',
      es: 'Las ciudades se encienden por distancia creciente: fija el nodo no visitado más cercano y relaja sus aristas.',
    },
    repo: '★ O(E log V)',
    built: true,
  },
  {
    id: 'topological-sort',
    category: 'graphs',
    emoji: '👕',
    title: 'Topological Sort',
    scene: { en: 'Getting dressed in the right order', es: 'Vestirse en el orden correcto' },
    description: {
      en: 'Respects dependencies: repeatedly puts on an item that needs nothing else first (Kahn’s algorithm).',
      es: 'Respeta dependencias: se va poniendo la prenda que no requiere ninguna otra antes (algoritmo de Kahn).',
    },
    repo: '★ O(V + E)',
    built: true,
  },
  {
    id: 'kruskal-mst',
    category: 'graphs',
    emoji: '🌉',
    title: 'Kruskal’s MST',
    scene: { en: 'Cheapest bridges between islands', es: 'Los puentes más baratos entre islas' },
    description: {
      en: 'Adds the cheapest bridge that doesn’t form a loop (union-find), connecting all islands at minimum cost.',
      es: 'Agrega el puente más barato que no forme un ciclo (union-find), conectando todas las islas al mínimo costo.',
    },
    repo: '★ O(E log E)',
    built: true,
  },

  // ── Cadenas (Strings) ─────────────────────────────────────────
  {
    id: 'kmp-search',
    category: 'strings',
    emoji: '📏',
    title: 'KMP Search',
    scene: { en: 'A ruler that never slides back', es: 'Una regla que nunca retrocede' },
    description: {
      en: 'Matches a pattern in text using a failure table, so the text pointer never moves backward.',
      es: 'Busca un patrón en el texto usando una tabla de fallos, sin mover nunca el puntero del texto hacia atrás.',
    },
    repo: '★ O(n + m)',
    built: true,
  },
  {
    id: 'levenshtein',
    category: 'strings',
    emoji: '✏️',
    title: 'Levenshtein',
    scene: { en: 'Autocorrect morphing one word into another', es: 'El autocorrector transformando una palabra en otra' },
    description: {
      en: 'Fills a DP grid of edits (insert, delete, replace) to measure how far one word is from another.',
      es: 'Llena una grilla DP de ediciones (insertar, borrar, reemplazar) para medir qué tan lejos está una palabra de otra.',
    },
    repo: '★ O(n·m)',
    built: true,
  },
  {
    id: 'caesar-cipher',
    category: 'strings',
    emoji: '🔐',
    title: 'Caesar Cipher',
    scene: { en: 'A rotating decoder ring', es: 'Un anillo decodificador giratorio' },
    description: {
      en: 'Two alphabet rings rotated by N: each letter maps through the wheel to its shifted cipher letter.',
      es: 'Dos anillos del alfabeto girados N: cada letra pasa por la rueda hacia su letra cifrada desplazada.',
    },
    repo: '★ O(n)',
    built: true,
  },

  // ── Matemática ────────────────────────────────────────────────
  {
    id: 'euclid-gcd',
    category: 'math',
    emoji: '🟦',
    title: 'Euclid’s GCD',
    scene: { en: 'Tiling a rectangle with the biggest square', es: 'Embaldosar un rectángulo con el cuadrado más grande' },
    description: {
      en: 'Repeatedly carves the largest possible square out of a rectangle; the final tile size is the GCD.',
      es: 'Recorta repetidamente el cuadrado más grande posible de un rectángulo; el último azulejo es el MCD.',
    },
    repo: '★ O(log n)',
    built: true,
  },
  {
    id: 'sieve-eratosthenes',
    category: 'math',
    emoji: '🔢',
    title: 'Sieve of Eratosthenes',
    scene: { en: 'Crossing out multiples on a number grid', es: 'Tachando múltiplos en una grilla de números' },
    description: {
      en: 'Each prime glows and its multiples get crossed out; whatever survives the grid is prime.',
      es: 'Cada primo brilla y sus múltiplos se tachan; lo que sobrevive en la grilla es primo.',
    },
    repo: '★ O(n log log n)',
    built: true,
  },
  {
    id: 'tower-of-hanoi',
    category: 'math',
    emoji: '🗼',
    title: 'Tower of Hanoi',
    scene: { en: 'Moving golden disks between three pegs', es: 'Moviendo discos dorados entre tres varillas' },
    description: {
      en: 'A recursive dance: move n−1 disks aside, move the biggest, then move the rest on top of it.',
      es: 'Una danza recursiva: mover n−1 discos a un lado, mover el más grande y luego el resto encima.',
    },
    repo: '★ O(2ⁿ)',
    built: true,
  },
  {
    id: 'n-queens',
    category: 'math',
    emoji: '♛',
    title: 'N-Queens',
    scene: { en: 'Placing queens with no attacks', es: 'Ubicando reinas sin que se ataquen' },
    description: {
      en: 'Backtracking: places one queen per row, undoing a move whenever a square is under attack.',
      es: 'Backtracking: ubica una reina por fila y deshace la jugada cada vez que una casilla queda amenazada.',
    },
    repo: '★ backtracking',
    built: true,
  },
];

export const SCENES_BY_ID = Object.fromEntries(SCENES.map((s) => [s.id, s]));
