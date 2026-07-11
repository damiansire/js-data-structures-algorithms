/**
 * @jest-environment jsdom
 */
// Test de COMPONENTE (no de equivalencia de traza): monta la escena real de
// Bubble Sort sobre un host de jsdom y ejercita play/pause/step del Player,
// verificando estado real del DOM (narrador, progreso, clases de las
// burbujas). No reimplementa las aserciones de
// ../trace/bubble-sort.trace.test.mjs (que solo compara datos).
import { fireEvent } from '@testing-library/dom';
import mountBubbleSort from './bubble-sort.js';

function progressCounts(host) {
  const [index, total] = host
    .querySelector('.transport .progress')
    .textContent.split('/')
    .map((s) => parseInt(s.trim(), 10));
  return { index, total };
}

describe('escena Bubble Sort (componente)', () => {
  let host;
  let scene;

  beforeEach(() => {
    host = document.createElement('div');
    document.body.append(host);
    scene = mountBubbleSort(host, { id: 'bubble-sort' });
  });

  afterEach(() => {
    scene.destroy();
    host.remove();
  });

  test('arranca en pausa, con el narrador listo y 9 burbujas sin marcar', () => {
    expect(host.querySelector('.narrator').textContent).toBe('Ready to play.');
    expect(host.querySelectorAll('.bs-bubble')).toHaveLength(9);
    expect(progressCounts(host)).toEqual({ index: 0, total: expect.any(Number) });
    expect(host.querySelectorAll('.bs-bubble.settled')).toHaveLength(0);
  });

  test('el botón Step avanza un paso por click y actualiza el contador', () => {
    const stepBtn = host.querySelectorAll('.transport .tbtn')[1];
    const before = progressCounts(host);

    fireEvent.click(stepBtn);
    const after = progressCounts(host);

    expect(after.index).toBe(before.index + 1);
    expect(after.total).toBe(before.total);
    // el narrador cambió de la narración inicial a la del primer paso real
    expect(host.querySelector('.narrator').textContent).not.toBe('Ready to play.');
  });

  test('pisar Step hasta el final deja las 9 burbujas asentadas y ordenadas', () => {
    const stepBtn = host.querySelectorAll('.transport .tbtn')[1];
    const { total } = progressCounts(host);

    for (let i = 0; i < total; i++) fireEvent.click(stepBtn);

    expect(progressCounts(host)).toEqual({ index: total, total });
    expect(host.querySelectorAll('.bs-bubble.settled')).toHaveLength(9);
    expect(host.querySelector('.narrator').textContent).toBe('Sorted from smallest to largest! ✨');
  });

  test('Reset vuelve el narrador y el progreso al estado inicial', () => {
    const stepBtn = host.querySelectorAll('.transport .tbtn')[1];
    const resetBtn = host.querySelectorAll('.transport .tbtn')[2];

    fireEvent.click(stepBtn);
    fireEvent.click(stepBtn);
    fireEvent.click(resetBtn);

    expect(progressCounts(host).index).toBe(0);
    expect(host.querySelector('.narrator').textContent).toBe('Ready to play.');
    expect(host.querySelectorAll('.bs-bubble.settled')).toHaveLength(0);
  });
});
