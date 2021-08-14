class TreeNode {
    constructor(value) {
        this.value = value;
        this.children = []
    }
    GetChildByValue(value) {
        return this.children.find(child => child.value === value)
    }
    addChild(value) {
        let newNode = new TreeNode(value);
        this.children.push(newNode);
    }
}

class Tree {
    constructor() {
        this.root = null;
    }
    insertByPath(value, path) {
        let selectedNode = this.selectedByPath(path);
        if (selectedNode) {
            selectedNode.addChild(value);
        } else {
            console.log("No encontre un nodo seleccionado para ", path)
        }
    }

    selectedByPath(path) {
        if (path == undefined) { return this.root; }
        let selectedNode = this.root;
        let pathArr = path.split("/");
        for (let index = 0; index <= pathArr.length - 1; index++) {
            selectedNode = selectedNode?.GetChildByValue(pathArr[index]);
        }
        return selectedNode;
    }
}

let fileSystem = new Tree();
let newNode = new TreeNode("Equipo");
fileSystem.root = newNode;
fileSystem.insertByPath("C:");
fileSystem.insertByPath("D:");
fileSystem.insertByPath("Datos", "D:");
fileSystem.insertByPath("Bin", "C:");
fileSystem.insertByPath("Usuarios", "C:");
fileSystem.insertByPath("Windows", "C:");
fileSystem.insertByPath("Damian", "C:/Usuarios");
fileSystem.insertByPath("Publico", "C:/Usuarios");
fileSystem.insertByPath("Escritorio", "C:/Usuarios/Damian");
fileSystem.insertByPath("Documentos", "C:/Usuarios/Damian");
fileSystem.insertByPath("MaterialDeEstudio", "C:/Usuarios/Damian/Documentos")

