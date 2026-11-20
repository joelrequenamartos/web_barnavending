// Ruleta de premios para eventos. El premio se elige al pulsar (según la probabilidad de cada uno y sin dar los que se han
// acabado) y la ruleta gira hasta pararse justo en él. Premios, existencias e historial se guardan en este navegador.
(function () {
  // v3 = premios 10 % 30 aniversario / 25 % sobre / 30 % vuelve a tirar / 35 % nada. Al cambiar de versión se
  // cambian los premios guardados en el navegador, pero se conservan los textos y el historial.
  const STORE = 'ruleta-premios-v3', OLD_STORES = ['ruleta-premios-v2', 'ruleta-premios'];
  const LOGO = '../imagenes/logo.png';
  // colores de la web: foil dorado, naranja y rojo, y el azul noche de las tarjetas
  const COLORS = ['#F2C14E', '#151830', '#FF8C00', '#1E2246', '#E53935', '#151830', '#D9A441', '#262A55'];
  // sobre 100: 10 % sobre 30 aniversario, 25 % sobre normal, 30 % vuelve a tirar y 35 % nada
  const EXAMPLE = [
    { emoji: '💎', name: 'Sobre 30 aniversario', weight: 10, left: null },
    { emoji: '😅', name: 'Nada', weight: 35, left: null, win: false },
    { emoji: '🎁', name: 'Sobre', weight: 25, left: null },
    { emoji: '🔁', name: 'Vuelve a tirar', weight: 30, left: null },
  ];
  const newId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const examplePrizes = () => EXAMPLE.map((p, i) => ({ id: newId() + i, color: COLORS[i % COLORS.length], win: true, ...p }));
  const DEFAULTS = {
    eyebrow: 'Evento en SomMultiespai', title: 'Ruleta de premios', sub: 'Gira la ruleta y llévate tu premio',
    place: 'SomMultiespai', message: 'Enséñale esta pantalla a nuestro equipo 🎉', sizeByOdds: false, sound: true,
  };
  let state = { ...DEFAULTS, prizes: examplePrizes(), history: [] };
  try {
    const saved = JSON.parse(localStorage.getItem(STORE) || 'null');
    if (saved && Array.isArray(saved.prizes)) state = { ...state, ...saved };
    else for (const k of OLD_STORES) {
      const old = JSON.parse(localStorage.getItem(k) || 'null');
      if (!old) continue;
      const { prizes, ...rest } = old; // los premios de antes no se usan: van los nuevos
      state = { ...state, ...rest };
      break;
    }
  } catch (e) { /* sin datos guardados */ }
  const save = () => { try { localStorage.setItem(STORE, JSON.stringify(state)); } catch (e) { /* almacenamiento bloqueado */ } };

  const $ = id => document.getElementById(id);
  const canvas = $('rueda'), ctx = canvas.getContext('2d'), puntero = $('puntero');
  const available = () => state.prizes.filter(p => p.left === null || p.left > 0);

  // ── SONIDO (sin archivos: se genera) ──
  let audio = null;
  const ac = () => { audio ||= new (window.AudioContext || window.webkitAudioContext)(); if (audio.state === 'suspended') audio.resume(); return audio; };
  function tone(freq, start, dur, type = 'triangle', vol = .18) {
    const a = ac(), o = a.createOscillator(), g = a.createGain(), t = a.currentTime + start;
    o.type = type; o.frequency.value = freq;
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    o.connect(g).connect(a.destination); o.start(t); o.stop(t + dur + .02);
  }
  const tick = () => { if (state.sound) tone(2200, 0, .035, 'square', .06); };
  const fanfare = win => {
    if (!state.sound) return;
    if (win) [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, i * .09, i === 4 ? .7 : .22));
    else [392, 330].forEach((f, i) => tone(f, i * .16, .3));
  };

  // ── DIBUJO ──
  let size = 0, rot = 0, wheel = null, hub = null, logo = null, segments = [];
  let spin = null; // giro en marcha: { from, to, start, dur, prize, last }
  const lum = hex => { const n = parseInt(hex.slice(1), 16); return (.2126 * (n >> 16) + .7152 * (n >> 8 & 255) + .0722 * (n & 255)) / 255; };
  // porciones (en radianes, empezando en 0) de los premios que quedan
  function layout() {
    const list = available(), total = list.reduce((s, p) => s + (state.sizeByOdds ? p.weight : 1), 0);
    let a = 0;
    segments = list.map(p => { const span = (state.sizeByOdds ? p.weight : 1) / total * Math.PI * 2, s = { p, a0: a, a1: a + span }; a += span; return s; });
  }
  function wrapText(c, text, maxW) {
    const words = text.split(/\s+/), lines = [];
    let line = '';
    words.forEach(w => { const t = line ? line + ' ' + w : w; if (c.measureText(t).width > maxW && line) { lines.push(line); line = w; } else line = t; });
    if (line) lines.push(line);
    return lines;
  }
  // la parte que gira, pintada una vez en un lienzo aparte (se repinta solo si cambian los premios)
  function paintWheel() {
    layout();
    const S = size, c = S / 2, Rt = S / 2 * .96, R = Rt * .87;
    wheel = document.createElement('canvas'); wheel.width = wheel.height = S;
    const x = wheel.getContext('2d');
    if (!segments.length) {
      x.beginPath(); x.arc(c, c, R, 0, Math.PI * 2); x.fillStyle = '#151830'; x.fill();
      x.fillStyle = '#8A8A93'; x.font = `600 ${R * .08}px Inter`; x.textAlign = 'center'; x.textBaseline = 'middle';
      x.fillText('Sin premios: añádelos en ⚙️', c, c + R * .45);
      return;
    }
    segments.forEach(({ p, a0, a1 }) => {
      x.beginPath(); x.moveTo(c, c); x.arc(c, c, R, a0, a1); x.closePath();
      x.fillStyle = p.color; x.fill();
      const g = x.createRadialGradient(c, c, R * .2, c, c, R); // relieve: más luz hacia el borde
      g.addColorStop(0, 'rgba(0,0,0,.18)'); g.addColorStop(.7, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(255,255,255,.12)');
      x.fillStyle = g; x.fill();
      const mid = (a0 + a1) / 2, span = a1 - a0, ink = lum(p.color) > .5 ? '#1a0e00' : '#FFFFFF';
      x.save();
      x.translate(c, c); x.rotate(mid + Math.PI / 2); // aquí «arriba» es hacia el borde y el texto sale derecho al pasar por el puntero
      const es = Math.min(R * .13, R * span * .42);
      x.font = `${es}px "Apple Color Emoji","Segoe UI Emoji",sans-serif`; x.textAlign = 'center'; x.textBaseline = 'middle';
      x.fillText(p.emoji || '🎁', 0, -R * .8);
      const maxW = Math.min(R * .6, 2 * R * .58 * Math.sin(Math.min(span, Math.PI) / 2) * .86);
      // hasta 3 líneas: la letra se encoge hasta que quepa el nombre entero
      let fs = Math.min(R * .085, maxW * .3), lines;
      const fits = () => { x.font = `700 ${fs}px "Space Grotesk", sans-serif`; lines = wrapText(x, p.name, maxW); return lines.length <= 3 && lines.every(l => x.measureText(l).width <= maxW); };
      while (!fits() && fs > R * .03) fs -= 1;
      lines = lines.slice(0, 3);
      x.fillStyle = ink;
      if (ink === '#FFFFFF') { x.shadowColor = 'rgba(0,0,0,.45)'; x.shadowBlur = fs * .3; }
      lines.forEach((l, i) => x.fillText(l, 0, -R * .6 + (i - (lines.length - 1) / 2) * fs * 1.08, maxW));
      x.restore();
    });
    // separadores dorados
    x.strokeStyle = 'rgba(255, 215, 120, .9)'; x.lineWidth = Math.max(2, S * .004);
    segments.forEach(({ a0 }) => { x.beginPath(); x.moveTo(c, c); x.lineTo(c + Math.cos(a0) * R, c + Math.sin(a0) * R); x.stroke(); });
  }
  // el centro y el aro (quietos): aro foil con bombillas y el logo en medio
  function paintHub() {
    const S = size, c = S / 2, Rt = S / 2 * .96, R = Rt * .87;
    hub = document.createElement('canvas'); hub.width = hub.height = S;
    const x = hub.getContext('2d');
    const g = x.createLinearGradient(0, 0, S, S);
    g.addColorStop(0, '#FFE18A'); g.addColorStop(.35, '#D9A441'); g.addColorStop(.6, '#FF8C00'); g.addColorStop(1, '#B4281F');
    x.beginPath(); x.arc(c, c, Rt, 0, Math.PI * 2); x.arc(c, c, R, 0, Math.PI * 2, true);
    x.fillStyle = g; x.fill();
    x.lineWidth = S * .006; x.strokeStyle = '#0A0B16';
    x.beginPath(); x.arc(c, c, R, 0, Math.PI * 2); x.stroke();
    x.beginPath(); x.arc(c, c, Rt, 0, Math.PI * 2); x.stroke();
    const hr = R * .2;
    x.save();
    x.shadowColor = 'rgba(0,0,0,.6)'; x.shadowBlur = S * .03;
    x.beginPath(); x.arc(c, c, hr * 1.12, 0, Math.PI * 2); x.fillStyle = g; x.fill();
    x.restore();
    x.save();
    x.beginPath(); x.arc(c, c, hr, 0, Math.PI * 2); x.clip();
    x.fillStyle = '#0A0B16'; x.fillRect(c - hr, c - hr, hr * 2, hr * 2);
    if (logo) x.drawImage(logo, c - hr, c - hr, hr * 2, hr * 2);
    x.restore();
  }
  let lightsT = 0;
  function frame(now) {
    if (!wheel) return;
    const S = size, c = S / 2, Rt = S / 2 * .96, R = Rt * .87;
    ctx.clearRect(0, 0, S, S);
    ctx.save(); ctx.translate(c, c); ctx.rotate(rot); ctx.drawImage(wheel, -c, -c); ctx.restore();
    ctx.drawImage(hub, 0, 0);
    // bombillas: una ola lenta en reposo, parpadeo rápido al girar
    const n = 28, rb = (R + Rt) / 2, br = (Rt - R) * .2, fast = spin ? 1 : 0;
    lightsT = now / 1000;
    for (let i = 0; i < n; i++) {
      const a = i / n * Math.PI * 2;
      const on = fast ? ((i + Math.floor(lightsT * 12)) % 2 === 0) : .5 + .5 * Math.sin(lightsT * 3 - i * .7) > .5;
      const bx = c + Math.cos(a) * rb, by = c + Math.sin(a) * rb;
      ctx.beginPath(); ctx.arc(bx, by, br, 0, Math.PI * 2);
      ctx.fillStyle = on ? '#FFF6D8' : 'rgba(80, 30, 0, .55)';
      ctx.shadowColor = on ? 'rgba(255, 230, 150, .95)' : 'transparent'; ctx.shadowBlur = on ? br * 3 : 0;
      ctx.fill();
    }
    ctx.shadowBlur = 0;
  }
  function resize() {
    const css = canvas.getBoundingClientRect().width;
    const S = Math.round(css * Math.min(2, window.devicePixelRatio || 1));
    if (!S || S === size) return;
    size = canvas.width = canvas.height = S;
    paintWheel(); paintHub();
  }
  new ResizeObserver(resize).observe(canvas);
  (function loop() { requestAnimationFrame(loop); const now = performance.now(); if (spin) step(now); frame(now); })();

  // ── GIRO ──
  const indexAt = r => { // porción bajo el puntero (arriba) con la ruleta girada r
    const a = ((-Math.PI / 2 - r) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
    return segments.findIndex(s => a >= s.a0 && a < s.a1);
  };
  const ease = t => 1 - Math.pow(1 - t, 4);
  function pick(list) {
    const total = list.reduce((s, p) => s + p.weight, 0);
    let r = Math.random() * total;
    for (const p of list) { r -= p.weight; if (r < 0) return p; }
    return list[list.length - 1];
  }
  function start() {
    if (spin || !$('premio').hidden || !segments.length) return;
    ac();
    const prize = pick(segments.map(s => s.p)), seg = segments.find(s => s.p === prize);
    const a = seg.a0 + (seg.a1 - seg.a0) * (.15 + Math.random() * .7); // un punto al azar dentro de su porción (sin rozar el borde)
    const base = -Math.PI / 2 - a, turns = 6 + Math.floor(Math.random() * 3);
    const to = base + Math.PI * 2 * Math.ceil((rot + turns * Math.PI * 2 - base) / (Math.PI * 2));
    spin = { from: rot, to, start: performance.now(), dur: 5200 + Math.random() * 1400, prize, last: indexAt(rot) };
    $('btnGirar').disabled = true;
  }
  function step(now) {
    const t = Math.min(1, (now - spin.start) / spin.dur);
    rot = spin.from + (spin.to - spin.from) * ease(t);
    const i = indexAt(rot);
    if (i !== spin.last) {
      spin.last = i; tick();
      puntero.classList.add('toque');
      requestAnimationFrame(() => puntero.classList.remove('toque'));
    }
    if (t >= 1) finish();
  }
  function finish() {
    const p = spin.prize;
    spin = null;
    rot %= Math.PI * 2;
    if (p.left !== null) p.left = Math.max(0, p.left - 1);
    state.history.unshift({ id: p.id, emoji: p.emoji, name: p.name, t: Date.now() });
    state.history = state.history.slice(0, 500);
    save();
    showPrize(p);
  }
  // «Vuelve a tirar» / «Tira otra vez»: no es premio ni fallo, al cerrar vuelve a girar sola
  const isRetry = p => /\btira(r)?\b|otra vez/i.test(p.name);
  let again = false;
  function showPrize(p) {
    const win = p.win !== false;
    again = win && isRetry(p);
    $('premio').classList.toggle('sin-premio', !win);
    $('premioEyebrow').textContent = again ? '¡Otra oportunidad!' : win ? '¡Enhorabuena!' : '¡Uy, casi!';
    $('premioEmoji').textContent = p.emoji || '🎁';
    $('premioNombre').textContent = p.name;
    $('premioMensaje').textContent = again ? 'Gira otra vez la ruleta 🍀' : win ? state.message : 'Suerte la próxima vez 💛';
    $('btnSeguir').textContent = again ? 'Girar otra vez' : 'Seguir';
    $('premio').hidden = false;
    $('btnSeguir').focus();
    fanfare(win);
    if (win && !again) confetti();
    refresh();
  }
  function closePrize() {
    $('premio').hidden = true;
    $('btnGirar').disabled = false;
    paintWheel(); // si un premio se ha acabado, desaparece ahora
    if (again) { again = false; start(); }
  }

  // ── CONFETI ──
  function confetti() {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const cv = $('confeti'), x = cv.getContext('2d'), k = Math.min(2, devicePixelRatio || 1);
    cv.width = innerWidth * k; cv.height = innerHeight * k;
    const cols = ['#FFD700', '#FF8C00', '#FF4444', '#D9A441', '#FFFFFF'];
    const parts = Array.from({ length: 180 }, () => ({
      x: cv.width / 2 + (Math.random() - .5) * cv.width * .3, y: cv.height * .55,
      vx: (Math.random() - .5) * 26 * k, vy: -(12 + Math.random() * 20) * k, r: (4 + Math.random() * 6) * k,
      a: Math.random() * 6, va: (Math.random() - .5) * .4, c: cols[Math.floor(Math.random() * cols.length)],
    }));
    const t0 = performance.now();
    (function draw(now) {
      const t = (now - t0) / 1000;
      x.clearRect(0, 0, cv.width, cv.height);
      if (t > 3.5) return;
      parts.forEach(p => {
        p.vy += .55 * k; p.vx *= .99; p.x += p.vx; p.y += p.vy; p.a += p.va;
        x.save(); x.translate(p.x, p.y); x.rotate(p.a); x.globalAlpha = Math.min(1, 3.5 - t);
        x.fillStyle = p.c; x.fillRect(-p.r, -p.r * .4, p.r * 2, p.r * .8);
        x.restore();
      });
      requestAnimationFrame(draw);
    })(t0);
  }

  // ── TEXTOS, QUEDAN E HISTORIAL ──
  const esc = s => String(s).replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[ch]);
  function refresh() {
    $('eyebrow').textContent = state.eyebrow;
    $('titulo').innerHTML = `<span class="text-grad">${esc(state.title)}</span>`;
    $('sub').textContent = state.sub;
    $('lugar').textContent = state.place;
    $('lugar').parentElement.hidden = !state.place.trim();
    document.title = `${state.title} — TCG Barna Vending`;
    $('btnSonido').textContent = state.sound ? '🔊' : '🔇';
    $('quedan').innerHTML = state.prizes.filter(p => p.left !== null)
      .map(p => `<span class="${p.left <= 2 ? 'pocos' : ''}">${esc(p.emoji)} ${esc(p.name)}: ${p.left ? `quedan ${p.left}` : 'agotado'}</span>`).join('');
    const h = state.history;
    $('giros').textContent = `${h.length} ${h.length === 1 ? 'giro' : 'giros'}`;
    $('historial').innerHTML = h.length
      ? h.slice(0, 30).map(e => `<li><span>${esc(e.emoji)}</span><span>${esc(e.name)}</span><time>${new Date(e.t).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</time></li>`).join('')
      : '<li class="vacio">Aún no ha girado nadie.</li>';
    if (!$('ajustes').hidden) buildSettings(false);
  }

  // ── AJUSTES ──
  const lista = $('listaPremios');
  function buildSettings(full = true) {
    document.querySelectorAll('[data-k]').forEach(el => {
      if (el === document.activeElement) return;
      if (el.type === 'checkbox') el.checked = !!state[el.dataset.k]; else el.value = state[el.dataset.k];
    });
    const totalW = available().reduce((s, p) => s + p.weight, 0);
    const given = id => state.history.filter(e => e.id === id).length;
    if (!full) { // solo los datos que cambian al girar (para no perder lo que se está escribiendo)
      lista.querySelectorAll('.fila-premio').forEach(row => {
        const p = state.prizes.find(q => q.id === row.dataset.id);
        if (!p) return;
        row.querySelector('.dados').textContent = `${given(p.id)} dados`;
        row.querySelector('.pct').textContent = p.left === 0 ? 'agotado' : `sale el ${totalW ? Math.round(p.weight / totalW * 100) : 0} %`;
        row.classList.toggle('agotado', p.left === 0);
        const left = row.querySelector('[data-f="left"]');
        if (left !== document.activeElement) left.value = p.left ?? '';
      });
      return;
    }
    lista.innerHTML = state.prizes.map(p => `
      <div class="fila-premio${p.left === 0 ? ' agotado' : ''}" data-id="${p.id}">
        <input type="text" class="emoji" data-f="emoji" value="${esc(p.emoji)}" maxlength="4" aria-label="Emoji" />
        <input type="text" data-f="name" value="${esc(p.name)}" maxlength="30" aria-label="Premio" />
        <input type="color" data-f="color" value="${p.color}" aria-label="Color" />
        <label>Prob.<input type="number" data-f="weight" min="1" max="100" value="${p.weight}" /></label>
        <label>Quedan<input type="number" data-f="left" min="0" placeholder="∞" value="${p.left ?? ''}" /></label>
        <button type="button" class="borrar" data-borrar title="Quitar">✕</button>
        <div class="info">
          <label><input type="checkbox" data-f="win" ${p.win !== false ? 'checked' : ''} /> Es premio <small>(si no, sale «¡Uy, casi!»)</small></label>
          <span class="pct">${p.left === 0 ? 'agotado' : `sale el ${totalW ? Math.round(p.weight / totalW * 100) : 0} %`}</span>
          <span class="dados">${given(p.id)} dados</span>
        </div>
      </div>`).join('');
  }
  function openSettings() { if (spin) return; $('ajustes').hidden = false; buildSettings(); }
  function closeSettings() { $('ajustes').hidden = true; }
  document.querySelectorAll('[data-k]').forEach(el => el.addEventListener('input', () => {
    state[el.dataset.k] = el.type === 'checkbox' ? el.checked : el.value;
    save(); refresh();
    if (el.dataset.k === 'sizeByOdds') paintWheel();
  }));
  lista.addEventListener('input', e => {
    const row = e.target.closest('.fila-premio'), f = e.target.dataset.f, p = row && state.prizes.find(q => q.id === row.dataset.id);
    if (!p || !f) return;
    if (f === 'weight') p.weight = Math.max(1, Math.round(Number(e.target.value) || 1));
    else if (f === 'left') p.left = e.target.value === '' ? null : Math.max(0, Math.round(Number(e.target.value)));
    else if (f === 'win') p.win = e.target.checked;
    else p[f] = e.target.value;
    save(); paintWheel(); refresh();
  });
  lista.addEventListener('click', e => {
    const b = e.target.closest('[data-borrar]');
    if (!b) return;
    state.prizes = state.prizes.filter(p => p.id !== b.closest('.fila-premio').dataset.id);
    save(); paintWheel(); buildSettings(); refresh();
  });
  $('btnAnadir').addEventListener('click', () => {
    state.prizes.push({ id: newId(), emoji: '🎁', name: 'Nuevo premio', color: COLORS[state.prizes.length % COLORS.length], weight: 3, left: null, win: true });
    save(); paintWheel(); buildSettings(); refresh();
    lista.lastElementChild.querySelector('[data-f="name"]').select();
  });
  // lo que no se deshace pide un segundo clic
  function confirmFirst(b, label) {
    if (b.classList.contains('confirmar')) return true;
    const old = b.textContent;
    b.classList.add('confirmar'); b.textContent = label;
    setTimeout(() => { b.classList.remove('confirmar'); b.textContent = old; }, 2500);
    return false;
  }
  $('btnBorrarHistorial').addEventListener('click', e => {
    if (!confirmFirst(e.currentTarget, '¿Seguro? Pulsa otra vez')) return;
    state.history = []; save(); refresh(); buildSettings();
  });
  $('btnEjemplo').addEventListener('click', e => {
    if (!confirmFirst(e.currentTarget, '¿Seguro? Pulsa otra vez')) return;
    state.prizes = examplePrizes(); save(); paintWheel(); buildSettings(); refresh();
  });

  // ── BOTONES Y TECLAS ──
  $('btnGirar').addEventListener('click', start);
  $('centro').addEventListener('click', start);
  canvas.addEventListener('click', start);
  $('btnSeguir').addEventListener('click', closePrize);
  $('premio').addEventListener('click', e => { if (e.target === $('premio')) closePrize(); });
  $('btnAjustes').addEventListener('click', () => ($('ajustes').hidden ? openSettings() : closeSettings()));
  $('btnCerrarAjustes').addEventListener('click', closeSettings);
  $('btnSonido').addEventListener('click', () => { state.sound = !state.sound; save(); refresh(); });
  $('btnPantalla').addEventListener('click', () => {
    if (document.fullscreenElement) document.exitFullscreen(); else document.documentElement.requestFullscreen?.().catch(() => {});
  });
  document.addEventListener('keydown', e => {
    if (e.target.closest('input, textarea')) return;
    if (e.key === 'Escape') { if (!$('premio').hidden) closePrize(); else closeSettings(); return; }
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      if (!$('premio').hidden) closePrize(); else if ($('ajustes').hidden) start();
    }
  });

  // el logo del centro y las fuentes llegan después: entonces se repinta
  const img = new Image();
  img.onload = () => { logo = img; if (size) paintHub(); };
  img.src = LOGO;
  document.fonts?.ready.then(() => { if (size) paintWheel(); });

  window.__ruleta = { state, start, available, segments: () => segments, isSpinning: () => !!spin };
  refresh();
})();
