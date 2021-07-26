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
        length() {
            let aux = this.head
            let length = 0;
            while (aux != null) {
                this.length;
                aux = aux.next
            }
            return aux;
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
            if (aux.data == element) { this.head = aux.next; return aux.data }
            while (aux.next.data != element) {
                aux = aux.next
            }
            aux.next = aux.next.next
        }
        deleteByNode(node) {
            node.data = node.next.data
            node.next = node.next.next;
        }
    }


    let myList = new List();
    myList.push(1)
    myList.push(4)
    myList.push(6)
    myList.push(8)
    myList.push(3)
    myList.push(2)