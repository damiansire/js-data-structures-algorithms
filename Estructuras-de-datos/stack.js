class Node {
    constructor(data) {
        this.data = data;
        this.prev = null;
    }
}

class Stack {
    constructor() {
        this.top = null;
    }

    length() {
        let aux = this.top;
        let count = 0;
        while (aux !== null) {
            count++;
            aux = aux.prev;
        }
        return count;
    }

    hasElement(element) {
        let aux = this.top;
        while (aux != null && aux.data != element) {
            aux = aux.prev;
        }
        return aux !== null;
    }

    peek() {
        return this.top;
    }

    isEmpty() {
        return this.top === null;
    }

    print() {
        let aux = this.top;
        while (aux !== null) {
            console.log(aux.data)
            aux = aux.prev;
        }
    }

    push(element) {
        let aux = new Node(element)
        aux.prev = this.top;
        this.top = aux;
    }

    pop() {
        if (this.top != null) {
            this.top = this.top.prev
        } else {
            alert("Amigo, estas queriendo borrar un elemento de una pila vacia ")
        }
    }

}