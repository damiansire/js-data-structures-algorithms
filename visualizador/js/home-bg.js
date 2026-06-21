// Fondo animado global: una "constelación" de nodos conectados (estética de
// grafo) que derivan suavemente, con pulsos que viajan por las aristas — un
// guiño a los algoritmos de grafos. Liviano (canvas + rAF), respeta
// prefers-reduced-motion y se pausa cuando la pestaña no está visible.

let started = false;

export function startConstellation() {
  if (started) return;
  started = true;

  const canvas = document.createElement('canvas');
  canvas.className = 'constellation';
  canvas.setAttribute('aria-hidden', 'true');
  // se inserta al principio del body para quedar detrás del contenido
  document.body.insertBefore(canvas, document.body.firstChild);
  const ctx = canvas.getContext('2d');

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let W = 0;
  let H = 0;
  let dpr = 1;
  let nodes = [];
  let pulses = [];

  const COUNT = 46; // cantidad de nodos
  const LINK = 150; // distancia máxima para dibujar una arista (px)
  const rnd = (a, b) => a + Math.random() * (b - a);

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function seed() {
    nodes = Array.from({ length: COUNT }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: rnd(-0.18, 0.18),
      vy: rnd(-0.18, 0.18),
      r: rnd(1.1, 2.6),
      hue: rnd(200, 320), // cian → violeta
    }));
    pulses = [];
  }

  // un pulso viaja del nodo a→b; al llegar salta a un vecino del destino
  function spawnPulse() {
    if (nodes.length < 2) return;
    const a = (Math.random() * nodes.length) | 0;
    let b = (Math.random() * nodes.length) | 0;
    if (b === a) b = (b + 1) % nodes.length;
    pulses.push({ a, b, t: 0, speed: rnd(0.004, 0.011), hue: rnd(190, 320) });
  }

  function nearestNeighbor(i, exclude) {
    let best = -1;
    let bestD = Infinity;
    for (let k = 0; k < nodes.length; k++) {
      if (k === i || k === exclude) continue;
      const dx = nodes[k].x - nodes[i].x;
      const dy = nodes[k].y - nodes[i].y;
      const d = dx * dx + dy * dy;
      if (d < bestD) {
        bestD = d;
        best = k;
      }
    }
    return best;
  }

  function step() {
    ctx.clearRect(0, 0, W, H);

    // mover nodos
    for (const n of nodes) {
      n.x += n.vx;
      n.y += n.vy;
      if (n.x < -20) n.x = W + 20;
      if (n.x > W + 20) n.x = -20;
      if (n.y < -20) n.y = H + 20;
      if (n.y > H + 20) n.y = -20;
    }

    // aristas
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const dist = Math.hypot(dx, dy);
        if (dist < LINK) {
          const a = (1 - dist / LINK) * 0.16;
          ctx.strokeStyle = `rgba(150,170,255,${a.toFixed(3)})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.stroke();
        }
      }
    }

    // nodos
    for (const n of nodes) {
      ctx.beginPath();
      ctx.fillStyle = `hsla(${n.hue | 0},90%,72%,0.55)`;
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fill();
    }

    // pulsos viajando por aristas
    for (let p = pulses.length - 1; p >= 0; p--) {
      const pl = pulses[p];
      const A = nodes[pl.a];
      const B = nodes[pl.b];
      pl.t += pl.speed;
      const x = A.x + (B.x - A.x) * pl.t;
      const y = A.y + (B.y - A.y) * pl.t;
      const grd = ctx.createRadialGradient(x, y, 0, x, y, 6);
      grd.addColorStop(0, `hsla(${pl.hue | 0},95%,75%,0.9)`);
      grd.addColorStop(1, `hsla(${pl.hue | 0},95%,75%,0)`);
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, Math.PI * 2);
      ctx.fill();
      if (pl.t >= 1) {
        // salta a un vecino del destino (recorrido tipo grafo)
        const next = nearestNeighbor(pl.b, pl.a);
        if (next >= 0 && pulses.length < 14) {
          pl.a = pl.b;
          pl.b = next;
          pl.t = 0;
        } else {
          pulses.splice(p, 1);
        }
      }
    }

    // mantener un caudal de pulsos
    if (pulses.length < 7 && Math.random() < 0.04) spawnPulse();
  }

  let raf = 0;
  let running = false;
  function loop() {
    if (!running) return;
    step();
    raf = requestAnimationFrame(loop);
  }
  function start() {
    if (running) return;
    running = true;
    raf = requestAnimationFrame(loop);
  }
  function stop() {
    running = false;
    cancelAnimationFrame(raf);
  }

  window.addEventListener('resize', () => {
    resize();
    seed();
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop();
    else if (!reduce) start();
  });

  resize();
  seed();
  for (let i = 0; i < 5; i++) spawnPulse();

  if (reduce) {
    step(); // un único frame estático
  } else {
    start();
  }
}
