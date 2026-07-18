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

## Desarrollo

No hay build ni dependencias: es HTML/CSS/JS plano. Abre `index.html` en el navegador o sirve la carpeta con cualquier servidor estático:

```bash
python3 -m http.server 8000
```

## Tareas pendientes

- Añadir el embed de Google Maps en la sección "Dónde encontrarnos" (instrucciones en el comentario del propio `index.html`).
- Rellenar la ubicación real de cada máquina en el carrusel.
- Sección de estadísticas comentada en `index.html` hasta tener datos reales.
