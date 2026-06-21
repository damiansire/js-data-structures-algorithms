const { Stack, Node } = require("./stack");

describe("Stack", () => {
  test("una pila recién creada está vacía", () => {
    const s = new Stack();
    expect(s.isEmpty()).toBe(true);
    expect(s.length()).toBe(0);
    expect(s.peek()).toBeNull();
  });

  test("push agrega elementos en el tope (LIFO)", () => {
    const s = new Stack();
    s.push(1);
    s.push(2);
    s.push(3);
    expect(s.isEmpty()).toBe(false);
    expect(s.length()).toBe(3);
    expect(s.peek()).toBeInstanceOf(Node);
    expect(s.peek().data).toBe(3);
  });

  test("pop quita el último elemento apilado", () => {
    const s = new Stack();
    s.push("a");
    s.push("b");
    s.pop();
    expect(s.length()).toBe(1);
    expect(s.peek().data).toBe("a");
  });

  test("pop hasta vaciar deja la pila reutilizable", () => {
    const s = new Stack();
    s.push(10);
    s.pop();
    expect(s.isEmpty()).toBe(true);
    expect(s.peek()).toBeNull();
    s.push(20);
    expect(s.peek().data).toBe(20);
    expect(s.length()).toBe(1);
  });

  test("pop sobre pila vacía lanza Error", () => {
    const s = new Stack();
    expect(() => s.pop()).toThrow("No se puede hacer pop() sobre una pila vacia");
  });

  test("hasElement encuentra un valor presente y rechaza uno ausente", () => {
    const s = new Stack();
    s.push(1);
    s.push(2);
    s.push(3);
    expect(s.hasElement(2)).toBe(true);
    expect(s.hasElement(3)).toBe(true); // tope
    expect(s.hasElement(1)).toBe(true); // fondo
    expect(s.hasElement(99)).toBe(false);
  });

  test("hasElement en pila vacía devuelve false", () => {
    const s = new Stack();
    expect(s.hasElement(1)).toBe(false);
  });

  test("print recorre del tope al fondo", () => {
    const s = new Stack();
    s.push(1);
    s.push(2);
    s.push(3);
    const spy = jest.spyOn(console, "log").mockImplementation(() => {});
    s.print();
    expect(spy.mock.calls.map((c) => c[0])).toEqual([3, 2, 1]);
    spy.mockRestore();
  });

  test("Node se construye con prev en null", () => {
    const n = new Node(5);
    expect(n.data).toBe(5);
    expect(n.prev).toBeNull();
  });
});
