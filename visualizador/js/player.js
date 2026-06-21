// Motor de reproducción para escenas basadas en "pasos" (steps).
//
// Una escena entrega una lista de pasos y una función `apply(step, ctx)`.
// El Player recorre los pasos con una demora ajustable y dispara `apply`.
// Soporta play/pause, avanzar un paso, reiniciar y cambiar velocidad.
//
// El retroceso se resuelve reiniciando y re-aplicando hasta el índice (sin
// animación), lo que mantiene la lógica de cada escena simple e idempotente.

import { el } from './dom.js';
import { t } from './i18n.js';

export class Player {
  /**
   * @param {object}   opts
   * @param {any[]}    opts.steps   Lista de pasos a reproducir.
   * @param {Function} opts.apply   (step, { index, total, animate }) => narración|void
   * @param {Function} [opts.reset] Restablece el lienzo al estado inicial.
   * @param {Function} [opts.onChange] (state) => void  Notifica cambios de UI.
   * @param {number}   [opts.baseDelay=720] Demora base por paso en ms.
   */
  constructor({ steps, apply, reset, onChange, baseDelay = 720 }) {
    this.steps = steps;
    this.apply = apply;
    this._reset = reset || (() => {});
    this.onChange = onChange || (() => {});
    this.baseDelay = baseDelay;
    this.index = 0; // próximo paso a aplicar
    this.speed = 1;
    this.playing = false;
    this._timer = null;
    this._restartTimer = null;
  }

  get total() {
    return this.steps.length;
  }
  get done() {
    return this.index >= this.total;
  }

  _emit(narration) {
    this.onChange({
      index: this.index,
      total: this.total,
      playing: this.playing,
      done: this.done,
      narration,
    });
  }

  _delay() {
    return this.baseDelay / this.speed;
  }

  /** Aplica el próximo paso con animación. Devuelve true si avanzó. */
  next() {
    if (this.done) {
      this.pause();
      this._emit();
      return false;
    }
    const step = this.steps[this.index];
    const narration = this.apply(step, {
      index: this.index,
      total: this.total,
      animate: true,
    });
    this.index += 1;
    this._emit(narration);
    return true;
  }

  play() {
    if (this.playing || this.done) return;
    this.playing = true;
    this._emit();
    const tick = () => {
      if (!this.playing) return;
      const advanced = this.next();
      if (advanced && !this.done) {
        this._timer = setTimeout(tick, this._delay());
      } else {
        this.pause();
      }
    };
    this._timer = setTimeout(tick, this._delay() * 0.35);
  }

  pause() {
    this.playing = false;
    if (this._timer) clearTimeout(this._timer);
    this._timer = null;
    if (this._restartTimer) clearTimeout(this._restartTimer);
    this._restartTimer = null;
    this._emit();
  }

  toggle() {
    this.playing ? this.pause() : this.done ? this.restart() : this.play();
  }

  /** Avanza un solo paso (en pausa). */
  stepOnce() {
    this.pause();
    this.next();
  }

  reset() {
    this.pause();
    this.index = 0;
    this._reset();
    this._emit();
  }

  restart() {
    this.reset(); // reset() -> pause() ya limpia cualquier _restartTimer pendiente
    // pequeño respiro para que el reset pinte antes de arrancar.
    // Se guarda el id para que pause()/destroy() puedan cancelarlo y no se
    // dispare play() sobre un Player ya destruido.
    this._restartTimer = setTimeout(() => {
      this._restartTimer = null;
      this.play();
    }, 120);
  }

  setSpeed(v) {
    this.speed = v;
    this._emit();
  }

  destroy() {
    this.pause();
  }
}

/**
 * Construye la barra de transporte estándar y la enlaza a un Player.
 * Devuelve { bar } para insertar en el DOM.
 */
export function buildTransport(player) {
  const playBtn = el('button', { class: 'tbtn primary' }, t('tp_play'));
  const stepBtn = el('button', { class: 'tbtn', title: t('tp_step_title') }, t('tp_step'));
  const resetBtn = el('button', { class: 'tbtn', title: t('tp_reset_title') }, '↺');
  const speedInput = el('input', {
    type: 'range',
    min: '0.25',
    max: '3',
    step: '0.25',
    value: '1',
  });
  const speedVal = el('span', { class: 'mono' }, '1.0×');
  const progress = el('span', { class: 'progress' }, '0 / ' + player.total);

  playBtn.addEventListener('click', () => player.toggle());
  stepBtn.addEventListener('click', () => player.stepOnce());
  resetBtn.addEventListener('click', () => player.reset());
  speedInput.addEventListener('input', () => {
    const v = parseFloat(speedInput.value);
    speedVal.textContent = v.toFixed(2).replace(/0$/, '') + '×';
    player.setSpeed(v);
  });

  const bar = el(
    'div',
    { class: 'transport' },
    playBtn,
    stepBtn,
    resetBtn,
    el('span', { class: 'spacer' }),
    el('label', { class: 'speed' }, '🐢', speedInput, '🐇', speedVal),
    progress
  );

  // sincroniza el botón con el estado del player
  const sync = (state) => {
    if (state.playing) playBtn.innerHTML = t('tp_pause');
    else if (state.done) playBtn.innerHTML = t('tp_replay');
    else playBtn.innerHTML = t('tp_play');
    stepBtn.disabled = state.done;
    progress.textContent = `${state.index} / ${state.total}`;
  };

  return { bar, sync };
}
