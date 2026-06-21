const { BinarySearchTree, BinarySearchTreeNode } = require('./binary-search-tree');

describe('BinarySearchTree', () => {
  test('un árbol recién creado tiene raíz nula', () => {
    const bst = new BinarySearchTree();
    expect(bst.getRootNode()).toBeNull();
    expect(bst.find(1)).toBeNull();
    expect(bst.findMinNode()).toBeNull();
    expect(bst.inOrder()).toEqual([]);
  });

  test('insert en árbol vacío crea la raíz', () => {
    const bst = new BinarySearchTree();
    const node = bst.insert(8);
    expect(node).toBeInstanceOf(BinarySearchTreeNode);
    expect(bst.getRootNode()).toBe(node);
    expect(node.value).toBe(8);
  });

  test('insert ubica menores a la izquierda y mayores a la derecha', () => {
    const bst = new BinarySearchTree();
    bst.insert(8);
    bst.insert(3);
    bst.insert(10);
    const root = bst.getRootNode();
    expect(root.left.value).toBe(3);
    expect(root.right.value).toBe(10);
  });

  test('inOrder devuelve los valores ordenados ascendentemente', () => {
    const bst = new BinarySearchTree();
    [8, 3, 10, 1, 6, 14, 4, 7, 13].forEach((v) => bst.insert(v));
    expect(bst.inOrder()).toEqual([1, 3, 4, 6, 7, 8, 10, 13, 14]);
  });

  test('insert ignora valores duplicados y devuelve el nodo existente', () => {
    const bst = new BinarySearchTree();
    const first = bst.insert(5);
    const dup = bst.insert(5);
    expect(dup).toBe(first);
    expect(bst.inOrder()).toEqual([5]);
  });

  test('find devuelve el nodo cuando el valor existe', () => {
    const bst = new BinarySearchTree();
    [8, 3, 10, 6].forEach((v) => bst.insert(v));
    const found = bst.find(6);
    expect(found).not.toBeNull();
    expect(found.value).toBe(6);
  });

  test('find devuelve null cuando el valor no existe', () => {
    const bst = new BinarySearchTree();
    [8, 3, 10].forEach((v) => bst.insert(v));
    expect(bst.find(99)).toBeNull();
  });

  test('findMinNode devuelve el nodo de menor valor', () => {
    const bst = new BinarySearchTree();
    [8, 3, 10, 1, 6].forEach((v) => bst.insert(v));
    expect(bst.findMinNode().value).toBe(1);
  });

  test('findMinNode acepta un subárbol como punto de partida', () => {
    const bst = new BinarySearchTree();
    [8, 3, 10, 1, 6, 14, 12].forEach((v) => bst.insert(v));
    const rightSubtree = bst.getRootNode().right;
    expect(bst.findMinNode(rightSubtree).value).toBe(10);
  });

  test('BinarySearchTreeNode se construye con hijos nulos', () => {
    const n = new BinarySearchTreeNode(7);
    expect(n.value).toBe(7);
    expect(n.left).toBeNull();
    expect(n.right).toBeNull();
  });
});
