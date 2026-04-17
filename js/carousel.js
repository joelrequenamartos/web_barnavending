const track    = document.getElementById('carouselTrack');
const dotsWrap = document.getElementById('carouselDots');
const prevBtn  = document.getElementById('prevBtn');
const nextBtn  = document.getElementById('nextBtn');

if (track) {
  const slides = track.querySelectorAll('.carousel-slide');
  const total  = slides.length;
  let current  = 0;

  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', `Slide ${i + 1}`);
    dot.addEventListener('click', () => goTo(i));
    dotsWrap.appendChild(dot);
  });

  function goTo(index) {
    current = (index + total) % total;
    track.style.transform = `translateX(-${current * 100}%)`;
    dotsWrap.querySelectorAll('.dot').forEach((d, i) => {
      d.classList.toggle('active', i === current);
    });
  }

  prevBtn.addEventListener('click', () => goTo(current - 1));
  nextBtn.addEventListener('click', () => goTo(current + 1));

  let autoplay = setInterval(() => goTo(current + 1), 4000);

  track.parentElement.addEventListener('mouseenter', () => clearInterval(autoplay));
  track.parentElement.addEventListener('mouseleave', () => {
    autoplay = setInterval(() => goTo(current + 1), 4000);
  });

  let touchStartX = 0;
  track.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) goTo(diff > 0 ? current + 1 : current - 1);
  });
}
