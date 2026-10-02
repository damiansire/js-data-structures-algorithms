# CLAUDE.md — js-data-structures-algorithms

Repo educativo de estructuras de datos y algoritmos (módulos canónicos JS/TS con test
co-ubicado) más un visualizador SPA vanilla publicado en GitHub Pages, donde cada escena
anima el algoritmo real.

- **Stacks:** Node + TypeScript (dominio, tooling, CI) y visualización creativa
  (visualizador: canvas, rAF, motion, UI viva). Barras transversales: arquitectura y
  TypeScript estricto.
- **Gates locales:** `npm run lint`, `npm run build` (typecheck), `npm run format:check`,
  `npm test`, `npm run coverage`, `npm run check-metrics`.
- **Artefactos internos:** `_audit/`, `_audits/` y `AUDITORIA.md` nunca se versionan
  (`.gitignore` + `hygiene-gate.yml`).

---

## Barra de calidad

Esta sección es **build-time**: se cumple ANTES de escribir la feature, no se audita al
final. Las reglas de stack están destiladas de repos OSS de referencia, verificadas contra
su fuente primaria (archivos de config y docs reales), y cada una cita su origen. Las que
no vienen de un repo externo se declaran como barra propia. Si una regla no tiene cita, no
es regla: es opinión.

### Piso de Craft (a-j)

_(origen: barra propia de arquitectura, común a los repos del autor. Regla raíz: intención
clara, que nada obligue a adivinar)_

- **a. El nombre revela la intención de dominio, no el mecanismo.** Nada de `data`,
  `handle`, `manager`, `process` donde el dominio tiene término propio (`trace`, `step`,
  `bucket`, `pivot`).
- **b. Los comentarios explican POR QUÉ, nunca QUÉ.** Un comentario que parafrasea el
  código es señal de renombrar o extraer. Los porqués de diseño van a `docs/design-notes.md`.
- **c. Superficie pública autodocumentada.** La firma comunica el contrato sin leer el
  cuerpo. En JS eso significa JSDoc con tipos en toda API exportada; en TS, tipos reales.
- **d. Impacto mínimo al cambiar el core.** Un cambio en la lógica central no obliga a
  tocar N archivos. Prohibido agregar una copia más de una estructura ya canónica: la
  escena consume el módulo, o consume una traza que tiene test de equivalencia contra él.
- **e. Features borrables sin cirugía.** Una escena se borra sacando su archivo, su entrada
  de catálogo y su loader. Nada de estado global compartido entre escenas.
- **f. Flujo de datos inmutable y rastreable.** El estado se deriva de la traza. Una escena
  no muta el array del dominio ni el paso que recibe: `apply(step)` debe ser idempotente
  (contrato ya escrito en `visualizador/js/player.js`).
- **g. Consistencia ante excepción.** Si una escena falla a mitad de animación, el stage
  queda en un estado consistente y visible, no a medias.
- **h. Los boundaries comunican lo que pasa.** Los límites del sistema acá son: carga
  dinámica de escena, arranque de la app y lectura de `localStorage`. Un fallo ahí se
  muestra al usuario, no se traga en silencio.
- **i. Límites explícitos.** Ningún bucle de animación o de algoritmo sin condición de
  corte probada (el bug de bucle infinito de la escena greedy es el caso real que esta
  regla previene).
- **j. Fail-closed donde importa.** Ante entrada inválida (id de escena inexistente, paso
  fuera de rango, `localStorage` no disponible), degradar a un estado seguro conocido, no
  seguir con datos rotos.

### Legibilidad en frío (k-m)

_(origen: barra propia de arquitectura + consenso de guías OSS de documentación; cada regla
cita su fuente)_

Que el artefacto haga visible y verificable lo que es, para alguien que cae en frío en 30
segundos sin abrir el código. Su ausencia no baja el craft, pero deja el trabajo
sub-descripto.

- **k. El README lidera con prueba visible y framing honesto.** Este repo tiene salida
  VISUAL: la descripción textual NO cuenta como prueba. Un README sin captura ni GIF del
  visualizador está violado aunque el texto sea impecable. Además, nombre y descripción
  tienen que igualar el contenido real: ni inflar ni sub-vender.
  _(ref: GitLab OSS-guide, GitHub README 5-part)_
- **l. Donde prometés robustez o performance, la prueba está y es reproducible.** Los
  números de `benchmarks/` que cita `docs/design-notes.md` van con entorno declarado (Node,
  CPU, fecha) y runner re-ejecutable. Un claim de complejidad ("O(1) promedio") exige el
  test o el benchmark que lo sostiene, o el caveat que lo acota.
  _(ref: ripgrep benchsuite, TechEmpower, paper fixest)_
- **m. Framing honesto: se reconoce el límite del claim.** Se dice dónde el patrón NO
  aplica. Ejemplo obligatorio acá: si el README promete escenas fieles al código real, dice
  a cuántas escenas cubre el mecanismo que lo garantiza. Publicar 24% de cobertura con la
  explicación al lado es la conducta correcta, no la vergonzosa.
  _(ref: Gallant/ripgrep, "not universally faster… on small files negligible")_

### Techo de Craft

_(origen: estudio de repos de referencia donde la calidad está machine-checked: Kubernetes
[import-restrictions](https://github.com/kubernetes/kubernetes/blob/master/staging/publishing/import-restrictions.yaml),
[SQLite testing](https://sqlite.org/testing.html) y [assert](https://www.sqlite.org/assert.html),
[LLVM coding standards](https://llvm.org/docs/CodingStandards.html),
[tracing-error](https://github.com/tokio-rs/tracing/blob/master/tracing-error/src/lib.rs))_

Idea rectora: los repos de referencia convierten la calidad en **hecho machine-enforced**,
no en convención. Lo que mueve este repo de "ok" a "referencia":

- **Nombres y superficie:** imposible de malusar, no solo legible. Un contrato único de
  boundary bien especificado (acá: `traza -> Player -> escena`, una sola forma de describir
  un paso). _(type-state-builder, LLVM)_
- **Encapsulamiento como hecho de CI:** allowlist de imports default-deny chequeada, no
  convención. El equivalente barato y ya al alcance acá: un test que cruce el catálogo con
  el mapa de loaders, y un gate que exija que toda escena con módulo canónico tenga su
  `.trace.test.mjs`. _(Kubernetes import-boss)_
- **Integridad de estado:** invariante observable y ejercitado, no asumido. Un `assert` es
  una PRUEBA verificada en todos los tests, distinta de lo meramente creído. Acá: los tests
  de traza deben fijar la SECUENCIA de operaciones que la animación narra, no solo el
  estado final. _(SQLite, PostgreSQL)_
- **Observabilidad:** contexto capturado en el ORIGEN, render diferido. Techo fino (una
  sola fuente confirmada): no sobre-generalizar. _(tokio-rs/tracing-error)_
- **Enforcement:** distinguí siempre "gateable por linter/CI" (regla dura) de "criterio de
  review" (juicio). En esos repos solo el import-boss de Kubernetes y los assert/test-VFS de
  SQLite están literalmente machine-checked; el resto es "should" por review.

> El patrón propio de este repo (traza pura sin DOM + test de equivalencia contra el módulo
> canónico) es candidato legítimo a techo. Se vuelve techo el día que sea un gate universal,
> no un ejemplo aplicado a unas pocas escenas.

### Reglas enforzables del stack

#### Node + TypeScript, tooling y CI

_(origen: consenso verificado contra los archivos de config reales de
[n8n](https://github.com/n8n-io/n8n), [Backstage](https://github.com/backstage/backstage) y
[Directus](https://github.com/directus/directus). La numeración (consenso N, divergencia D4)
es la que citan los comentarios de `.github/workflows/` y `jest.config.js`)_

1. **tsconfig estricto en UN solo lugar y con `include` por patrón.** La cobertura del
   typecheck no puede depender de que alguien se acuerde de editar una allowlist: un `.ts`
   nuevo entra solo. Un tsconfig hoja que re-declara flags de strictness es drift.
   _(consenso 1)_
2. **Typecheck como gate de CI dedicado y bloqueante**, separado de lint y de build:
   `npm run build` (`tsc --noEmit`) tiene su propio step, sin `continue-on-error`.
   _(consenso 2)_
3. **Nada de TS crudo en el artefacto que consume el usuario.** `ts-node` y `ts-jest` son
   dev-only; el navegador recibe JS que se sirve tal cual. _(consenso 3)_
4. **CI sin enmascaramiento de fallos:** cero `continue-on-error` y cero `|| true` en los
   workflows; las excepciones se marcan explícitas y documentadas. Cierra con **working
   tree limpio** (`git ls-files --others --exclude-standard --modified` sin salida), que
   convierte "los scripts son deterministas" en propiedad verificada. _(consenso 4)_
5. **Supply-chain determinista:** `permissions` declarados por workflow (mínimo
   `contents: read`), Actions de terceros pinneadas a **SHA completo** con el tag en
   comentario, y lockfile sin duplicados. _(consenso 5)_
6. **Coverage con umbral como ratchet** (`coverageThreshold` en `jest.config.js`): el piso
   solo sube, nunca baja. Honestidad al citarlo: el mecanismo es estándar, pero gatear
   cobertura por umbral es barra propia de este repo, no consenso de los OSS top.
   _(divergencia D4: no es consenso de los tres repos)_

#### TypeScript

_(origen: barra propia de TypeScript estricto, inspirada en el type-safety de tRPC y en
las configs de monorepos tipo Nx)_

- **`as Type` es apagar el compilador.** Prohibido el cast ciego después de una operación
  que puede devolver `undefined`/`null`: type guard o validación en runtime. Severidad
  MAYOR a BLOCKER.
- **`any` es BLOCKER.** Si la estructura es genuinamente desconocida, el tipo correcto es
  `unknown`, que fuerza el narrowing antes de operar.
- **Exhaustividad con `never`** en todo `switch` sobre union types (los tipos de paso de la
  traza son exactamente eso).
- **Nada de interfaces vacías** ni alias que no aporten seguridad nominal.

#### Visualizador (creative: SPA vanilla, canvas, motion)

_(origen: [three.js](https://github.com/mrdoob/three.js),
[p5.js](https://github.com/processing/p5.js),
[MediaPipe](https://github.com/google-ai-edge/mediapipe), [neal.fun](https://neal.fun) para
la UI viva, y WCAG 2.2 + Nielsen Norman Group para la usabilidad)_

- **Cero dependencias de runtime, ESM tree-shakeable.** three.js sostiene ~600k LOC sin una
  sola dep de runtime; acá el claim de "sin build step, sin dependencias" es del README y
  hay que mantenerlo cierto. _(three.js)_
- **Cero alloc en el hot path.** En loops de `requestAnimationFrame` no se instancian
  objetos ni arrays por frame: temporales reutilizables a nivel módulo. _(three.js)_
- **API fluida: los mutadores devuelven `this`**, y el JSDoc lo declara como contrato.
  _(three.js)_
- **Lint con reglas concretas, no genéricas:** `no-unused-vars` en `error`, tipos JSDoc
  obligatorios, y `browserslist` + `eslint-plugin-compat` para que usar una API más nueva
  que el target soportado falle en CI en vez de fallar en el navegador del visitante.
  _(three.js)_
- **Lógica de dominio testeable sin navegador,** con fakes en lugar del entorno real: el
  test de la lógica no depende del DOM ni de un canvas. _(MediaPipe, p5.js)_
- **Gobernanza de PRs explícita** para superficie grande: declarar qué clase de PRs se
  acepta baja el ruido de mantenimiento. _(mediapipe)_
- **Toda pantalla nueva o retocada pasa los gates de UI antes de darse por terminada:**
  - Polo "UI viva" (estilo neal.fun): nada popea (entradas y salidas animadas ≥150ms),
    ack instantáneo en el primer frame post interacción, `prefers-reduced-motion` cubre
    **todo** el motion y no un subconjunto, comprensión sin código, información completa y
    no truncada.
  - Polo "usable / sin defectos" (anclado a WCAG 2.2 y NNG): feedback ≤400ms, targets
    ≥24×24 px, contraste ≥4.5:1, foco visible y no tapado, transiciones de 100 a 500ms,
    layout íntegro sin overflow ni colisiones, medido por `getBoundingClientRect` contra
    TODOS los vecinos.
  - Los dos polos se exigen juntos: una pantalla puede estar viva y seguir siendo incómoda,
    inaccesible o rota.

### Documentación

_(origen: reglas k-m de arriba + consenso de guías de documentación OSS:
[GitHub sobre READMEs](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-readmes),
[GitLab](https://about.gitlab.com/blog/how-to-start-a-great-oss-project/),
[ADRs](https://github.com/joelparkerhenderson/architecture-decision-record))_

- **El README nombra al proyecto igual que el manifest.** El título, la descripción de
  `package.json` y el claim de apertura describen la misma cosa. Un rename se propaga a los
  tres lugares en el mismo commit.
- **No se linkea a archivos que no existen.** Todo link relativo del README apunta a algo
  presente en el árbol, y los links quedan cubiertos por el gate de links (incluyendo los
  `.html`, no solo los `.md`).
- **No es un molde reciclado.** Nada de secciones genéricas de plantilla que no describan
  este repo. Cada sección existe porque este proyecto la necesita.
- **Ningún claim sin su mecanismo.** Si el README promete algo ("cada implementación trae
  su suite", "la escena es fiel al código real"), o el gate lo garantiza, o el texto
  declara el alcance exacto de la promesa. El drift ya materializado de este repo nació
  justo ahí.
- **Los números del README se generan, no se escriben a mano.** El bloque
  `<!-- METRICS:START -->` sale de `scripts/update-metrics.mjs` y `npm run check-metrics`
  lo gatea; ningún número queda escrito a mano fuera de ese bloque.
- **El "por qué" vive en un doc de decisión.** Una decisión por doc, con contexto y
  consecuencias (Nygard). Hoy eso es `docs/design-notes.md`; los cambios de decisión se
  escriben ahí, no en el mensaje de commit. _(ADR)_
- **Scope declarado por negación.** El repo dice qué a propósito NO es ni hace (por
  ejemplo: no es una librería publicable, no busca ser la implementación más rápida).
  Presencia = alcance deliberado; ausencia = no se distingue deliberado de deriva.
  _(SQLite "Distinctive Features", ripgrep "Why shouldn't I use ripgrep?")_

### Definición de listo

Ningún cambio se considera terminado sin `npm run lint`, `npm run build`,
`npm run format:check`, `npm run coverage` (con el ratchet de cobertura) y
`npm run check-metrics` en verde, y sin dejar el working tree sucio. Si el cambio es
visual, además: captura real mirada, no solo mediciones de DOM.
