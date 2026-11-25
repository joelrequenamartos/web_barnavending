// Actualiza «disponible» en datos/productos.json según el stock de Mr Nono (mrnonohobbies.com).
//
// Mr Nono enseña sin iniciar sesión si cada producto está en stock o «Fuera de stock» en sus listados
// de categoría (los precios sí piden sesión, por eso aquí no se tocan). Cada producto de la tienda
// lleva en «mrnono» el id de su ficha allí.
//
// Uso:  node scripts/actualizar-disponibilidad.mjs           → escribe los cambios
//       node scripts/actualizar-disponibilidad.mjs --prueba  → solo dice qué cambiaría
//
// Lo ejecuta cada mañana .github/workflows/disponibilidad.yml. Por seguridad no cambia nada si algún
// listado falla o si faltan muchos productos (por ejemplo, si Mr Nono cambia su web).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const CATALOGO = path.join(RAIZ, 'datos', 'productos.json');
const CATEGORIAS = ['13-pokemon-tcg', '39-otros-tcg', '40-otros-tcg', '41-dragon-ball-tcg'];
const PRUEBA = process.argv.includes('--prueba');

async function listado(cat) {
  for (let intento = 1; intento <= 3; intento++) {
    try {
      const r = await fetch(`https://mrnonohobbies.com/${cat}?resultsPerPage=1000`, {
        headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest', 'User-Agent': 'Mozilla/5.0 (TCG Barna Vending stock)' },
        signal: AbortSignal.timeout(120000)
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const j = await r.json();
      if (!Array.isArray(j.products) || typeof j.rendered_products !== 'string') throw new Error('formato inesperado');
      return j;
    } catch (e) {
      console.warn(`  ${cat}: intento ${intento} falló (${e.message})`);
      if (intento < 3) await new Promise((r) => setTimeout(r, 15000 * intento));
    }
  }
  throw new Error(`No se ha podido leer el listado ${cat}`);
}

// id de Mr Nono → true (hay stock) / false (fuera de stock)
async function stockMrNono() {
  const stock = new Map();
  for (const cat of CATEGORIAS) {
    const j = await listado(cat);
    // cada producto es un <article data-id-product="…">; si está agotado lleva <li class="product-flag out_of_stock">
    const trozos = j.rendered_products.split(/(?=<article[^>]*data-id-product=")/);
    let n = 0;
    for (const t of trozos) {
      const m = t.match(/data-id-product="(\d+)"/);
      if (!m) continue;
      const id = Number(m[1]);
      if (!stock.has(id)) stock.set(id, !/out_of_stock|Fuera de stock/i.test(t));
      n++;
    }
    console.log(`  ${cat}: ${n} productos`);
  }
  return stock;
}

const texto = fs.readFileSync(CATALOGO, 'utf8');
const catalogo = JSON.parse(texto);
const stock = await stockMrNono();

const conId = catalogo.productos.filter((p) => p.mrnono);
const sinDato = conId.filter((p) => !stock.has(p.mrnono));
if (sinDato.length > conId.length * 0.25) {
  console.error(`Faltan ${sinDato.length} de ${conId.length} productos en los listados de Mr Nono: no se cambia nada.`);
  process.exit(1);
}

const cambios = [];
for (const p of conId) {
  if (!stock.has(p.mrnono)) continue; // si Mr Nono ya no lo lista, se deja como estaba
  const hay = stock.get(p.mrnono);
  if (p.disponible !== hay) cambios.push({ p, hay });
}

for (const s of sinDato) console.log(`  ? ${s.id}: Mr Nono no lo lista (id ${s.mrnono}), se deja como estaba`);
if (!cambios.length) {
  console.log('Sin cambios de disponibilidad.');
  process.exit(0);
}
for (const { p, hay } of cambios) console.log(`  ${hay ? '✔ vuelve a haber' : '✘ agotado'}: ${p.id}`);

if (PRUEBA) {
  console.log(`(prueba) ${cambios.length} cambios; no se escribe nada.`);
  process.exit(0);
}

// Cambia solo el «"disponible": …» de cada línea afectada, para no reordenar el archivo.
let nuevo = texto;
for (const { p, hay } of cambios) {
  const re = new RegExp(`(\\{"id": "${p.id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}",[^\\n]*?"disponible": )(true|false)`);
  if (!re.test(nuevo)) { console.error(`No encuentro la línea de ${p.id}`); process.exit(1); }
  nuevo = nuevo.replace(re, `$1${hay}`);
}
JSON.parse(nuevo); // comprobación: sigue siendo JSON válido
fs.writeFileSync(CATALOGO, nuevo);
console.log(`${cambios.length} cambios guardados en datos/productos.json`);
