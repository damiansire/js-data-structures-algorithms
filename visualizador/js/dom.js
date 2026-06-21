// Helpers mínimos de DOM — para no depender de ningún framework.

/**
 * Crea un elemento. `attrs` admite props normales, `class`, `style` (objeto o
 * string), `dataset` (objeto) y handlers `onX`. Los hijos pueden ser nodos o
 * strings (mezclados, en cualquier cantidad).
 */
export function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v == null || v === false) continue;
    if (k === 'class') node.className = v;
    else if (k === 'style' && typeof v === 'object') setStyle(node, v);
    else if (k === 'dataset') Object.assign(node.dataset, v);
    else if (k.startsWith('on') && typeof v === 'function')
      node.addEventListener(k.slice(2).toLowerCase(), v);
    else node.setAttribute(k, v);
  }
  for (const c of children.flat()) {
    if (c == null || c === false) continue;
    node.append(c.nodeType ? c : document.createTextNode(String(c)));
  }
  return node;
}

/**
 * Aplica estilos desde un objeto. Las custom properties (`--x`) requieren
 * `setProperty`: asignarlas por índice (`style['--x']`) no las registra.
 */
export function setStyle(node, styles) {
  for (const [k, v] of Object.entries(styles)) {
    if (k.startsWith('--')) node.style.setProperty(k, v);
    else node.style[k] = v;
  }
}

/** Limpia un contenedor. */
export function clear(node) {
  while (node.firstChild) node.removeChild(node.firstChild);
  return node;
}

/** Promesa que resuelve tras `ms`. */
export const wait = (ms) => new Promise((r) => setTimeout(r, ms));

/** Reinicia una animación CSS forzando reflow. */
export function replay(node, className) {
  node.classList.remove(className);
  void node.offsetWidth; // fuerza reflow
  node.classList.add(className);
}
