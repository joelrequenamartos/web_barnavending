const mapTrack    = document.getElementById('mapCarouselTrack');
const mapDotsWrap = document.getElementById('mapCarouselDots');
const mapPrevBtn  = document.getElementById('mapPrevBtn');
const mapNextBtn  = document.getElementById('mapNextBtn');

if (mapTrack) {
  const slides = mapTrack.querySelectorAll('.map-carousel-slide');
  const total  = slides.length;
  let current  = 0;

  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', `Ubicación ${i + 1}`);
    dot.addEventListener('click', () => goTo(i));
    mapDotsWrap.appendChild(dot);
  });

  function goTo(index) {
    current = (index + total) % total;
    mapTrack.style.transform = `translateX(-${current * 100}%)`;
    mapDotsWrap.querySelectorAll('.dot').forEach((d, i) => {
      d.classList.toggle('active', i === current);
    });
  }

  mapPrevBtn.addEventListener('click', () => goTo(current - 1));
  mapNextBtn.addEventListener('click', () => goTo(current + 1));

  let touchStartX = 0;
  mapTrack.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  mapTrack.addEventListener('touchend', e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) goTo(diff > 0 ? current + 1 : current - 1);
  });
}
