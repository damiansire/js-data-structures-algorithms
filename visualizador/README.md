# Visualizador de Algoritmos · El Catálogo de Escenas

App web en **Vanilla JS + CSS** (sin build, sin dependencias) que cuenta cada
algoritmo del repo como una **escena/metáfora animada**, fiel al código real.

## Cómo correrlo

Los módulos usan `import` (ESM), así que necesitás servirlo por HTTP (no
`file://`). Desde la raíz del repo:

```bash
# opción 1: Node sin instalar nada
npx serve visualizador

# opción 2: Python
cd visualizador && python -m http.server 4178
```

Abrí `http://localhost:<puerto>/`.

## Estructura

```
visualizador/
├── index.html
├── css/
│   ├── styles.css      # tema global (layout, hero, catálogo, transporte)
│   └── scenes.css      # estilos por escena (burbujas, puertas, platos…)
└── js/
    ├── app.js          # router por hash (#/ y #/scene/<id>)
    ├── catalog.js      # metadatos de las 15 escenas (qué está "Listo")
    ├── dom.js          # helpers: el(), clear(), setStyle()…
    ├── player.js       # motor de reproducción + barra de transporte
    └── scenes/         # una escena por archivo
        ├── bubble-sort.js
        ├── binary-search.js
        └── stack.js
```

## Cómo agregar una escena nueva

1. En `js/catalog.js`, poné `built: true` en la entrada del algoritmo.
2. Creá `js/scenes/<id>.js` con un `export default function(host, meta)` que
   pinte dentro de `host` y devuelva `{ destroy() }`.
3. Registrá el loader en `js/app.js` → `SCENE_LOADERS['<id>'] = () => import(...)`.
4. Agregá sus estilos en `css/scenes.css`.

## Idiomas (i18n)

La app arranca en **inglés** y permite cambiar a **español** con el botón 🌐 del
topbar (se recuerda en `localStorage`). El motor está en `js/i18n.js`:

- `getLang()` → `'en'` | `'es'` (idioma activo).
- `pick({ en, es })` → el texto del idioma actual (para metadatos del catálogo).
- `t('clave')` → strings de UI a nivel app (hero, transporte, badges…).
- Al cambiar idioma, el router re-renderiza la vista; **cada escena lee
  `getLang()` al montarse**, así que remontarla la reconstruye en el idioma
  activo (las escenas no se suscriben a cambios).

Cada escena define sus textos en un `const STRINGS = { en: {...}, es: {...} }`
y elige `const S = STRINGS[getLang()] || STRINGS.en` al inicio del mount.

### Dos sabores de escena

- **Por pasos** (Bubble Sort, Binary Search): generás un `trace` fiel al
  algoritmo del repo y lo entregás a `new Player({ steps, apply, reset })`.
  `buildTransport(player)` te da la barra play/paso/velocidad gratis.
- **Interactiva** (Stack): manejás tus propios botones y animás a mano.

## Escenas animadas (34)

Las primeras 14 son **fieles al código del repo**; las otras 20 son algoritmos
**clásicos añadidos** al visualizador (marcadas con `★` en su tarjeta).

**Ordenamiento** — Bubble · Quick · Merge recursivo · Merge in-place · Insertion
(mano de cartas) · Selection (bailarines) · Heap (pirámide de torneo) · Counting
(casilleros) · Radix (correo por dígito).
**Estructuras** — Linked List (tren) · Stack (platos) · Binary Tree · BST
(Pachinko) · Tree (organigrama).
**Búsqueda** — Binary Search (puertas) · Linear (rueda de sospechosos) · Jump
(piedras del río) · Interpolation (guía telefónica).
**Grafos** — BFS (ondas) · DFS (hilo de Ariadna) · Dijkstra (GPS) · Topological
(vestirse en orden) · Kruskal (puentes entre islas).
**Cadenas** — KMP (regla que no retrocede) · Levenshtein (grilla DP) · Caesar
(anillo decodificador).
**Matemática** — Euclid (embaldosar) · Sieve (criba) · Tower of Hanoi (discos) ·
N-Queens (tablero + backtracking).
**Generales** — Fibonacci (espiral áurea) · Greedy (caja registradora) · Letter
Count (cinta) · Remove Duplicates (guardia VIP).

El home tiene un fondo animado de **constelación de nodos** (`js/home-bg.js`) con
pulsos viajando por las aristas, además del campo de burbujas del hero.

> Nota de implementación: cada escena trae su propio `css/scene-<id>.css`.
> Cinco escenas lo auto-inyectan en runtime (`<link data-scene>`); `pachinko` y
> `tree` se enlazan estáticamente desde `index.html`.
