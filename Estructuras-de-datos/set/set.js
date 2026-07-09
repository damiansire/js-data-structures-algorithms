/**
 * Conjunto (hash set) con encadenamiento separado: guarda valores ÚNICOS y
 * responde `has()` en O(1) promedio. Igual que una tabla hash, pero sin valores
 * asociados: la clave ES el elemento, y `add()` de un valor ya presente no hace
 * nada. Es lo que está detrás de la deduplicación y las operaciones de conjuntos.
 */
class HashSet {
  /**
   * @param {number} [capacity=8] Cantidad de buckets. Debe ser un entero > 0.
   */
  constructor(capacity = 8) {
    if (!Number.isInteger(capacity) || capacity <= 0) {
      throw new RangeError(`capacity debe ser un entero > 0, recibí ${capacity}`);
    }
    this.capacity = capacity;
    /** @type {Array<Array<*>>} Un bucket (lista de valores) por posición. */
    this.buckets = Array.from({ length: capacity }, () => []);
    this.count = 0;
  }

  /**
   * Función hash determinista → índice de bucket en `[0, capacity)`. O(len).
   * @param {*} value
   * @returns {number}
   */
  hash(value) {
    const s = String(value);
    let h = 0;
    for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
    return h % this.capacity;
  }

  /**
   * Agrega un valor si no estaba. O(1) promedio.
   * @param {*} value
   * @returns {boolean} true si lo agregó (era nuevo); false si ya estaba.
   */
  add(value) {
    const bucket = this.buckets[this.hash(value)];
    if (bucket.includes(value)) return false;
    bucket.push(value);
    this.count++;
    return true;
  }

  /**
   * Indica si el valor está en el conjunto. O(1) promedio.
   * @param {*} value
   * @returns {boolean}
   */
  has(value) {
    return this.buckets[this.hash(value)].includes(value);
  }

  /**
   * Elimina un valor. O(1) promedio.
   * @param {*} value
   * @returns {boolean} true si eliminó algo; false si no estaba.
   */
  delete(value) {
    const bucket = this.buckets[this.hash(value)];
    const i = bucket.indexOf(value);
    if (i < 0) return false;
    bucket.splice(i, 1);
    this.count--;
    return true;
  }

  /**
   * Cantidad de elementos únicos. O(1).
   * @returns {number}
   */
  size() {
    return this.count;
  }

  /**
   * Todos los valores del conjunto (orden no garantizado). O(n).
   * @returns {Array<*>}
   */
  values() {
    return this.buckets.flat();
  }
}

module.exports = { HashSet };
