// Formulario de sugerencias. Envía a /api/sugerencias (api/sugerencias.mjs), que manda el correo con Resend.
// Sin data-endpoint (modo prueba) valida y avisa, pero NO envía nada a nadie.
(function () {
  const form = document.getElementById('sugForm');
  if (!form) return;

  const status    = form.querySelector('.sug-status');
  const submitBtn = form.querySelector('button[type="submit"]');
  const endpoint  = form.getAttribute('data-endpoint');

  function setStatus(text, kind) {
    status.textContent = text;
    status.className = 'sug-status' + (kind ? ' is-' + kind : '');
  }

  // Anti-spam: al cargar la página se pide un token firmado con la hora; el servidor comprueba que han pasado unos segundos.
  let spamToken = '';
  function pedirToken() {
    if (!endpoint || endpoint.charAt(0) !== '/') return;
    fetch(endpoint, { headers: { Accept: 'application/json' } })
      .then(r => (r.ok ? r.json() : {}))
      .then(d => { spamToken = (d && d.token) || ''; })
      .catch(() => {});
  }
  pedirToken();

  form.addEventListener('submit', e => {
    e.preventDefault();

    // Los tres campos son obligatorios y el correo tiene que ser válido.
    let bad = false;
    form.querySelectorAll('.sug-field').forEach(field => {
      const input = field.querySelector('input, textarea');
      const empty = !input.value.trim();
      const wrongMail = input.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim());
      field.classList.toggle('is-invalid', empty || wrongMail);
      if (empty || wrongMail) bad = true;
    });
    if (bad) { setStatus('Revisa los campos marcados.', 'error'); return; }
    if (form.elements['web'].value) return; // anti-spam: un robot rellenó el campo oculto

    if (!endpoint) {
      setStatus('Modo prueba: el formulario es correcto, pero todavía no se envía a ningún correo.', 'ok');
      return;
    }

    submitBtn.disabled = true;
    setStatus('Enviando…');
    const payload = {
      nombre: form.elements['nombre'].value.trim(),
      correo: form.elements['correo'].value.trim(),
      mensaje: form.elements['mensaje'].value.trim(),
      web: form.elements['web'].value,
      token: spamToken
    };

    fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload)
    }).then(res => res.json().catch(() => ({})).then(data => {
      if (!res.ok) { const err = new Error('status ' + res.status); err.code = data.error || ('http-' + res.status); throw err; }
      return data;
    })).then(() => {
      form.reset();
      setStatus('');
      const wrap = form.closest('.sug-wrap');
      wrap.style.minHeight = wrap.offsetHeight + 'px'; // mantiene el hueco para que la burbuja quede justo en medio
      form.setAttribute('inert', '');
      wrap.classList.add('is-sent');
    }).catch(err => {
      const code = err && err.code;
      if (code === 'too-fast') { setStatus('Un momento… vuelve a pulsar «Enviar» en unos segundos.', 'error'); return; }
      if (code === 'token') { pedirToken(); setStatus('Se ha caducado el formulario. Vuelve a pulsar «Enviar».', 'error'); return; }
      setStatus('No se ha podido enviar. Escríbenos a tcgbarnavending@gmail.com.' + (code ? ' (' + code + ')' : ''), 'error');
    }).finally(() => { submitBtn.disabled = false; });
  });

  // Al corregir un campo marcado, se quita el aviso
  form.querySelectorAll('.sug-field input, .sug-field textarea').forEach(input => {
    input.addEventListener('input', () => input.closest('.sug-field').classList.remove('is-invalid'));
  });
})();
