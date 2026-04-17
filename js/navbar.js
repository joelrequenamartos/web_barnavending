const navToggle = document.getElementById('navToggle');
const navLinks  = document.querySelector('.nav-links');

navToggle.addEventListener('click', () => {
  navLinks.classList.toggle('open');
});

navLinks.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => navLinks.classList.remove('open'));
});

const navbar = document.querySelector('.navbar');
window.addEventListener('scroll', () => {
  navbar.style.boxShadow = window.scrollY > 10
    ? '0 4px 24px rgba(0,0,0,.5)'
    : 'none';
});
