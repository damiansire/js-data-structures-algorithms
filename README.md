# Estructuras de Datos y Algoritmos en JavaScript

Implementaciones de estructuras de datos y algoritmos clásicos en JavaScript, pensadas como material de estudio y referencia. Cada módulo exporta su API con `module.exports` para poder importarlo y testearlo.

> Estado de los tests: todos los módulos de estructuras, ordenamiento, búsqueda y algoritmos generales tienen su suite Jest co-localizada (14 suites en total). Para ver la cobertura corré `npm run coverage`.

## Contenido

| Categoría | Implementaciones |
|---|---|
| **Estructuras de datos** | Lista, Pila (stack), Árbol, Árbol binario, Árbol binario de búsqueda (BST) |
| **Ordenamiento** | Bubble sort, Merge sort (recursivo e *in-place*), Quick sort |
| **Búsqueda** | Búsqueda binaria |
| **Algoritmos generales** | Fibonacci, Greedy, conteo de letras, eliminar duplicados |

## Correr los tests

```bash
npm install
npm test   # Jest
```
