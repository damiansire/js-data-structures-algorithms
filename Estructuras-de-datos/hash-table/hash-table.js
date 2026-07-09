/**
 * Tabla hash con encadenamiento separado (separate chaining): un arreglo fijo de
 * "buckets"; una función hash mapea cada clave a un bucket, y las claves que caen
 * en el mismo bucket (colisiones) se guardan encadenadas en una lista. Es el
 * mapa clave→posición-de-memoria que está detrás de objetos, diccionarios y sets.
 */
class HashTable {
  /**
   * @param {number} [capacity=8] Cantidad de buckets. Debe ser un entero > 0.
   */
  constructor(capacity = 8) {
    if (!Number.isInteger(capacity) || capacity <= 0) {
      throw new RangeError(`capacity debe ser un entero > 0, recibí ${capacity}`);
    }
    /** @type {number} */
    this.capacity = capacity;
    /** @type {Array<Array<{key: *, value: *}>>} Un bucket (lista de entradas) por posición. */
    this.buckets = Array.from({ length: capacity }, () => []);
    /** @type {number} Cantidad de pares almacenados. */
    this.count = 0;
  }

  /**
   * Función hash determinista (djb2-ish) que mapea una clave a un índice de
   * bucket en `[0, capacity)`. O(len(key)).
   * @param {*} key Clave (se convierte a string).
   * @returns {number} Índice de bucket.
   */
  hash(key) {
    const s = String(key);
    let h = 0;
    for (let i = 0; i < s.length; i++) {
      h = (h * 31 + s.charCodeAt(i)) >>> 0;
    }
    return h % this.capacity;
  }

  /**
   * Inserta o actualiza el valor de una clave. O(1) promedio. O(n) en el peor
   * caso (todas las claves colisionan en un bucket).
   * @param {*} key Clave.
   * @param {*} value Valor a asociar.
   * @returns {boolean} true si insertó una clave nueva; false si actualizó una existente.
   */
  set(key, value) {
    const bucket = this.buckets[this.hash(key)];
    const entry = bucket.find((e) => e.key === key);
    if (entry) {
      entry.value = value;
      return false;
    }
    bucket.push({ key, value });
    this.count++;
    return true;
  }

  /**
   * Devuelve el valor asociado a una clave. O(1) promedio.
   * @param {*} key Clave.
   * @returns {*} El valor, o undefined si la clave no existe.
   */
  get(key) {
    const entry = this.buckets[this.hash(key)].find((e) => e.key === key);
    return entry ? entry.value : undefined;
  }

  /**
   * Indica si una clave está presente. O(1) promedio.
   * @param {*} key Clave.
   * @returns {boolean}
   */
  has(key) {
    return this.buckets[this.hash(key)].some((e) => e.key === key);
  }

  /**
   * Elimina una clave. O(1) promedio.
   * @param {*} key Clave.
   * @returns {boolean} true si eliminó algo; false si la clave no existía.
   */
  delete(key) {
    const bucket = this.buckets[this.hash(key)];
    const i = bucket.findIndex((e) => e.key === key);
    if (i < 0) return false;
    bucket.splice(i, 1);
    this.count--;
    return true;
  }

  /**
   * Cantidad de pares almacenados. O(1).
   * @returns {number}
   */
  size() {
    return this.count;
  }
}

module.exports = { HashTable };
