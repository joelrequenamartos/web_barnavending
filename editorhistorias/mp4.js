// Guarda en un .mp4 (vídeo H.264, sin audio) los trozos que devuelve VideoEncoder.
// Todo en memoria y con el índice (moov) delante de los datos, como los MP4 normales de cámara o de móvil.
// chunks: [{ data: Uint8Array, key: bool, ts: µs }] en orden; description: registro avcC que da el codificador.
function crearMp4({ width, height, fps, description, chunks }) {
  if (!description || !chunks.length) throw new Error('El codificador no ha devuelto vídeo');
  for (let i = 1; i < chunks.length; i++) {
    if (chunks[i].ts <= chunks[i - 1].ts) throw new Error('El codificador usa fotogramas B');
  }
  const n = chunks.length, scale = fps * 1000, delta = 1000; // 1000 unidades de tiempo por fotograma
  const ms = Math.round(n * 1000 / fps);
  const text = new TextEncoder();
  const u16 = v => [v >>> 8 & 255, v & 255];
  const u32 = v => [v >>> 24 & 255, v >>> 16 & 255, v >>> 8 & 255, v & 255];
  const zeros = k => new Array(k).fill(0);
  const cat = parts => {
    const arrays = parts.map(p => p instanceof Uint8Array ? p : Uint8Array.from(p));
    const out = new Uint8Array(arrays.reduce((s, a) => s + a.length, 0));
    let o = 0;
    arrays.forEach(a => { out.set(a, o); o += a.length; });
    return out;
  };
  const box = (type, ...parts) => { const body = cat(parts); return cat([u32(body.length + 8), text.encode(type), body]); };
  const full = (type, flags, ...parts) => box(type, [0, flags >>> 16 & 255, flags >>> 8 & 255, flags & 255], ...parts);
  const matrix = [0x10000, 0, 0, 0, 0x10000, 0, 0, 0, 0x40000000].flatMap(u32);
  const keys = chunks.flatMap((c, i) => c.key ? [i + 1] : []);
  const size = chunks.reduce((s, c) => s + c.data.length, 0);

  const ftyp = box('ftyp', text.encode('isom'), u32(0x200), text.encode('isomiso2avc1mp41'));
  const moov = offset => box('moov',
    full('mvhd', 0, u32(0), u32(0), u32(1000), u32(ms), u32(0x10000), u16(0x100), zeros(10), matrix, zeros(24), u32(2)),
    box('trak',
      full('tkhd', 3, u32(0), u32(0), u32(1), u32(0), u32(ms), zeros(8), zeros(8), matrix, u32(width * 65536), u32(height * 65536)),
      box('mdia',
        full('mdhd', 0, u32(0), u32(0), u32(scale), u32(n * delta), u16(0x55c4), u16(0)),
        full('hdlr', 0, u32(0), text.encode('vide'), zeros(12), text.encode('VideoHandler\0')),
        box('minf',
          full('vmhd', 1, zeros(8)),
          box('dinf', full('dref', 0, u32(1), full('url ', 1))),
          box('stbl',
            full('stsd', 0, u32(1), box('avc1',
              zeros(6), u16(1), zeros(16), u16(width), u16(height), u32(0x480000), u32(0x480000),
              u32(0), u16(1), zeros(32), u16(0x18), u16(0xffff), box('avcC', description))),
            full('stts', 0, u32(1), u32(n), u32(delta)),
            full('stss', 0, u32(keys.length), keys.flatMap(u32)),
            full('stsc', 0, u32(1), u32(1), u32(n), u32(1)),
            full('stsz', 0, u32(0), u32(n), chunks.flatMap(c => u32(c.data.length))),
            full('stco', 0, u32(1), u32(offset)))))));
  // los datos empiezan justo después de ftyp, moov y la cabecera de mdat
  const head = ftyp.length + moov(0).length + 8;
  return cat([ftyp, moov(head), u32(size + 8), text.encode('mdat'), ...chunks.map(c => c.data)]);
}
