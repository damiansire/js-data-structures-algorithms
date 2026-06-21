/**
 * Nodo de un árbol n-ario (cantidad arbitraria de hijos).
 */
class TreeNode {
  /**
   * @param {*} value Valor almacenado en el nodo.
   */
  constructor(value) {
    this.value = value;
    /** @type {TreeNode[]} Lista de nodos hijos. */
    this.children = [];
  }
  /**
   * Busca entre los hijos directos el primero con el valor indicado.
   * @param {*} value Valor del hijo buscado.
   * @returns {TreeNode|undefined} El hijo coincidente, o undefined si no hay.
   */
  GetChildByValue(value) {
    return this.children.find((child) => child.value === value);
  }
  /**
   * Crea un nodo con el valor dado y lo agrega como hijo de este nodo.
   * @param {*} value Valor del nuevo hijo.
   * @returns {void}
   */
  addChild(value) {
    let newNode = new TreeNode(value);
    this.children.push(newNode);
  }
}

/**
 * Árbol n-ario cuyos nodos se direccionan por una ruta tipo path de archivos
 * (valores separados por "/"), p. ej. "C:/Usuarios/Damian".
 */
class Tree {
  constructor() {
    /** @type {TreeNode|null} Nodo raíz del árbol. */
    this.root = null;
  }
  /**
   * Inserta un nuevo hijo bajo el nodo ubicado en la ruta indicada. Si la
   * ruta no resuelve a un nodo, avisa por consola y no inserta nada.
   * @param {*} value Valor del nuevo nodo hijo.
   * @param {string} [path] Ruta del nodo padre (omitir para colgar de la raíz).
   * @returns {void}
   */
  insertByPath(value, path) {
    let selectedNode = this.selectedByPath(path);
    if (selectedNode) {
      selectedNode.addChild(value);
    } else {
      console.log('No encontre un nodo seleccionado para ', path);
    }
  }

  /**
   * Resuelve una ruta (valores separados por "/") navegando por los hijos y
   * devuelve el nodo final. Sin path, devuelve la raíz.
   * @param {string} [path] Ruta a resolver, p. ej. "C:/Usuarios/Damian".
   * @returns {TreeNode|null|undefined} El nodo encontrado; la raíz si no hay path; undefined si la ruta no existe.
   */
  selectedByPath(path) {
    if (path == undefined) {
      return this.root;
    }
    let selectedNode = this.root;
    let pathArr = path.split('/');
    for (let index = 0; index <= pathArr.length - 1; index++) {
      selectedNode = selectedNode?.GetChildByValue(pathArr[index]);
    }
    return selectedNode;
  }
}

let fileSystem = new Tree();
let newNode = new TreeNode('Equipo');
fileSystem.root = newNode;
fileSystem.insertByPath('C:');
fileSystem.insertByPath('D:');
fileSystem.insertByPath('Datos', 'D:');
fileSystem.insertByPath('Bin', 'C:');
fileSystem.insertByPath('Usuarios', 'C:');
fileSystem.insertByPath('Windows', 'C:');
fileSystem.insertByPath('Damian', 'C:/Usuarios');
fileSystem.insertByPath('Publico', 'C:/Usuarios');
fileSystem.insertByPath('Escritorio', 'C:/Usuarios/Damian');
fileSystem.insertByPath('Documentos', 'C:/Usuarios/Damian');
fileSystem.insertByPath('MaterialDeEstudio', 'C:/Usuarios/Damian/Documentos');

module.exports = { Tree, TreeNode };
