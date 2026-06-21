const { List } = require("./list");

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
});
