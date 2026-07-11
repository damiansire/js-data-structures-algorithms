/**
 * @jest-environment jsdom
 */
// Test de componente para Linear Search: dirige el reproductor real
// (Player/buildTransport) sobre la escena montada y verifica el DOM real de
// la rueda de reconocimiento (tarjetas checked/cleared/found), no solo la
// traza de datos.
import { fireEvent } from '@testing-library/dom';
import mountLinearSearch from './linear-search.js';

describe('escena Linear Search (componente)', () => {
  let host;
  let scene;

  beforeEach(() => {
    host = document.createElement('div');
    document.body.append(host);
    scene = mountLinearSearch(host, { id: 'linear-search' });
  });

  afterEach(() => {
    scene.destroy();
    host.remove();
  });

  test('arranca con 8 sospechosos en la rueda y el narrador listo', () => {
    expect(host.querySelectorAll('.lse-card')).toHaveLength(8);
    expect(host.querySelector('.narrator').textContent).toBe('Ready to play.');
    expect(host.querySelectorAll('.lse-card.lse-checking')).toHaveLength(0);
  });

  test('Step revisa un sospechoso a la vez, de izquierda a derecha', () => {
    const stepBtn = host.querySelectorAll('.transport .tbtn')[1];

    fireEvent.click(stepBtn);
    const checking1 = host.querySelectorAll('.lse-card.lse-checking');
    expect(checking1).toHaveLength(1);
    expect(checking1[0].dataset.idx).toBe('0');

    fireEvent.click(stepBtn);
    const checking2 = host.querySelectorAll('.lse-card.lse-checking');
    expect(checking2).toHaveLength(1);
    expect(checking2[0].dataset.idx).toBe('1');
    // el sospechoso anterior, que no coincidía, quedó descartado
    expect(host.querySelector('[data-idx="0"]').classList.contains('lse-cleared')).toBe(true);
  });

  test('pisar Step hasta encontrar el objetivo marca la tarjeta como found', () => {
    const stepBtn = host.querySelectorAll('.transport .tbtn')[1];
    // El objetivo (31) está en el índice 4: check x5 + found = 6 pasos.
    for (let i = 0; i < 6; i++) fireEvent.click(stepBtn);

    const found = host.querySelectorAll('.lse-card.lse-found');
    expect(found).toHaveLength(1);
    expect(found[0].dataset.idx).toBe('4');
    expect(host.querySelector('.narrator').textContent).toContain('Match!');
    expect(host.querySelectorAll('.transport .progress')[0].textContent).toBe('6 / 6');
  });
});
