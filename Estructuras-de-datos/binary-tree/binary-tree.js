/**
 * Nodo de un árbol binario genérico (hasta dos hijos: left y right).
 */
class BinaryTreeNode {
    /**
     * @param {*} value Valor almacenado en el nodo.
     */
    constructor(value) {
        this.value = value;
        /** @type {BinaryTreeNode|null} Hijo izquierdo. */
        this.left = null;
        /** @type {BinaryTreeNode|null} Hijo derecho. */
        this.right = null;
    }
}

/**
 * Árbol binario genérico cuyos nodos se direccionan por una ruta tipo XPath
 * (valores separados por "/"), p. ej. "raiz/dia/datos".
 */
class BinaryTree {
    constructor() {
        /** @type {BinaryTreeNode|null} Nodo raíz del árbol. */
        this.root = null
    }
    /**
     * Inserta un nodo. Sin path, lo coloca como raíz; con path, lo cuelga como
     * hijo (left/right) del nodo ubicado en esa ruta.
     * @param {*} value Valor del nuevo nodo.
     * @param {string} [path] Ruta XPath del nodo padre (omitir para insertar la raíz).
     * @param {('left'|'right')} [whereChild] Lado en el que colgar el nuevo nodo.
     * @returns {BinaryTreeNode} El nodo recién insertado.
     */
    insert(value, path, whereChild) {
        let node = new BinaryTreeNode(value);
        if (!path) {
            this.root = node;
        } else {
            let actualNode = this.findNodeByXpath(path);
            actualNode[whereChild] = node;
        }
        return node;
    }
    /**
     * Busca entre los hijos directos de un nodo el que tenga el valor indicado.
     * @param {BinaryTreeNode} actualNode Nodo cuyos hijos se inspeccionan.
     * @param {*} valueToSearch Valor del hijo buscado.
     * @returns {BinaryTreeNode|undefined} El hijo coincidente, o undefined si no hay.
     */
    foundChild(actualNode, valueToSearch) {
        if (actualNode.right?.value === valueToSearch) {
            return actualNode.right;
        }
        else if (actualNode.left?.value === valueToSearch) {
            return actualNode.left;
        }
        //Javascript return undefined
    }
    /**
     * Resuelve una ruta XPath (valores separados por "/") y devuelve el nodo
     * final, navegando nivel a nivel por coincidencia de valor.
     * @param {string} path Ruta a resolver, p. ej. "raiz/dia/datos".
     * @throws {Error} Si la ruta no resuelve a ningún nodo existente.
     * @returns {BinaryTreeNode} El nodo ubicado al final de la ruta.
     */
    findNodeByXpath(path) {
        let actualNode = this.root;
        let routes = path.split("/")
        for (let routeIndex = 0; routeIndex < routes.length - 1; routeIndex++) {
            actualNode = this.foundChild(actualNode, routes[routeIndex + 1]);
        }
        if (actualNode.value === routes[routes.length - 1]) {
            return actualNode;
        }
        else {
            throw new Error(`No se encontro ningun nodo en la ruta: ${path}`)
        }
    }
    /**
     * Recorre el árbol en pre-orden (raíz, izquierda, derecha) imprimiendo cada
     * valor por consola con sangría según el nivel.
     * @param {BinaryTreeNode} [binaryTreeNode=this.root] Nodo desde el cual recorrer.
     * @param {number} [level=0] Nivel de profundidad actual (para la sangría).
     * @returns {void}
     */
    recorrer(binaryTreeNode = this.root, level = 0) {
        console.log("-".repeat(level), binaryTreeNode.value);

        if (binaryTreeNode.left) {
            this.recorrer(binaryTreeNode.left, level + 1);
        }

        if (binaryTreeNode.right) {
            this.recorrer(binaryTreeNode.right, level + 1);
        }
    }
}

let systemFile = new BinaryTree();
systemFile.insert("informacion");
systemFile.insert("dia", "informacion", "left");
systemFile.insert("noche", "informacion", "right");
systemFile.insert("datos", "informacion/dia", "left");
systemFile.insert("comida.xls", "informacion/dia/datos", "left");
systemFile.insert("mediciones.txt", "informacion/dia/datos", "right");
systemFile.insert("gastos.txt", "informacion/noche", "left");
systemFile.insert("restaurants", "informacion/noche", "right");
systemFile.insert("mcdonalds.txt", "informacion/noche/restaurants", "left");
systemFile.insert("tequeños.txt", "informacion/noche/restaurants", "right");

module.exports = { BinaryTree, BinaryTreeNode };


// find(value)
// specificInsert(valueParent, value)
// printInOrder(node)
// printPreOrder(node)
// printPostOrder(node)
// search(node, data)
// recursiveInsert(data, node)
// recursiveFind(value)
// recursiveFindMinNode()
