// Efecto de carta holográfica: inclinación 3D + brillo que sigue al cursor.
(function () {
  var cards = document.querySelectorAll('.gallery-item, .machine-card, .product-card');
  if (!cards.length) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (window.matchMedia('(hover: none)').matches) return;

  cards.forEach(function (card) {
    card.classList.add('holo');

    card.addEventListener('mousemove', function (e) {
      var r = card.getBoundingClientRect();
      var px = (e.clientX - r.left) / r.width;
      var py = (e.clientY - r.top) / r.height;
      card.style.setProperty('--mx', (px * 100).toFixed(1) + '%');
      card.style.setProperty('--my', (py * 100).toFixed(1) + '%');
      card.style.setProperty('--rx', ((py - .5) * -8).toFixed(2) + 'deg');
      card.style.setProperty('--ry', ((px - .5) * 10).toFixed(2) + 'deg');
    });

    card.addEventListener('mouseleave', function () {
      card.style.setProperty('--rx', '0deg');
      card.style.setProperty('--ry', '0deg');
    });
  });
})();
