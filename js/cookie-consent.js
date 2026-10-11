// Banner de cookies: los mapas de Google (que instalan cookies de terceros)
// solo se cargan si el visitante acepta. La elección se guarda en el navegador.
(function () {
  const KEY = 'tcg-cookies'; // 'accepted' | 'rejected'

  function getChoice() {
    try { return localStorage.getItem(KEY); } catch (e) { return null; }
  }
  function setChoice(value) {
    try { localStorage.setItem(KEY, value); } catch (e) { /* sin almacenamiento: se vuelve a preguntar */ }
  }

  // Carga los mapas: el src real está en data-src hasta que hay consentimiento
  function loadMaps() {
    document.querySelectorAll('iframe[data-src]').forEach(frame => {
      if (!frame.getAttribute('src')) frame.setAttribute('src', frame.dataset.src);
    });
  }

  let banner = null;

  function buildBanner() {
    banner = document.createElement('div');
    banner.className = 'cookie-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-label', 'Aviso de cookies');
    banner.innerHTML = `
      <p class="cookie-banner-text">
        🍪 Usamos cookies de terceros para mejorar tu experiencia en la web. <a href="cookies.html">Más información</a>
      </p>
      <div class="cookie-banner-btns">
        <button type="button" class="cookie-btn cookie-btn-reject">Rechazar</button>
        <button type="button" class="cookie-btn cookie-btn-accept">Aceptar</button>
      </div>
    `;
    banner.querySelector('.cookie-btn-accept').addEventListener('click', accept);
    banner.querySelector('.cookie-btn-reject').addEventListener('click', reject);
    document.body.appendChild(banner);
    requestAnimationFrame(() => banner.classList.add('is-visible'));
  }

  function hideBanner() {
    if (banner) { banner.remove(); banner = null; }
  }

  // Avisa al resto de la web (p. ej. el popup) de que ya se ha decidido
  function decided(value) {
    document.dispatchEvent(new CustomEvent('tcg:cookies', { detail: value }));
  }

  function accept() {
    setChoice('accepted');
    hideBanner();
    loadMaps();
    decided('accepted');
  }

  function reject() {
    setChoice('rejected');
    hideBanner();
    decided('rejected');
  }

  // Botones "Ver mapa" dentro de cada mapa bloqueado: aceptar desde ahí
  document.querySelectorAll('[data-cookie-accept]').forEach(btn => btn.addEventListener('click', accept));

  // Botón "Cambiar preferencias" de la página de cookies
  document.querySelectorAll('[data-cookie-reset]').forEach(btn => btn.addEventListener('click', () => {
    try { localStorage.removeItem(KEY); } catch (e) { /* nada que borrar */ }
    if (!banner) buildBanner();
  }));

  const choice = getChoice();
  if (choice === 'accepted') loadMaps();
  else if (choice !== 'rejected') buildBanner();
})();
