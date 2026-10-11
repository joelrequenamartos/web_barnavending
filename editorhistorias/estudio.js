// Estudio Instagram — dibuja las plantillas en un canvas a tamaño real (1080 px de ancho) y las descarga en PNG.
(function () {
  // ── DATOS ─────────────────────────────────────────
  const W = 1080;
  const FORMATS = { story: 1920, post: 1350, square: 1080 };
  const FORMAT_TAG = { story: '9x16', post: '4x5', square: '1x1' };
  const PAD = 72;

  const BRANDS = { pokemon: '⚡ Pokémon', onepiece: '🏴‍☠️ One Piece', dragonball: '🐉 Dragon Ball' };
  const PACKS = [
    { slug: '30th-celebration', name: '30th Celebration', brand: 'pokemon' },
    { slug: 'mega-brave', name: 'Mega Brave', brand: 'pokemon' },
    { slug: 'nihil-zero', name: 'Nihil Zero', brand: 'pokemon' },
    { slug: 'storm-emerald', name: 'Storm Emerald', brand: 'pokemon' },
    { slug: 'ninja-spinner', name: 'Ninja Spinner', brand: 'pokemon' },
    { slug: 'abyss-eye', name: 'Abyss Eye', brand: 'pokemon' },
    { slug: 'mega-symphonia', name: 'Mega Symphonia', brand: 'pokemon' },
    { slug: 'llamas-obsidianas', name: 'Llamas Obsidianas', brand: 'pokemon' },
    { slug: 'chispas-fulgurantes', name: 'Chispas Fulgurantes', brand: 'pokemon' },
    { slug: 'corona-astral', name: 'Corona Astral', brand: 'pokemon' },
    { slug: 'escarlata-purpura', name: 'Escarlata y Púrpura', brand: 'pokemon' },
    { slug: 'op16-the-time-of-battle', name: 'OP16 The Time of Battle', brand: 'onepiece' },
    { slug: 'op14-heroes-of-the-blue-sea', name: 'OP14 Heroes of the Blue Sea', brand: 'onepiece' },
    { slug: 'fb09-dual-evolution', name: 'FB09 Dual Evolution', brand: 'dragonball' },
    { slug: 'fb02-fiery-fighting-spirit', name: 'FB02 Fiery Fighting Spirit', brand: 'dragonball' },
    { slug: 'dragon-ball-heroes-extra', name: 'Dragon Ball Heroes Extra', brand: 'dragonball' },
  ];
  // Máquinas: nombre, zona (texto libre) y foto de la carpeta imagenes/ubicaciones de la web
  const LOCS = [
    { name: 'SomMultiespai', zone: 'Barcelona', img: 'som-multiespai' },
    { name: 'Enjoy Padel Sabadell', zone: 'Sabadell', img: 'enjoy-padel-sabadell' },
    { name: 'La Mar Bella', zone: 'Barcelona · Poblenou', img: 'mar-bella' },
  ];
  const LOCATIONS = LOCS.map(l => l.name);
  // Colores base: fondo, texto, tarjetas... (ink = texto sobre foil, edge = viñeta). Los temas claros traen los suyos.
  const DARK = {
    dark: '#0A0B16', dark2: '#0E1020', card: '#151830', text: '#EDEDEF', muted: '#8A8A93',
    line: 'rgba(140,160,255,.18)', panel: 'rgba(21,24,48,.92)', soft: 'rgba(21,24,48,.8)',
    ink: '#1a0e00', edge: '#04050B', shadow: 'rgba(0,0,0,.55)',
  };
  let C = DARK;
  // Cada tema: degradado foil, color de acento, brillo detrás de los sobres y manchas de luz del fondo.
  // base = tema claro; photo = tema que usa sobre una foto (overlay)
  const THEMES = {
    oro: { name: 'Dorado', foil: ['#FFD700', '#FF8C00', '#FF4444'], accent: '#D9A441', halo: ['255,190,70', '255,120,30'], glows: [['255,170,40', .22], ['229,57,53', .16], ['40,80,200', .14]] },
    pokemon: { name: 'Pokémon', foil: ['#FFF07A', '#FFCB05', '#FF9E1B'], accent: '#FFCB05', halo: ['255,213,60', '61,125,202'], glows: [['255,203,5', .2], ['61,125,202', .28], ['61,125,202', .2]] },
    onepiece: { name: 'One Piece', foil: ['#FFE29A', '#FF6B4A', '#E11D2E'], accent: '#FF6B4A', halo: ['255,130,90', '225,29,46'], glows: [['225,29,46', .26], ['255,170,60', .14], ['30,70,170', .16]] },
    dragonball: { name: 'Dragon Ball', foil: ['#FFE066', '#FFA41B', '#FF6A00'], accent: '#FFA41B', halo: ['255,180,50', '255,106,0'], glows: [['255,140,0', .26], ['80,120,255', .18], ['255,210,60', .1]] },
    holo: { name: 'Holo', foil: ['#A898FF', '#FF6FB5', '#FFB84D', '#FFF07A'], accent: '#FF8FC8', halo: ['255,160,220', '140,130,255'], glows: [['140,100,255', .26], ['255,90,170', .18], ['70,200,255', .16]] },
    plata: { name: 'Platino', foil: ['#FFFFFF', '#B8C2D9', '#EEF1F8'], accent: '#C9D2E6', halo: ['220,228,255', '140,155,200'], glows: [['170,185,230', .16], ['90,100,140', .2], ['230,235,255', .08]] },
    neon: { name: 'Neón', foil: ['#5CF2FF', '#8B7BFF', '#FF4FD8'], accent: '#5CF2FF', halo: ['92,242,255', '255,79,216'], glows: [['139,123,255', .28], ['255,79,216', .2], ['92,242,255', .16]] },
    esmeralda: { name: 'Esmeralda', foil: ['#D4FF8A', '#3DDC84', '#11A37F'], accent: '#3DDC84', halo: ['120,240,170', '20,170,130'], glows: [['61,220,132', .2], ['17,163,127', .22], ['212,255,138', .08]] },
    purpura: { name: 'Púrpura', foil: ['#F3B8FF', '#B66DFF', '#6D4BFF'], accent: '#C084FC', halo: ['200,140,255', '109,75,255'], glows: [['160,90,255', .28], ['255,80,170', .14], ['90,70,230', .2]] },
    hielo: { name: 'Hielo', foil: ['#F0FCFF', '#8FDDFF', '#4C8DFF'], accent: '#8FDDFF', halo: ['170,230,255', '76,141,255'], glows: [['76,141,255', .24], ['143,221,255', .14], ['40,80,200', .2]] },
    halloween: { name: 'Halloween', foil: ['#FFD166', '#FF7A1A', '#C2410C'], accent: '#FF8A2A', halo: ['255,150,40', '150,70,255'], glows: [['255,110,20', .24], ['130,60,255', .24], ['60,200,120', .08]] },
    navidad: { name: 'Navidad', foil: ['#FFF1B8', '#FFD166', '#E53935'], accent: '#FFD166', halo: ['255,220,140', '229,57,53'], glows: [['229,57,53', .22], ['30,150,90', .26], ['255,215,120', .1]] },
    // claros: el amarillo del bloque «30 aniversario» de la web y un papel crema
    aniversario: {
      name: '30 años', foil: ['#C2410C', '#E53935', '#9F1239'], accent: '#B91C1C', halo: ['255,255,255', '255,150,0'],
      glows: [['255,255,255', .55], ['255,150,0', .22], ['255,240,170', .4]], photo: 'pokemon',
      base: { light: true, dark: '#FFD21F', dark2: '#FFE45C', card: '#FFF4BF', text: '#1A1405', muted: '#6B5A1E', line: 'rgba(26,20,5,.16)',
        panel: 'rgba(255,250,225,.62)', soft: 'rgba(255,250,225,.72)', ink: '#FFF6D6', edge: '#FFAE00', shadow: 'rgba(90,50,0,.4)' },
    },
    papel: {
      name: 'Papel', foil: ['#D97706', '#DC2626', '#9D174D'], accent: '#B45309', halo: ['255,255,255', '217,164,65'],
      glows: [['255,255,255', .8], ['217,164,65', .2], ['229,57,53', .06]], photo: 'oro',
      base: { light: true, dark: '#F2ECE1', dark2: '#FBF8F2', card: '#FFFFFF', text: '#151729', muted: '#6E6A73', line: 'rgba(21,23,41,.14)',
        panel: 'rgba(255,255,255,.72)', soft: 'rgba(255,255,255,.85)', ink: '#FFF8EC', edge: '#DCCFBA', shadow: 'rgba(40,30,10,.32)' },
    },
  };
  let T = THEMES.oro;
  const SEALS = { limitada: 'Edición limitada', ultimas: 'Últimas unidades', oferta: 'Oferta' };
  const REP_MAX = { story: 9, post: 6, square: 4 };
  const SOR_MAX = 3;
  const TOP_MAX = 3;
  const LOGO = '../imagenes/logo.png';
  const locSrc = l => `../imagenes/ubicaciones/${l.img}.png`;

  const fmtDate = (days = 0) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }).replace('.', '');
  };
  const DEFAULTS = {
    template: 'novedad', format: 'story', theme: 'oro', safe: true, guides: false,
    location: LOCATIONS[0], locationCustom: '', customName: '', customBrand: 'pokemon',
    pack: '30th-celebration', novEyebrow: '¡Nuevo en la máquina!', novTitle: '', novSub: 'Disponible 24 h', novSeal: '', novSealText: '',
    proxPack: 'mega-brave', proxEyebrow: 'Próximamente', proxTitle: '', proxDate: fmtDate(7), proxSub: 'En nuestras máquinas', proxMystery: false,
    repEyebrow: 'Recién repuesto', repTitle: 'Stock renovado', repDate: fmtDate(),
    repPacks: ['30th-celebration', 'mega-brave', 'op16-the-time-of-battle', 'ninja-spinner', 'fb09-dual-evolution', 'abyss-eye'],
    sorEyebrow: '🎁 Sorteo', sorTitle: 'Gana 3 sobres', sorDate: 'Termina el ' + fmtDate(7),
    sorSteps: 'Sigue a @tcgbarnavending\nDale like a esta publicación\nMenciona a 2 amigos en comentarios',
    sorPacks: ['30th-celebration', 'op16-the-time-of-battle', 'fb09-dual-evolution'],
    pullEyebrow: '🔥 Pull de la semana', pullTitle: 'Pikachu ilustrado', pullUser: '@usuario', pullSub: 'Sacado en nuestra máquina',
    photoZoom: 1, photoX: 0, photoY: 0, ovEyebrow: '', ovTitle: 'Te esperamos', ovSub: 'Sobres de Pokémon, One Piece y Dragon Ball 24 h',
    ovFrame: true, ovOnly: false,
    dondeEyebrow: 'Abiertas 24 h', dondeTitle: 'Dónde estamos', dondeSub: 'Paga con tarjeta, contactless o móvil', dondeLocs: LOCATIONS,
    infoEyebrow: 'Fácil y 24 h', infoTitle: 'Cómo funciona', infoLangs: true,
    infoSteps: 'Encuentra tu máquina | En centros deportivos y locales de Barcelona y alrededores\nElige tu sobre | Pokémon, One Piece y Dragon Ball en 4 idiomas\nPaga con tarjeta o móvil | Contactless, Apple Pay o Google Pay. Sin efectivo',
    anuEyebrow: 'Aviso', anuIcon: '🎉', anuTitle: '¡Gracias por estar ahí!',
    anuText: 'Cada sobre que abrís hace crecer este proyecto.\nSeguimos trayendo novedades cada semana.', anuCta: 'Síguenos para no perderte nada',
    vsEyebrow: 'Encuesta', vsTitle: '¿Cuál abrirías?', vsA: 'mega-brave', vsB: 'op16-the-time-of-battle', vsSub: 'Vota en la encuesta 👇',
    topEyebrow: '🏆 Top ventas', topTitle: 'Los más vendidos', topSub: 'Esta semana',
    topPacks: ['30th-celebration', 'op16-the-time-of-battle', 'mega-brave'],
    resEyebrow: 'Lo que dicen', resQuote: 'Pega aquí el comentario de un cliente.', resUser: '@cliente', resStars: '5',
    // estilo: fondo, decoración, marco y efectos (seed = variación de estrellas, confeti...)
    customColor: '#4f8cff', bg: 'brillos', deco: '', frame: '', grain: false, shine: false, seed: 7, bgDim: .55, bgBlur: true,
    animate: false, animDur: '8',
    showLogo: true, showName: true, footLeft: '@tcgbarnavending', footRight: 'BARCELONA · 24 H',
    energy: 'fuego', energyTheme: false, cardStyle: 'ex', cardBorder: 'auto', cardArt: 'sobre', cardPack: '30th-celebration',
    cardName: '', cardHp: '24h', cardStage: 'Básico', cardEyebrow: '', cardInfo: 'Disponible 24 h en nuestras máquinas',
    cardAttacks: 'Abre un sobre | 24h | Pokémon, One Piece y Dragon Ball en nuestras máquinas, a cualquier hora.\nPago rápido | | Con tarjeta, contactless o móvil. Sin efectivo.',
  };
  // Lo que una idea rápida pone a cero antes de aplicar lo suyo
  const STYLE = { theme: 'oro', bg: 'brillos', deco: '', frame: '', grain: false, shine: false };
  // Ideas rápidas: plantilla + colores + fondo + textos (los sobres elegidos se mantienen)
  const PRESETS = [
    { name: '🚀 Lanzamiento', set: { template: 'novedad', theme: 'auto', bg: 'rayos', deco: 'destellos', shine: true, novEyebrow: '¡Nuevo en la máquina!', novTitle: '', novSub: 'Disponible 24 h', novSeal: 'limitada' } },
    { name: '👀 Teaser', set: { template: 'proximamente', theme: 'neon', bg: 'manga', grain: true, proxMystery: true, proxEyebrow: 'Muy pronto', proxTitle: '¿Adivinas qué llega?', proxSub: 'Pista: brilla mucho ✨' } },
    { name: '🔄 Restock', set: { template: 'reposicion', bg: 'rejilla', shine: true, repEyebrow: 'Recién repuesto', repTitle: 'Stock renovado', repDate: fmtDate() } },
    { name: '⚔️ Encuesta', set: { template: 'versus', theme: 'holo', bg: 'manga', shine: true, vsEyebrow: 'Encuesta', vsTitle: '¿Cuál abrirías?', vsSub: 'Vota en la encuesta 👇' } },
    { name: '🏆 Top semanal', set: { template: 'top', bg: 'rayos', deco: 'confeti', shine: true, topEyebrow: '🏆 Top ventas', topTitle: 'Los más vendidos', topSub: 'Esta semana' } },
    { name: '⚡ 30 aniversario', set: { template: 'novedad', theme: 'aniversario', bg: 'rayos', deco: 'confeti', pack: '30th-celebration', novEyebrow: '30 aniversario Pokémon', novTitle: '', novSub: 'Celebra 30 años de Pokémon', novSeal: 'limitada' } },
    { name: '🎃 Halloween', set: { template: 'proximamente', theme: 'halloween', bg: 'estrellas', deco: 'burbujas', grain: true, proxMystery: true, proxEyebrow: '🎃 Halloween', proxTitle: 'Algo terrorífico se acerca…', proxDate: '31 oct', proxSub: '¿Truco o sobre?' } },
    { name: '🖤 Black Friday', set: { template: 'novedad', theme: 'plata', bg: 'liso', frame: 'doble', grain: true, shine: true, novEyebrow: 'Black Friday', novTitle: '', novSub: 'Solo este fin de semana', novSeal: 'custom', novSealText: '-20 %' } },
    { name: '🎄 Navidad', set: { template: 'anuncio', theme: 'navidad', bg: 'estrellas', deco: 'destellos', anuEyebrow: 'Felices fiestas', anuIcon: '🎄', anuTitle: 'Esta Navidad, regala sobres', anuText: 'Pokémon, One Piece y Dragon Ball.\nAbiertas 24 h, también en festivos.', anuCta: '¡Felices fiestas! 🎁' } },
    { name: '🌹 Sant Jordi', set: { template: 'anuncio', theme: 'onepiece', deco: 'destellos', frame: 'esquinas', anuEyebrow: '23 de abril', anuIcon: '🌹', anuTitle: 'Una rosa, un libro… y un sobre', anuText: 'Este Sant Jordi, regala cartas.', anuCta: 'Feliz Sant Jordi 📚' } },
    { name: '🎉 Hito', set: { template: 'anuncio', theme: 'aniversario', bg: 'rayos', deco: 'confeti', anuEyebrow: 'Gracias', anuIcon: '1.000', anuTitle: '¡Ya somos 1.000!', anuText: 'Gracias por coleccionar con nosotros.', anuCta: 'Pronto, sorteo para celebrarlo 🎁' } },
    { name: '🔧 Aviso', set: { template: 'anuncio', bg: 'liso', anuEyebrow: 'Aviso', anuIcon: '🔧', anuTitle: 'Máquina en mantenimiento', anuText: 'Volvemos a estar operativos muy pronto.\nPerdona las molestias.', anuCta: '' } },
    { name: '🃏 Carta', set: { template: 'carta', bg: 'energia', deco: 'destellos', shine: true, cardStyle: 'ex', cardArt: 'sobre' } },
  ];

  // ── ESTADO (se recuerda en el navegador, salvo la foto) ──
  const STORE = 'estudio-ig';
  const STORE_PACK = 'estudio-ig-sobre';
  let state = { ...DEFAULTS };
  try { Object.assign(state, JSON.parse(localStorage.getItem(STORE) || '{}')); } catch (e) { /* sin almacenamiento */ }
  const save = () => { try { localStorage.setItem(STORE, JSON.stringify(state)); } catch (e) { /* nada */ } };
  let photo = null; // imagen subida (no se guarda)
  let custom = null; // sobre personalizado en dataURL (se guarda aparte si cabe)
  try { custom = localStorage.getItem(STORE_PACK); } catch (e) { /* nada */ }
  const STORE_BG = 'estudio-ig-fondo';
  const STORE_SAVED = 'estudio-ig-disenos';
  let bgPhoto = null, bgPhotoId = 0; // imagen de fondo (se guarda reducida si cabe)

  const allPacks = () => custom
    ? [...PACKS, { slug: 'custom', name: state.customName.trim() || 'Sobre nuevo', brand: state.customBrand }]
    : PACKS;
  const findPack = slug => allPacks().find(p => p.slug === slug);
  const getPack = slug => findPack(slug) || PACKS[0];
  const packSrc = p => p.slug === 'custom' ? custom : `sobres/${p.slug}.png`;

  // ── CARGA DE IMÁGENES Y FUENTES ───────────────────
  const cache = {};
  function loadImage(src) {
    if (!cache[src]) {
      cache[src] = new Promise((resolve, reject) => {
        const im = new Image();
        im.onload = () => resolve(im);
        im.onerror = reject;
        im.src = src;
      });
    }
    return cache[src];
  }
  const fontsReady = Promise.all([
    '700 100px "Space Grotesk"', '600 40px "Space Grotesk"', '500 30px Inter', '600 30px Inter',
  ].map(f => document.fonts.load(f))).catch(() => {});

  // ── AYUDAS DE DIBUJO ──────────────────────────────
  function alpha(hex, a) {
    const n = parseInt(hex.slice(1), 16);
    return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`;
  }
  function foil(ctx, x0, y0, x1, y1) {
    const g = ctx.createLinearGradient(x0, y0, x1, y1);
    T.foil.forEach((c, i, a) => g.addColorStop(i / (a.length - 1), c));
    return g;
  }
  // Aleatorio con semilla: estrellas, confeti... salen igual en la vista previa y en el PNG
  function rng(seed) {
    let a = seed >>> 0;
    return () => {
      a = (a + 0x6D2B79F5) >>> 0;
      let t = Math.imul(a ^ (a >>> 15), a | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const rgbOf = hex => { const n = parseInt(hex.slice(1), 16); return `${n >> 16},${(n >> 8) & 255},${n & 255}`; };
  function toHsl(hex) {
    const [r, g, b] = rgbOf(hex).split(',').map(v => v / 255);
    const max = Math.max(r, g, b), min = Math.min(r, g, b), l = (max + min) / 2, d = max - min;
    if (!d) return [0, 0, l * 100];
    const h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
    return [h * 60, (l > .5 ? d / (2 - max - min) : d / (max + min)) * 100, l * 100];
  }
  function hsl(h, s, l) {
    h = ((h % 360) + 360) % 360; s /= 100; l /= 100;
    const a = s * Math.min(l, 1 - l);
    const f = n => { const k = (n + h / 30) % 12; return l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1)); };
    return '#' + [f(0), f(8), f(4)].map(v => Math.round(v * 255).toString(16).padStart(2, '0')).join('');
  }
  // Tema a partir de un solo color (se aclara lo justo para que se lea sobre el fondo oscuro)
  function customTheme(hex) {
    const [h, s0, l0] = toHsl(hex);
    const s = s0 < 8 ? s0 : Math.max(s0, 55), l = Math.min(Math.max(l0, 50), 66);
    const mid = hsl(h, s, l);
    return {
      foil: [hsl(h + 16, s, Math.min(90, l + 22)), mid, hsl(h - 30, s, Math.max(45, l - 6))], accent: mid,
      halo: [rgbOf(hsl(h + 8, s, Math.min(82, l + 14))), rgbOf(hsl(h - 30, s, l))],
      glows: [[rgbOf(mid), .22], [rgbOf(hsl(h + 180, Math.min(s, 60), 45)), .14], [rgbOf(hsl(h - 30, s, 50)), .18]],
    };
  }
  function setFont(ctx, size, weight = 700, family = 'Space Grotesk', spacing = 0) {
    ctx.font = `${weight} ${size}px "${family}"`;
    ctx.letterSpacing = spacing + 'px';
  }
  function wrap(ctx, text, maxWidth) {
    const words = String(text).split(/\s+/).filter(Boolean);
    const lines = [];
    let line = '';
    words.forEach(w => {
      const test = line ? line + ' ' + w : w;
      if (ctx.measureText(test).width > maxWidth && line) { lines.push(line); line = w; } else line = test;
    });
    if (line) lines.push(line);
    return lines;
  }
  const splitLines = s => String(s).split('\n').map(l => l.trim()).filter(Boolean);
  // "Título | descripción" por línea
  const parseSteps = s => splitLines(s).map(l => {
    const [title, ...rest] = l.split('|');
    return { title: title.trim(), desc: rest.join('|').trim() };
  });

  // Escribe un texto que puede ocupar varias líneas y devuelve la y final
  function paragraph(ctx, text, x, y, { size, weight = 700, family = 'Space Grotesk', color = C.text, align = 'left', maxWidth = W - PAD * 2, lineHeight = 1.05, maxLines = 4 }) {
    setFont(ctx, size, weight, family);
    ctx.textAlign = align;
    ctx.textBaseline = 'top';
    let lines = wrap(ctx, text, maxWidth);
    if (lines.length > maxLines) { lines = lines.slice(0, maxLines); lines[maxLines - 1] += '…'; }
    lines.forEach((l, i) => {
      const ly = y + i * size * lineHeight;
      if (color === 'foil') {
        const w = Math.min(ctx.measureText(l).width, maxWidth);
        const sx = align === 'center' ? x - w / 2 : x;
        ctx.fillStyle = foil(ctx, sx, ly, sx + w, ly + size);
      } else ctx.fillStyle = color;
      ctx.fillText(l, x, ly);
    });
    return y + lines.length * size * lineHeight;
  }
  function countLines(ctx, text, { size, weight = 700, family = 'Space Grotesk', maxWidth, maxLines }) {
    if (!text) return 0;
    setFont(ctx, size, weight, family);
    return Math.min(wrap(ctx, text, maxWidth).length, maxLines);
  }
  // Píldora con borde (etiquetas). Con bg = 'foil' queda rellena, como un botón. Devuelve su ancho.
  function pill(ctx, text, x, y, { size = 30, color = T.accent, border = alpha(T.accent, .55), bg = alpha(T.accent, .12), align = 'left', upper = true } = {}) {
    setFont(ctx, size, 600, 'Space Grotesk', upper ? size * .16 : 0);
    const label = upper ? text.toUpperCase() : text;
    const w = ctx.measureText(label).width + size * 1.4;
    const h = size * 2;
    const sx = align === 'center' ? x - w / 2 : x;
    ctx.beginPath(); ctx.roundRect(sx, y, w, h, h / 2);
    ctx.fillStyle = bg === 'foil' ? foil(ctx, sx, y, sx + w, y + h) : bg; ctx.fill();
    ctx.lineWidth = 2; ctx.strokeStyle = border; ctx.stroke();
    ctx.fillStyle = color; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.fillText(label, sx + size * .7, y + h / 2 + 1);
    ctx.letterSpacing = '0px';
    return w;
  }
  const soft = () => ({ size: 30, upper: false, color: C.text, border: C.line, bg: C.soft });

  // ── FONDOS ────────────────────────────────────────
  // Fondos y decoraciones aceptan t (segundos) para el fondo animado; sin t se pintan quietos, como siempre.
  // Al animar, todo se repite exactamente cada loopP() segundos (la duración del vídeo): el bucle es perfecto.
  const loopP = () => Number(state.animDur) || 8;
  // Vueltas dadas en t a unas hz vueltas por segundo, redondeadas a un número entero de vueltas por bucle
  const cyc = (t, hz) => t / loopP() * Math.max(1, Math.round(loopP() * hz));
  const osc = (t, hz, phase = 0) => cyc(t, hz) * Math.PI * 2 + phase;
  // Manchas de luz del tema (el fondo de siempre). k = intensidad. Al animar, dan vueltas despacio y respiran.
  function glows(ctx, H, k = 1, t) {
    [[.85, .12, .9], [.1, .9, 1], [.2, .25, .8]].forEach(([x, y, r], i) => {
      let [rgb, a] = T.glows[i];
      if (t !== undefined) {
        const w = osc(t, .12, i * 2.1);
        x += Math.cos(w) * .08; y += Math.sin(w) * .05; a *= 1 + .2 * Math.sin(osc(t, .2, i * 1.3));
      }
      const g = ctx.createRadialGradient(W * x, H * y, 0, W * x, H * y, W * r);
      g.addColorStop(0, `rgba(${rgb},${a * k})`); g.addColorStop(1, `rgba(${rgb},0)`);
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    });
  }
  function vignette(ctx, H, a) {
    const g = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * .35, W / 2, H / 2, Math.hypot(W, H) / 2);
    g.addColorStop(0, alpha(C.edge, 0)); g.addColorStop(1, alpha(C.edge, a));
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  }
  // Estrella de 4 puntas
  function sparkle(ctx, x, y, r, fill) {
    const c = r * .14;
    ctx.beginPath(); ctx.moveTo(x, y - r);
    ctx.quadraticCurveTo(x + c, y - c, x + r, y); ctx.quadraticCurveTo(x + c, y + c, x, y + r);
    ctx.quadraticCurveTo(x - c, y + c, x - r, y); ctx.quadraticCurveTo(x - c, y - c, x, y - r);
    ctx.fillStyle = fill; ctx.fill();
  }
  // Centro de rayos y líneas: donde suele ir el protagonista
  const focus = H => H === FORMATS.square ? [W * .72, H * .56] : [W / 2, H * .56];
  // Fondo de foto desenfocado: se reduce mucho y el navegador lo suaviza al ampliarlo
  let blurCache = null;
  function blurred(img) {
    if (blurCache?.img !== img) {
      const cv = document.createElement('canvas');
      cv.width = Math.max(1, Math.round(img.width / 16)); cv.height = Math.max(1, Math.round(img.height / 16));
      const x = cv.getContext('2d');
      x.imageSmoothingQuality = 'high';
      x.drawImage(img, 0, 0, cv.width, cv.height);
      blurCache = { img, cv };
    }
    return blurCache.cv;
  }

  // ── ENERGÍAS ──────────────────────────────────────
  // Tipos de energía con sus colores. Los iconos son dibujos propios y sencillos (llama, gota, hoja, rayo, ojo,
  // puño, luna y triángulo), inspirados en las cartas de energía pero sin copiar los símbolos oficiales.
  const ENERGIES = {
    fuego: { name: 'Fuego', emoji: '🔥', light: '#FFC98A', main: '#EE4A22', deep: '#86160A' },
    agua: { name: 'Agua', emoji: '💧', light: '#A6EAFF', main: '#1FA0E3', deep: '#0B4987' },
    planta: { name: 'Planta', emoji: '🌿', light: '#C6F29A', main: '#43B04A', deep: '#145E2A' },
    rayo: { name: 'Rayo', emoji: '⚡', light: '#FFF38A', main: '#F5C518', deep: '#9A6400' },
    psiquico: { name: 'Psíquico', emoji: '🔮', light: '#EFC2FF', main: '#9C52D4', deep: '#461A73' },
    lucha: { name: 'Lucha', emoji: '👊', light: '#FFCF94', main: '#D8761F', deep: '#733008' },
    oscuro: { name: 'Oscuro', emoji: '🌙', light: '#9DBBBF', main: '#33545D', deep: '#0E1D22' },
    metal: { name: 'Metálico', emoji: '⚙️', light: '#F4F6F9', main: '#A9B2BE', deep: '#4D5662' },
  };
  const COLORLESS = { light: '#FFFFFF', main: '#D6D6D6', deep: '#8C8C8C' };
  // Colores de una energía, o sacados del tema si así se ha elegido (incluido «Tu color»)
  function energyPal(type) {
    if (type === 'incolora') return COLORLESS;
    if (!state.energyTheme) return ENERGIES[type] || ENERGIES.fuego;
    const [h, s, l] = toHsl(T.accent);
    return { light: hsl(h, s, Math.min(90, l + 26)), main: T.accent, deep: hsl(h, Math.min(s, 75), Math.max(10, l * .36)) };
  }
  // Iconos en un cuadrado de -1 a 1. Lo "hueco" (nervios de la hoja, el centro de la llama...) se recorta.
  const cut = ctx => { ctx.globalCompositeOperation = 'destination-out'; ctx.fillStyle = ctx.strokeStyle = '#000'; };
  const ICONS = {
    fuego: (ctx, c) => {
      ctx.fillStyle = c;
      ctx.beginPath();
      ctx.moveTo(0, .95);
      ctx.bezierCurveTo(-.58, .95, -.86, .5, -.7, .08);
      ctx.bezierCurveTo(-.62, -.14, -.46, -.3, -.42, -.6);
      ctx.bezierCurveTo(-.24, -.42, -.17, -.28, -.12, -.16);
      ctx.bezierCurveTo(-.1, -.56, .06, -.82, .22, -1);
      ctx.bezierCurveTo(.22, -.62, .58, -.46, .62, -.08);
      ctx.bezierCurveTo(.68, -.26, .72, -.36, .74, -.46);
      ctx.bezierCurveTo(.94, -.06, .9, .56, .52, .82);
      ctx.bezierCurveTo(.36, .92, .2, .95, 0, .95);
      ctx.fill();
      cut(ctx);
      ctx.beginPath();
      ctx.moveTo(0, .8);
      ctx.bezierCurveTo(-.3, .8, -.42, .52, -.3, .3);
      ctx.bezierCurveTo(-.2, .12, -.06, .04, -.02, -.16);
      ctx.bezierCurveTo(.1, .04, .32, .16, .32, .44);
      ctx.bezierCurveTo(.32, .68, .2, .8, 0, .8);
      ctx.fill();
    },
    agua: ctx => {
      ctx.rotate(.3);
      ctx.beginPath();
      ctx.moveTo(0, -1);
      ctx.bezierCurveTo(.28, -.52, .74, -.18, .74, .3);
      ctx.bezierCurveTo(.74, .72, .4, .98, 0, .98);
      ctx.bezierCurveTo(-.4, .98, -.74, .72, -.74, .3);
      ctx.bezierCurveTo(-.74, -.18, -.28, -.52, 0, -1);
      ctx.fill();
      cut(ctx);
      ctx.lineWidth = .12; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.arc(0, .3, .46, Math.PI * .62, Math.PI * 1.02); ctx.stroke();
    },
    planta: (ctx, c) => {
      ctx.rotate(-.55);
      ctx.strokeStyle = c;
      ctx.beginPath();
      ctx.moveTo(0, -1);
      ctx.bezierCurveTo(.78, -.5, .74, .42, 0, .74);
      ctx.bezierCurveTo(-.74, .42, -.78, -.5, 0, -1);
      ctx.fill();
      ctx.lineWidth = .13; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(0, .6); ctx.lineTo(0, 1.02); ctx.stroke();
      cut(ctx);
      ctx.lineWidth = .09;
      ctx.beginPath(); ctx.moveTo(0, -.7); ctx.lineTo(0, .58);
      [-.38, -.08, .22].forEach(y => { ctx.moveTo(0, y + .2); ctx.lineTo(-.34, y - .04); ctx.moveTo(0, y + .2); ctx.lineTo(.34, y - .04); });
      ctx.stroke();
    },
    rayo: ctx => {
      ctx.beginPath();
      [[.3, -1], [-.55, .12], [-.05, .12], [-.32, 1], [.58, -.18], [.06, -.18], [.42, -1]].forEach(([x, y]) => ctx.lineTo(x, y));
      ctx.closePath(); ctx.fill();
    },
    psiquico: (ctx, c) => {
      const eye = k => { ctx.beginPath(); ctx.moveTo(-k, 0); ctx.quadraticCurveTo(0, -k * 1.02, k, 0); ctx.quadraticCurveTo(0, k * 1.02, -k, 0); ctx.fill(); };
      eye(1);
      cut(ctx); eye(.76);
      ctx.globalCompositeOperation = 'source-over'; ctx.fillStyle = c;
      ctx.beginPath(); ctx.arc(0, 0, .32, 0, Math.PI * 2); ctx.fill();
      cut(ctx);
      ctx.beginPath(); ctx.arc(-.1, -.1, .09, 0, Math.PI * 2); ctx.fill();
    },
    lucha: ctx => {
      for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.roundRect(-.66 + i * .335, -.8, .31, .66, .13); ctx.fill(); }
      ctx.beginPath(); ctx.roundRect(-.66, -.32, 1.32, 1.02, .22); ctx.fill();
      cut(ctx);
      ctx.lineWidth = .07; ctx.lineCap = 'round';
      ctx.beginPath();
      [-.33, 0, .335].forEach(x => { ctx.moveTo(x, -.66); ctx.lineTo(x, -.28); });
      ctx.moveTo(-.5, .14); ctx.lineTo(.12, .14); ctx.quadraticCurveTo(.34, .14, .34, .38);
      ctx.stroke();
    },
    oscuro: ctx => {
      ctx.beginPath(); ctx.arc(0, 0, .88, 0, Math.PI * 2); ctx.fill();
      cut(ctx);
      ctx.beginPath(); ctx.arc(.3, -.3, .66, 0, Math.PI * 2); ctx.fill();
    },
    metal: (ctx, c) => {
      ctx.strokeStyle = c; ctx.lineWidth = .3; ctx.lineJoin = 'round';
      ctx.beginPath();
      for (let i = 0; i < 3; i++) { const a = -Math.PI / 2 + i * Math.PI * 2 / 3; ctx.lineTo(Math.cos(a) * .74, Math.sin(a) * .74 + .1); }
      ctx.closePath(); ctx.stroke();
      ctx.beginPath(); ctx.arc(0, .1, .14, 0, Math.PI * 2); ctx.fill();
    },
    incolora: (ctx, c) => sparkle(ctx, 0, 0, .95, c),
  };
  // Cada icono se pinta una vez en su propio canvas (así lo recortado queda transparente) y se reutiliza
  const sprites = {};
  function iconSprite(type, color, size) {
    const px = Math.min(1024, 2 ** Math.ceil(Math.log2(Math.max(16, size))));
    const key = `${type}|${color}|${px}`;
    if (!sprites[key]) {
      const cv = document.createElement('canvas');
      cv.width = cv.height = px;
      const x = cv.getContext('2d');
      x.translate(px / 2, px / 2); x.scale(px * .46, px * .46);
      x.fillStyle = color;
      (ICONS[type] || ICONS.incolora)(x, color);
      sprites[key] = cv;
    }
    return sprites[key];
  }
  // Símbolo de energía: círculo con degradado, canto brillante y el icono en negro
  function emblem(ctx, type, cx, cy, r, pal = energyPal(type)) {
    const g = ctx.createRadialGradient(cx - r * .3, cy - r * .35, r * .05, cx, cy, r);
    g.addColorStop(0, pal.light); g.addColorStop(.62, pal.main); g.addColorStop(1, pal.deep);
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = g; ctx.fill();
    ctx.lineWidth = Math.max(1, r * .07); ctx.strokeStyle = 'rgba(255,255,255,.6)'; ctx.stroke();
    const size = r * 1.25;
    ctx.drawImage(iconSprite(type, '#17171A', size), cx - size / 2, cy - size / 2, size, size);
  }

  const BGS = {
    brillos: { name: 'Brillos', draw: (ctx, H, rnd, t) => glows(ctx, H, 1, t) },
    rayos: { name: 'Rayos', draw: (ctx, H, rnd, t) => {
      glows(ctx, H, .8, t);
      const [cx, cy] = focus(H), R = Math.hypot(W, H), n = 32;
      const spin = t === undefined ? 0 : cyc(t, .3) * Math.PI * 2 / n; // al animar, giran despacio
      ctx.beginPath();
      for (let i = 0; i < n; i++) {
        const a = i * Math.PI * 2 / n + spin;
        ctx.moveTo(cx, cy); ctx.arc(cx, cy, R, a, a + Math.PI / n); ctx.closePath();
      }
      ctx.fillStyle = `rgba(${T.halo[0]},${C.light ? .18 : .06})`; ctx.fill();
      vignette(ctx, H, C.light ? .35 : .6);
    } },
    holo: { name: 'Holo', draw: (ctx, H, rnd, t) => {
      glows(ctx, H, .7, t);
      const cols = ['255,90,150', '255,190,80', '240,250,130', '100,235,180', '90,175,255', '175,120,255'];
      // al animar, las bandas se deslizan en diagonal (el degradado es más largo que la imagen para que no se acabe)
      const d = t === undefined ? 0 : cyc(t, .1) % 1 * .25, n = t === undefined ? 24 : 30;
      const g = t === undefined ? ctx.createLinearGradient(0, 0, W, H) : ctx.createLinearGradient(-d * W, -d * H, (1.25 - d) * W, (1.25 - d) * H);
      for (let i = 0; i <= n; i++) g.addColorStop(i / n, `rgba(${cols[i % cols.length]},${C.light ? .2 : .1})`);
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      // dos reflejos blancos en diagonal (al animar, cruzan la imagen)
      const at = v => Math.min(1, Math.max(0, v));
      [[.3, .12], [.66, .08]].forEach(([p, a]) => {
        if (t !== undefined) p = (p + cyc(t, .15)) % 1 * 1.4 - .2;
        const s = ctx.createLinearGradient(0, 0, W, H);
        s.addColorStop(at(p - .08), 'rgba(255,255,255,0)'); s.addColorStop(at(p), `rgba(255,255,255,${a})`); s.addColorStop(at(p + .08), 'rgba(255,255,255,0)');
        ctx.fillStyle = s; ctx.fillRect(0, 0, W, H);
      });
    } },
    manga: { name: 'Manga', draw: (ctx, H, rnd, t) => {
      glows(ctx, H, .9, t);
      // al animar, las líneas cambian 8 veces por segundo, como en el anime
      if (t !== undefined) rnd = rng(state.seed + 7919 * Math.floor(t * 8));
      const [cx, cy] = focus(H), R = Math.hypot(W, H);
      for (let i = 0; i < 170; i++) {
        const a = rnd() * Math.PI * 2, w = .003 + rnd() * .011, r0 = W * (.3 + rnd() * .3);
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0);
        ctx.lineTo(cx + Math.cos(a - w) * R, cy + Math.sin(a - w) * R);
        ctx.lineTo(cx + Math.cos(a + w) * R, cy + Math.sin(a + w) * R);
        ctx.fillStyle = alpha(C.text, .04 + rnd() * .1); ctx.fill();
      }
    } },
    trama: { name: 'Trama', draw: (ctx, H, rnd, t) => {
      glows(ctx, H, .8, t);
      // puntos de cómic que crecen hacia dos esquinas (al animar, una onda los hace latir)
      const s = 24, dmax = W * 1.05, wave = t === undefined ? 0 : osc(t, .3);
      ctx.beginPath();
      for (let row = 0, y = 0; y < H + s; row++, y += s * .87) {
        for (let x = row % 2 ? s / 2 : 0; x < W + s; x += s) {
          let r = s * .48 * (1 - Math.min(Math.hypot(x, H - y), Math.hypot(W - x, y)) / dmax);
          if (t !== undefined) r *= 1 + .25 * Math.sin(wave - (x + y) * .008);
          if (r > .8) { ctx.moveTo(x + r, y); ctx.arc(x, y, r, 0, Math.PI * 2); }
        }
      }
      ctx.fillStyle = alpha(T.accent, C.light ? .22 : .16); ctx.fill();
    } },
    rejilla: { name: 'Rejilla', draw: (ctx, H, rnd, t) => {
      glows(ctx, H, 1, t);
      // al animar, la rejilla avanza hacia abajo
      const s = 72, x0 = (W % s) / 2, y0 = (H % s) / 2 + (t === undefined ? 0 : cyc(t, .2) % 1 * s * 4 - s * 4);
      ctx.beginPath();
      for (let x = x0; x <= W; x += s) { ctx.moveTo(x, 0); ctx.lineTo(x, H); }
      for (let y = y0; y <= H; y += s) { ctx.moveTo(0, y); ctx.lineTo(W, y); }
      ctx.lineWidth = 2; ctx.strokeStyle = alpha(C.text, .05); ctx.stroke();
      ctx.beginPath();
      for (let x = x0 + s * 2; x < W; x += s * 4) for (let y = y0 + s * 2; y < H; y += s * 4) {
        ctx.moveTo(x - 10, y); ctx.lineTo(x + 10, y); ctx.moveTo(x, y - 10); ctx.lineTo(x, y + 10);
      }
      ctx.lineWidth = 3; ctx.strokeStyle = alpha(T.accent, .35); ctx.stroke();
      vignette(ctx, H, C.light ? .3 : .7);
    } },
    estrellas: { name: 'Estrellas', draw: (ctx, H, rnd, t) => {
      glows(ctx, H, 1, t);
      for (let i = 0; i < 240; i++) {
        const x = rnd() * W, y = rnd() * H, r = rnd() < .92 ? .8 + rnd() * 1.6 : 2.4 + rnd() * 1.8, a0 = .2 + rnd() * .6;
        // al animar, cada estrella parpadea a su ritmo
        const a = t === undefined ? a0 : a0 * (.55 + .45 * Math.sin(osc(t, .2 + i % 4 * .12, i * 2.4)));
        ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = C.light ? alpha(C.text, a * .4) : `rgba(${rnd() < .7 ? '255,255,255' : T.halo[0]},${a})`; ctx.fill();
      }
      for (let i = 0; i < 9; i++) {
        const [x, y] = edgePoint(rnd, H), r = 10 + rnd() * 18;
        sparkle(ctx, x, y, t === undefined ? r : r * (.6 + .4 * Math.sin(osc(t, .25, i * 1.9))), C.light ? alpha(C.text, .35) : 'rgba(255,255,255,.85)');
      }
      // y una estrella fugaz en cada vuelta, a la derecha de la cabecera
      const p = t === undefined ? -1 : (t / loopP() - .3) / .12;
      if (p > 0 && p < 1) {
        const len = Math.hypot(W * .45, 120), ux = W * .45 / len, uy = 120 / len;
        const x = W * (.6 + .45 * p), y = layout(H).headY - 10 + 120 * p, c = C.light ? rgbOf(C.text) : '255,255,255';
        const g = ctx.createLinearGradient(x - ux * 260, y - uy * 260, x, y);
        g.addColorStop(0, `rgba(${c},0)`); g.addColorStop(1, `rgba(${c},${.9 * Math.sin(p * Math.PI)})`);
        ctx.save();
        ctx.strokeStyle = g; ctx.lineWidth = 3; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(x - ux * 260, y - uy * 260); ctx.lineTo(x, y); ctx.stroke();
        ctx.restore();
      }
    } },
    liso: { name: 'Liso', draw: (ctx, H, rnd, t) => {
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, C.dark2); g.addColorStop(1, C.dark);
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      const [rgb, a] = T.glows[0];
      const k = t === undefined ? .8 : .8 * (1 + .3 * Math.sin(osc(t, .15))); // al animar, la luz de arriba respira
      const r = ctx.createRadialGradient(W / 2, -H * .05, 0, W / 2, -H * .05, W * 1.1);
      r.addColorStop(0, `rgba(${rgb},${a * k})`); r.addColorStop(1, `rgba(${rgb},0)`);
      ctx.fillStyle = r; ctx.fillRect(0, 0, W, H);
    } },
    energia: { name: 'Energía', draw: (ctx, H, rnd, t) => {
      // como una carta de energía: el símbolo en grande con anillos, un destello y purpurina.
      // Con plantillas de texto (sin un protagonista en el centro) el símbolo y el destello van muy suaves.
      const pal = energyPal(state.energy), [cx, cy] = focus(H);
      const k = ['novedad', 'proximamente', 'pull', 'versus', 'carta'].includes(state.template) ? 1 : .25;
      const R = W * .3 * (t === undefined ? 1 : 1 + .025 * Math.sin(osc(t, .25)));
      let g = ctx.createRadialGradient(cx, cy, R * .4, cx, cy, R * 2.8);
      g.addColorStop(0, pal.main); g.addColorStop(1, C.light ? pal.light : pal.deep);
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      const ring = t === undefined ? 0 : cyc(t, .25) % 1; // al animar, los anillos se alejan
      ctx.lineWidth = 4;
      for (let i = 0; i < 6; i++) {
        const k = i + ring;
        ctx.beginPath(); ctx.arc(cx, cy, R * (1.25 + k * .42), 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255,255,255,${.2 * (1 - k / 6)})`; ctx.stroke();
      }
      g = ctx.createRadialGradient(cx, cy, R * .5, cx, cy, R * 2.4);
      g.addColorStop(0, `rgba(255,255,255,${.4 * k})`); g.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      ctx.save();
      ctx.translate(cx, cy); ctx.scale(1, .05);
      g = ctx.createRadialGradient(0, 0, 0, 0, 0, W * .8);
      g.addColorStop(0, `rgba(255,255,255,${.95 * k})`); g.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, W * .8, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
      for (let i = 0; i < 280; i++) {
        const a = rnd() * Math.PI * 2, d = R * (.95 + rnd() ** 1.7 * 2.8), r = .8 + rnd() * 2.4, a0 = .25 + rnd() * .65;
        const al = t === undefined ? a0 : a0 * (.5 + .5 * Math.sin(osc(t, .3 + i % 4 * .1, i * 2.4)));
        ctx.beginPath(); ctx.arc(cx + Math.cos(a) * d, cy + Math.sin(a) * d * .9, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${al})`; ctx.fill();
      }
      vignette(ctx, H, C.light ? .3 : .65); // bordes más oscuros para que se lean cabecera y pie
      ctx.save();
      ctx.globalAlpha = k;
      emblem(ctx, state.energy, cx, cy, R, pal);
      ctx.restore();
    } },
    simbolos: { name: 'Símbolos', draw: (ctx, H, rnd, t) => {
      glows(ctx, H, 1, t);
      // las energías repetidas en diagonal, muy suaves (al animar, se deslizan)
      const s = 170, size = 70, types = Object.keys(ENERGIES), span = Math.hypot(W, H) / 2 + s * 2;
      const off = t === undefined ? 0 : cyc(t, .05) % 1 * s * types.length;
      ctx.save();
      ctx.translate(W / 2, H / 2); ctx.rotate(-.35);
      ctx.globalAlpha = C.light ? .1 : .07;
      for (let j = Math.floor(-span / s); j * s < span; j++) {
        for (let i = Math.floor(-span / s) - types.length - 1; i * s < span; i++) {
          const x = i * s + (j % 2 ? s / 2 : 0) + off, type = types[((i + j * 3) % 8 + 8) % 8];
          if (x > -span && x < span) ctx.drawImage(iconSprite(type, C.text, size), x - size / 2, j * s - size / 2, size, size);
        }
      }
      ctx.restore();
    } },
    foto: { name: 'Tu foto', draw: (ctx, H, rnd, t) => {
      if (!bgPhoto) return glows(ctx, H, 1, t);
      // al animar, la foto se acerca y se aleja despacio una vez por vuelta
      const z = t === undefined ? 1 : 1 + .07 * (1 - Math.cos(osc(t, 0))) / 2;
      const s = Math.max(W / bgPhoto.width, H / bgPhoto.height) * (state.bgBlur ? 1.08 : 1) * z;
      const w = bgPhoto.width * s, h = bgPhoto.height * s;
      ctx.drawImage(state.bgBlur ? blurred(bgPhoto) : bgPhoto, (W - w) / 2, (H - h) / 2, w, h);
      ctx.fillStyle = alpha(C.dark, state.bgDim); ctx.fillRect(0, 0, W, H);
      glows(ctx, H, .6, t);
    } },
  };

  // ── DECORACIONES (detrás del contenido) ───────────
  // Punto al azar para una decoración, sin tapar la cabecera ni el pie. Normal: fuera del centro del contenido.
  // frame = solo márgenes, el hueco junto a la cabecera y las bandas de arriba y abajo (para lo más llamativo).
  function edgePoint(rnd, H, frame = false) {
    const L = layout(H), m = PAD * .8;
    const busy = (x, y) => (x < W * .62 && y > L.headY - 14 && y < L.headY + 98) || (y > L.footY - 50 && y < L.footY + 16) || (frame
      ? x > m && x < W - m && y > L.headY - 14 && y < L.footY + 16 && !(x > W * .62 && y < L.top - 30)
      : x > W * .14 && x < W * .86 && y > L.top - 10 && y < L.bottom + 10);
    let x, y, i = 0;
    do { x = rnd() * W; y = rnd() * H; } while (++i < 30 && busy(x, y));
    return [x, y];
  }
  const DECOS = {
    destellos: (ctx, H, rnd, t) => {
      for (let i = 0; i < 16; i++) {
        const big = i < 12, [x, y] = edgePoint(rnd, H, big);
        let r = big ? 14 + rnd() ** 2 * 34 : 8 + rnd() * 10;
        if (t !== undefined) r *= .35 + .65 * (.5 + .5 * Math.sin(osc(t, .3 + i % 3 * .15, i * 1.7))); // al animar, laten
        ctx.save();
        ctx.shadowColor = `rgba(${T.halo[0]},.9)`; ctx.shadowBlur = r * .8;
        sparkle(ctx, x, y, r, i % 3 && !C.light ? 'rgba(255,255,255,.92)' : foil(ctx, x - r, y - r, x + r, y + r));
        ctx.restore();
      }
      for (let i = 0; i < 40; i++) {
        const [x, y] = edgePoint(rnd, H), r = 1.5 + rnd() * 2.5, a = .2 + rnd() * .5;
        ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = alpha(C.light ? C.text : '#FFFFFF', t === undefined ? a : a * (.5 + .5 * Math.sin(osc(t, .4, i * 2.4)))); ctx.fill();
      }
    },
    confeti: (ctx, H, rnd, t) => {
      const cols = [...T.foil, T.accent, C.light ? C.text : '#FFFFFF'];
      for (let i = 0; i < 80; i++) {
        let [x, y] = edgePoint(rnd, H);
        const c = cols[Math.floor(rnd() * cols.length)];
        let rot = rnd() * Math.PI;
        // al animar, el confeti cae (y vuelve a entrar por arriba), se balancea y gira
        if (t !== undefined) {
          const span = H + 120;
          y = (y + span * cyc(t, .12 + i % 3 * .08)) % span - 60;
          x += Math.sin(osc(t, .5, i)) * 16;
          rot += osc(t, .35 + i % 2 * .2);
        }
        ctx.save();
        ctx.translate(x, y); ctx.rotate(rot);
        ctx.globalAlpha = .55 + rnd() * .4; ctx.fillStyle = c;
        if (rnd() < .65) { const w = 10 + rnd() * 8, h = 22 + rnd() * 14; ctx.fillRect(-w / 2, -h / 2, w, h); }
        else { ctx.beginPath(); ctx.arc(0, 0, 6 + rnd() * 5, 0, Math.PI * 2); ctx.fill(); }
        ctx.restore();
      }
    },
    cartas: (ctx, H, rnd, t) => {
      // cartas flotando, como el reverso de una carta (al animar, suben, bajan y se balancean)
      for (let i = 0; i < 7; i++) {
        const [x, y] = edgePoint(rnd, H), w = 170 + rnd() * 150, h = w * 88 / 63;
        const bob = t === undefined ? 0 : Math.sin(osc(t, .12, i * 1.3)) * 24, sway = t === undefined ? 0 : Math.sin(osc(t, .1, i * 2.1)) * .06;
        ctx.save();
        ctx.translate(x, y + bob); ctx.rotate((rnd() - .5) * .9 + sway);
        ctx.beginPath(); ctx.roundRect(-w / 2, -h / 2, w, h, w * .06);
        ctx.fillStyle = alpha(C.text, .03); ctx.fill();
        ctx.lineWidth = 3; ctx.strokeStyle = alpha(C.text, .12); ctx.stroke();
        ctx.beginPath(); ctx.roundRect(-w * .42, -h / 2 + w * .08, w * .84, h - w * .16, w * .03);
        ctx.lineWidth = 2; ctx.strokeStyle = alpha(C.text, .07); ctx.stroke();
        ctx.beginPath(); ctx.ellipse(0, 0, w * .26, w * .18, 0, 0, Math.PI * 2);
        ctx.strokeStyle = alpha(T.accent, .22); ctx.stroke();
        ctx.restore();
      }
    },
    burbujas: (ctx, H, rnd, t) => {
      for (let i = 0; i < 18; i++) {
        let x = rnd() * W, y = rnd() * H;
        const r = 30 + rnd() ** 1.5 * 150, c = C.light ? '255,255,255' : T.halo[i % 2];
        if (t !== undefined) { x += Math.cos(osc(t, .08, i * 1.1)) * 30; y += Math.sin(osc(t, .1, i * 1.7)) * 70; } // al animar, flotan
        const g = ctx.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0, `rgba(${c},.04)`); g.addColorStop(.85, `rgba(${c},${C.light ? .35 : .14})`); g.addColorStop(1, `rgba(${c},0)`);
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
      }
    },
  };

  // Grano fino, como el reverso mate de una carta (el mismo efecto que la web)
  let noise = null;
  function grain(ctx, H, t) {
    if (!noise) {
      noise = document.createElement('canvas');
      noise.width = noise.height = 160;
      const x = noise.getContext('2d'), d = x.createImageData(160, 160), r = rng(9);
      for (let i = 0; i < d.data.length; i += 4) {
        d.data[i] = d.data[i + 1] = d.data[i + 2] = r() < .5 ? 0 : 255;
        d.data[i + 3] = r() * 26;
      }
      x.putImageData(d, 0, 0);
    }
    ctx.fillStyle = ctx.createPattern(noise, 'repeat');
    if (t === undefined) return ctx.fillRect(0, 0, W, H);
    // al animar, el grano cambia 24 veces por segundo, como el de una película
    const f = rng(1 + Math.floor(t * 24)), ox = Math.floor(f() * 160), oy = Math.floor(f() * 160);
    ctx.save(); ctx.translate(ox, oy); ctx.fillRect(-ox, -oy, W, H); ctx.restore();
  }

  // t = instante del fondo animado. Con bgSkip no se pinta: así sale la capa de contenido que va encima.
  let bgSkip = false;
  function background(ctx, H, t) {
    if (bgSkip) return;
    ctx.fillStyle = C.dark; ctx.fillRect(0, 0, W, H);
    (BGS[state.bg] || BGS.brillos).draw(ctx, H, rng(state.seed), t);
    if (DECOS[state.deco]) DECOS[state.deco](ctx, H, rng(state.seed + 1), t);
    if (state.grain) grain(ctx, H, t);
  }

  // Marco por encima de todo
  function drawFrame(ctx, H) {
    if (!state.frame) return;
    ctx.save();
    ctx.strokeStyle = foil(ctx, 0, 0, W, H);
    ctx.beginPath();
    if (state.frame === 'foil') { ctx.lineWidth = 10; ctx.roundRect(24, 24, W - 48, H - 48, 36); }
    else if (state.frame === 'carta') { // borde grueso como el de una carta, con canto brillante
      ctx.lineWidth = 40; ctx.strokeStyle = lin(ctx, borderColors(state.cardBorder === 'auto' ? 'amarillo' : state.cardBorder), 0, 0, W, H);
      ctx.roundRect(20, 20, W - 40, H - 40, 52); ctx.stroke();
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.strokeStyle = 'rgba(255,255,255,.5)'; ctx.roundRect(3, 3, W - 6, H - 6, 68); ctx.stroke();
      ctx.beginPath(); ctx.strokeStyle = 'rgba(0,0,0,.3)'; ctx.roundRect(41, 41, W - 82, H - 82, 32); ctx.stroke();
      ctx.beginPath();
    }
    else if (state.frame === 'doble') {
      ctx.lineWidth = 6; ctx.roundRect(22, 22, W - 44, H - 44, 38); ctx.stroke();
      ctx.beginPath(); ctx.lineWidth = 2; ctx.globalAlpha = .7; ctx.roundRect(40, 40, W - 80, H - 80, 24);
    } else {
      const m = 34, s = 120;
      ctx.lineWidth = 9; ctx.lineCap = 'round';
      [[m, m, 1, 1], [W - m, m, -1, 1], [m, H - m, 1, -1], [W - m, H - m, -1, -1]].forEach(([x, y, dx, dy]) => {
        ctx.moveTo(x, y + dy * s); ctx.arcTo(x, y, x + dx * s, y, 26); ctx.lineTo(x + dx * s, y);
      });
    }
    ctx.stroke();
    ctx.restore();
  }

  // Márgenes de cada formato. En historias con "margen seguro" se deja libre la zona que tapa Instagram.
  function layout(H) {
    const kind = H > 1500 ? 'story' : H > 1200 ? 'post' : 'square';
    if (kind === 'story') return state.safe
      ? { kind, headY: 220, top: 400, bottom: H - 340, footY: H - 260 }
      : { kind, headY: PAD, top: 250, bottom: H - 200, footY: H - 82 };
    if (kind === 'post') return { kind, headY: PAD, top: 210, bottom: H - 150, footY: H - 82 };
    return { kind, headY: 60, top: 186, bottom: H - 130, footY: H - 66 };
  }
  const SAFE_ZONES = { top: 210, bottom: 240 };

  // Logo y nombre de la empresa; cada uno se puede quitar en el panel (sin logo, el nombre se pega a la izquierda)
  function header(ctx, logo, L) {
    const s = 84, y = L.headY;
    if (state.showLogo) {
      ctx.save();
      ctx.beginPath(); ctx.roundRect(PAD, y, s, s, 20); ctx.clip();
      ctx.drawImage(logo, PAD, y, s, s);
      ctx.restore();
    }
    if (!state.showName) return;
    const x = state.showLogo ? PAD + s + 24 : PAD;
    setFont(ctx, 30, 700, 'Space Grotesk', 5);
    ctx.fillStyle = C.text; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.fillText('TCG BARNA VENDING', x, y + s / 2 - 14);
    setFont(ctx, 24, 500, 'Inter', 1);
    ctx.fillStyle = alpha(C.text, .65);
    ctx.fillText('Colecciona en cada esquina', x, y + s / 2 + 22);
    ctx.letterSpacing = '0px';
  }
  // Textos del pie (se editan en el panel; vacío = no sale). Cada uno cabe en media anchura.
  function footer(ctx, L, onDark = true) {
    const half = (W - PAD * 2) / 2 - 16;
    setFont(ctx, 30, 600, 'Space Grotesk', 1);
    ctx.textBaseline = 'alphabetic';
    ctx.textAlign = 'left'; ctx.fillStyle = C.text;
    ctx.fillText(state.footLeft.trim(), PAD, L.footY, half);
    setFont(ctx, 26, 500, 'Inter', 2);
    ctx.textAlign = 'right'; ctx.fillStyle = onDark ? C.muted : alpha(C.text, .8);
    ctx.fillText(state.footRight.trim().toUpperCase(), W - PAD, L.footY, half);
    ctx.letterSpacing = '0px';
  }
  // Rayos de luz suaves detrás de un objeto
  function rays(ctx, cx, cy, r, a = .05) {
    ctx.save();
    ctx.translate(cx, cy);
    for (let i = 0; i < 24; i++) {
      ctx.rotate(Math.PI * 2 / 24);
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(r, -r * .07); ctx.lineTo(r, r * .07); ctx.closePath();
      ctx.fillStyle = `rgba(${T.halo[0]},${a})`; ctx.fill();
    }
    ctx.restore();
  }
  function glowRays(ctx, cx, cy, h) {
    const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, h * .75);
    glow.addColorStop(0, `rgba(${T.halo[0]},.38)`); glow.addColorStop(.5, `rgba(${T.halo[1]},.14)`); glow.addColorStop(1, `rgba(${T.halo[1]},0)`);
    ctx.fillStyle = glow; ctx.fillRect(cx - h, cy - h, h * 2, h * 2);
    rays(ctx, cx, cy, h * .95);
  }
  function packImage(ctx, img, cx, cy, h, rot = -6, shadow = C.shadow, blur = 50, offY = 30) {
    const w = h * img.width / img.height;
    ctx.save();
    ctx.translate(cx, cy); ctx.rotate(rot * Math.PI / 180);
    ctx.shadowColor = shadow; ctx.shadowBlur = blur; ctx.shadowOffsetY = offY;
    ctx.drawImage(img, -w / 2, -h / 2, w, h);
    ctx.restore();
    return w;
  }
  function drawPack(ctx, img, cx, cy, h, rot) {
    glowRays(ctx, cx, cy, h);
    return packImage(ctx, shiny(img), cx, cy, h, rot);
  }
  // Brillo holográfico sobre el sobre (solo donde hay sobre, respetando la transparencia)
  const shines = new WeakMap();
  function shiny(img) {
    if (!state.shine) return img;
    let s = shines.get(img);
    if (!s) {
      s = document.createElement('canvas');
      const w = s.width = img.width, h = s.height = img.height, x = s.getContext('2d');
      x.drawImage(img, 0, 0);
      let g = x.createLinearGradient(0, h, w, 0);
      ['255,80,150', '255,200,70', '110,240,170', '90,170,255', '190,110,255', '255,80,150'].forEach((c, i, a) => g.addColorStop(i / (a.length - 1), `rgba(${c},.45)`));
      x.globalCompositeOperation = 'soft-light';
      x.fillStyle = g; x.fillRect(0, 0, w, h);
      g = x.createLinearGradient(0, 0, w, h);
      [[0, 0], [.3, 0], [.42, .42], [.47, .1], [.53, .3], [.62, 0], [1, 0]].forEach(([p, a]) => g.addColorStop(p, `rgba(255,255,255,${a})`));
      x.globalCompositeOperation = 'screen';
      x.fillStyle = g; x.fillRect(0, 0, w, h);
      x.globalCompositeOperation = 'destination-in';
      x.drawImage(img, 0, 0);
      shines.set(img, s);
    }
    return s;
  }
  // Altura del sobre para que quepa en una caja (con margen por la rotación)
  const fitH = (img, mw, mh, cap) => Math.max(0, Math.min(mh * .92, cap, mw * .9 * img.height / img.width));

  // Sobre en silueta con un "?" (para anunciar sin desvelar)
  const silhouettes = new WeakMap();
  function mysteryPack(ctx, img, cx, cy, h) {
    let s = silhouettes.get(img);
    if (!s) {
      s = document.createElement('canvas');
      s.width = img.width; s.height = img.height;
      const x = s.getContext('2d');
      x.drawImage(img, 0, 0);
      x.globalCompositeOperation = 'source-in';
      x.fillStyle = '#05060d'; x.fillRect(0, 0, s.width, s.height);
      silhouettes.set(img, s);
    }
    glowRays(ctx, cx, cy, h);
    packImage(ctx, s, cx, cy, h, -6, alpha(T.accent, .9), 70, 0);
    packImage(ctx, s, cx, cy, h, -6, alpha(T.accent, .6), 18, 0);
    const size = h * .42;
    setFont(ctx, size, 700);
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillStyle = C.light ? C.dark2 : foil(ctx, cx - size / 2, cy - size / 2, cx + size / 2, cy + size / 2);
    ctx.fillText('?', cx, cy + size * .04);
  }

  // Varios sobres en abanico
  function fan(ctx, imgs, cx, cy, mw, mh, cap) {
    const n = imgs.length;
    if (!n) return;
    const off = [[0], [-.34, .34], [-.52, 0, .52]][n - 1];
    const rot = [[-6], [-9, 9], [-13, 0, 13]][n - 1];
    const ar = Math.max(...imgs.map(i => i.width / i.height));
    const h = Math.max(0, Math.min(mh * .9, cap, mw * .9 / (ar * (1 + 2 * Math.abs(off[0])) * 1.1)));
    glowRays(ctx, cx, cy, h * (n > 1 ? 1.15 : 1));
    const order = n === 3 ? [0, 2, 1] : n === 2 ? [0, 1] : [0];
    order.forEach(i => packImage(ctx, shiny(imgs[i]), cx + off[i] * h * ar * 1.25, cy + (off[i] ? h * .04 : 0), h * (off[i] ? .92 : 1), rot[i]));
  }

  // Sello tipo estrella ("Edición limitada", "Oferta"...)
  function seal(ctx, text, cx, cy, r) {
    ctx.save();
    ctx.translate(cx, cy); ctx.rotate(12 * Math.PI / 180);
    const n = 20;
    ctx.beginPath();
    for (let i = 0; i < n * 2; i++) {
      const a = i * Math.PI / n, rr = i % 2 ? r * .88 : r;
      ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
    }
    ctx.closePath();
    ctx.shadowColor = 'rgba(0,0,0,.5)'; ctx.shadowBlur = 30; ctx.shadowOffsetY = 14;
    ctx.fillStyle = foil(ctx, -r, -r, r, r); ctx.fill();
    ctx.shadowColor = 'transparent';
    ctx.beginPath(); ctx.arc(0, 0, r * .76, 0, Math.PI * 2);
    ctx.lineWidth = 3; ctx.strokeStyle = alpha(C.ink, .35); ctx.setLineDash([6, 6]); ctx.stroke(); ctx.setLineDash([]);
    // textos cortos en una línea; si no caben, en varias líneas cada vez más pequeñas
    const label = text.toUpperCase();
    setFont(ctx, 100, 700);
    let size = Math.min(r * .4, r * 1.36 * 100 / ctx.measureText(label).width), lines = [label];
    if (size < r * .26) {
      size = r * .36;
      do {
        setFont(ctx, size, 700);
        lines = wrap(ctx, label, r * 1.25);
        size -= 2;
      } while (size > 12 && (lines.length > 3 || lines.some(l => ctx.measureText(l).width > r * 1.32)));
      size += 2;
    }
    setFont(ctx, size, 700);
    ctx.fillStyle = C.ink; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    lines.forEach((l, i) => ctx.fillText(l, 0, (i - (lines.length - 1) / 2) * size * 1.05 + 2));
    ctx.restore();
  }
  // Sello rojo inclinado ("Agotado")
  function stamp(ctx, text, cx, cy, size) {
    ctx.save();
    ctx.translate(cx, cy); ctx.rotate(-14 * Math.PI / 180);
    setFont(ctx, size, 700, 'Space Grotesk', size * .12);
    const label = text.toUpperCase();
    const w = ctx.measureText(label).width + size * 1.1, h = size * 1.6;
    ctx.beginPath(); ctx.roundRect(-w / 2, -h / 2, w, h, size * .25);
    ctx.fillStyle = 'rgba(10,11,22,.65)'; ctx.fill();
    ctx.lineWidth = size * .09; ctx.strokeStyle = '#FF4D4D'; ctx.stroke();
    ctx.fillStyle = '#FF4D4D'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(label, size * .06, 2);
    ctx.restore();
  }
  function drawSeal(ctx, cx, cy, w, h, L) {
    const kind = state.novSeal;
    if (!kind) return;
    if (kind === 'agotado') return stamp(ctx, 'Agotado', cx, cy, { story: 96, post: 76, square: 64 }[L.kind]);
    const text = kind === 'custom' ? state.novSealText.trim() : SEALS[kind];
    if (!text) return;
    const r = { story: 130, post: 105, square: 92 }[L.kind];
    seal(ctx, text, Math.min(cx + w * .45, W - r - 20), Math.max(cy - h * .36, L.top + r * .4), r);
  }

  // Lista numerada (círculos con número + título + descripción opcional). Con draw = false solo mide.
  function steps(ctx, items, x, y, { size, circle, gap, maxWidth }, draw = true) {
    const desc = Math.round(size * .74);
    const tx = x + circle + 28, tw = maxWidth - circle - 28;
    items.forEach((it, i) => {
      const tl = countLines(ctx, it.title, { size, maxWidth: tw, maxLines: 2 });
      const dl = countLines(ctx, it.desc, { size: desc, weight: 500, family: 'Inter', maxWidth: tw, maxLines: 2 });
      const textH = tl * size * 1.12 + (dl ? 10 + dl * desc * 1.3 : 0);
      if (draw) {
        ctx.beginPath(); ctx.arc(x + circle / 2, y + circle / 2, circle / 2, 0, Math.PI * 2);
        ctx.fillStyle = foil(ctx, x, y, x + circle, y + circle); ctx.fill();
        setFont(ctx, circle * .48, 700);
        ctx.fillStyle = C.ink; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(String(i + 1), x + circle / 2, y + circle / 2 + 2);
        let ty = y + Math.max(0, (circle - textH) / 2);
        ty = paragraph(ctx, it.title, tx, ty, { size, maxWidth: tw, lineHeight: 1.12, maxLines: 2 });
        if (dl) paragraph(ctx, it.desc, tx, ty + 10, { size: desc, weight: 500, family: 'Inter', color: alpha(C.text, .72), maxWidth: tw, lineHeight: 1.3, maxLines: 2 });
      }
      y += Math.max(circle, textH) + gap;
    });
    return items.length ? y - gap : y;
  }

  // Foto que llena una caja; se mueve con los deslizadores o arrastrando en la vista previa
  let photoGeom = null;
  function drawCover(ctx, img, x, y, w, h) {
    const s = Math.max(w / img.width, h / img.height) * state.photoZoom;
    const pw = img.width * s, ph = img.height * s;
    ctx.drawImage(img, x + (w - pw) / 2 + state.photoX * (pw - w) / 2, y + (h - ph) / 2 + state.photoY * (ph - h) / 2, pw, ph);
    if (ctx.canvas === canvas || ctx.canvas === animCanvas) photoGeom = { ex: (pw - w) / 2, ey: (ph - h) / 2 };
  }
  // Marco de carta con borde foil y brillo holográfico
  function cardFrame(ctx, cx, cy, mw, mh, cap) {
    const ar = 63 / 88;
    const h = Math.max(0, Math.min(mh * .94, cap, mw * .9 / ar)), w = h * ar;
    glowRays(ctx, cx, cy, h);
    ctx.save();
    ctx.translate(cx, cy); ctx.rotate(-3 * Math.PI / 180);
    ctx.beginPath(); ctx.roundRect(-w / 2, -h / 2, w, h, w * .05);
    ctx.shadowColor = 'rgba(0,0,0,.6)'; ctx.shadowBlur = 60; ctx.shadowOffsetY = 34;
    ctx.fillStyle = C.card; ctx.fill();
    ctx.shadowColor = 'transparent';
    ctx.save();
    ctx.clip();
    if (photo) drawCover(ctx, photo, -w / 2, -h / 2, w, h);
    else {
      setFont(ctx, 34, 600);
      ctx.fillStyle = C.muted; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('Sube la foto', 0, -22); ctx.fillText('de la carta', 0, 22);
    }
    const g = ctx.createLinearGradient(-w / 2, -h / 2, w / 2, h / 2);
    [[0, 0], [.38, 0], [.47, .16], [.53, .04], [.6, 0], [1, 0]].forEach(([p, a]) => g.addColorStop(p, `rgba(255,255,255,${a})`));
    ctx.fillStyle = g; ctx.fillRect(-w / 2, -h / 2, w, h);
    ctx.restore();
    ctx.lineWidth = Math.max(8, w * .016);
    ctx.strokeStyle = foil(ctx, -w / 2, -h / 2, w / 2, h / 2); ctx.stroke();
    ctx.restore();
  }

  const locationText = () => state.location === 'otra' ? state.locationCustom.trim() : state.location;

  // Bloques que se apilan debajo del elemento principal: { h, draw(x, y, align, maxWidth) }
  function textBlock(ctx, text, mw, { size = 40, weight = 600, family = 'Space Grotesk', color = C.text, maxLines = 2, lineHeight = 1.1 } = {}) {
    const n = countLines(ctx, text, { size, weight, family, maxWidth: mw, maxLines });
    if (!n) return null;
    return { h: n * size * lineHeight, draw: (x, y, align, w) => paragraph(ctx, text, x, y, { size, weight, family, color, align, maxWidth: w, lineHeight, maxLines }) };
  }
  function pillBlock(ctx, text, opts) {
    if (!text) return null;
    return { h: opts.size * 2, draw: (x, y, align) => pill(ctx, text, x, y, { ...opts, align }) };
  }
  const locBlock = ctx => { const loc = locationText(); return pillBlock(ctx, loc && '📍 ' + loc, soft()); };
  function dateBlock(ctx, label, text, size) {
    if (!text) return null;
    return {
      h: 40 + size * 1.05,
      draw: (x, y, align, mw) => {
        setFont(ctx, 24, 600, 'Space Grotesk', 5);
        ctx.fillStyle = C.muted; ctx.textAlign = align; ctx.textBaseline = 'top';
        ctx.fillText(label.toUpperCase(), x, y);
        ctx.letterSpacing = '0px';
        paragraph(ctx, text, x, y + 40, { size, color: 'foil', align, maxWidth: mw, maxLines: 1 });
      },
    };
  }

  // Diseño "protagonista": textos arriba, elemento grande en el centro y bloques abajo.
  // En 1:1 los textos van a la izquierda y el protagonista a la derecha.
  function hero(ctx, L, { eyebrow, title, titleSizes, meta, drawHero, blocks }) {
    const side = L.kind === 'square';
    const colW = side ? 500 : W - PAD * 2;
    let y = L.top;
    if (eyebrow) { pill(ctx, eyebrow, PAD, y); y += 96; }
    y = paragraph(ctx, title, PAD, y, { size: (titleSizes || { story: 118, post: 92, square: 72 })[L.kind], color: 'foil', maxLines: 3, maxWidth: colW });
    if (meta) y = paragraph(ctx, meta, PAD, y + 18, { size: side ? 30 : 34, weight: 500, family: 'Inter', color: C.muted, maxWidth: colW, maxLines: 1 }) + 26;
    const list = blocks(colW).filter(Boolean);
    const gap = 24;
    const blocksH = list.reduce((s, b) => s + b.h, 0) + gap * Math.max(0, list.length - 1);
    let by;
    if (side) {
      const x0 = PAD + colW + 40;
      drawHero((x0 + W - PAD) / 2 + 20, (L.top + L.bottom) / 2, W - PAD - x0 + 40, L.bottom - L.top);
      by = L.bottom - blocksH;
    } else {
      const bottom = L.bottom - blocksH - (list.length ? 30 : 0);
      drawHero(W / 2, y + (bottom - y) / 2, W - PAD * 2, bottom - y - 20);
      by = bottom + 30;
    }
    list.forEach(b => {
      b.draw(side ? PAD : W / 2, by, side ? 'left' : 'center', colW);
      by += b.h + gap;
    });
  }

  // ── PLANTILLAS ────────────────────────────────────
  async function drawNovedad(ctx, H, L) {
    const pack = getPack(state.pack);
    const [logo, img] = await Promise.all([loadImage(LOGO), loadImage(packSrc(pack))]);
    return () => {
      background(ctx, H);
      header(ctx, logo, L);
      hero(ctx, L, {
        eyebrow: state.novEyebrow.trim(),
        title: state.novTitle.trim() || pack.name,
        meta: BRANDS[pack.brand],
        drawHero: (cx, cy, mw, mh) => {
          const h = fitH(img, mw, mh, { story: 860, post: 560, square: 640 }[L.kind]);
          const w = drawPack(ctx, img, cx, cy, h);
          drawSeal(ctx, cx, cy, w, h, L);
        },
        blocks: mw => [textBlock(ctx, state.novSub.trim(), mw, { size: L.kind === 'square' ? 34 : 40 }), locBlock(ctx)],
      });
      footer(ctx, L);
    };
  }

  async function drawProximamente(ctx, H, L) {
    const pack = getPack(state.proxPack);
    const [logo, img] = await Promise.all([loadImage(LOGO), loadImage(packSrc(pack))]);
    return () => {
      background(ctx, H);
      header(ctx, logo, L);
      const mystery = state.proxMystery;
      hero(ctx, L, {
        eyebrow: state.proxEyebrow.trim(),
        title: state.proxTitle.trim() || (mystery ? 'Nueva colección' : pack.name),
        meta: BRANDS[pack.brand],
        drawHero: (cx, cy, mw, mh) => {
          const h = fitH(img, mw, mh, { story: 820, post: 520, square: 640 }[L.kind]);
          if (mystery) mysteryPack(ctx, img, cx, cy, h); else drawPack(ctx, img, cx, cy, h);
        },
        blocks: mw => [
          dateBlock(ctx, 'Llega', state.proxDate.trim(), { story: 76, post: 64, square: 52 }[L.kind]),
          textBlock(ctx, state.proxSub.trim(), mw, { size: L.kind === 'square' ? 30 : 36, weight: 500, family: 'Inter', color: alpha(C.text, .8) }),
          locBlock(ctx),
        ],
      });
      footer(ctx, L);
    };
  }

  async function drawPull(ctx, H, L) {
    const logo = await loadImage(LOGO);
    return () => {
      background(ctx, H);
      header(ctx, logo, L);
      hero(ctx, L, {
        eyebrow: state.pullEyebrow.trim(),
        title: state.pullTitle.trim() || 'Carta brutal',
        titleSizes: { story: 96, post: 78, square: 62 },
        meta: state.pullUser.trim(),
        drawHero: (cx, cy, mw, mh) => cardFrame(ctx, cx, cy, mw, mh, { story: 1000, post: 640, square: 760 }[L.kind]),
        blocks: mw => [textBlock(ctx, state.pullSub.trim(), mw, { size: L.kind === 'square' ? 30 : 36, weight: 500, family: 'Inter', color: alpha(C.text, .8) }), locBlock(ctx)],
      });
      footer(ctx, L);
    };
  }

  async function drawOverlay(ctx, H, L) {
    const logo = await loadImage(LOGO);
    return () => {
      if (!state.ovOnly) {
        if (photo) drawCover(ctx, photo, 0, 0, W, H);
        else {
          background(ctx, H);
          setFont(ctx, 40, 600, 'Space Grotesk');
          ctx.fillStyle = C.muted; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillText('Sube una foto en el panel', W / 2, H / 2);
        }
      }
      // bloque de texto inferior, de abajo hacia arriba
      const sq = L.kind === 'square';
      const ts = sq ? 72 : 88, ss = sq ? 32 : 38;
      const loc = locationText();
      const eyebrow = state.ovEyebrow.trim(), title = state.ovTitle.trim(), sub = state.ovSub.trim();
      const titleLines = countLines(ctx, title, { size: ts, maxWidth: W - PAD * 2, maxLines: 3 });
      const subLines = countLines(ctx, sub, { size: ss, weight: 500, family: 'Inter', maxWidth: W - PAD * 2, maxLines: 2 });
      let y = L.footY - 68 - (loc ? 88 : 0) - subLines * ss * 1.35 - (subLines ? 20 : 0) - titleLines * ts * 1.05 - (eyebrow ? 96 : 0);

      // degradados para que se lea el texto sobre cualquier foto
      const topH = L.headY + 84 + 220;
      let g = ctx.createLinearGradient(0, 0, 0, topH);
      g.addColorStop(0, 'rgba(10,11,22,.85)'); g.addColorStop(1, 'rgba(10,11,22,0)');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, topH);
      const gy = Math.max(0, y - 300);
      g = ctx.createLinearGradient(0, gy, 0, H);
      g.addColorStop(0, 'rgba(10,11,22,0)'); g.addColorStop(.5, 'rgba(10,11,22,.78)'); g.addColorStop(1, 'rgba(10,11,22,.95)');
      ctx.fillStyle = g; ctx.fillRect(0, gy, W, H - gy);

      header(ctx, logo, L);
      if (eyebrow) { pill(ctx, eyebrow, PAD, y); y += 96; }
      if (titleLines) y = paragraph(ctx, title, PAD, y, { size: ts, color: C.text, maxLines: 3 });
      if (subLines) y = paragraph(ctx, sub, PAD, y + 20, { size: ss, weight: 500, family: 'Inter', color: 'rgba(237,237,239,.82)', lineHeight: 1.35, maxLines: 2 });
      if (loc) pill(ctx, '📍 ' + loc, PAD, y + 28, { size: 30, upper: false, color: C.text, border: 'rgba(237,237,239,.35)', bg: 'rgba(10,11,22,.55)' });
      footer(ctx, L, false);

      if (state.ovFrame) {
        ctx.lineWidth = 10;
        ctx.strokeStyle = foil(ctx, 0, 0, W, H);
        ctx.beginPath(); ctx.roundRect(24, 24, W - 48, H - 48, 36); ctx.stroke();
      }
    };
  }

  async function drawReposicion(ctx, H, L) {
    const max = REP_MAX[L.kind];
    const packs = state.repPacks.map(findPack).filter(Boolean).slice(0, max);
    const [logo, ...imgs] = await Promise.all([loadImage(LOGO), ...packs.map(p => loadImage(packSrc(p)))]);
    return () => {
      background(ctx, H);
      header(ctx, logo, L);
      let y = L.top;
      if (state.repEyebrow.trim()) { pill(ctx, state.repEyebrow.trim(), PAD, y); y += 96; }
      y = paragraph(ctx, state.repTitle.trim() || 'Stock renovado', PAD, y, { size: { story: 110, post: 88, square: 72 }[L.kind], color: 'foil', maxLines: 2 });
      const loc = locationText();
      const meta = [loc && '📍 ' + loc, state.repDate.trim()].filter(Boolean).join('  ·  ');
      if (meta) y = paragraph(ctx, meta, PAD, y + 18, { size: 34, weight: 500, family: 'Inter', maxLines: 1 }) + 26;
      y += 30;

      if (!packs.length) {
        setFont(ctx, 36, 600);
        ctx.fillStyle = C.muted; ctx.textAlign = 'center';
        ctx.fillText('Elige sobres en el panel', W / 2, y + 200);
      } else {
        const cols = L.kind === 'square' ? packs.length : packs.length <= 4 && L.kind === 'post' ? 2 : 3;
        const rows = Math.ceil(packs.length / cols);
        const gap = 24;
        const cw = (W - PAD * 2 - gap * (cols - 1)) / cols;
        const avail = L.bottom - y;
        const ch = Math.min((avail - gap * (rows - 1)) / rows, cw * { story: 1.8, post: 1.45, square: 1.6 }[L.kind]);
        const gridH = rows * ch + gap * (rows - 1);
        const top = y + (avail - gridH) / 2;
        packs.forEach((p, i) => {
          const r = Math.floor(i / cols), c = i % cols;
          const inRow = Math.min(cols, packs.length - r * cols);
          const offset = (cols - inRow) * (cw + gap) / 2; // centra la última fila
          const x = PAD + offset + c * (cw + gap), cy = top + r * (ch + gap);
          ctx.beginPath(); ctx.roundRect(x, cy, cw, ch, 22);
          ctx.fillStyle = C.panel; ctx.fill();
          ctx.lineWidth = 2; ctx.strokeStyle = C.line; ctx.stroke();
          const nameH = 76;
          const ih = ch - nameH - 36;
          const img = shiny(imgs[i]);
          const iw = Math.min(ih * img.width / img.height, cw - 40);
          const realH = iw * img.height / img.width;
          const g = ctx.createRadialGradient(x + cw / 2, cy + 18 + ih / 2, 0, x + cw / 2, cy + 18 + ih / 2, cw * .6);
          g.addColorStop(0, `rgba(${T.halo[0]},.22)`); g.addColorStop(1, `rgba(${T.halo[0]},0)`);
          ctx.fillStyle = g; ctx.fillRect(x, cy, cw, ch - nameH);
          ctx.save();
          ctx.shadowColor = 'rgba(0,0,0,.5)'; ctx.shadowBlur = 24; ctx.shadowOffsetY = 12;
          ctx.drawImage(img, x + (cw - iw) / 2, cy + 18 + (ih - realH) / 2, iw, realH);
          ctx.restore();
          paragraph(ctx, p.name, x + cw / 2, cy + ch - nameH - 6, { size: cols === 2 ? 30 : 26, weight: 600, align: 'center', maxWidth: cw - 28, lineHeight: 1.15, maxLines: 2 });
        });
      }
      footer(ctx, L);
    };
  }

  async function drawSorteo(ctx, H, L) {
    const packs = state.sorPacks.map(findPack).filter(Boolean).slice(0, SOR_MAX);
    const [logo, ...imgs] = await Promise.all([loadImage(LOGO), ...packs.map(p => loadImage(packSrc(p)))]);
    return () => {
      background(ctx, H);
      header(ctx, logo, L);
      const side = L.kind === 'square';
      const colW = side ? 500 : W - PAD * 2;
      let y = L.top;
      if (state.sorEyebrow.trim()) { pill(ctx, state.sorEyebrow.trim(), PAD, y); y += 96; }
      y = paragraph(ctx, state.sorTitle.trim() || 'Sorteo', PAD, y, { size: { story: 104, post: 84, square: 64 }[L.kind], color: 'foil', maxLines: side ? 3 : 2, maxWidth: colW });

      const items = splitLines(state.sorSteps).slice(0, 4).map(t => ({ title: t }));
      const o = { ...{ story: { size: 40, circle: 70, gap: 26 }, post: { size: 34, circle: 58, gap: 18 }, square: { size: 28, circle: 50, gap: 14 } }[L.kind], maxWidth: colW };
      const listH = steps(ctx, items, PAD, 0, o, false);
      const date = state.sorDate.trim();
      const listTop = L.bottom - (date ? 60 + (items.length ? 36 : 0) : 0) - listH;

      if (side) {
        const x0 = PAD + colW + 40;
        fan(ctx, imgs, (x0 + W - PAD) / 2 + 20, (L.top + L.bottom) / 2, W - PAD - x0 + 40, L.bottom - L.top, 640);
      } else {
        fan(ctx, imgs, W / 2, (y + listTop) / 2, W - PAD * 2, listTop - y - 50, L.kind === 'story' ? 720 : 440);
      }
      if (!packs.length) {
        setFont(ctx, 34, 600);
        ctx.fillStyle = C.muted; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText('Elige el premio en el panel', side ? 800 : W / 2, side ? H / 2 : (y + listTop) / 2);
      }
      if (items.length) steps(ctx, items, PAD, listTop, o);
      if (date) pill(ctx, '⏰ ' + date, side ? PAD : W / 2, L.bottom - 60, { ...soft(), align: side ? 'left' : 'center' });
      footer(ctx, L);
    };
  }

  async function drawDonde(ctx, H, L) {
    const locs = LOCS.filter(l => state.dondeLocs.includes(l.name));
    const [logo, ...imgs] = await Promise.all([loadImage(LOGO), ...locs.map(l => loadImage(locSrc(l)))]);
    return () => {
      background(ctx, H);
      header(ctx, logo, L);
      let y = L.top;
      if (state.dondeEyebrow.trim()) { pill(ctx, state.dondeEyebrow.trim(), PAD, y); y += 96; }
      y = paragraph(ctx, state.dondeTitle.trim() || 'Dónde estamos', PAD, y, { size: { story: 110, post: 88, square: 72 }[L.kind], color: 'foil', maxLines: 2 });
      if (state.dondeSub.trim()) y = paragraph(ctx, state.dondeSub.trim(), PAD, y + 18, { size: L.kind === 'square' ? 30 : 34, weight: 500, family: 'Inter', color: C.muted, maxLines: 2, lineHeight: 1.3 });
      y += 44;

      const n = locs.length, gap = 24, avail = L.bottom - y;
      if (!n) {
        setFont(ctx, 36, 600);
        ctx.fillStyle = C.muted; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
        ctx.fillText('Elige ubicaciones en el panel', W / 2, y + 160);
      } else if (L.kind !== 'square') {
        // una fila por máquina: foto a la izquierda, datos a la derecha
        const rh = Math.min((avail - gap * (n - 1)) / n, L.kind === 'story' ? 330 : 250);
        const top = y + (avail - (rh * n + gap * (n - 1))) / 2;
        const ns = L.kind === 'story' ? 48 : 40, zs = L.kind === 'story' ? 32 : 28;
        locs.forEach((l, i) => {
          const ry = top + i * (rh + gap);
          ctx.beginPath(); ctx.roundRect(PAD, ry, W - PAD * 2, rh, 24);
          ctx.fillStyle = C.panel; ctx.fill();
          ctx.lineWidth = 2; ctx.strokeStyle = C.line; ctx.stroke();
          const ph = rh - 28, pw = ph * .75;
          ctx.save();
          ctx.beginPath(); ctx.roundRect(PAD + 14, ry + 14, pw, ph, 16); ctx.clip();
          const im = imgs[i], s = Math.max(pw / im.width, ph / im.height);
          ctx.drawImage(im, PAD + 14 + (pw - im.width * s) / 2, ry + 14 + (ph - im.height * s) / 2, im.width * s, im.height * s);
          ctx.restore();
          const tx = PAD + 14 + pw + 36, tw = W - PAD - 30 - tx;
          const nl = countLines(ctx, l.name, { size: ns, maxWidth: tw, maxLines: 2 });
          const blockH = nl * ns * 1.08 + 14 + zs * 1.2 + 22 + 48;
          let ty = ry + (rh - blockH) / 2;
          ty = paragraph(ctx, l.name, tx, ty, { size: ns, maxWidth: tw, lineHeight: 1.08, maxLines: 2 });
          ty = paragraph(ctx, '📍 ' + l.zone, tx, ty + 14, { size: zs, weight: 500, family: 'Inter', color: C.muted, maxWidth: tw, maxLines: 1, lineHeight: 1.2 });
          pill(ctx, '24 h', tx, ty + 22, { size: 24 });
        });
      } else {
        // 1:1 → columnas
        const cw = Math.min((W - PAD * 2 - gap * (n - 1)) / n, 380);
        const left = (W - (cw * n + gap * (n - 1))) / 2;
        const ph = Math.min(avail - 130, (cw - 24) * 4 / 3), pw = cw - 24;
        const ch = ph + 130;
        const top = y + (avail - ch) / 2;
        locs.forEach((l, i) => {
          const x = left + i * (cw + gap);
          ctx.beginPath(); ctx.roundRect(x, top, cw, ch, 22);
          ctx.fillStyle = C.panel; ctx.fill();
          ctx.lineWidth = 2; ctx.strokeStyle = C.line; ctx.stroke();
          ctx.save();
          ctx.beginPath(); ctx.roundRect(x + 12, top + 12, pw, ph, 14); ctx.clip();
          const im = imgs[i], s = Math.max(pw / im.width, ph / im.height);
          ctx.drawImage(im, x + 12 + (pw - im.width * s) / 2, top + 12 + (ph - im.height * s) / 2, im.width * s, im.height * s);
          ctx.restore();
          const nl = countLines(ctx, l.name, { size: 26, maxWidth: cw - 24, maxLines: 2 });
          const ty = paragraph(ctx, l.name, x + cw / 2, top + ph + 22 + (2 - nl) * 13, { size: 26, align: 'center', maxWidth: cw - 24, lineHeight: 1.1, maxLines: 2 });
          paragraph(ctx, l.zone, x + cw / 2, ty + 8, { size: 22, weight: 500, family: 'Inter', color: C.muted, align: 'center', maxWidth: cw - 24, maxLines: 1 });
        });
      }
      footer(ctx, L);
    };
  }

  async function drawInfo(ctx, H, L) {
    const logo = await loadImage(LOGO);
    return () => {
      background(ctx, H);
      header(ctx, logo, L);
      let y = L.top;
      if (state.infoEyebrow.trim()) { pill(ctx, state.infoEyebrow.trim(), PAD, y); y += 96; }
      y = paragraph(ctx, state.infoTitle.trim() || 'Cómo funciona', PAD, y, { size: { story: 118, post: 92, square: 72 }[L.kind], color: 'foil', maxLines: 2 });
      const items = parseSteps(state.infoSteps).slice(0, 4);
      const o = { ...{ story: { size: 50, circle: 96, gap: 60 }, post: { size: 40, circle: 76, gap: 38 }, square: { size: 32, circle: 60, gap: 24 } }[L.kind], maxWidth: W - PAD * 2 };
      const langH = state.infoLangs ? 60 + 40 : 0;
      const listH = steps(ctx, items, PAD, 0, o, false);
      const avail = L.bottom - langH - (y + 50);
      steps(ctx, items, PAD, y + 50 + Math.max(0, (avail - listH) / 2), o);
      if (state.infoLangs) pill(ctx, '🇪🇸 🇬🇧 🇯🇵 🇰🇷  Cartas en 4 idiomas', W / 2, L.bottom - 60, { ...soft(), align: 'center' });
      footer(ctx, L);
    };
  }

  // Destacado del anuncio: un emoji dentro de una medalla, o un texto corto (1.000, -20 %...) en grande
  const isEmoji = s => /\p{Extended_Pictographic}/u.test(s);
  function feature(ctx, text, cx, cy, size) {
    glowRays(ctx, cx, cy, size * 1.1);
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    if (isEmoji(text)) {
      ctx.beginPath(); ctx.arc(cx, cy, size / 2, 0, Math.PI * 2);
      ctx.fillStyle = C.panel; ctx.fill();
      ctx.lineWidth = Math.max(6, size * .025);
      ctx.strokeStyle = foil(ctx, cx - size / 2, cy - size / 2, cx + size / 2, cy + size / 2); ctx.stroke();
      setFont(ctx, size * .56, 400);
      const k = Math.min(1, size * .74 / ctx.measureText(text).width);
      setFont(ctx, size * .56 * k, 400);
      ctx.fillStyle = C.text;
      ctx.fillText(text, cx, cy + size * .03);
    } else {
      setFont(ctx, 100, 700);
      const s = Math.min(size * .9, 100 * (W - PAD * 2) / ctx.measureText(text).width);
      setFont(ctx, s, 700, 'Space Grotesk', -s * .03);
      const w = ctx.measureText(text).width;
      ctx.fillStyle = foil(ctx, cx - w / 2, cy - s / 2, cx + w / 2, cy + s / 2);
      ctx.fillText(text, cx, cy);
      ctx.letterSpacing = '0px';
    }
  }

  async function drawAnuncio(ctx, H, L) {
    const logo = await loadImage(LOGO);
    return () => {
      background(ctx, H);
      header(ctx, logo, L);
      const s = state, mw = W - PAD * 2;
      const eyebrow = s.anuEyebrow.trim(), icon = s.anuIcon.trim(), title = s.anuTitle.trim(), cta = s.anuCta.trim();
      const paras = splitLines(s.anuText).slice(0, 4);
      const ts = { story: 108, post: 84, square: 66 }[L.kind], bs = { story: 38, post: 32, square: 28 }[L.kind];
      const tl = countLines(ctx, title, { size: ts, maxWidth: mw, maxLines: 3 });
      const textH = (eyebrow ? 96 : 0) + tl * ts * 1.05
        + paras.reduce((h, p) => h + 24 + countLines(ctx, p, { size: bs, weight: 500, family: 'Inter', maxWidth: mw, maxLines: 3 }) * bs * 1.35, 0)
        + (cta ? 50 + 64 : 0);
      // todo centrado en vertical; el destacado se encoge si no cabe
      const avail = L.bottom - L.top;
      let fs = icon ? Math.min({ story: 340, post: 230, square: 190 }[L.kind], avail - textH - 50) : 0;
      if (fs < 90) fs = 0;
      let y = L.top + Math.max(0, (avail - textH - (fs ? fs + 50 : 0)) / 2);
      if (fs) { feature(ctx, icon, W / 2, y + fs / 2, fs); y += fs + 50; }
      if (eyebrow) { pill(ctx, eyebrow, W / 2, y, { align: 'center' }); y += 96; }
      y = paragraph(ctx, title, W / 2, y, { size: ts, color: 'foil', align: 'center', maxLines: 3 });
      paras.forEach(p => { y = paragraph(ctx, p, W / 2, y + 24, { size: bs, weight: 500, family: 'Inter', color: alpha(C.text, .8), align: 'center', lineHeight: 1.35, maxLines: 3 }); });
      if (cta) pill(ctx, cta, W / 2, y + 50, { size: 30, upper: false, align: 'center', color: C.ink, border: 'transparent', bg: 'foil' });
      footer(ctx, L);
    };
  }

  async function drawVersus(ctx, H, L) {
    const packs = [getPack(state.vsA), getPack(state.vsB)];
    const [logo, ...imgs] = await Promise.all([loadImage(LOGO), ...packs.map(p => loadImage(packSrc(p)))]);
    return () => {
      background(ctx, H);
      header(ctx, logo, L);
      let y = L.top;
      const eyebrow = state.vsEyebrow.trim(), sub = state.vsSub.trim();
      if (eyebrow) { pill(ctx, eyebrow, W / 2, y, { align: 'center' }); y += 96; }
      y = paragraph(ctx, state.vsTitle.trim() || '¿Cuál prefieres?', W / 2, y, { size: { story: 100, post: 80, square: 64 }[L.kind], color: 'foil', align: 'center', maxLines: 2 });
      const ns = { story: 36, post: 30, square: 26 }[L.kind];
      const colW = (W - PAD * 2 - 40) / 2;
      const top = y + 50, bottom = L.bottom - (sub ? 100 : 0) - (ns * 1.1 * 2 + 14 + ns * .8) - 30;
      const cy = (top + bottom) / 2;
      const ar = Math.max(...imgs.map(i => i.width / i.height));
      const h = Math.max(0, Math.min(bottom - top, { story: 620, post: 420, square: 380 }[L.kind], colW * .86 / ar));
      const xs = [PAD + colW / 2, W - PAD - colW / 2];
      // un brillo de cada color detrás de cada sobre y un rayo entre los dos
      xs.forEach((x, i) => {
        const g = ctx.createRadialGradient(x, cy, 0, x, cy, h * .8);
        g.addColorStop(0, `rgba(${T.halo[i]},.32)`); g.addColorStop(1, `rgba(${T.halo[i]},0)`);
        ctx.fillStyle = g; ctx.fillRect(x - h, cy - h, h * 2, h * 2);
      });
      ctx.save();
      ctx.lineWidth = 8; ctx.lineCap = 'round';
      ctx.shadowColor = alpha(T.accent, .8); ctx.shadowBlur = 30;
      ctx.strokeStyle = foil(ctx, W / 2, top, W / 2, bottom);
      ctx.beginPath(); ctx.moveTo(W / 2 + h * .18, top); ctx.lineTo(W / 2 - h * .18, bottom); ctx.stroke();
      ctx.restore();
      imgs.forEach((im, i) => packImage(ctx, shiny(im), xs[i], cy, h, i ? 7 : -7));
      // insignia VS
      const r = { story: 88, post: 72, square: 62 }[L.kind];
      ctx.save();
      ctx.beginPath(); ctx.arc(W / 2, cy, r, 0, Math.PI * 2);
      ctx.shadowColor = 'rgba(0,0,0,.5)'; ctx.shadowBlur = 30; ctx.shadowOffsetY = 10;
      ctx.fillStyle = foil(ctx, W / 2 - r, cy - r, W / 2 + r, cy + r); ctx.fill();
      ctx.shadowColor = 'transparent';
      ctx.lineWidth = 8; ctx.strokeStyle = C.dark; ctx.stroke();
      setFont(ctx, r * .8, 700, 'Space Grotesk', -r * .02);
      ctx.fillStyle = C.ink; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('VS', W / 2, cy + r * .05);
      ctx.restore();
      packs.forEach((p, i) => {
        const ty = paragraph(ctx, p.name, xs[i], bottom + 30, { size: ns, align: 'center', maxWidth: colW, lineHeight: 1.1, maxLines: 2 });
        paragraph(ctx, BRANDS[p.brand], xs[i], ty + 14, { size: Math.round(ns * .8), weight: 500, family: 'Inter', color: C.muted, align: 'center', maxWidth: colW, maxLines: 1 });
      });
      if (sub) pill(ctx, sub, W / 2, L.bottom - 60, { ...soft(), align: 'center' });
      footer(ctx, L);
    };
  }

  async function drawTop(ctx, H, L) {
    const packs = state.topPacks.map(findPack).filter(Boolean).slice(0, TOP_MAX);
    const [logo, ...imgs] = await Promise.all([loadImage(LOGO), ...packs.map(p => loadImage(packSrc(p)))]);
    return () => {
      background(ctx, H);
      header(ctx, logo, L);
      let y = L.top;
      if (state.topEyebrow.trim()) { pill(ctx, state.topEyebrow.trim(), PAD, y); y += 96; }
      y = paragraph(ctx, state.topTitle.trim() || 'Top ventas', PAD, y, { size: { story: 104, post: 84, square: 64 }[L.kind], color: 'foil', maxLines: 2 });
      const loc = locationText();
      const meta = [state.topSub.trim(), loc && '📍 ' + loc].filter(Boolean).join('  ·  ');
      if (meta) y = paragraph(ctx, meta, PAD, y + 18, { size: L.kind === 'square' ? 30 : 34, weight: 500, family: 'Inter', color: C.muted, maxLines: 1 });
      y += 50;
      if (!packs.length) {
        setFont(ctx, 36, 600);
        ctx.fillStyle = C.muted; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
        ctx.fillText('Elige los sobres en el panel', W / 2, y + 160);
        return footer(ctx, L);
      }
      // podio: 1.º en el centro y más alto, 2.º a la izquierda, 3.º a la derecha
      const gap = 20, cw = (W - PAD * 2 - gap * 2) / 3;
      const ns = { story: 30, post: 26, square: 24 }[L.kind];
      const base = L.bottom - ns * 1.15 * 2 - 16;
      const avail = base - y;
      const bh = [.27, .2, .14].map(k => avail * k);
      const ar = Math.max(...imgs.map(i => i.width / i.height));
      const ph = Math.max(0, Math.min(avail - bh[0] - 24, cw * .9 / ar, { story: 520, post: 400, square: 300 }[L.kind]));
      const cx = r => PAD + [1, 0, 2][r] * (cw + gap) + cw / 2;
      glowRays(ctx, cx(0), base - bh[0] - ph / 2, ph * 1.05);
      [1, 2, 0].filter(r => r < packs.length).forEach(r => {
        const x = cx(r) - cw / 2, by = base - bh[r];
        ctx.beginPath(); ctx.roundRect(x, by, cw, bh[r], [20, 20, 4, 4]);
        ctx.fillStyle = C.panel; ctx.fill();
        ctx.lineWidth = 2; ctx.strokeStyle = C.line; ctx.stroke();
        ctx.fillStyle = foil(ctx, x, by, x + cw, by); ctx.fillRect(x + 20, by - 1, cw - 40, 6);
        const n = Math.min(bh[r] * .62, 150);
        setFont(ctx, n, 700);
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillStyle = foil(ctx, x, by, x + cw, by + bh[r]);
        ctx.fillText(String(r + 1), cx(r), by + bh[r] / 2 + n * .04);
        const h = ph * (r ? .84 : 1);
        packImage(ctx, shiny(imgs[r]), cx(r), by - h / 2 - 10, h, [0, -5, 5][r], C.shadow, 36, 18);
        paragraph(ctx, packs[r].name, cx(r), base + 16, { size: ns, weight: 600, align: 'center', maxWidth: cw, lineHeight: 1.15, maxLines: 2 });
      });
      footer(ctx, L);
    };
  }

  async function drawResena(ctx, H, L) {
    const logo = await loadImage(LOGO);
    return () => {
      background(ctx, H);
      header(ctx, logo, L);
      const eyebrow = state.resEyebrow.trim(), quote = state.resQuote.trim() || 'Escribe aquí la opinión', user = state.resUser.trim();
      const loc = locationText(), stars = Math.min(5, Number(state.resStars) || 0);
      const qs = { story: 62, post: 50, square: 42 }[L.kind], ms = { story: 300, post: 230, square: 190 }[L.kind];
      const ss = Math.round(qs * .9), us = { story: 36, post: 32, square: 28 }[L.kind];
      const ql = countLines(ctx, quote, { size: qs, weight: 600, maxWidth: W - PAD * 2, maxLines: 7 });
      const h = (eyebrow ? 96 : 0) + ms * .42 + 36 + ql * qs * 1.2 + (stars ? 44 + ss : 0) + (user ? 30 + us : 0) + (loc ? 40 + 60 : 0);
      let y = L.top + Math.max(0, (L.bottom - L.top - h) / 2);
      if (eyebrow) { pill(ctx, eyebrow, W / 2, y, { align: 'center' }); y += 96; }
      // comillas grandes en foil
      setFont(ctx, ms, 700);
      ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
      ctx.fillStyle = foil(ctx, W / 2 - ms * .3, y, W / 2 + ms * .3, y + ms * .42);
      ctx.fillText('“', W / 2, y + ms * .72);
      y += ms * .42 + 36;
      y = paragraph(ctx, quote, W / 2, y, { size: qs, weight: 600, align: 'center', lineHeight: 1.2, maxLines: 7 });
      if (stars) y = paragraph(ctx, '★'.repeat(stars), W / 2, y + 44, { size: ss, color: 'foil', align: 'center', maxLines: 1 });
      if (user) y = paragraph(ctx, user, W / 2, y + 30, { size: us, weight: 600, family: 'Inter', color: alpha(C.text, .8), align: 'center', maxLines: 1 });
      if (loc) pill(ctx, '📍 ' + loc, W / 2, y + 40, { ...soft(), align: 'center' });
      footer(ctx, L);
    };
  }

  // ── CARTA ─────────────────────────────────────────
  // Diseño con forma de carta. Ediciones inspiradas en las de siempre, con dibujo propio (sin logos oficiales).
  // art = textura de la ilustración · full = la ilustración ocupa toda la carta · suffix = lo que va tras el nombre
  const CARD_STYLES = {
    normal: { name: 'Normal', border: 'amarillo', art: 'liso' },
    holo: { name: 'Holo', border: 'amarillo', art: 'holo' },
    shining: { name: 'Shining', border: 'amarillo', art: 'noche' },
    ex: { name: 'ex', border: 'plata', art: 'holo', suffix: 'ex' },
    v: { name: 'V', border: 'plata', art: 'rayas', suffix: 'V', full: true },
    vmax: { name: 'VMAX', border: 'plata', art: 'estallido', suffix: 'VMAX', full: true },
    fullart: { name: 'Full Art', border: 'plata', art: 'textura', full: true },
    tera: { name: 'Tera', border: 'plata', art: 'cristal', suffix: 'ex', full: true },
    dorada: { name: 'Dorada', border: 'oro', art: 'oro', full: true },
    arcoiris: { name: 'Arcoíris', border: 'arcoiris', art: 'arcoiris', full: true },
  };
  const BORDERS = {
    amarillo: ['#FFF3A6', '#F7D63E', '#E4B01E', '#F9DC55'],
    plata: ['#FFFFFF', '#CDD2DA', '#9EA6B2', '#E9ECF1'],
    oro: ['#FFF1B8', '#E6C05A', '#A87822', '#F2D27A'],
    negro: ['#4B4C54', '#1E1F25', '#0A0A0D', '#2E2F36'],
    arcoiris: ['#FFB6DA', '#FFE7A1', '#B8F5D2', '#A9D9FF', '#D8BBFF'],
  };
  const borderColors = key => key === 'tema' ? T.foil : BORDERS[key] || BORDERS.amarillo;
  const WEAK = { fuego: 'agua', agua: 'rayo', planta: 'fuego', rayo: 'lucha', psiquico: 'oscuro', lucha: 'psiquico', oscuro: 'lucha', metal: 'fuego' };
  const lin = (ctx, cols, x0, y0, x1, y1) => {
    const g = ctx.createLinearGradient(x0, y0, x1, y1);
    cols.forEach((c, i, a) => g.addColorStop(i / (a.length - 1), c));
    return g;
  };
  const isDarkHex = hex => { const [r, g, b] = rgbOf(hex).split(',').map(Number); return .2126 * r + .7152 * g + .0722 * b < 115; };
  // "Nombre | daño | texto" por línea
  const parseAttacks = s => splitLines(s).slice(0, 2).map(l => {
    const [name, dmg = '', ...rest] = l.split('|').map(x => x.trim());
    return { name, dmg, desc: rest.join(' | ') };
  });
  let cardRect = null; // dónde quedó la carta (para el brillo del fondo animado)

  // Ilustración teñida de oro o de arcoíris, como en las cartas especiales
  const tints = new WeakMap();
  function tinted(img, kind) {
    let m = tints.get(img);
    if (!m) tints.set(img, m = {});
    if (!m[kind]) {
      const cv = document.createElement('canvas'), w = cv.width = img.width, h = cv.height = img.height, x = cv.getContext('2d');
      x.drawImage(img, 0, 0);
      x.globalCompositeOperation = 'color';
      x.fillStyle = kind === 'oro' ? lin(x, ['#FFE7A0', '#D9A63E', '#FFF2C4', '#C08A2A'], 0, 0, w, h) : lin(x, ['#FF9FD3', '#FFE18C', '#A2F5CB', '#94D5FF', '#CCA6FF'], 0, h, w, 0);
      x.fillRect(0, 0, w, h);
      x.globalCompositeOperation = 'screen'; // aclara las sombras para que no quede apagado
      x.fillStyle = kind === 'oro' ? 'rgba(255,225,150,.22)' : 'rgba(255,255,255,.2)';
      x.fillRect(0, 0, w, h);
      x.globalCompositeOperation = 'destination-in';
      x.drawImage(img, 0, 0);
      m[kind] = cv;
    }
    return m[kind];
  }

  // Fondo de la ilustración según la edición (s = píxeles por milímetro de carta)
  function cardTexture(ctx, kind, pal, x, y, w, h, s) {
    const rnd = rng(state.seed + 5), cx = x + w / 2, cy = y + h * .4;
    if (kind === 'noche') ctx.fillStyle = lin(ctx, ['#030410', '#0B1236', '#02030A'], x, y, x, y + h);
    else if (kind === 'oro') ctx.fillStyle = lin(ctx, ['#FFF5D0', '#E9C35C', '#FFEFB0', '#C4932F', '#F5DA86'], x, y, x + w, y + h);
    else if (kind === 'arcoiris') ctx.fillStyle = lin(ctx, ['#FFC6E3', '#FFF0B4', '#C6F7DF', '#BFE4FF', '#E3CEFF', '#FFC6E3'], x, y + h, x + w, y);
    else {
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(w, h) * .8);
      g.addColorStop(0, pal.light); g.addColorStop(.5, pal.main); g.addColorStop(1, pal.deep);
      ctx.fillStyle = g;
    }
    ctx.fillRect(x, y, w, h);
    ctx.save();
    ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
    if (kind === 'noche' || kind === 'holo' || kind === 'oro' || kind === 'arcoiris') {
      for (let i = 0, n = kind === 'noche' ? 160 : 80; i < n; i++) {
        const px = x + rnd() * w, py = y + rnd() * h, r = (rnd() < .85 ? .25 + rnd() * .35 : .8 + rnd() * .9) * s;
        sparkle(ctx, px, py, r * 1.6, `rgba(255,255,255,${.3 + rnd() * .6})`);
      }
    }
    if (kind === 'holo' || kind === 'arcoiris') {
      ctx.fillStyle = lin(ctx, ['rgba(255,90,160,0)', 'rgba(255,90,160,.2)', 'rgba(255,215,90,.2)', 'rgba(90,230,170,.2)', 'rgba(90,170,255,.2)', 'rgba(175,110,255,0)'], x, y + h, x + w, y);
      ctx.fillRect(x, y, w, h);
    }
    if (kind === 'rayas' || kind === 'oro' || kind === 'arcoiris' || kind === 'textura') {
      // rayado fino en diagonal (en la full art, cruzado)
      const step = (kind === 'rayas' ? 1.6 : .9) * s;
      ctx.beginPath();
      for (let i = -h; i < w + h; i += step) {
        ctx.moveTo(x + i, y); ctx.lineTo(x + i + h * .7, y + h);
        if (kind === 'textura') { ctx.moveTo(x + i, y + h); ctx.lineTo(x + i + h * .7, y); }
      }
      ctx.lineWidth = s * (kind === 'rayas' ? .3 : .12);
      ctx.strokeStyle = kind === 'oro' ? 'rgba(120,80,0,.12)' : `rgba(255,255,255,${kind === 'rayas' ? .1 : .08})`;
      ctx.stroke();
    }
    if (kind === 'estallido') {
      // rayos desde el centro y bordes oscuros, como al hacerse gigante
      const R = Math.hypot(w, h);
      for (let i = 0; i < 110; i++) {
        const a = rnd() * Math.PI * 2, d = .008 + rnd() * .022, r0 = w * (.12 + rnd() * .2);
        ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0);
        ctx.lineTo(cx + Math.cos(a - d) * R, cy + Math.sin(a - d) * R); ctx.lineTo(cx + Math.cos(a + d) * R, cy + Math.sin(a + d) * R);
        ctx.fillStyle = `rgba(255,255,255,${.05 + rnd() * .14})`; ctx.fill();
      }
      const v = ctx.createRadialGradient(cx, cy, w * .3, cx, cy, R * .6);
      v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,.45)');
      ctx.fillStyle = v; ctx.fillRect(x, y, w, h);
    }
    if (kind === 'cristal') {
      // facetas de cristal
      for (let i = 0; i < 70; i++) {
        const px = x + rnd() * w, py = y + rnd() * h, r = (3 + rnd() * 11) * s, a = rnd() * Math.PI * 2;
        ctx.beginPath();
        for (let k = 0; k < 3; k++) { const b = a + k * 2.1 + rnd() * .5; ctx.lineTo(px + Math.cos(b) * r, py + Math.sin(b) * r); }
        ctx.closePath();
        ctx.fillStyle = rnd() < .55 ? `rgba(255,255,255,${.05 + rnd() * .14})` : `rgba(0,0,0,${.05 + rnd() * .12})`; ctx.fill();
        ctx.lineWidth = s * .14; ctx.strokeStyle = 'rgba(255,255,255,.22)'; ctx.stroke();
      }
    }
    ctx.restore();
  }

  // La ilustración: el sobre (o tu foto) con un brillo detrás
  function cardArt(ctx, img, st, x, y, w, h, full) {
    if (state.cardArt === 'foto') {
      if (photo) return drawCover(ctx, photo, x, y, w, h);
      setFont(ctx, Math.max(18, w * .05), 600);
      ctx.fillStyle = 'rgba(255,255,255,.8)'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      return ctx.fillText('Sube tu foto en el panel', x + w / 2, y + h * (full ? .4 : .5));
    }
    const im = st.art === 'oro' || st.art === 'arcoiris' ? tinted(img, st.art) : shiny(img);
    const ph = Math.min(full ? h * .47 : h * .88, (full ? w * .56 : w * .5) * img.height / img.width);
    const cx = x + w / 2, cy = y + h * (full ? .31 : .5);
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, ph * .75);
    g.addColorStop(0, 'rgba(255,255,255,.55)'); g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g; ctx.fillRect(x, y, w, h);
    packImage(ctx, im, cx, cy, ph, -5, 'rgba(0,0,0,.45)', ph * .07, ph * .035);
  }

  // La carta entera en (x0, y0) con ancho w. Las medidas van en milímetros de una carta real (63 × 88).
  function drawCard(ctx, x0, y0, w, img, name) {
    const st = CARD_STYLES[state.cardStyle] || CARD_STYLES.normal, full = !!st.full, s = w / 63, h = 88 * s;
    const pal = energyPal(state.energy), pale = st.art === 'oro' || st.art === 'arcoiris';
    const bcol = borderColors(state.cardBorder === 'auto' ? st.border : state.cardBorder);
    // texto oscuro sobre lo claro y blanco sobre lo oscuro (y sobre las ilustraciones a sangre)
    const fullInk = pale ? '#2B2210' : '#FFFFFF';
    const topInk = full ? fullInk : isDarkHex(pal.main) ? '#FFFFFF' : '#16161A';
    const ink = full ? fullInk : isDarkHex(pal.light) ? '#FFFFFF' : '#16161A';
    const metal = st.border === 'plata' ? BORDERS.plata : BORDERS.oro;
    const B = 3 * s, iw = w - 2 * B, ih = h - 2 * B, x1 = B + iw;
    ctx.save();
    ctx.translate(x0, y0);
    // borde con sombra y canto brillante
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,.5)'; ctx.shadowBlur = 5 * s; ctx.shadowOffsetY = 2.5 * s;
    ctx.beginPath(); ctx.roundRect(0, 0, w, h, 3.4 * s);
    ctx.fillStyle = lin(ctx, bcol, 0, 0, w, h); ctx.fill();
    ctx.restore();
    ctx.beginPath(); ctx.roundRect(s * .3, s * .3, w - s * .6, h - s * .6, 3.1 * s);
    ctx.lineWidth = s * .25; ctx.strokeStyle = 'rgba(255,255,255,.5)'; ctx.stroke();

    // cara de la carta
    ctx.save();
    ctx.beginPath(); ctx.roundRect(B, B, iw, ih, 1.4 * s); ctx.clip();
    if (full) {
      if (state.cardArt !== 'foto') cardTexture(ctx, st.art, pal, B, B, iw, ih, s);
      cardArt(ctx, img, st, B, B, iw, ih, true);
      if (!pale) { // velo arriba para que se lea el nombre
        const g = ctx.createLinearGradient(0, B, 0, B + 15 * s);
        g.addColorStop(0, 'rgba(0,0,0,.5)'); g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g; ctx.fillRect(B, B, iw, 15 * s);
      }
    } else {
      ctx.fillStyle = lin(ctx, [pal.main, pal.light, pal.light], 0, B, 0, B + ih); ctx.fillRect(B, B, iw, ih);
      // ventana de la ilustración con marco metálico
      const ax = B + 2.4 * s, ay = 11.2 * s, aw = iw - 4.8 * s, ah = 35.4 * s;
      ctx.fillStyle = lin(ctx, metal, ax, ay, ax + aw, ay + ah);
      ctx.fillRect(ax - .7 * s, ay - .7 * s, aw + 1.4 * s, ah + 1.4 * s);
      ctx.save();
      ctx.beginPath(); ctx.rect(ax, ay, aw, ah); ctx.clip();
      if (state.cardArt !== 'foto') cardTexture(ctx, st.art, pal, ax, ay, aw, ah, s);
      cardArt(ctx, img, st, ax, ay, aw, ah, false);
      ctx.restore();
      // franja de información bajo la ilustración
      const info = state.cardInfo.trim();
      if (info) {
        const fy = ay + ah + 1.3 * s;
        ctx.fillStyle = lin(ctx, metal, ax, fy, ax + aw, fy); ctx.fillRect(ax, fy, aw, 2.6 * s);
        ctx.font = `italic 600 ${1.5 * s}px Inter`; ctx.letterSpacing = '0px';
        ctx.fillStyle = '#2A2A2E'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(info, ax + aw / 2, fy + 1.35 * s, aw - 2 * s);
      }
    }
    ctx.restore();

    // fase, nombre (con su sufijo), PS y energía
    const ny = 7.7 * s;
    let nx = B + 2.2 * s;
    ctx.save();
    if (full && !pale) { ctx.shadowColor = 'rgba(0,0,0,.55)'; ctx.shadowBlur = s * .8; }
    const stage = state.cardStage.trim().toUpperCase();
    if (stage) {
      setFont(ctx, 1.45 * s, 700, 'Space Grotesk', .12 * s);
      const sw = ctx.measureText(stage).width + 1.8 * s;
      ctx.beginPath(); ctx.roundRect(nx, ny - 1.35 * s, sw, 2.7 * s, 1.35 * s);
      ctx.fillStyle = full ? 'rgba(255,255,255,.9)' : 'rgba(30,30,36,.85)'; ctx.fill();
      ctx.fillStyle = full ? '#1E1E24' : '#FFFFFF'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      ctx.fillText(stage, nx + .9 * s, ny + .1 * s);
      nx += sw + 1.3 * s;
    }
    const er = 2.3 * s, ex = x1 - 1.4 * s - er;
    emblem(ctx, state.energy, ex, ny, er, pal);
    let hx = ex - er - .9 * s;
    const hp = state.cardHp.trim();
    ctx.fillStyle = topInk; ctx.textAlign = 'right'; ctx.textBaseline = 'alphabetic';
    if (hp) {
      setFont(ctx, 4.2 * s, 700);
      ctx.fillText(hp, hx, ny + 1.5 * s);
      hx -= ctx.measureText(hp).width + .5 * s;
      setFont(ctx, 1.6 * s, 700);
      ctx.fillText('PS', hx, ny + 1.45 * s);
      hx -= ctx.measureText('PS').width + 1.2 * s;
    }
    const suf = st.suffix || '', ss = (suf === 'ex' ? 5.8 : suf === 'V' ? 5.4 : 4.4) * s;
    ctx.font = `italic 700 ${ss}px "Space Grotesk"`; ctx.letterSpacing = '0px';
    const sufW = suf ? ctx.measureText(suf).width + .9 * s : 0, room = hx - nx - sufW;
    let size = 4.3 * s;
    setFont(ctx, size, 700);
    while (ctx.measureText(name).width > room && size > 3.2 * s) { size -= .15 * s; setFont(ctx, size, 700); }
    ctx.textAlign = 'left'; ctx.fillStyle = topInk;
    ctx.fillText(name, nx, ny + 1.55 * s, room);
    if (suf) { // sufijo plateado con contorno oscuro
      const sx = nx + Math.min(ctx.measureText(name).width, room) + .9 * s;
      ctx.font = `italic 700 ${ss}px "Space Grotesk"`;
      ctx.lineWidth = ss * .12; ctx.strokeStyle = '#18181D'; ctx.lineJoin = 'round';
      ctx.strokeText(suf, sx, ny + 1.75 * s);
      ctx.fillStyle = lin(ctx, ['#FFFFFF', '#BFC6D1', '#FFFFFF', '#8D97A5'], sx, ny - ss * .7, sx, ny + ss * .3);
      ctx.fillText(suf, sx, ny + 1.75 * s);
    }
    ctx.restore();

    // ataques: coste en energías, nombre, daño y texto
    const atks = parseAttacks(state.cardAttacks), ax0 = B + 2.6 * s, ax1 = x1 - 2.6 * s;
    let ty = full ? 50.5 * s : 52.4 * s;
    if (full && atks.length) {
      ctx.beginPath(); ctx.roundRect(B + 1.5 * s, ty - 1.6 * s, iw - 3 * s, 22.4 * s, 1.4 * s);
      ctx.fillStyle = pale ? 'rgba(255,255,255,.6)' : 'rgba(8,8,16,.52)'; ctx.fill();
    }
    atks.forEach((a, i) => {
      const cr = 1.75 * s, n = i + 1;
      for (let k = 0; k < n; k++) emblem(ctx, k ? 'incolora' : state.energy, ax0 + cr + k * (cr * 2 + .45 * s), ty + 2.2 * s, cr, k ? COLORLESS : pal);
      const tx = ax0 + n * (cr * 2 + .45 * s) + 1.1 * s;
      ctx.fillStyle = ink; ctx.textBaseline = 'middle';
      if (a.dmg) { setFont(ctx, 3.9 * s, 700); ctx.textAlign = 'right'; ctx.fillText(a.dmg, ax1, ty + 2.35 * s); }
      setFont(ctx, 3.1 * s, 700); ctx.textAlign = 'left';
      ctx.fillText(a.name, tx, ty + 2.3 * s, ax1 - tx - (a.dmg ? 9 * s : 0));
      let dy = ty + 5 * s;
      if (a.desc) dy = paragraph(ctx, a.desc, ax0, dy, { size: 1.85 * s, weight: 500, family: 'Inter', color: alpha(ink, .88), maxWidth: ax1 - ax0, lineHeight: 1.3, maxLines: 3 });
      ty = dy + 1.8 * s;
      if (i < atks.length - 1) { ctx.fillStyle = alpha(ink, .25); ctx.fillRect(ax0, ty - .9 * s, ax1 - ax0, s * .12); }
    });
    // en las cartas a sangre, el texto pequeño va en un recuadro (como la regla de las ex o V)
    const info = state.cardInfo.trim();
    if (full && info) {
      const by = 74 * s;
      ctx.beginPath(); ctx.roundRect(B + 1.5 * s, by, iw - 3 * s, 3.6 * s, .9 * s);
      ctx.fillStyle = pale ? 'rgba(255,255,255,.55)' : 'rgba(255,255,255,.14)'; ctx.fill();
      ctx.lineWidth = s * .15; ctx.strokeStyle = alpha(ink, .45); ctx.stroke();
      ctx.font = `italic 600 ${1.45 * s}px Inter`; ctx.letterSpacing = '0px';
      ctx.fillStyle = ink; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(info, B + iw / 2, by + 1.85 * s, iw - 5 * s);
    }
    // debilidad, resistencia y retirada
    const wy = 79.2 * s, cw = (ax1 - ax0) / 3;
    ctx.fillStyle = alpha(ink, .3); ctx.fillRect(ax0, wy - 2.2 * s, ax1 - ax0, s * .12);
    [['debilidad', WEAK[state.energy] || 'agua', '×2'], ['resistencia', null, '—'], ['retirada', 'incolora', '']].forEach(([label, icon, val], i) => {
      const lx = ax0 + i * cw;
      setFont(ctx, 1.35 * s, 600, 'Inter');
      ctx.fillStyle = alpha(ink, .8); ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      ctx.fillText(label, lx, wy);
      let vx = lx + ctx.measureText(label).width + 1.6 * s;
      if (icon) { emblem(ctx, icon, vx, wy, 1.25 * s, icon === 'incolora' ? COLORLESS : ENERGIES[icon]); vx += 2.1 * s; }
      if (val) { setFont(ctx, 1.7 * s, 700); ctx.fillStyle = ink; ctx.fillText(val, vx, wy + .1 * s); }
    });
    // pie de la carta
    const fy = 83.9 * s;
    ctx.font = `italic 500 ${1.3 * s}px Inter`; ctx.letterSpacing = '0px';
    ctx.fillStyle = alpha(ink, .75); ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.fillText('Ilus. TCG Barna Vending', ax0, fy);
    setFont(ctx, 1.35 * s, 700, 'Inter');
    ctx.textAlign = 'right'; ctx.fillStyle = ink;
    ctx.fillText('001/024 ★', ax1, fy);
    ctx.restore();
  }

  async function drawCarta(ctx, H, L) {
    const pack = getPack(state.cardPack);
    const [logo, img] = await Promise.all([loadImage(LOGO), loadImage(packSrc(pack))]);
    return () => {
      background(ctx, H);
      header(ctx, logo, L);
      const eyebrow = state.cardEyebrow.trim(), loc = locationText();
      let top = L.top, bottom = L.bottom;
      if (eyebrow) { pill(ctx, eyebrow, W / 2, top, { align: 'center' }); top += 96; }
      if (loc) bottom -= 96;
      // la carta, lo más grande que quepa
      const ch = Math.min(bottom - top, (W - PAD * 2) * 88 / 63), cw = ch * 63 / 88;
      const x = (W - cw) / 2, y = top + (bottom - top - ch) / 2;
      cardRect = { x, y, w: cw, h: ch };
      drawCard(ctx, x, y, cw, img, state.cardName.trim() || (state.cardArt === 'foto' ? 'Tu carta' : pack.name));
      if (loc) pill(ctx, '📍 ' + loc, W / 2, bottom + 36, { ...soft(), align: 'center' });
      footer(ctx, L);
    };
  }

  // Brillo que recorre la carta en el fondo animado (como al mover una carta holo bajo la luz)
  function cardShine(c, r, t) {
    const p = cyc(t, .18) % 1 * 1.8 - .4, at = v => Math.min(1, Math.max(0, v));
    c.save();
    c.beginPath(); c.roundRect(r.x, r.y, r.w, r.h, r.w * .054); c.clip();
    const g = c.createLinearGradient(r.x, r.y, r.x + r.w, r.y + r.h);
    g.addColorStop(at(p - .16), 'rgba(255,255,255,0)'); g.addColorStop(at(p - .05), 'rgba(255,190,240,.1)');
    g.addColorStop(at(p), 'rgba(255,255,255,.3)');
    g.addColorStop(at(p + .05), 'rgba(170,230,255,.1)'); g.addColorStop(at(p + .16), 'rgba(255,255,255,0)');
    c.fillStyle = g; c.fillRect(r.x, r.y, r.w, r.h);
    c.restore();
  }

  const BUILDERS = {
    novedad: drawNovedad, proximamente: drawProximamente, reposicion: drawReposicion, sorteo: drawSorteo,
    pull: drawPull, overlay: drawOverlay, donde: drawDonde, info: drawInfo,
    anuncio: drawAnuncio, versus: drawVersus, top: drawTop, resena: drawResena, carta: drawCarta,
  };

  // Tema "según el sobre": usa la marca si todos los sobres de la plantilla son de la misma
  function themeKey() {
    if (state.theme === 'custom') return 'custom';
    if (state.theme !== 'auto') return THEMES[state.theme] ? state.theme : 'oro';
    const slugs = { novedad: [state.pack], proximamente: [state.proxPack], reposicion: state.repPacks, sorteo: state.sorPacks, versus: [state.vsA, state.vsB], top: state.topPacks,
      carta: state.cardArt === 'foto' ? [] : [state.cardPack] }[state.template] || [];
    const brands = new Set(slugs.map(findPack).filter(Boolean).map(p => p.brand));
    return brands.size === 1 ? [...brands][0] : 'oro';
  }
  // Tema y colores base que se usan al pintar. Sobre una foto (overlay) los temas claros pasan a su versión oscura.
  function resolveTheme() {
    const key = themeKey();
    let t = key === 'custom' ? customTheme(state.customColor) : THEMES[key];
    if (state.template === 'overlay' && t.base) t = THEMES[t.photo];
    return t;
  }

  // ── TEXTO PARA LA PUBLICACIÓN ─────────────────────
  const HASH = {
    base: '#tcgbarnavending #barcelona #vending #tcg #tradingcards',
    pokemon: '#pokemontcg #pokemon #cartaspokemon #pokemoncards',
    onepiece: '#onepiecetcg #onepiececardgame #onepiece',
    dragonball: '#dragonballsuper #fusionworld #dbscg',
  };
  const hashtags = (brands = [], extra = '') => {
    const b = [...new Set(brands)];
    return [HASH.base, ...(b.length ? b : Object.keys(BRANDS)).map(k => HASH[k]), extra].filter(Boolean).join(' ');
  };
  const NUM = ['1️⃣', '2️⃣', '3️⃣', '4️⃣'];
  function caption() {
    const loc = locationText();
    const where = loc ? `📍 ${loc}` : '📍 En nuestras máquinas de Barcelona';
    const pay = '💳 Paga con tarjeta, contactless o móvil · Abiertas 24 h';
    const s = state;
    let parts;
    switch (s.template) {
      case 'novedad': {
        const p = getPack(s.pack);
        const seal = s.novSeal === 'agotado' ? '❌ ¡Agotado! Gracias a todos, pronto más.' : s.novSeal === 'custom' ? s.novSealText.trim() : SEALS[s.novSeal];
        parts = [`✨ ¡${s.novTitle.trim() || p.name} ya está en nuestras máquinas! ${BRANDS[p.brand]}`, seal && s.novSeal !== 'agotado' ? `🔥 ${seal}` : seal, s.novSub.trim(), where, pay, hashtags([p.brand])];
        break;
      }
      case 'proximamente': {
        const p = getPack(s.proxPack);
        parts = [s.proxMystery ? '👀 Algo nuevo llega a nuestras máquinas… ¿Adivinas qué es? Te leemos en comentarios 👇' : `👀 Próximamente: ${s.proxTitle.trim() || p.name} ${BRANDS[p.brand]}`,
          s.proxDate.trim() && `📅 ${s.proxDate.trim()}`, s.proxSub.trim(), where, hashtags([p.brand])];
        break;
      }
      case 'reposicion': {
        const packs = s.repPacks.map(findPack).filter(Boolean).slice(0, REP_MAX[layout(FORMATS[s.format]).kind]);
        parts = [`🔄 ${s.repTitle.trim() || 'Stock renovado'}${s.repDate.trim() ? ' · ' + s.repDate.trim() : ''}`,
          packs.length && 'Recién llegado:\n' + packs.map(p => `• ${p.name}`).join('\n'), where, pay, hashtags(packs.map(p => p.brand))];
        break;
      }
      case 'sorteo': {
        const packs = s.sorPacks.map(findPack).filter(Boolean).slice(0, SOR_MAX);
        const items = splitLines(s.sorSteps).slice(0, 4);
        parts = [`🎁 SORTEO · ${s.sorTitle.trim() || 'Sorteo'} 🎁`, packs.length && `Premio: ${packs.map(p => p.name).join(', ')}`,
          items.length && 'Para participar:\n' + items.map((t, i) => `${NUM[i]} ${t}`).join('\n'), s.sorDate.trim() && `⏰ ${s.sorDate.trim()}`,
          'Anunciaremos el ganador en stories. Esta promoción no está patrocinada, avalada ni administrada por Instagram.',
          hashtags(packs.map(p => p.brand), '#sorteo #giveaway')];
        break;
      }
      case 'pull':
        parts = [`${s.pullEyebrow.trim() || '🔥 Pull'}: ${s.pullTitle.trim()} 🤩`, s.pullUser.trim() && `¡Enhorabuena ${s.pullUser.trim()}! 👏`, s.pullSub.trim() && `${s.pullSub.trim()} · ${where}`,
          '¿Cuál ha sido tu mejor pull? Cuéntanoslo en comentarios 👇', hashtags([], '#pull #pulls')];
        break;
      case 'donde': {
        const locs = LOCS.filter(l => s.dondeLocs.includes(l.name));
        parts = [`📍 ${s.dondeTitle.trim() || 'Dónde estamos'}`, locs.map(l => `• ${l.name} — ${l.zone}`).join('\n'), s.dondeSub.trim(), '¿Quieres una máquina en tu local? Escríbenos por DM 📩', hashtags()];
        break;
      }
      case 'info':
        parts = [`💡 ${s.infoTitle.trim() || 'Cómo funciona'}`, parseSteps(s.infoSteps).slice(0, 4).map((it, i) => `${NUM[i]} ${it.title}${it.desc ? ': ' + it.desc : ''}`).join('\n'),
          s.infoLangs && '🇪🇸 🇬🇧 🇯🇵 🇰🇷 Cartas en español, inglés, japonés y coreano', hashtags()];
        break;
      case 'anuncio': {
        const icon = s.anuIcon.trim();
        parts = [[isEmoji(icon) && icon, s.anuTitle.trim()].filter(Boolean).join(' '), splitLines(s.anuText).slice(0, 4).join('\n'),
          s.anuCta.trim() && `👉 ${s.anuCta.trim()}`, hashtags()];
        break;
      }
      case 'versus': {
        const a = getPack(s.vsA), b = getPack(s.vsB);
        parts = [`⚔️ ${s.vsTitle.trim() || '¿Cuál prefieres?'}`, `👈 ${a.name}\n👉 ${b.name}`,
          'Vota en nuestras stories o déjalo en comentarios 👇', hashtags([a.brand, b.brand], '#encuesta')];
        break;
      }
      case 'top': {
        const packs = s.topPacks.map(findPack).filter(Boolean).slice(0, TOP_MAX);
        parts = [`🏆 ${s.topTitle.trim() || 'Top ventas'}${s.topSub.trim() ? ' · ' + s.topSub.trim() : ''}`,
          packs.map((p, i) => `${['🥇', '🥈', '🥉'][i]} ${p.name}`).join('\n'), '¿Cuál es tu favorito? Te leemos 👇', where, pay, hashtags(packs.map(p => p.brand))];
        break;
      }
      case 'resena': {
        const stars = Math.min(5, Number(s.resStars) || 0);
        parts = [[stars && '⭐'.repeat(stars), s.resEyebrow.trim()].filter(Boolean).join(' '), s.resQuote.trim() && `«${s.resQuote.trim()}»`,
          s.resUser.trim() && `— ${s.resUser.trim()}`, '¡Gracias por confiar en nosotros! 💛', where, hashtags()];
        break;
      }
      case 'carta': {
        const st = CARD_STYLES[s.cardStyle] || CARD_STYLES.normal, p = getPack(s.cardPack), e = ENERGIES[s.energy] || ENERGIES.fuego;
        const name = s.cardName.trim() || (s.cardArt === 'foto' ? '' : p.name);
        parts = [`🃏 ${[name, st.suffix].filter(Boolean).join(' ')}${s.cardHp.trim() ? ' · PS ' + s.cardHp.trim() : ''}`,
          parseAttacks(s.cardAttacks).map(a => `${e.emoji} ${a.name}${a.dmg ? ' · ' + a.dmg : ''}${a.desc ? '\n' + a.desc : ''}`).join('\n\n'),
          s.cardInfo.trim(), where, hashtags(s.cardArt === 'foto' ? [] : [p.brand])];
        break;
      }
      default:
        parts = [s.ovTitle.trim(), s.ovSub.trim(), where, hashtags()];
    }
    return parts.filter(Boolean).join('\n\n');
  }

  // ── RENDER ────────────────────────────────────────
  const canvas = document.getElementById('lienzo');
  const ctx = canvas.getContext('2d');

  // Prepara la plantilla en un canvas (carga imágenes) y devuelve la función que la pinta
  async function prepare(cv, format) {
    const H = FORMATS[format];
    const theme = resolveTheme(), pal = theme.base || DARK;
    T = theme; C = pal;
    const c = cv.getContext('2d');
    const paint = await BUILDERS[state.template](c, H, layout(H));
    return () => {
      T = theme; C = pal;
      cv.width = W; cv.height = H;
      c.clearRect(0, 0, W, H);
      cardRect = null;
      paint();
      if (state.template !== 'overlay') drawFrame(c, H); // el overlay tiene su propio marco
    };
  }

  // Zonas que tapa la interfaz de Instagram en las historias (solo en la vista previa)
  function drawGuides(H) {
    [[0, SAFE_ZONES.top, 'Perfil de Instagram'], [H - SAFE_ZONES.bottom, H, 'Barra de responder']].forEach(([y0, y1, label]) => {
      ctx.fillStyle = 'rgba(255,60,100,.16)'; ctx.fillRect(0, y0, W, y1 - y0);
      const ly = y0 === 0 ? y1 : y0;
      ctx.setLineDash([16, 12]); ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(255,90,130,.85)';
      ctx.beginPath(); ctx.moveTo(0, ly); ctx.lineTo(W, ly); ctx.stroke(); ctx.setLineDash([]);
      setFont(ctx, 24, 600, 'Inter', 2);
      ctx.fillStyle = 'rgba(255,150,175,.95)'; ctx.textAlign = 'right';
      ctx.textBaseline = y0 === 0 ? 'bottom' : 'top';
      ctx.fillText(label.toUpperCase(), W - 24, y0 === 0 ? ly - 12 : ly + 12);
      ctx.letterSpacing = '0px';
    });
  }

  let renderId = 0;
  async function render() {
    const id = ++renderId;
    await fontsReady;
    const animated = animOn();
    let commit;
    try { commit = await prepare(animated ? animCanvas : canvas, state.format); } catch (e) { console.error(e); return; }
    if (id !== renderId) return; // llegó un cambio más nuevo mientras cargaban las imágenes
    if (animated) startAnim(contentLayer(animCanvas, commit, FORMATS[state.format]));
    else {
      stopAnim();
      commit();
      if (state.guides && state.format === 'story') drawGuides(FORMATS.story);
    }
    document.getElementById('medidas').textContent = `${W} × ${FORMATS[state.format]} px`;
    drawThumbs(FORMATS[state.format]);
  }

  // ── FONDO ANIMADO ─────────────────────────────────
  // Textos, sobres y marco se pintan una vez en una capa transparente; en cada fotograma solo se repinta
  // el fondo y se pone la capa encima. Los PNG siguen saliendo con el fondo quieto.
  const FPS = 30;
  const animCanvas = document.createElement('canvas');
  const animOn = () => state.animate && state.template !== 'overlay';
  let anim = null, animReq = 0, animStart = 0, animLast = 0;
  function contentLayer(cv, commit, H) {
    bgSkip = true;
    try { commit(); } finally { bgSkip = false; }
    return { cv, H, theme: T, pal: C, card: cardRect };
  }
  function animFrame(c, a, t) {
    T = a.theme; C = a.pal;
    c.clearRect(0, 0, W, a.H);
    background(c, a.H, t);
    c.drawImage(a.cv, 0, 0);
    if (a.card && t !== undefined) cardShine(c, a.card, t);
  }
  function drawAnim(now) {
    animLast = now;
    animFrame(ctx, anim, (now - animStart) / 1000 % loopP());
    if (state.guides && state.format === 'story') drawGuides(FORMATS.story);
  }
  function startAnim(a) {
    anim = a;
    if (canvas.width !== W || canvas.height !== a.H) { canvas.width = W; canvas.height = a.H; }
    if (!animReq) {
      animStart = performance.now();
      const loop = now => { animReq = requestAnimationFrame(loop); if (now - animLast > 1000 / FPS - 4) drawAnim(now); }; // ~30 fps, como el vídeo
      animReq = requestAnimationFrame(loop);
    }
    drawAnim(performance.now());
  }
  function stopAnim() { cancelAnimationFrame(animReq); animReq = 0; anim = null; }

  // ── VÍDEO ─────────────────────────────────────────
  // Se pinta fotograma a fotograma (sin saltos aunque el ordenador vaya justo) y se codifica en H.264 con el
  // propio navegador; mp4.js lo guarda como .mp4. Dura una vuelta exacta del fondo, así que se repite sin cortes.
  async function videoConfig(H) {
    if (!('VideoEncoder' in window)) return null;
    // perfil baseline primero: sin fotogramas B, el MP4 más sencillo y compatible
    for (const codec of ['avc1.42e02a', 'avc1.42e028', 'avc1.4d002a', 'avc1.64002a']) {
      const config = { codec, width: W, height: H, bitrate: 10e6, framerate: FPS, avc: { format: 'avc' } };
      try { if ((await VideoEncoder.isConfigSupported(config)).supported) return config; } catch (e) { /* el siguiente */ }
    }
    return null;
  }
  async function exportVideo(progress) {
    await fontsReady;
    const H = FORMATS[state.format], config = await videoConfig(H);
    if (!config) return null;
    const lc = document.createElement('canvas');
    const a = contentLayer(lc, await prepare(lc, state.format), H);
    const cv = document.createElement('canvas');
    cv.width = W; cv.height = H;
    const c = cv.getContext('2d'), chunks = [];
    let description, failure;
    const encoder = new VideoEncoder({
      output: (chunk, meta) => {
        const data = new Uint8Array(chunk.byteLength);
        chunk.copyTo(data);
        chunks.push({ data, key: chunk.type === 'key', ts: chunk.timestamp });
        const d = meta?.decoderConfig?.description;
        if (d) description = new Uint8Array(ArrayBuffer.isView(d) ? d.buffer.slice(d.byteOffset, d.byteOffset + d.byteLength) : d.slice(0));
      },
      error: e => { failure = e; },
    });
    encoder.configure(config);
    const n = Math.round(loopP() * FPS);
    for (let i = 0; i < n && !failure; i++) {
      animFrame(c, a, i / FPS);
      const frame = new VideoFrame(cv, { timestamp: Math.round(i * 1e6 / FPS), duration: Math.round(1e6 / FPS) });
      encoder.encode(frame, { keyFrame: i % (FPS * 2) === 0 });
      frame.close();
      while (encoder.encodeQueueSize > 4 && !failure) await new Promise(r => setTimeout(r, 4));
      if (i % 6 === 0) { progress(i / n); await new Promise(r => setTimeout(r)); }
    }
    if (!failure) await encoder.flush();
    if (encoder.state !== 'closed') encoder.close();
    if (failure) throw failure;
    return new Blob([crearMp4({ width: W, height: H, fps: FPS, description, chunks })], { type: 'video/mp4' });
  }

  // Miniaturas de los fondos con los colores actuales (solo se repintan si cambia algo que les afecte)
  let thumbsKey = '';
  function drawThumbs(H) {
    const key = [themeKey(), state.customColor, state.seed, H, bgPhotoId, state.bgDim, state.bgBlur, state.energy, state.energyTheme].join('|');
    if (key === thumbsKey || state.template === 'overlay') return;
    thumbsKey = key;
    // se ve la esquina superior derecha ampliada: ahí se notan todos los fondos (en el centro, las líneas finas no se ven)
    document.querySelectorAll('.fondos button').forEach(b => {
      const cv = b.querySelector('canvas'), x = cv.getContext('2d'), k = cv.width / (W * .6);
      x.setTransform(k, 0, 0, k, -W * .4 * k, 0);
      if (b.dataset.value === 'energia') { const [fx, fy] = focus(H); x.setTransform(k, 0, 0, k, cv.width / 2 - fx * k, cv.height / 2 - fy * k); }
      x.fillStyle = C.dark; x.fillRect(0, 0, W, H);
      BGS[b.dataset.value].draw(x, H, rng(state.seed));
      if (b.dataset.value === 'foto' && !bgPhoto) {
        setFont(x, 260, 400, 'Inter');
        x.fillStyle = C.muted; x.textAlign = 'center'; x.textBaseline = 'middle';
        x.fillText('+', W * .7, W * .3);
      }
    });
  }

  async function exportBlob(format) {
    await fontsReady;
    const cv = document.createElement('canvas');
    (await prepare(cv, format))();
    return new Promise(resolve => cv.toBlob(resolve, 'image/png'));
  }
  function fileName(format) {
    const s = state;
    const extra = s.template === 'novedad' ? '-' + s.pack : s.template === 'proximamente' ? '-' + s.proxPack
      : s.template === 'versus' ? `-${s.vsA}-vs-${s.vsB}` : s.template === 'carta' ? '-' + s.cardStyle
      : s.template === 'overlay' && s.ovOnly ? '-transparente' : '';
    return `${s.template}${extra}-${FORMAT_TAG[format]}.png`;
  }
  function downloadBlob(blob, name) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }

  // ── PANEL ─────────────────────────────────────────
  const panel = document.querySelector('.panel');
  const captionEl = document.getElementById('caption');
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

  function buildPackLists() {
    const packs = allPacks();
    const thumb = p => `<img src="${packSrc(p)}" alt="" />`;
    document.querySelectorAll('[data-pack-select]').forEach(sel => {
      sel.innerHTML = packs.map(p => `<option value="${p.slug}">${esc(p.name)}</option>`).join('');
    });
    document.querySelectorAll('[data-packs]').forEach(grid => {
      grid.innerHTML = packs.map(p => `<label><input type="checkbox" value="${p.slug}" />${thumb(p)}${esc(p.name)}</label>`).join('');
    });
    document.getElementById('btnQuitarSobre').hidden = !custom;
  }
  // Muestras de color (degradado foil sobre el color de fondo del tema) y fondos con miniatura
  const swatchBg = k => k === 'auto' ? 'conic-gradient(#FFCB05 0 33%, #E11D2E 0 66%, #FF6A00 0)'
    : `linear-gradient(135deg, ${(k === 'custom' ? customTheme(state.customColor) : THEMES[k]).foil.join(', ')})`;
  const themeTabs = document.querySelector('[data-name="theme"]');
  themeTabs.innerHTML = ['oro', 'auto', ...Object.keys(THEMES).filter(k => k !== 'oro'), 'custom'].map(k => {
    const t = THEMES[k], name = t ? t.name : k === 'auto' ? 'Según el sobre' : 'Tu color';
    return `<button type="button" data-value="${k}" title="${name}"><i style="background:${swatchBg(k)};${t?.base ? `--base:${t.base.dark}` : ''}"></i>${name}</button>`;
  }).join('');
  document.querySelector('[data-name="bg"]').innerHTML = Object.entries(BGS)
    .map(([k, b]) => `<button type="button" data-value="${k}"><canvas width="112" height="112"></canvas>${b.name}</button>`).join('');
  // Selectores de energía (cada botón con su símbolo) y de edición de la carta
  document.querySelectorAll('[data-name="energy"]').forEach(el => {
    el.innerHTML = Object.entries(ENERGIES).map(([k, e]) => `<button type="button" data-value="${k}" title="${e.name}"><canvas width="68" height="68"></canvas>${e.name}</button>`).join('');
    el.querySelectorAll('canvas').forEach(cv => { const k = cv.parentElement.dataset.value; emblem(cv.getContext('2d'), k, 34, 34, 31, ENERGIES[k]); });
  });
  document.querySelector('[data-name="cardStyle"]').innerHTML = Object.entries(CARD_STYLES)
    .map(([k, c]) => `<button type="button" data-value="${k}">${c.name}</button>`).join('');
  const ideas = document.getElementById('ideas');
  ideas.innerHTML = '<button type="button" class="sorpresa" data-idea="random">🎰 Historia random</button>'
    + '<button type="button" class="sorpresa" data-idea="sorpresa">🎲 Sorpréndeme</button>'
    + PRESETS.map((p, i) => `<button type="button" data-idea="${i}"><i style="background:${swatchBg(p.set.theme || STYLE.theme)}"></i>${p.name}</button>`).join('');
  const selectLocation = document.getElementById('selectLocation');
  selectLocation.innerHTML = LOCATIONS.map(l => `<option value="${l}">${l}</option>`).join('')
    + '<option value="otra">Otra…</option><option value="">Sin ubicación</option>';
  const listaLocs = document.getElementById('listaLocs');
  listaLocs.innerHTML = LOCS.map(l => `<label class="check"><input type="checkbox" value="${l.name}" /> ${l.name} <small>${l.zone}</small></label>`).join('');
  buildPackLists();

  const gridMax = key => key === 'repPacks' ? REP_MAX[layout(FORMATS[state.format]).kind] : key === 'topPacks' ? TOP_MAX : SOR_MAX;
  const canDrag = () => !!photo && (state.template === 'pull' || (state.template === 'overlay' && !state.ovOnly)
    || (state.template === 'carta' && state.cardArt === 'foto'));

  function syncUI() {
    document.querySelectorAll('.tabs').forEach(t => t.querySelectorAll('button').forEach(b =>
      b.classList.toggle('is-active', b.dataset.value === state[t.dataset.name])));
    // data-if="clave=valor1|valor2" → solo se ve cuando el estado coincide ("clave!=valor" → cuando no)
    document.querySelectorAll('[data-if]').forEach(el => {
      const [, key, not, vals] = el.dataset.if.match(/^(\w+)(!?)=(.*)$/);
      el.hidden = vals.split('|').includes(String(state[key])) !== !not;
    });
    panel.querySelectorAll('[name]').forEach(el => {
      if (el.type === 'checkbox') el.checked = !!state[el.name];
      else if (el.value !== String(state[el.name])) el.value = state[el.name];
    });
    document.querySelectorAll('[data-packs]').forEach(grid => {
      const key = grid.dataset.packs, max = gridMax(key);
      document.querySelector(`[data-limit="${key}"]`).textContent = key === 'repPacks' ? `(máx. ${max} en este formato)`
        : key === 'topPacks' ? '(márcalos en orden: 1.º, 2.º y 3.º)' : `(máx. ${max})`;
      grid.querySelectorAll('input').forEach(i => {
        i.checked = state[key].includes(i.value);
        i.disabled = !i.checked && state[key].length >= max;
        // en el Top 3 cada sobre marcado muestra su puesto
        if (key !== 'topPacks' || !i.checked) delete i.parentElement.dataset.rank;
        else i.parentElement.dataset.rank = state[key].indexOf(i.value) + 1;
      });
    });
    listaLocs.querySelectorAll('input').forEach(i => { i.checked = state.dondeLocs.includes(i.value); });
    themeTabs.querySelector('[data-value="custom"] i').style.background = swatchBg('custom');
    btnDeshacer.hidden = !undo.length;
    canvas.classList.toggle('movible', canDrag());
  }

  function update(changes) {
    Object.assign(state, changes);
    save();
    syncUI();
    captionEl.value = caption();
    render();
  }

  // Los cambios grandes (ideas rápidas, sorpresa, diseños guardados) se pueden deshacer
  const undo = [];
  const btnDeshacer = document.getElementById('btnDeshacer');
  function apply(changes, msg) {
    undo.push({ ...state });
    if (undo.length > 20) undo.shift();
    update(changes);
    toast(msg);
  }
  function undoLast() {
    if (!undo.length) return;
    update(undo.pop());
    toast('Deshecho ↩︎');
  }
  btnDeshacer.addEventListener('click', undoLast);

  // Historia random: plantilla, colores, fondo, energía, sobres, decoración, marco y efectos al azar (a veces con el
  // estilo de una idea rápida). Los textos vuelven a ser los normales; formato, ubicación, marca y animación se quedan.
  function randomStory() {
    const pick = a => a[Math.floor(Math.random() * a.length)], chance = k => Math.random() < k;
    const slugs = allPacks().map(p => p.slug), some = n => [...slugs].sort(() => Math.random() - .5).slice(0, n);
    const keep = ['format', 'safe', 'guides', 'location', 'locationCustom', 'customName', 'customBrand', 'showLogo', 'showName',
      'footLeft', 'footRight', 'animate', 'animDur', 'bgDim', 'bgBlur', 'photoZoom', 'photoX', 'photoY'];
    const custom = chance(.15);
    const random = {
      template: pick(Object.keys(BUILDERS).filter(k => photo || (k !== 'overlay' && k !== 'pull'))),
      theme: custom ? 'custom' : pick(['auto', ...Object.keys(THEMES)]), customColor: custom ? hsl(Math.random() * 360, 75, 55) : state.customColor,
      bg: pick(Object.keys(BGS).filter(k => k !== 'foto' || bgPhoto)), energy: pick(Object.keys(ENERGIES)), energyTheme: chance(.25),
      deco: pick(['', '', ...Object.keys(DECOS)]), frame: pick(['', '', '', 'foil', 'doble', 'esquinas', 'carta']),
      grain: chance(.4), shine: chance(.6), seed: Math.floor(Math.random() * 1e6),
      cardStyle: pick(Object.keys(CARD_STYLES)), cardBorder: chance(.6) ? 'auto' : pick([...Object.keys(BORDERS), 'tema']),
      cardArt: photo && chance(.5) ? 'foto' : 'sobre', proxMystery: chance(.5), novSeal: pick(['', '', 'limitada', 'ultimas', 'oferta']),
      pack: pick(slugs), proxPack: pick(slugs), cardPack: pick(slugs), repPacks: some(3 + Math.floor(Math.random() * 7)),
      sorPacks: some(3), topPacks: some(3),
    };
    [random.vsA, random.vsB] = some(2);
    // un tercio de las veces, el estilo de una idea rápida (sin sus textos)
    const idea = chance(.35) ? pick(PRESETS).set : {};
    const ideaStyle = Object.fromEntries(Object.entries(idea).filter(([k]) => ['template', 'theme', 'bg', 'deco', 'frame', 'grain', 'shine', 'proxMystery', 'cardStyle'].includes(k)));
    apply({ ...DEFAULTS, ...Object.fromEntries(keep.map(k => [k, state[k]])), ...random, ...ideaStyle }, '🎰 Historia random · ⌘Z deshace');
  }

  ideas.addEventListener('click', e => {
    const b = e.target.closest('[data-idea]');
    if (!b) return;
    if (b.dataset.idea === 'random') randomStory();
    else if (b.dataset.idea === 'sorpresa') {
      const pick = a => a[Math.floor(Math.random() * a.length)];
      apply({
        theme: pick(Object.keys(THEMES)), bg: pick(Object.keys(BGS).filter(k => k !== 'foto' || bgPhoto)),
        deco: pick(['', ...Object.keys(DECOS)]), frame: pick(['', '', 'foil', 'doble', 'esquinas']),
        grain: Math.random() < .5, seed: Math.floor(Math.random() * 1e6),
      }, '🎲 ¿Qué tal así? · ⌘Z deshace');
    } else {
      const p = PRESETS[b.dataset.idea];
      apply({ ...STYLE, ...p.set }, `${p.name} · ⌘Z deshace`);
    }
  });
  document.getElementById('btnVariar').addEventListener('click', () => update({ seed: Math.floor(Math.random() * 1e6) }));

  // Mis diseños: copias del estado guardadas en el navegador
  const STYLE_KEYS = ['theme', 'customColor', 'bg', 'deco', 'frame', 'grain', 'shine', 'seed', 'bgDim', 'bgBlur', 'animate', 'animDur', 'energy', 'energyTheme', 'cardBorder'];
  let saved = [];
  try { saved = JSON.parse(localStorage.getItem(STORE_SAVED) || '[]'); } catch (e) { /* nada */ }
  const listaDisenos = document.getElementById('listaDisenos'), nombreDiseno = document.getElementById('nombreDiseno');
  function buildSaved() {
    listaDisenos.innerHTML = saved.map((d, i) => `<span class="guardado"><button type="button" data-load="${i}">★ ${esc(d.name)}</button>`
      + `<button type="button" data-del="${i}" title="Borrar">✕</button></span>`).join('');
  }
  function storeSaved() {
    try { localStorage.setItem(STORE_SAVED, JSON.stringify(saved)); } catch (e) { toast('No cabe en el navegador'); }
    buildSaved();
  }
  document.getElementById('btnGuardar').addEventListener('click', () => {
    const name = nombreDiseno.value.trim() || `Diseño ${saved.length + 1}`;
    saved = [...saved.filter(d => d.name !== name), { name, state: { ...state } }];
    nombreDiseno.value = '';
    storeSaved();
    toast('Diseño guardado ✓');
  });
  nombreDiseno.addEventListener('keydown', e => { if (e.key === 'Enter') document.getElementById('btnGuardar').click(); });
  listaDisenos.addEventListener('click', e => {
    const b = e.target.closest('button');
    if (!b) return;
    if (b.dataset.load) {
      const d = saved[b.dataset.load];
      apply({ ...d.state }, `«${d.name}» cargado · ⌘Z deshace`);
    } else {
      saved.splice(b.dataset.del, 1);
      storeSaved();
    }
  });
  buildSaved();

  // Imagen de fondo: se reduce y se guarda en el navegador si cabe
  function setBgPhoto(url, select) {
    const im = new Image();
    im.onload = () => { bgPhoto = im; bgPhotoId++; if (select) update({ bg: 'foto' }); else render(); };
    im.src = url;
  }
  try { const url = localStorage.getItem(STORE_BG); if (url) setBgPhoto(url); } catch (e) { /* nada */ }
  document.getElementById('inputFondo').addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;
    const im = new Image();
    im.onload = () => {
      const k = Math.min(1, 1600 / Math.max(im.width, im.height));
      const cv = document.createElement('canvas');
      cv.width = Math.round(im.width * k); cv.height = Math.round(im.height * k);
      cv.getContext('2d').drawImage(im, 0, 0, cv.width, cv.height);
      const url = cv.toDataURL('image/jpeg', .85);
      try { localStorage.setItem(STORE_BG, url); } catch (err) { /* demasiado grande: solo para esta sesión */ }
      setBgPhoto(url, true);
      e.target.value = '';
    };
    im.src = URL.createObjectURL(file);
  });

  document.querySelectorAll('.tabs').forEach(t => t.addEventListener('click', e => {
    const b = e.target.closest('button');
    if (b) update({ [t.dataset.name]: b.dataset.value });
  }));
  panel.addEventListener('input', e => {
    const el = e.target;
    if (!el.name) return;
    const v = el.type === 'checkbox' ? el.checked : el.type === 'range' ? Number(el.value) : el.value;
    update({ [el.name]: v });
  });
  panel.addEventListener('change', e => {
    const grid = e.target.closest('[data-packs]');
    if (grid) {
      const key = grid.dataset.packs;
      const set = state[key].filter(s => s !== e.target.value);
      if (e.target.checked) set.push(e.target.value);
      update({ [key]: set });
    } else if (e.target.closest('#listaLocs')) {
      update({ dondeLocs: LOCATIONS.filter(n => n === e.target.value ? e.target.checked : state.dondeLocs.includes(n)) });
    }
  });

  document.querySelectorAll('#inputFoto, #inputFotoCarta').forEach(input => input.addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;
    const im = new Image();
    im.onload = () => { photo = im; update({ photoZoom: 1, photoX: 0, photoY: 0 }); };
    im.src = URL.createObjectURL(file);
  }));

  // Sobre personalizado: se reduce y se guarda en el navegador para no tener que subirlo cada vez
  document.getElementById('inputSobre').addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;
    const im = new Image();
    im.onload = () => {
      const k = Math.min(1, 1000 / im.height);
      const cv = document.createElement('canvas');
      cv.width = Math.round(im.width * k); cv.height = Math.round(im.height * k);
      cv.getContext('2d').drawImage(im, 0, 0, cv.width, cv.height);
      custom = cv.toDataURL('image/png');
      try { localStorage.setItem(STORE_PACK, custom); } catch (err) { /* demasiado grande: solo para esta sesión */ }
      buildPackLists();
      const name = state.customName.trim() || file.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ');
      update({ customName: name, [{ proximamente: 'proxPack', versus: 'vsB', carta: 'cardPack' }[state.template] || 'pack']: 'custom' });
      e.target.value = '';
    };
    im.src = URL.createObjectURL(file);
  });
  document.getElementById('btnQuitarSobre').addEventListener('click', () => {
    custom = null;
    try { localStorage.removeItem(STORE_PACK); } catch (e) { /* nada */ }
    buildPackLists();
    const fix = s => s === 'custom' ? DEFAULTS.pack : s;
    const drop = list => list.filter(s => s !== 'custom');
    update({
      pack: fix(state.pack), proxPack: fix(state.proxPack), vsA: fix(state.vsA), vsB: fix(state.vsB), cardPack: fix(state.cardPack),
      repPacks: drop(state.repPacks), sorPacks: drop(state.sorPacks), topPacks: drop(state.topPacks),
    });
  });
  // El nombre y la marca del sobre personalizado cambian las listas
  ['customName', 'customBrand'].forEach(n => panel.querySelector(`[name="${n}"]`).addEventListener('change', () => { buildPackLists(); syncUI(); }));

  // Restablece los textos; la plantilla, el formato y el estilo (colores, fondo, marco...) se quedan
  document.getElementById('btnReset').addEventListener('click', () => {
    const keep = ['template', 'format', 'safe', 'guides', 'customName', 'customBrand', 'showLogo', 'showName', 'footLeft', 'footRight', ...STYLE_KEYS];
    update({ ...DEFAULTS, ...Object.fromEntries(keep.map(k => [k, state[k]])) });
  });

  // Arrastrar la foto en la vista previa y hacer zoom con la rueda
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  let drag = null;
  canvas.addEventListener('pointerdown', e => {
    if (!canDrag()) return;
    drag = { x: e.clientX, y: e.clientY, px: state.photoX, py: state.photoY };
    canvas.setPointerCapture(e.pointerId);
    canvas.classList.add('arrastrando');
  });
  canvas.addEventListener('pointermove', e => {
    if (!drag || !photoGeom) return;
    const k = canvas.width / canvas.getBoundingClientRect().width;
    const dx = (e.clientX - drag.x) * k, dy = (e.clientY - drag.y) * k;
    update({
      photoX: photoGeom.ex > 1 ? clamp(drag.px + dx / photoGeom.ex, -1, 1) : state.photoX,
      photoY: photoGeom.ey > 1 ? clamp(drag.py + dy / photoGeom.ey, -1, 1) : state.photoY,
    });
  });
  const endDrag = () => { drag = null; canvas.classList.remove('arrastrando'); };
  canvas.addEventListener('pointerup', endDrag);
  canvas.addEventListener('pointercancel', endDrag);
  canvas.addEventListener('wheel', e => {
    if (!canDrag()) return;
    e.preventDefault();
    update({ photoZoom: clamp(state.photoZoom * (e.deltaY < 0 ? 1.04 : 1 / 1.04), 1, 2.5) });
  }, { passive: false });

  // ── ACCIONES ──────────────────────────────────────
  const aviso = document.getElementById('aviso');
  let avisoTimer;
  function toast(text) {
    aviso.textContent = text;
    aviso.classList.add('visible');
    clearTimeout(avisoTimer);
    avisoTimer = setTimeout(() => aviso.classList.remove('visible'), 2200);
  }

  document.getElementById('btnDescargar').addEventListener('click', async () => {
    downloadBlob(await exportBlob(state.format), fileName(state.format));
  });
  document.getElementById('btnTodos').addEventListener('click', async () => {
    for (const f of Object.keys(FORMATS)) {
      downloadBlob(await exportBlob(f), fileName(f));
      await new Promise(r => setTimeout(r, 400));
    }
    toast('3 formatos descargados');
  });
  const btnVideo = document.getElementById('btnVideo');
  btnVideo.addEventListener('click', async () => {
    const main = document.querySelector('main'), label = btnVideo.textContent;
    main.inert = true; // que nada cambie mientras se crea
    try {
      const blob = await exportVideo(p => { btnVideo.textContent = `Creando vídeo… ${Math.round(p * 100)} %`; });
      if (blob) { downloadBlob(blob, fileName(state.format).replace('.png', '.mp4')); toast('Vídeo listo ✓'); }
      else toast('Este navegador no crea vídeo: usa Chrome o graba la pantalla');
    } catch (e) {
      console.error(e);
      toast('No se ha podido crear el vídeo: graba la pantalla');
    } finally {
      main.inert = false;
      btnVideo.textContent = label;
    }
  });
  document.getElementById('btnCopiarImagen').addEventListener('click', async () => {
    try {
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': exportBlob(state.format) })]);
      toast('Imagen copiada ✓');
    } catch (e) { toast('El navegador no deja copiar la imagen'); }
  });
  document.getElementById('btnCopiarTexto').addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(captionEl.value); toast('Texto copiado ✓'); }
    catch (e) { captionEl.select(); toast('Selecciónalo y cópialo a mano'); }
  });
  // Atajos: ⌘S / Ctrl+S descarga el PNG; ⌘Z deshace una idea rápida (si no estás escribiendo)
  document.addEventListener('keydown', e => {
    if (!(e.metaKey || e.ctrlKey)) return;
    const k = e.key.toLowerCase();
    if (k === 's') { e.preventDefault(); document.getElementById('btnDescargar').click(); }
    else if (k === 'z' && !e.shiftKey && undo.length && !e.target.closest('input, textarea, select')) { e.preventDefault(); undoLast(); }
  });

  syncUI();
  captionEl.value = caption();
  render();
})();
