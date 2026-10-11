// Popup «Abre tu sobre»: aparece un sobre cerrado; al tocarlo se rasga y sale una carta con el anuncio.
// - Sale cuando el visitante ha bajado hasta la mitad de la página.
// - Espera a que se acepte o rechace el banner de cookies.
// - Si se cierra, no vuelve a salir en 7 días.
(function () {
  // ---- Configuración fácilmente editable ----
  const PACK_IMAGE   = "imagenes/popup.png";
  const PACK_LABEL   = "TCG Barna Vending";
  const PACK_HINT    = "Toca el sobre para abrirlo";
  const CARD_IMAGE   = "imagenes/30th/sobre-30th-celebration.webp";
  const CARD_EYEBROW = "¡Carta especial!";
  const CARD_TITLE   = "30th Celebration ya en nuestras máquinas";
  const CARD_TEXT    = "La colección del 30 aniversario de Pokémon llega a TCG Barna Vending. Síguenos en Instagram para no perderte cuándo reponemos.";
  const CARD_CTA     = "Síguenos en Instagram";
  const CARD_CTA_URL = "https://www.instagram.com/tcgbarnavending";
  const DAYS_HIDDEN  = 7;   // días sin volver a mostrarlo tras cerrarlo
  const SCROLL_POINT = .5;  // fracción de la página que hay que bajar para que salga
  // --------------------------------------------

  const KEY = "tcg-promo-cerrado";

  function closedRecently() {
    try {
      const t = Number(localStorage.getItem(KEY));
      return t > 0 && Date.now() - t < DAYS_HIDDEN * 864e5;
    } catch (e) { return false; }
  }
  function rememberClosed() {
    try { localStorage.setItem(KEY, String(Date.now())); } catch (e) { /* sin almacenamiento: puede volver a salir */ }
  }

  function buildModal() {
    const overlay = document.createElement("div");
    overlay.className = "promo-modal-overlay";
    overlay.id = "promoModalOverlay";
    overlay.innerHTML = `
      <div class="promo-stage" role="dialog" aria-modal="true" aria-labelledby="promoCardTitle">
        <button class="promo-modal-close" type="button" aria-label="Cerrar">&times;</button>

        <button class="promo-pack" type="button" aria-label="Abrir el sobre">
          <span class="promo-pack-top" aria-hidden="true"></span>
          <span class="promo-pack-body">
            <span class="promo-pack-label">${PACK_LABEL}</span>
            <img src="${PACK_IMAGE}" alt="" />
            <span class="promo-pack-tag">Edición especial</span>
          </span>
        </button>
        <p class="promo-hint">${PACK_HINT}</p>

        <div class="promo-card" aria-hidden="true">
          <div class="promo-card-media"><img src="${CARD_IMAGE}" alt="Sobre de Pokémon 30th Celebration" /></div>
          <span class="promo-card-eyebrow">${CARD_EYEBROW}</span>
          <h2 class="promo-card-title" id="promoCardTitle">${CARD_TITLE}</h2>
          <p class="promo-card-text">${CARD_TEXT}</p>
          <a class="promo-card-cta" href="${CARD_CTA_URL}" target="_blank" rel="noopener">${CARD_CTA}</a>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
    return overlay;
  }

  function init() {
    const overlay = buildModal();
    const stage   = overlay.querySelector(".promo-stage");
    const pack    = overlay.querySelector(".promo-pack");
    const card    = overlay.querySelector(".promo-card");
    const closeBtn = overlay.querySelector(".promo-modal-close");

    function open() {
      document.body.classList.add("promo-modal-open");
      overlay.classList.add("is-visible");
      pack.focus({ preventScroll: true });
    }

    function close() {
      rememberClosed();
      document.body.classList.remove("promo-modal-open");
      overlay.classList.remove("is-visible");
    }

    function openPack() {
      if (stage.classList.contains("is-open")) return;
      stage.classList.add("is-open");
      pack.setAttribute("tabindex", "-1");
      card.removeAttribute("aria-hidden");
      setTimeout(() => card.querySelector(".promo-card-cta").focus({ preventScroll: true }), 700);
    }

    pack.addEventListener("click", openPack);
    closeBtn.addEventListener("click", close);
    overlay.addEventListener("click", e => { if (e.target === overlay) close(); });
    document.addEventListener("keydown", e => {
      if (e.key === "Escape" && overlay.classList.contains("is-visible")) close();
    });
    // Al ir a Instagram (pestaña nueva) el popup se cierra y no vuelve a salir en unos días
    card.querySelector(".promo-card-cta").addEventListener("click", close);

    // 1) esperar al banner de cookies  2) esperar a que baje media página  3) abrir
    const cookiesPending = !!document.querySelector(".cookie-banner");
    const afterCookies = cookiesPending
      ? new Promise(resolve => document.addEventListener("tcg:cookies", resolve, { once: true }))
      : Promise.resolve();

    afterCookies.then(() => new Promise(resolve => {
      function reached() {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        return max <= 0 || window.scrollY / max >= SCROLL_POINT;
      }
      if (reached()) return resolve();
      function onScroll() {
        if (!reached()) return;
        window.removeEventListener("scroll", onScroll);
        resolve();
      }
      window.addEventListener("scroll", onScroll, { passive: true });
    })).then(open);
  }

  if (closedRecently()) return;
  document.addEventListener("DOMContentLoaded", init);
})();
