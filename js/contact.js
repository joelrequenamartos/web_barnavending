const contactForm = document.getElementById('contactForm');
const formSuccess = document.getElementById('formSuccess');

if (contactForm) {
  contactForm.addEventListener('submit', e => {
    e.preventDefault();
    const btn = contactForm.querySelector('button[type="submit"]');
    btn.textContent = 'Enviando…';
    btn.disabled = true;

    setTimeout(() => {
      formSuccess.classList.add('visible');
      contactForm.reset();
      btn.textContent = 'Enviar mensaje';
      btn.disabled = false;
      setTimeout(() => formSuccess.classList.remove('visible'), 5000);
    }, 800);
  });
}
