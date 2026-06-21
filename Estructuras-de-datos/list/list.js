    class Node {
        constructor(data) {
            this.data = data;
            this.next = null;
        }
    }

    class List {
        constructor() {
            this.head = null;
            this.length = 0;
        }
        push(data) {
            let node = new Node(data)
            if (this.head == null) {
                this.head = node;
            } else {
                this.last.next = node;
            }
            this.last = node;
            this.length++;
        }
        print() {
            let aux = this.head
            while (aux != null) {
                console.log(aux.data)
                aux = aux.next
            }
        }
        getLastElement() {
            let aux = this.head
            while (aux != null && aux.next != null) {
                aux = aux.next
            }
            return aux;
        }
        getElementByIndex(index) {
            if (index < 0) { return null }
            let aux = this.head;
            let actualIndex = 0;
            while (aux != null && actualIndex != index) {
                aux = aux.next
                actualIndex++;
            }
            return aux;
        }
        find(element) {
            let aux = this.head;
            while (aux != null && aux.data != element) {
                aux = aux.next;
            }
            return aux
        }
        delete(element) {
            let aux = this.head;
            if (aux == null) { return null }
            if (aux.data == element) {
                this.head = aux.next;
                if (aux == this.last) { this.last = this.head }
                this.length--;
                return aux.data;
            }
            while (aux.next != null && aux.next.data != element) {
                aux = aux.next
            }
            if (aux.next == null) { return null }
            let removed = aux.next;
            aux.next = aux.next.next;
            if (removed == this.last) { this.last = aux }
            this.length--;
            return removed.data;
        }
        deleteByNode(node) {
            if (node.next == null) { return null }
            node.data = node.next.data
            node.next = node.next.next;
            if (node.next == null) { this.last = node }
            this.length--;
        }
    }


    let myList = new List();
    myList.push(1)
    myList.push(4)
    myList.push(6)
    myList.push(8)
    myList.push(3)
    myList.push(2)

module.exports = { List, Node };