// Test del catálogo de escenas: no necesita DOM (catalog.js es data pura),
// así que corre en el entorno node por defecto del repo.
import { CATEGORIES, SCENES, SCENES_BY_ID } from './catalog.js';

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
