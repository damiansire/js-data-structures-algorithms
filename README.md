# Data Structures and Algorithms in JavaScript

Implementations of classic data structures and algorithms in JavaScript, meant
as study and reference material. Each module exports its API with
`module.exports` so it can be imported and tested.

> Test status: every data structure, sorting, search, and general-algorithm
> module has a co-located Jest suite (14 suites in total). Run `npm run coverage`
> to see the coverage report.

## Contents

| Category               | Implementations                                                            |
| ---------------------- | -------------------------------------------------------------------------- |
| **Data structures**    | List, Stack, Tree, Binary tree, Binary search tree (BST)                   |
| **Sorting**            | Bubble sort, Merge sort (recursive and _in-place_), Quick sort             |
| **Search**             | Binary search                                                              |
| **General algorithms** | Fibonacci, Greedy, letter counting, removing duplicates                    |

## Running the tests

```bash
npm install
npm test   # Jest
```
