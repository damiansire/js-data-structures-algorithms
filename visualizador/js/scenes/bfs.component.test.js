/**
 * @jest-environment jsdom
 */
// Test de componente para BFS: dirige el Player real sobre el grafo fijo de
// 8 nodos y verifica DOM real (nodos visitados, cola en vivo, contador).
// No hay test de traza equivalente para BFS: esta es una escena de grafos,
// sin módulo canónico en Ordenamiento/Busqueda contra el cual comparar.
import { fireEvent } from '@testing-library/dom';
import mountBFS from './bfs.js';

describe('escena BFS (componente)', () => {
  let host;
  let scene;

  beforeEach(() => {
    host = document.createElement('div');
    document.body.append(host);
    scene = mountBFS(host, { id: 'bfs' });
  });

  afterEach(() => {
    scene.destroy();
    host.remove();
  });

  test('arranca con los 8 nodos del grafo, cola vacía y 0 visitados', () => {
    expect(host.querySelectorAll('.bfs-node')).toHaveLength(8);
    expect(host.querySelector('.bfs-queue-empty')).not.toBeNull();
    expect(host.querySelectorAll('.bfs-node.bfs-visited')).toHaveLength(0);
  });

  test('el primer Step visita el origen A y lo encola', () => {
    const stepBtn = host.querySelectorAll('.transport .tbtn')[1];
    fireEvent.click(stepBtn);

    const nodeA = host.querySelector('[data-id="A"]');
    expect(nodeA.classList.contains('bfs-visited')).toBe(true);
    expect(host.querySelectorAll('.bfs-chip')).toHaveLength(1);
    expect(host.querySelectorAll('.bfs-chip')[0].textContent).toBe('A');
  });

  test('pisar Step hasta el final visita los 8 nodos y vacía la cola', () => {
    const stepBtn = host.querySelectorAll('.transport .tbtn')[1];
    const total = parseInt(
      host.querySelectorAll('.transport .progress')[0].textContent.split('/')[1].trim(),
      10,
    );

    for (let i = 0; i < total; i++) fireEvent.click(stepBtn);

    expect(host.querySelectorAll('.bfs-node.bfs-visited')).toHaveLength(8);
    expect(host.querySelector('.bfs-queue-empty')).not.toBeNull();
    expect(host.querySelector('.narrator').textContent).toContain('8');
  });
});
