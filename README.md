# Data Structures and Algorithms in JavaScript

[![CI](https://github.com/damiansire/js-data-structures-algorithms/actions/workflows/ci.yml/badge.svg)](https://github.com/damiansire/js-data-structures-algorithms/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D22-brightgreen.svg)](./.nvmrc)

Implementations of classic data structures and algorithms in JavaScript, meant
as study and reference material. Each module exports its API with
`module.exports` so it can be imported and tested in isolation.

> Test status: every implementation ships with a co-located Jest suite —
> **25 suites, 245 tests** in total (21 module suites + 4 visualizer trace
> suites). Run `npm run coverage` to see the coverage report.

## Live visualizer

The repo ships an interactive **algorithm visualizer** (Vanilla JS + CSS, no
build step, no dependencies) that renders each algorithm as an animated
scene faithful to the real code.

**Live demo:** <https://damiansire.github.io/js-data-structures-algorithms/>

To run it locally you need to serve it over HTTP (the scenes use ESM
`import`, so `file://` won't work):

```bash
npx serve visualizador        # then open the printed URL
# or:  cd visualizador && python -m http.server 4178
```

See [`visualizador/README.md`](./visualizador/README.md) for how the scene
catalog works and how to add a new scene.

## Contents

| Category               | Implementations                                                                                                     |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------ |
| **Data structures**    | List, Stack, Queue, Deque, Circular buffer, Tree, Binary tree, Binary search tree (BST), Priority queue (min-heap), Hash table (separate chaining), Set (hashing), Graph (undirected, adjacency list) |
| **Sorting**            | Bubble sort, Merge sort (recursive and _in-place_), Quick sort                                                     |
| **Search**             | Binary search                                                                                                      |
| **General algorithms** | Fibonacci, Greedy, letter counting, removing duplicates                                                            |

Each entry lives in its own folder under `Estructuras-de-datos/`,
`Ordenamiento/`, `Busqueda/` and `Algoritmos-generales/`, next to its test
file.

## Running the tests

```bash
npm install
npm test           # Jest (25 suites)
npm run coverage   # Jest with coverage report
npm run lint       # ESLint
npm run format:check
```

Requires Node `>=22` (see [`.nvmrc`](./.nvmrc)).

## License

[MIT](./LICENSE) © Damian Sire
