// Función de Vercel: recibe los pedidos de la tienda (tienda.html) y los manda por correo con Resend.
// No cobra nada: el pedido llega al correo de la tienda y desde allí se contesta al cliente con el pago.
//
// Los precios NO se fían del navegador: se recalculan aquí con datos/productos.json.
// (vercel.json incluye ese archivo en la función; si lo mueves, cámbialo allí también.)
//
// Variables de entorno (las mismas que usa api/sugerencias.mjs):
//   RESEND_API_KEY  clave de Resend (obligatoria)
//   CONTACT_TO      destinatario (opcional, por defecto tcgbarnavending@gmail.com)
//   CONTACT_FROM    remitente (opcional, por defecto onboarding@resend.dev)
// El correo de confirmación al cliente solo sale si Resend tiene un dominio verificado y CONTACT_FROM lo usa;
// con onboarding@resend.dev Resend lo rechaza y el pedido se acepta igualmente.
import { createHmac, timingSafeEqual, randomInt } from 'node:crypto';
import { createRequire } from 'node:module';

const catalogo = createRequire(import.meta.url)('../datos/productos.json');

const GOLD = '#D9A441';
const MIN_AGE_MS = 5000; // nadie rellena una cesta y un formulario de envío en menos de 5 s
const MAX_AGE_MS = 6 * 60 * 60 * 1000; // el token caduca a las 6 h
const MAX_LINEAS = 60;

const JUEGOS = { pokemon: 'Pokémon', onepiece: 'One Piece', dragonball: 'Dragon Ball', accesorio: 'Accesorio' };

const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const euros = (cent) => (cent / 100).toFixed(2).replace('.', ',') + ' €';
const unaLinea = (s, max) => String(s || '').replace(/[\r\n\t]+/g, ' ').trim().slice(0, max);

function horaMadrid() {
  return Object.fromEntries(
    new Intl.DateTimeFormat('en-US', {
      timeZone: 'Europe/Madrid', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
    }).formatToParts(new Date()).map((p) => [p.type, p.value])
  );
}

// Número de pedido legible: BV-1118-K7Q2 (mes y día + 4 caracteres sin letras que se confundan).
function numeroPedido() {
  const abc = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const h = horaMadrid();
  let cola = '';
  for (let i = 0; i < 4; i++) cola += abc[randomInt(abc.length)];
  return `BV-${h.month}${h.day}-${cola}`;
}

function originPermitido(req) {
  const origen = req.headers.origin || req.headers.referer || '';
  let host = '';
  try { host = new URL(origen).hostname; } catch { return false; }
  const servidor = String(req.headers['x-forwarded-host'] || req.headers.host || '').split(',')[0].trim().split(':')[0];
  return (
    (servidor && host === servidor) ||
    host.endsWith('.vercel.app') || host === 'localhost' || host === '127.0.0.1'
  );
}

// Mismo sistema anti-spam que las sugerencias, con otra «sal» para que un token no sirva en el otro formulario.
const firmar = (ts, secret) => createHmac('sha256', secret).update(`pedido:${ts}`).digest('hex');

function tokenValido(token, secret) {
  const [ts, firma] = String(token || '').split('.');
  const edad = Date.now() - Number(ts);
  if (!ts || !firma || !Number.isFinite(edad)) return 'token';
  const esperada = Buffer.from(firmar(ts, secret));
  const recibida = Buffer.from(firma);
  if (esperada.length !== recibida.length || !timingSafeEqual(esperada, recibida)) return 'token';
  if (edad > MAX_AGE_MS) return 'token';
  if (edad < MIN_AGE_MS) return 'too-fast';
  return null;
}

// Convierte la cesta del navegador ({id, cantidad}) en líneas con el precio del catálogo.
function montarLineas(items) {
  if (!Array.isArray(items) || !items.length || items.length > MAX_LINEAS) return { error: 'cesta' };
  const max = Number(catalogo.maxPorProducto) || 10;
  const porId = new Map(catalogo.productos.map((p) => [p.id, p]));
  const vistas = new Set();
  const lineas = [];
  for (const it of items) {
    const p = porId.get(String(it && it.id));
    const cantidad = Number(it && it.cantidad);
    if (!p || vistas.has(p.id) || !Number.isInteger(cantidad) || cantidad < 1 || cantidad > max) return { error: 'cesta' };
    if (!p.disponible) return { error: 'agotado', producto: p.nombre };
    vistas.add(p.id);
    const precio = Math.round(Number(p.precio) * 100);
    lineas.push({ producto: p, cantidad, precio, total: precio * cantidad });
  }
  const subtotal = lineas.reduce((s, l) => s + l.total, 0);
  // Pedido mínimo: X sobres en total (una caja cuenta todos sus sobres) o Y sobres de 30 Aniversario.
  const sobres = lineas.reduce((s, l) => s + l.cantidad * (Number(l.producto.sobres) || 1), 0);
  const aniversario = lineas.reduce((s, l) => s + (l.producto.aniversario ? l.cantidad * (Number(l.producto.sobres) || 1) : 0), 0);
  const minimo = Number(catalogo.minimoSobres) || 0;
  const minimoAniv = Number(catalogo.minimoSobresAniversario) || minimo;
  if (sobres < minimo && aniversario < minimoAniv) return { error: 'minimo' };
  // Envío: precio fijo por debajo de «gratisDesde», gratis a partir de ahí.
  const e = catalogo.envio || {};
  const envio = subtotal < Math.round((Number(e.gratisDesde) || 0) * 100) ? Math.round((Number(e.precio) || 0) * 100) : 0;
  return { lineas, subtotal, envio, total: subtotal + envio };
}

const nombreLinea = (p) =>
  `${p.nombre} · ${p.variante === 'sobre' ? 'sobre' : String(p.detalle || '').toLowerCase()}${p.idioma ? ` (${p.idioma})` : ''}`;

function correoTienda(numero, c, pedido) {
  const filas = pedido.lineas.map((l) => `
      <tr>
        <td style="padding:10px 14px;border-bottom:1px solid #eee;">${l.cantidad} ×</td>
        <td style="padding:10px 14px;border-bottom:1px solid #eee;"><strong>${esc(nombreLinea(l.producto))}</strong><br><span style="color:#777;font-size:14px;">${esc(JUEGOS[l.producto.juego] || '')}${l.producto.codigo ? ` · ${esc(l.producto.codigo)}` : ''} · ${euros(l.precio)}/u</span></td>
        <td style="padding:10px 14px;border-bottom:1px solid #eee;text-align:right;white-space:nowrap;">${euros(l.total)}</td>
      </tr>`).join('');
  const envioTxt = pedido.envio ? euros(pedido.envio) : 'Gratis';
  const html = `<div style="font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.55;color:#222;max-width:640px;">
  <p style="margin:0 0 16px;font-size:18px;"><strong>${esc(c.nombre)}</strong> ha hecho un pedido en la web. Contéstale a este correo con el total y los datos para el pago.</p>
  <div style="border:2px solid ${GOLD};border-radius:10px;overflow:hidden;margin-bottom:18px;">
    <div style="background:${GOLD};color:#1a0e00;font-weight:bold;font-size:18px;padding:12px 16px;">Pedido ${esc(numero)} · ${euros(pedido.total)}</div>
    <table style="width:100%;border-collapse:collapse;font-size:16px;">${filas}
      <tr><td></td><td style="padding:8px 14px;color:#777;">Envío</td><td style="padding:8px 14px;text-align:right;color:#777;">${envioTxt}</td></tr>
      <tr><td></td><td style="padding:8px 14px;font-weight:bold;">Total (IVA incluido)</td><td style="padding:8px 14px;text-align:right;font-weight:bold;white-space:nowrap;">${euros(pedido.total)}</td></tr>
    </table>
  </div>
  <div style="border:1px solid #ddd;border-radius:10px;padding:14px 16px;">
    <div style="font-weight:bold;margin-bottom:6px;">Enviar a</div>
    ${esc(c.nombre)}<br>${esc(c.direccion)}<br>${esc(c.cp)} ${esc(c.ciudad)} (${esc(c.provincia)})<br>
    Tel.: <a href="tel:${esc(c.telefono.replace(/\s/g, ''))}" style="color:${GOLD};">${esc(c.telefono)}</a><br>
    Email: <a href="mailto:${esc(c.correo)}" style="color:${GOLD};">${esc(c.correo)}</a>
    ${c.notas ? `<div style="margin-top:12px;font-weight:bold;">Notas del cliente</div><div style="white-space:pre-wrap;">${esc(c.notas)}</div>` : ''}
  </div>
</div>`;
  const text = [
    `${c.nombre} ha hecho un pedido en la web (${numero}).`,
    '',
    ...pedido.lineas.map((l) => `${l.cantidad} × ${nombreLinea(l.producto)} — ${euros(l.total)}`),
    `Envío: ${envioTxt}`,
    `TOTAL (IVA incluido): ${euros(pedido.total)}`,
    '',
    'Enviar a:',
    c.nombre, c.direccion, `${c.cp} ${c.ciudad} (${c.provincia})`,
    `Tel.: ${c.telefono}`, `Email: ${c.correo}`,
    ...(c.notas ? ['', 'Notas del cliente:', c.notas] : [])
  ].join('\n');
  return { html, text };
}

function correoCliente(numero, c, pedido) {
  const filas = pedido.lineas.map((l) =>
    `<tr><td style="padding:6px 0;">${l.cantidad} × ${esc(nombreLinea(l.producto))}</td><td style="padding:6px 0;text-align:right;white-space:nowrap;">${euros(l.total)}</td></tr>`).join('');
  const html = `<div style="font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.6;color:#222;max-width:560px;">
  <p>¡Hola, ${esc(c.nombre.split(' ')[0])}!</p>
  <p>Hemos recibido tu pedido <strong>${esc(numero)}</strong>. Comprobamos que tenemos todo y te escribimos en menos de 24 horas con los datos para el pago (Bizum o transferencia). <strong>Todavía no tienes que pagar nada.</strong></p>
  <table style="width:100%;border-collapse:collapse;border-top:2px solid ${GOLD};margin:16px 0;">${filas}
    <tr><td style="padding:6px 0;color:#777;">Envío</td><td style="padding:6px 0;text-align:right;color:#777;">${pedido.envio ? euros(pedido.envio) : 'Gratis'}</td></tr>
    <tr><td style="padding:8px 0;font-weight:bold;border-top:1px solid #ddd;">Total</td><td style="padding:8px 0;text-align:right;font-weight:bold;border-top:1px solid #ddd;">${euros(pedido.total)}</td></tr>
  </table>
  <p style="color:#555;">Lo enviaremos a: ${esc(c.direccion)}, ${esc(c.cp)} ${esc(c.ciudad)} (${esc(c.provincia)}).</p>
  <p style="color:#555;">Si quieres cambiar algo, responde a este correo.</p>
  <p>TCG Barna Vending</p>
</div>`;
  const text = `¡Hola, ${c.nombre.split(' ')[0]}!\n\nHemos recibido tu pedido ${numero}. Te escribimos en menos de 24 horas con los datos para el pago (Bizum o transferencia). Todavía no tienes que pagar nada.\n\n` +
    pedido.lineas.map((l) => `${l.cantidad} × ${nombreLinea(l.producto)} — ${euros(l.total)}`).join('\n') +
    `\nEnvío: ${pedido.envio ? euros(pedido.envio) : 'Gratis'}\nTotal: ${euros(pedido.total)}\n\nSi quieres cambiar algo, responde a este correo.\n\nTCG Barna Vending`;
  return { html, text };
}

async function enviar(secret, datos) {
  return fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${secret}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: process.env.CONTACT_FROM || 'TCG Barna Vending <onboarding@resend.dev>', ...datos })
  });
}

export default async function handler(req, res) {
  const secret = process.env.RESEND_API_KEY;

  // GET: entrega el token anti-spam; la tienda lo pide al cargarse.
  if (req.method === 'GET') {
    if (!secret) return res.status(500).json({ ok: false, error: 'not-configured' });
    const ts = Date.now();
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json({ ok: true, token: `${ts}.${firmar(ts, secret)}` });
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ ok: false });
  }

  if (!originPermitido(req)) return res.status(403).json({ ok: false, error: 'origin' });

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { body = {}; }
  }
  body = body || {};

  if (body.web) return res.status(200).json({ ok: true, numero: 'BV-0000-0000' }); // campo trampa: es un robot

  const c = {
    nombre: unaLinea(body.nombre, 120),
    correo: unaLinea(body.correo, 200),
    telefono: unaLinea(body.telefono, 30),
    direccion: unaLinea(body.direccion, 200),
    cp: unaLinea(body.cp, 10),
    ciudad: unaLinea(body.ciudad, 80),
    provincia: unaLinea(body.provincia, 80),
    notas: String(body.notas || '').trim().slice(0, 1000)
  };
  const valido =
    c.nombre && c.direccion && c.ciudad && c.provincia &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.correo) &&
    /^\+?[\d\s().-]{9,20}$/.test(c.telefono) &&
    /^\d{5}$/.test(c.cp) &&
    body.acepto === true;
  if (!valido) return res.status(400).json({ ok: false, error: 'invalid' });

  const pedido = montarLineas(body.items);
  if (pedido.error) return res.status(400).json({ ok: false, error: pedido.error, producto: pedido.producto });

  if (!secret) return res.status(500).json({ ok: false, error: 'not-configured' });
  const fallo = tokenValido(body.token, secret);
  if (fallo) return res.status(400).json({ ok: false, error: fallo });

  const numero = numeroPedido();
  const tienda = correoTienda(numero, c, pedido);

  try {
    const r = await enviar(secret, {
      to: [process.env.CONTACT_TO || 'tcgbarnavending@gmail.com'],
      reply_to: c.correo, // «Responder» contesta directamente al cliente
      subject: `PEDIDO WEB ${numero} · ${unaLinea(c.nombre, 30)} · ${euros(pedido.total)}`,
      html: tienda.html,
      text: tienda.text
    });
    if (!r.ok) {
      const detail = await r.json().catch(() => ({}));
      console.error('Resend rechazó el pedido', r.status, detail);
      const code = r.status === 403 ? 'resend-destinatario' : r.status === 401 ? 'resend-clave' : `resend-${r.status}`;
      return res.status(502).json({ ok: false, error: code });
    }
  } catch {
    return res.status(502).json({ ok: false, error: 'send-failed' });
  }

  // Confirmación al cliente: si falla (p. ej. sin dominio verificado en Resend), el pedido ya está en tu correo.
  let confirmacion = false;
  try {
    const cli = correoCliente(numero, c, pedido);
    const r = await enviar(secret, {
      to: [c.correo],
      reply_to: process.env.CONTACT_TO || 'tcgbarnavending@gmail.com',
      subject: `Hemos recibido tu pedido ${numero} — TCG Barna Vending`,
      html: cli.html,
      text: cli.text
    });
    confirmacion = r.ok;
    if (!r.ok) console.warn('Confirmación al cliente no enviada', r.status);
  } catch { /* sin confirmación */ }

  return res.status(200).json({ ok: true, numero, total: pedido.total, confirmacion });
}
