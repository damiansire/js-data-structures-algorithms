/**
 * Buffer circular (ring buffer): una cola FIFO sobre un arreglo de tamaño fijo
 * cuyos índices dan la vuelta (módulo capacidad). Cuando está lleno, `write()`
 * sobrescribe el elemento más viejo — el patrón de memoria acotada que usan los
 * buffers de audio, logs y streaming, donde reservás memoria una sola vez y la
 * reutilizás en círculo.
 */
class CircularBuffer {
  /**
   * @param {number} capacity Cantidad fija de slots. Debe ser un entero > 0.
   */
  constructor(capacity) {
    if (!Number.isInteger(capacity) || capacity <= 0) {
      throw new RangeError(`capacity debe ser un entero > 0, recibí ${capacity}`);
    }
    /** @type {number} */
    this.capacity = capacity;
    /** @type {Array<*>} Almacenamiento fijo; las posiciones vacías son undefined. */
    this.buffer = new Array(capacity).fill(undefined);
    /** @type {number} Próxima posición de escritura. */
    this.head = 0;
    /** @type {number} Posición del elemento más viejo (próxima lectura). */
    this.tail = 0;
    /** @type {number} Elementos ocupados. */
    this.count = 0;
  }

  /**
   * Cantidad de elementos ocupados. O(1).
   * @returns {number}
   */
  size() {
    return this.count;
  }

  /**
   * Indica si el buffer está vacío. O(1).
   * @returns {boolean}
   */
  isEmpty() {
    return this.count === 0;
  }

  /**
   * Indica si el buffer está lleno. O(1).
   * @returns {boolean}
   */
  isFull() {
    return this.count === this.capacity;
  }

  /**
   * Escribe un elemento en la cabeza. Si está lleno, sobrescribe el más viejo y
   * avanza la cola. O(1).
   * @param {*} element Valor a escribir.
   * @returns {*} El valor sobrescrito si estaba lleno; en otro caso, undefined.
   */
  write(element) {
    const overwritten = this.isFull() ? this.buffer[this.head] : undefined;
    this.buffer[this.head] = element;
    this.head = (this.head + 1) % this.capacity;
    if (this.isFull()) {
      // Se pisó el más viejo: la cola también avanza.
      this.tail = (this.tail + 1) % this.capacity;
    } else {
      this.count++;
    }
    return overwritten;
  }

  /**
   * Lee y quita el elemento más viejo. O(1).
   * @throws {Error} Si el buffer está vacío.
   * @returns {*} El elemento más viejo.
   */
  read() {
    if (this.isEmpty()) {
      throw new Error('No se puede leer de un buffer circular vacio');
    }
    const value = this.buffer[this.tail];
    this.buffer[this.tail] = undefined;
    this.tail = (this.tail + 1) % this.capacity;
    this.count--;
    return value;
  }

  /**
   * Devuelve el elemento más viejo sin quitarlo. O(1).
   * @returns {*} El más viejo, o null si está vacío.
   */
  peek() {
    return this.isEmpty() ? null : this.buffer[this.tail];
  }

  /**
   * Vuelca el contenido del más viejo al más nuevo, en orden. O(n).
   * @returns {Array<*>} Los elementos ocupados en orden FIFO.
   */
  toArray() {
    const out = [];
    for (let i = 0; i < this.count; i++) {
      out.push(this.buffer[(this.tail + i) % this.capacity]);
    }
    return out;
  }
}

module.exports = { CircularBuffer };
