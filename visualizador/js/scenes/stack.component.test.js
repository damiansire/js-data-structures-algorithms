/**
 * @jest-environment jsdom
 */
// Test de componente de la escena Stack. Existe por el drift ya materializado:
// la escena traía su propia copia de Stack con la API vieja (peek() devolvía el
// Node, pop() no devolvía nada) y sus call sites compensaban con `.data`. Al
// pasar a consumir trace/stack.trace.mjs (alineado con el canónico stack.ts)
// esos call sites cambiaron, así que acá se fija que lo que se PINTA sigue
// siendo correcto: la tarjeta peek() muestra el dato del tope, no "[object
// Object]" ni undefined.
import { fireEvent } from '@testing-library/dom';
import mountStack from './stack.js';

/** Valores de las tres info-cards: length(), peek(), isEmpty(). */
function stats(host) {
  const [len, top, empty] = host.querySelectorAll('.info-card .big');
  return { length: len.textContent, peek: top.textContent, isEmpty: empty.textContent };
}

const buttons = (host) => host.querySelectorAll('.transport .tbtn');

describe('escena Stack (componente)', () => {
  let host;
  let scene;

  beforeEach(() => {
    host = document.createElement('div');
    document.body.append(host);
    scene = mountStack(host, { id: 'stack' });
  });

  afterEach(() => {
    scene.destroy();
    host.remove();
  });

  test('arranca con 3 platos y la tarjeta peek() muestra el DATO del tope', () => {
    expect(host.querySelectorAll('.stk-plate')).toHaveLength(3);
    expect(stats(host)).toEqual({ length: '3', peek: '3', isEmpty: 'false' });
  });

  test('push() apila y peek() sigue mostrando el dato, no el Node', () => {
    const [pushBtn] = buttons(host);
    fireEvent.click(pushBtn);
    expect(stats(host)).toEqual({ length: '4', peek: '4', isEmpty: 'false' });
    expect(stats(host).peek).not.toContain('object');
  });

  test('pop() narra el dato desapilado y actualiza el tope', () => {
    const [, popBtn] = buttons(host);
    fireEvent.click(popBtn);
    // La narración cita el valor que devolvió pop(): con la API vieja (pop sin
    // retorno) acá aparecía "undefined".
    expect(host.querySelector('.narrator').textContent).toContain('3');
    expect(host.querySelector('.narrator').textContent).not.toContain('undefined');
    expect(stats(host)).toEqual({ length: '2', peek: '2', isEmpty: 'false' });
  });

  test('vaciar deja isEmpty en true y la pila sin platos', () => {
    const [, , clearBtn] = buttons(host);
    fireEvent.click(clearBtn);
    expect(stats(host)).toEqual({ length: '0', peek: '—', isEmpty: 'true' });
    expect(host.querySelectorAll('.stk-plate')).toHaveLength(0);
  });

  test('pop() sobre pila vacía avisa y no rompe la escena', () => {
    const [, popBtn, clearBtn] = buttons(host);
    fireEvent.click(clearBtn);
    expect(() => fireEvent.click(popBtn)).not.toThrow();
    expect(stats(host).isEmpty).toBe('true');
  });
});
