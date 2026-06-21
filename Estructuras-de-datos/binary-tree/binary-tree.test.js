const { BinaryTree, BinaryTreeNode } = require('./binary-tree');

describe('BinaryTree', () => {
  test('insert sin path crea la raíz', () => {
    const tree = new BinaryTree();
    const root = tree.insert('a');
    expect(root).toBeInstanceOf(BinaryTreeNode);
    expect(tree.root).toBe(root);
    expect(root.value).toBe('a');
    expect(root.left).toBeNull();
    expect(root.right).toBeNull();
  });

  test('insert con path agrega hijos izquierdo y derecho', () => {
    const tree = new BinaryTree();
    tree.insert('raiz');
    const left = tree.insert('izq', 'raiz', 'left');
    const right = tree.insert('der', 'raiz', 'right');
    expect(tree.root.left).toBe(left);
    expect(tree.root.right).toBe(right);
    expect(left.value).toBe('izq');
    expect(right.value).toBe('der');
  });

  test('insert anidado en una ruta de varios niveles', () => {
    const tree = new BinaryTree();
    tree.insert('raiz');
    tree.insert('izq', 'raiz', 'left');
    tree.insert('nieto', 'raiz/izq', 'left');
    expect(tree.root.left.left.value).toBe('nieto');
  });

  test('findNodeByXpath devuelve el nodo de la ruta', () => {
    const tree = new BinaryTree();
    tree.insert('raiz');
    tree.insert('izq', 'raiz', 'left');
    tree.insert('der', 'raiz', 'right');
    expect(tree.findNodeByXpath('raiz').value).toBe('raiz');
    expect(tree.findNodeByXpath('raiz/izq').value).toBe('izq');
    expect(tree.findNodeByXpath('raiz/der').value).toBe('der');
  });

  test('findNodeByXpath lanza Error si el último valor de la ruta no coincide', () => {
    // La raíz se alcanza pero su valor no coincide con el último segmento.
    const tree = new BinaryTree();
    tree.insert('raiz');
    expect(() => tree.findNodeByXpath('otra')).toThrow(/No se encontro ningun nodo en la ruta/);
  });

  test('findNodeByXpath lanza Error de dominio si un tramo intermedio no existe', () => {
    // El segmento intermedio "fantasma" no es hijo de la raíz: debe lanzar el
    // Error de dominio documentado, no un TypeError opaco.
    const tree = new BinaryTree();
    tree.insert('raiz');
    tree.insert('izq', 'raiz', 'left');
    expect(() => tree.findNodeByXpath('raiz/fantasma/izq')).toThrow(
      /No se encontro ningun nodo en la ruta/,
    );
  });

  test('foundChild encuentra el hijo correcto por valor', () => {
    const tree = new BinaryTree();
    tree.insert('raiz');
    const left = tree.insert('izq', 'raiz', 'left');
    const right = tree.insert('der', 'raiz', 'right');
    expect(tree.foundChild(tree.root, 'izq')).toBe(left);
    expect(tree.foundChild(tree.root, 'der')).toBe(right);
    expect(tree.foundChild(tree.root, 'nada')).toBeUndefined();
  });

  test('recorrer imprime cada valor del árbol', () => {
    const tree = new BinaryTree();
    tree.insert('raiz');
    tree.insert('izq', 'raiz', 'left');
    tree.insert('der', 'raiz', 'right');
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    tree.recorrer();
    const printed = spy.mock.calls.map((c) => c[1]);
    expect(printed).toEqual(['raiz', 'izq', 'der']);
    spy.mockRestore();
  });

  test('BinaryTreeNode se construye con hijos nulos', () => {
    const n = new BinaryTreeNode('x');
    expect(n.value).toBe('x');
    expect(n.left).toBeNull();
    expect(n.right).toBeNull();
  });
});
