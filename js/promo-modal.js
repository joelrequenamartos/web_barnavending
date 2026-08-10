(function () {
  // ---- Configuración fácilmente editable ----
  const PROMO_IMAGE = "imagenes/IMAGE_PLACEHOLDER.jpg";
  const PROMO_INSTAGRAM_URL = "https://www.instagram.com/tcgbarnavending";
  const PROMO_TEXT = "Síguenos en Instagram y descubre nuestras novedades, productos y próximos lanzamientos.";
  const PROMO_BUTTON_TEXT = "VER INSTAGRAM";
  const PROMO_EYEBROW = "TCG Barna Vending";
  const PROMO_TITLE = "Síguenos en Instagram";
  // --------------------------------------------

  function buildModal() {
    const overlay = document.createElement("div");
    overlay.className = "promo-modal-overlay";
    overlay.id = "promoModalOverlay";

    overlay.innerHTML = `
      <div class="promo-modal" role="dialog" aria-modal="true" aria-labelledby="promoModalTitle">
        <div class="promo-modal-media">
          <img src="${PROMO_IMAGE}" alt="${PROMO_TITLE}" />
        </div>
        <div class="promo-modal-content">
          <button class="promo-modal-close" id="promoModalClose" aria-label="Cerrar">&times;</button>
          <div class="promo-modal-body">
            <span class="promo-modal-eyebrow">${PROMO_EYEBROW}</span>
            <h2 class="promo-modal-title" id="promoModalTitle">${PROMO_TITLE}</h2>
            <p class="promo-modal-text">${PROMO_TEXT}</p>
          </div>
          <a class="promo-modal-cta" href="${PROMO_INSTAGRAM_URL}" target="_blank" rel="noopener">${PROMO_BUTTON_TEXT}</a>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    return overlay;
  }

  function openModal(overlay) {
    document.body.classList.add("promo-modal-open");
    overlay.classList.add("is-visible");
  }

  function closeModal(overlay) {
    document.body.classList.remove("promo-modal-open");
    overlay.classList.remove("is-visible");
  }

  document.addEventListener("DOMContentLoaded", function () {
    const overlay = buildModal();
    const closeBtn = document.getElementById("promoModalClose");

    closeBtn.addEventListener("click", () => closeModal(overlay));

    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) closeModal(overlay);
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && overlay.classList.contains("is-visible")) {
        closeModal(overlay);
      }
    });

    setTimeout(() => openModal(overlay), 3000);
  });
})();
