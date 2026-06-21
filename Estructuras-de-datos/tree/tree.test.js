const { Tree, TreeNode } = require('./tree');

describe('TreeNode', () => {
  test('se construye sin hijos', () => {
    const n = new TreeNode('root');
    expect(n.value).toBe('root');
    expect(n.children).toEqual([]);
  });

  test('addChild agrega un hijo nuevo', () => {
    const n = new TreeNode('root');
    n.addChild('hijo');
    expect(n.children).toHaveLength(1);
    expect(n.children[0]).toBeInstanceOf(TreeNode);
    expect(n.children[0].value).toBe('hijo');
  });

  test('GetChildByValue encuentra un hijo existente', () => {
    const n = new TreeNode('root');
    n.addChild('a');
    n.addChild('b');
    expect(n.GetChildByValue('b').value).toBe('b');
  });

  test('GetChildByValue devuelve undefined si no existe', () => {
    const n = new TreeNode('root');
    n.addChild('a');
    expect(n.GetChildByValue('z')).toBeUndefined();
  });
});

describe('Tree', () => {
  function buildTree() {
    const tree = new Tree();
    tree.root = new TreeNode('Equipo');
    tree.insertByPath('C:');
    tree.insertByPath('D:');
    tree.insertByPath('Usuarios', 'C:');
    tree.insertByPath('Damian', 'C:/Usuarios');
    return tree;
  }

  test('selectedByPath sin path devuelve la raíz', () => {
    const tree = buildTree();
    expect(tree.selectedByPath()).toBe(tree.root);
  });

  test('insertByPath agrega hijos directos a la raíz', () => {
    const tree = buildTree();
    expect(tree.root.GetChildByValue('C:')).toBeDefined();
    expect(tree.root.GetChildByValue('D:')).toBeDefined();
  });

  test('selectedByPath navega rutas anidadas', () => {
    const tree = buildTree();
    const damian = tree.selectedByPath('C:/Usuarios/Damian');
    expect(damian).toBeDefined();
    expect(damian.value).toBe('Damian');
  });

  test('insertByPath agrega en una ruta profunda', () => {
    const tree = buildTree();
    tree.insertByPath('Documentos', 'C:/Usuarios/Damian');
    const damian = tree.selectedByPath('C:/Usuarios/Damian');
    expect(damian.GetChildByValue('Documentos')).toBeDefined();
  });

  test('selectedByPath devuelve undefined para una ruta inexistente', () => {
    const tree = buildTree();
    expect(tree.selectedByPath('C:/NoExiste')).toBeUndefined();
  });

  test('insertByPath sobre ruta inexistente no agrega y avisa por consola', () => {
    const tree = buildTree();
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    tree.insertByPath('Huerfano', 'C:/NoExiste');
    expect(spy).toHaveBeenCalled();
    expect(tree.selectedByPath('C:/NoExiste')).toBeUndefined();
    spy.mockRestore();
  });
});
