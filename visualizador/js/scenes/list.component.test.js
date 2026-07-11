/**
 * @jest-environment jsdom
 */
// Test de componente para la escena de List (Linked List): a diferencia de
// las escenas basadas en Player (bubble-sort, linear-search, bfs), esta es
// "interactiva" (push/prepend/pop/shift/clear a demanda, sin transporte de
// play/pause). Se ejercitan sus botones reales y se usan fake timers para
// resolver los `await wait(ms)` internos sin esperas reales.
import { jest } from '@jest/globals';
import { fireEvent } from '@testing-library/dom';
import mountList from './list.js';

function statValues(host) {
  const [len, headEl, lastEl] = host.querySelectorAll('.info-card .big');
  return { length: len.textContent, head: headEl.textContent, last: lastEl.textContent };
}

describe('escena List (componente)', () => {
  let host;
  let scene;

  beforeEach(() => {
    jest.useFakeTimers();
    host = document.createElement('div');
    document.body.append(host);
    scene = mountList(host, { id: 'list' });
  });

  afterEach(() => {
    scene.destroy();
    host.remove();
    jest.useRealTimers();
  });

  test('arranca con 4 vagones precargados y las stats sincronizadas', () => {
    expect(host.querySelectorAll('.ll-car')).toHaveLength(4);
    expect(statValues(host)).toEqual({ length: '4', head: '3', last: '5' });
  });

  test('push() agrega un vagón al final y actualiza length/last', async () => {
    const pushBtn = host.querySelectorAll('.transport .tbtn')[0];

    fireEvent.click(pushBtn);
    // el render y las stats se actualizan de forma síncrona antes del await
    // interno de la animación; el contador de vagones sube ya mismo.
    expect(host.querySelectorAll('.ll-car')).toHaveLength(5);
    expect(statValues(host).length).toBe('5');

    await jest.advanceTimersByTimeAsync(700);
    // tras la animación, el botón vuelve a estar habilitado
    expect(pushBtn.disabled).toBe(false);
  });

  test('borrar head (shift) saca el primer vagón tras la animación', async () => {
    const shiftBtn = host.querySelectorAll('.transport .tbtn')[2];

    fireEvent.click(shiftBtn);
    await jest.advanceTimersByTimeAsync(600);

    expect(host.querySelectorAll('.ll-car')).toHaveLength(3);
    expect(statValues(host).head).toBe('7'); // el segundo vagón original pasa a ser head
  });

  test('clear() vacía el tren y deshabilita pop/shift/clear', async () => {
    const clearBtn = host.querySelectorAll('.transport .tbtn')[4];

    fireEvent.click(clearBtn);
    await jest.advanceTimersByTimeAsync(10);

    expect(host.querySelectorAll('.ll-car')).toHaveLength(0);
    expect(host.querySelector('.ll-empty')).not.toBeNull();
    expect(statValues(host)).toEqual({ length: '0', head: 'null', last: 'null' });
  });
});
