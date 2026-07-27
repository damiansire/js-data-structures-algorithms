/**
 * @jest-environment jsdom
 */
// El Player es el motor de las 40 escenas con transporte y no tenía una sola
// línea cubierta: play/toggle/restart/setSpeed estaban en FNDA:0. Los tests de
// componente sólo tocaban Step y Reset, así que el camino principal del
// producto (botón Play, slider de velocidad, Replay tras terminar) nunca se
// ejecutaba en CI.
//
// Interesa especialmente el invariante que el propio código documenta: restart()
// guarda `_restartTimer` para que pause()/destroy() lo cancelen y no dispare
// play() sobre un Player ya destruido (bug del "timer zombie"). Sin test, ese
// guard parece código muerto y un refactor lo borra con CI en verde.
import { jest } from '@jest/globals';
import { Player, buildTransport } from './player.js';

/** Player con `apply` espía sobre N pasos numerados, sin DOM. */
function makePlayer(total = 5, opts = {}) {
  const steps = Array.from({ length: total }, (_, i) => ({ type: 'step', i }));
  const apply = jest.fn((step) => `paso ${step.i}`);
  const reset = jest.fn();
  const onChange = jest.fn();
  const player = new Player({ steps, apply, reset, onChange, baseDelay: 100, ...opts });
  return { player, steps, apply, reset, onChange };
}

describe('Player', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  test('play() avanza todos los pasos y se auto-pausa al terminar', () => {
    const { player, apply } = makePlayer(5);
    player.play();
    expect(player.playing).toBe(true);
    jest.runAllTimers();
    expect(apply).toHaveBeenCalledTimes(5);
    expect(player.index).toBe(5);
    expect(player.done).toBe(true);
    expect(player.playing).toBe(false);
  });

  test('play() sobre un player ya terminado no hace nada', () => {
    const { player, apply } = makePlayer(2);
    player.play();
    jest.runAllTimers();
    apply.mockClear();
    player.play();
    jest.runAllTimers();
    expect(apply).not.toHaveBeenCalled();
  });

  test('setSpeed(2) parte a la mitad la demora entre pasos', () => {
    const { player, apply } = makePlayer(5);
    expect(player._delay()).toBe(100);
    player.setSpeed(2);
    expect(player._delay()).toBe(50);

    player.play();
    // arranque: baseDelay * 0.35 / speed
    jest.advanceTimersByTime(50 * 0.35);
    expect(apply).toHaveBeenCalledTimes(1);
    jest.advanceTimersByTime(50);
    expect(apply).toHaveBeenCalledTimes(2);
    // a velocidad 1 todavía no habría llegado el segundo paso
    jest.advanceTimersByTime(49);
    expect(apply).toHaveBeenCalledTimes(2);
  });

  test('pause() a mitad de reproducción congela el índice', () => {
    const { player, apply } = makePlayer(10);
    player.play();
    jest.advanceTimersByTime(100 * 0.35 + 100); // 2 pasos
    const frozen = player.index;
    player.pause();
    expect(player.playing).toBe(false);
    jest.advanceTimersByTime(10_000);
    expect(player.index).toBe(frozen);
    expect(apply).toHaveBeenCalledTimes(frozen);
  });

  test('toggle() alterna play/pause y, si terminó, reinicia y vuelve a reproducir', () => {
    const { player, apply, reset } = makePlayer(3);
    player.toggle(); // play
    expect(player.playing).toBe(true);
    player.toggle(); // pause
    expect(player.playing).toBe(false);

    player.play();
    jest.runAllTimers();
    expect(player.done).toBe(true);
    apply.mockClear();

    player.toggle(); // done -> restart()
    expect(reset).toHaveBeenCalled();
    expect(player.index).toBe(0);
    jest.advanceTimersByTime(120); // el respiro que restart() se toma
    expect(player.playing).toBe(true);
    jest.runAllTimers();
    expect(apply).toHaveBeenCalledTimes(3);
  });

  test('destroy() con un restart pendiente NO dispara play() (timer zombie)', () => {
    const { player, apply } = makePlayer(3);
    player.play();
    jest.runAllTimers();
    apply.mockClear();

    player.restart(); // deja _restartTimer armado
    expect(player._restartTimer).not.toBeNull();
    player.destroy(); // debe cancelarlo
    expect(player._restartTimer).toBeNull();

    jest.runAllTimers();
    expect(player.playing).toBe(false);
    expect(apply).not.toHaveBeenCalled();
  });

  test('stepOnce() avanza exactamente un paso y deja el player en pausa', () => {
    const { player, apply } = makePlayer(4);
    player.play();
    player.stepOnce();
    expect(player.playing).toBe(false);
    expect(player.index).toBe(1);
    apply.mockClear();
    jest.runAllTimers();
    expect(apply).not.toHaveBeenCalled();
  });

  test('reset() vuelve al principio, llama al reset de la escena y cancela timers', () => {
    const { player, reset } = makePlayer(5);
    player.play();
    jest.advanceTimersByTime(100 * 0.35 + 100);
    player.reset();
    expect(reset).toHaveBeenCalledTimes(1);
    expect(player.index).toBe(0);
    expect(player.playing).toBe(false);
    expect(player._timer).toBeNull();
  });

  test('next() en el último paso pausa y devuelve false', () => {
    const { player } = makePlayer(1);
    expect(player.next()).toBe(true);
    expect(player.next()).toBe(false);
    expect(player.playing).toBe(false);
  });

  test('onChange recibe la narración que devolvió apply', () => {
    const { player, onChange } = makePlayer(2);
    player.stepOnce();
    const last = onChange.mock.calls.at(-1)[0];
    expect(last).toMatchObject({ index: 1, total: 2, playing: false, narration: 'paso 0' });
  });
});

describe('buildTransport', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  test('el slider de velocidad llega hasta setSpeed y actualiza la etiqueta', () => {
    const { player } = makePlayer(5);
    const { bar } = buildTransport(player);
    const slider = bar.querySelector('input[type="range"]');
    slider.value = '2.5';
    slider.dispatchEvent(new Event('input'));
    expect(player.speed).toBe(2.5);
    expect(bar.querySelector('.mono').textContent).toBe('2.5×');
  });

  test('sync() refleja play / done en el botón primario y en el progreso', () => {
    const { player } = makePlayer(3);
    const { bar, sync } = buildTransport(player);
    const primary = bar.querySelector('.tbtn.primary');
    const progress = bar.querySelector('.progress');

    sync({ index: 1, total: 3, playing: true, done: false });
    expect(primary.innerHTML).toContain('Pause');
    expect(progress.textContent).toBe('1 / 3');

    sync({ index: 3, total: 3, playing: false, done: true });
    expect(primary.innerHTML).toContain('Replay');
    expect(bar.querySelectorAll('.tbtn')[1].disabled).toBe(true);
  });

  test('los botones del transporte manejan el player real', () => {
    const { player, apply, reset } = makePlayer(4);
    const { bar } = buildTransport(player);
    const [playBtn, stepBtn, resetBtn] = bar.querySelectorAll('.tbtn');

    stepBtn.click();
    expect(apply).toHaveBeenCalledTimes(1);

    playBtn.click();
    expect(player.playing).toBe(true);
    jest.runAllTimers();
    expect(player.done).toBe(true);

    resetBtn.click();
    expect(reset).toHaveBeenCalled();
    expect(player.index).toBe(0);
  });
});
