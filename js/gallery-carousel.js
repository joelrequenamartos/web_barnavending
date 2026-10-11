// Carrusel de "Últimas llegadas": páginas de 6 sobres (de 2 en móvil).
const galleryTrack    = document.getElementById('galleryTrack');
const galleryDotsWrap = document.getElementById('galleryDots');
const galleryPrevBtn  = document.getElementById('galleryPrevBtn');
const galleryNextBtn  = document.getElementById('galleryNextBtn');

if (galleryTrack) {
  const items  = [...galleryTrack.querySelectorAll('.gallery-item')];
  const mobile = window.matchMedia('(max-width: 600px)');
  let total    = 0;
  let current  = 0;

  // Reparte los sobres en páginas según el ancho de pantalla
  function paginate() {
    const perPage = mobile.matches ? 2 : 6;
    galleryTrack.innerHTML = '';
    galleryDotsWrap.innerHTML = '';
    total = Math.ceil(items.length / perPage);

    for (let i = 0; i < total; i++) {
      const slide = document.createElement('div');
      slide.className = 'carousel-slide';
      const grid = document.createElement('div');
      grid.className = 'gallery-grid';
      items.slice(i * perPage, (i + 1) * perPage).forEach(item => grid.appendChild(item));
      slide.appendChild(grid);
      galleryTrack.appendChild(slide);

      const dot = document.createElement('button');
      dot.className = 'dot';
      dot.setAttribute('aria-label', `Página ${i + 1}`);
      dot.addEventListener('click', () => goTo(i));
      galleryDotsWrap.appendChild(dot);
    }
    goTo(0);
  }

  function goTo(index) {
    current = (index + total) % total;
    galleryTrack.style.transform = `translateX(-${current * 100}%)`;
    galleryDotsWrap.querySelectorAll('.dot').forEach((d, i) => {
      d.classList.toggle('active', i === current);
    });
  }

  paginate();

  galleryPrevBtn.addEventListener('click', () => goTo(current - 1));
  galleryNextBtn.addEventListener('click', () => goTo(current + 1));

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let autoplay = null;
  const start = () => { stop(); if (!reduceMotion) autoplay = setInterval(() => goTo(current + 1), mobile.matches ? 3500 : 6000); };
  const stop  = () => clearInterval(autoplay);
  start();

  mobile.addEventListener('change', () => { paginate(); start(); });

  // en táctil no hay hover real: el autoplay solo se pausa mientras se desliza
  if (window.matchMedia('(hover: hover)').matches) {
    const wrapper = galleryTrack.closest('.carousel-wrapper');
    wrapper.addEventListener('mouseenter', stop);
    wrapper.addEventListener('mouseleave', start);
  }

  let touchStartX = 0;
  galleryTrack.addEventListener('touchstart', e => { stop(); touchStartX = e.touches[0].clientX; }, { passive: true });
  galleryTrack.addEventListener('touchend', e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) goTo(diff > 0 ? current + 1 : current - 1);
    start();
  });
}
