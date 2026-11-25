# TCG Barna Vending — Web

Landing page estática de [TCG Barna Vending](https://tcgbarnavending.com): máquinas vending de trading cards (Pokémon TCG, One Piece TCG, Dragon Ball SCG) en Barcelona.

## Estructura

```
index.html      Página única (landing)
css/            Estilos, un archivo por sección (variables.css define la paleta)
js/             Navbar móvil, carrusel de máquinas y animaciones de scroll
imagenes/       Fotos de colecciones (galería "Últimas llegadas")
maquinas/       Fotos de las máquinas vending (carrusel)
robots.txt      SEO
sitemap.xml     SEO
```

## Tienda online

`tienda.html` es la tienda con envío a casa. No cobra en la web: el cliente manda el pedido, llega un correo a tcgbarnavending@gmail.com (función `api/pedido.mjs`, con Resend, igual que las sugerencias) y se le contesta con el total y el pago por Bizum o transferencia.

- **Catálogo:** `datos/productos.json`, sacado del Excel de pedidos (pestaña «Mr Nono»; PVP por sobre de las pestañas Resumen y Stock; caja = sobres × PVP − 10 %). Cada colección (`grupo`) tiene variantes `sobre`, `caja` o `bundle`, cada una con `precio`, `sobres`, `foto`, `disponible` y `mrnono` (id del producto en mrnonohobbies.com).
- **Envío y mínimo:** `envio` (`precio` por debajo de `gratisDesde`, gratis a partir de ahí) y `minimoSobres` / `minimoSobresAniversario`. La función recalcula precios, envío y mínimo con este mismo archivo, así que no se pueden manipular desde el navegador. `vercel.json` lo incluye en la función.
- **Disponibilidad diaria:** `.github/workflows/disponibilidad.yml` ejecuta cada mañana `scripts/actualizar-disponibilidad.mjs`, que marca como agotado lo que Mr Nono tiene «Fuera de stock» (y vuelve a activar lo que vuelve a haber). No necesita contraseña. Para probarlo sin guardar: `node scripts/actualizar-disponibilidad.mjs --prueba`.
- **Fotos de cajas:** `imagenes/cajas/` (960×720, fondo blanco).
- **Textos legales:** `condiciones-venta.html` (envío, pedido mínimo, desistimiento de 14 días y formulario). Hay datos del titular pendientes marcados en rojo.

## Desarrollo

No hay build ni dependencias: es HTML/CSS/JS plano. Abre `index.html` en el navegador o sirve la carpeta con cualquier servidor estático:

```bash
python3 -m http.server 8000
```

## Tareas pendientes

- Añadir el embed de Google Maps en la sección "Dónde encontrarnos" (instrucciones en el comentario del propio `index.html`).
- Rellenar la ubicación real de cada máquina en el carrusel.
- Sección de estadísticas comentada en `index.html` hasta tener datos reales.
