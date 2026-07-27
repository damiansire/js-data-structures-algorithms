// Test del catálogo de escenas: no necesita DOM (catalog.js es data pura),
// así que corre en el entorno node por defecto del repo.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CATEGORIES, SCENES, SCENES_BY_ID } from './catalog.js';
import { SCENE_MODULES, hasScene } from './scene-loaders.js';

const SCENES_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), 'scenes');

describe('catalog', () => {
  test('cada escena registrada expone la metadata bilingüe esperada', () => {
    expect(SCENES.length).toBeGreaterThan(0);
    for (const s of SCENES) {
      expect(typeof s.id).toBe('string');
      expect(s.id.length).toBeGreaterThan(0);
      expect(CATEGORIES[s.category]).toBeDefined();
      expect(typeof s.emoji).toBe('string');
      expect(typeof s.title).toBe('string');
      expect(typeof s.scene.en).toBe('string');
      expect(typeof s.description.en).toBe('string');
      expect(typeof s.built).toBe('boolean');
    }
  });

  test('SCENES_BY_ID indexa cada escena por su id, sin pérdidas ni duplicados', () => {
    expect(Object.keys(SCENES_BY_ID)).toHaveLength(SCENES.length);
    for (const s of SCENES) {
      expect(SCENES_BY_ID[s.id]).toBe(s);
    }
  });

  test('incluye las escenas cubiertas por los tests de componente (una por categoría)', () => {
    expect(SCENES_BY_ID['bubble-sort']).toMatchObject({ category: 'sorting', built: true });
    expect(SCENES_BY_ID['linear-search']).toMatchObject({ category: 'search', built: true });
    expect(SCENES_BY_ID['list']).toMatchObject({ category: 'structures', built: true });
    expect(SCENES_BY_ID['bfs']).toMatchObject({ category: 'graphs', built: true });
  });
});

// Gate del contrato productor -> consumidor. El catálogo (qué escenas existen y
// cuáles están `built`) y el mapa de loaders (cómo se cargan) eran dos listas
// paralelas escritas a mano, sin nada que las cruzara. El modo de falla era
// silencioso y sólo visible para el usuario final: tarjeta con badge "Ready",
// click, pantalla de "Scene under construction". Agregar la escena 43 es el
// escenario más probable del repo, así que esto tiene que fallar en CI.
describe('catálogo <-> registro de escenas', () => {
  test('toda escena marcada built tiene módulo registrado', () => {
    const sinModulo = SCENES.filter((s) => s.built && !hasScene(s.id)).map((s) => s.id);
    expect(sinModulo).toEqual([]);
  });

  test('todo módulo registrado corresponde a una escena del catálogo', () => {
    const huérfanos = Object.keys(SCENE_MODULES).filter((id) => !SCENES_BY_ID[id]);
    expect(huérfanos).toEqual([]);
  });

  test('ninguna escena no-built tiene módulo (badge Soon con escena cargable)', () => {
    const contradictorias = SCENES.filter((s) => !s.built && hasScene(s.id)).map((s) => s.id);
    expect(contradictorias).toEqual([]);
  });

  // El chequeo que de verdad protege la demo publicada: la app carga las escenas
  // por `import()` dinámico, así que un rename de archivo no rompe nada en CI y
  // se descubre recién cuando el usuario hace click y ve la pantalla de error.
  test('cada módulo registrado existe en el disco', () => {
    const faltantes = Object.entries(SCENE_MODULES)
      .filter(([, mod]) => !fs.existsSync(path.join(SCENES_DIR, `${mod}.js`)))
      .map(([id, mod]) => `${id} -> scenes/${mod}.js`);
    expect(faltantes).toEqual([]);
  });

  test('todo archivo de escena del disco está registrado (nada muerto ni suelto)', () => {
    const registrados = new Set(Object.values(SCENE_MODULES));
    const enDisco = fs
      .readdirSync(SCENES_DIR)
      .filter((f) => f.endsWith('.js') && !f.includes('.test.'))
      .map((f) => f.replace(/\.js$/, ''));
    expect(enDisco.filter((m) => !registrados.has(m))).toEqual([]);
  });
});
