const { List, Node } = require("./list");

// Recorre la lista desde head y devuelve los datos en orden.
function toArray(list) {
  const out = [];
  let aux = list.head;
  while (aux != null) {
    out.push(aux.data);
    aux = aux.next;
  }
  return out;
}

describe("List.delete", () => {
  test("decrementa length al borrar un elemento existente", () => {
    const l = new List();
    l.push(1);
    l.push(2);
    l.push(3);
    expect(l.length).toBe(3);

    l.delete(2);
    expect(l.length).toBe(2);
    expect(toArray(l)).toEqual([1, 3]);
  });

  test("no cambia length al borrar un elemento inexistente", () => {
    const l = new List();
    l.push(1);
    l.push(2);
    l.delete(99);
    expect(l.length).toBe(2);
    expect(toArray(l)).toEqual([1, 2]);
  });

  test("borrar la cola deja this.last sincronizado: el siguiente push encadena bien", () => {
    const l = new List();
    l.push(1);
    l.push(2);
    l.push(3);

    l.delete(3); // borra la cola
    expect(l.length).toBe(2);
    expect(l.last.data).toBe(2);
    expect(l.getLastElement()).toBe(l.last);

    l.push(9); // si this.last quedó colgado, esto corrompería la lista
    expect(l.length).toBe(3);
    expect(toArray(l)).toEqual([1, 2, 9]);
    expect(l.last.data).toBe(9);
    expect(l.getLastElement()).toBe(l.last);
  });

  test("borrar la cabeza actualiza head y last cuando queda un solo nodo", () => {
    const l = new List();
    l.push(1);
    l.push(2);

    l.delete(1); // borra la cabeza
    expect(l.length).toBe(1);
    expect(l.head.data).toBe(2);

    l.push(5);
    expect(toArray(l)).toEqual([2, 5]);
    expect(l.last.data).toBe(5);
  });

  test("borrar el único elemento deja la lista vacía y reutilizable", () => {
    const l = new List();
    l.push(7);
    l.delete(7);
    expect(l.length).toBe(0);
    expect(l.head).toBeNull();

    l.push(8);
    expect(toArray(l)).toEqual([8]);
    expect(l.last.data).toBe(8);
  });

  test("delete sobre lista vacía devuelve null", () => {
    const l = new List();
    expect(l.delete(1)).toBeNull();
    expect(l.length).toBe(0);
  });

  test("delete devuelve el dato eliminado", () => {
    const l = new List();
    l.push(1);
    l.push(2);
    expect(l.delete(2)).toBe(2);
    expect(l.delete(1)).toBe(1);
  });
});

describe("List.push", () => {
  test("encadena los elementos en orden de inserción", () => {
    const l = new List();
    l.push(1);
    l.push(2);
    l.push(3);
    expect(toArray(l)).toEqual([1, 2, 3]);
    expect(l.head.data).toBe(1);
    expect(l.last.data).toBe(3);
  });
});

describe("List.getLastElement", () => {
  test("lista vacía devuelve null", () => {
    expect(new List().getLastElement()).toBeNull();
  });

  test("devuelve el último nodo", () => {
    const l = new List();
    l.push(1);
    l.push(2);
    l.push(9);
    expect(l.getLastElement().data).toBe(9);
  });
});

describe("List.getElementByIndex", () => {
  test("devuelve el nodo en la posición pedida (base 0)", () => {
    const l = new List();
    l.push(10);
    l.push(20);
    l.push(30);
    expect(l.getElementByIndex(0).data).toBe(10);
    expect(l.getElementByIndex(2).data).toBe(30);
  });

  test("índice negativo devuelve null", () => {
    const l = new List();
    l.push(1);
    expect(l.getElementByIndex(-1)).toBeNull();
  });

  test("índice fuera de rango devuelve null", () => {
    const l = new List();
    l.push(1);
    expect(l.getElementByIndex(5)).toBeNull();
  });
});

describe("List.find", () => {
  test("encuentra el primer nodo con el valor", () => {
    const l = new List();
    l.push(1);
    l.push(2);
    l.push(3);
    expect(l.find(2).data).toBe(2);
  });

  test("devuelve null si el valor no existe", () => {
    const l = new List();
    l.push(1);
    expect(l.find(99)).toBeNull();
  });
});

describe("List.deleteByNode", () => {
  test("elimina un nodo intermedio copiando el dato del siguiente", () => {
    const l = new List();
    l.push(1);
    l.push(2);
    l.push(3);
    const node = l.getElementByIndex(0); // nodo con data 1
    l.deleteByNode(node);
    expect(toArray(l)).toEqual([2, 3]);
    expect(l.length).toBe(2);
  });

  test("eliminar el penúltimo nodo deja this.last sincronizado", () => {
    const l = new List();
    l.push(1);
    l.push(2);
    l.push(3);
    const node = l.getElementByIndex(1); // nodo con data 2
    l.deleteByNode(node);
    expect(toArray(l)).toEqual([1, 3]);
    expect(l.last.data).toBe(3);
  });

  test("no puede eliminar la cola (no hay siguiente del cual copiar): devuelve null", () => {
    const l = new List();
    l.push(1);
    l.push(2);
    expect(l.deleteByNode(l.last)).toBeNull();
    expect(toArray(l)).toEqual([1, 2]);
  });
});

describe("List.print", () => {
  test("imprime cada dato en orden", () => {
    const l = new List();
    l.push("a");
    l.push("b");
    const spy = jest.spyOn(console, "log").mockImplementation(() => {});
    l.print();
    expect(spy.mock.calls.map((c) => c[0])).toEqual(["a", "b"]);
    spy.mockRestore();
  });
});

describe("List Node", () => {
  test("se construye con next en null", () => {
    const n = new Node(3);
    expect(n.data).toBe(3);
    expect(n.next).toBeNull();
  });
});
