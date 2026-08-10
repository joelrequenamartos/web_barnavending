// Haz de luz difuminado en el fondo, siguiendo al cursor (nunca por encima del contenido).
(function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (window.matchMedia('(hover: none)').matches) return;

  var root = document.documentElement;
  var x = window.innerWidth / 2, y = window.innerHeight / 3;
  var tx = x, ty = y;

  document.addEventListener('mousemove', function (e) {
    tx = e.clientX;
    ty = e.clientY;
    root.style.setProperty('--glow-o', '1');
  });

  document.addEventListener('mouseleave', function () {
    root.style.setProperty('--glow-o', '0');
  });

  function tick() {
    x += (tx - x) * .25;
    y += (ty - y) * .25;
    root.style.setProperty('--gx', x.toFixed(0) + 'px');
    root.style.setProperty('--gy', y.toFixed(0) + 'px');
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
})();
