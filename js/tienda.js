// Tienda online: pinta el catálogo de datos/productos.json, gestiona la cesta y manda el pedido a /api/pedido.
// No hay pago en la web: el pedido llega por correo y se cobra después por Bizum o transferencia.
(function () {
  'use strict';

  var CATALOGO_URL = 'datos/productos.json';
  var CLAVE_CESTA = 'bv-cesta';
  var INSTAGRAM = 'https://ig.me/m/tcgbarnavending';

  var JUEGOS = {
    pokemon:    { nombre: 'Pokémon',     icono: '⚡' },
    onepiece:   { nombre: 'One Piece',   icono: '🏴‍☠️' },
    dragonball: { nombre: 'Dragon Ball', icono: '🐉' }
  };
  var IDIOMAS = { ES: '🇪🇸 Español', JP: '🇯🇵 Japonés', KR: '🇰🇷 Coreano', EN: '🇬🇧 Inglés' };
  // secciones del catálogo, en este orden
  var SECCIONES = [
    { juego: 'pokemon', idioma: 'JP', titulo: 'Pokémon en japonés' },
    { juego: 'pokemon', idioma: 'KR', titulo: 'Pokémon en coreano' },
    { juego: 'pokemon', idioma: 'ES', titulo: 'Pokémon en español' },
    { juego: 'onepiece', idioma: 'JP', titulo: 'One Piece en japonés' },
    { juego: 'dragonball', idioma: 'JP', titulo: 'Dragon Ball en japonés' }
  ];
  var VARIANTES = { sobre: 'Sobre', caja: 'Caja', bundle: 'Bundle' };

  var $ = function (id) { return document.getElementById(id); };
  var catalogoEl = $('catalogo');
  if (!catalogoEl) return;

  var datos = null;          // contenido de productos.json
  var porId = {};            // id → producto
  var colecciones = [];      // [{ grupo, items: [sobre, caja…] }] en el orden del archivo
  var porGrupo = {};         // grupo → colección
  var elegida = {};          // grupo → id de la variante que se ve en la tarjeta
  var cesta = leerCesta();   // id → cantidad
  var filtro = 'todo';
  var maxPorProducto = 20;

  // ── utilidades ─────────────────────────────────────
  function centimos(p) { return Math.round(Number(p) * 100); }
  function euros(c) { return (c / 100).toFixed(2).replace('.', ',') + ' €'; }
  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function leerCesta() {
    try { return JSON.parse(localStorage.getItem(CLAVE_CESTA)) || {}; } catch (e) { return {}; }
  }
  function guardarCesta() {
    try { localStorage.setItem(CLAVE_CESTA, JSON.stringify(cesta)); } catch (e) { /* modo privado */ }
  }
  function lineas() {
    return Object.keys(cesta).filter(function (id) { return porId[id] && cesta[id] > 0; }).map(function (id) {
      var p = porId[id];
      return { p: p, cantidad: cesta[id], total: centimos(p.precio) * cesta[id] };
    });
  }
  // Envío: precio fijo por debajo de «gratisDesde» y gratis a partir de ahí.
  // Pedido mínimo: «minimoSobres» sobres en total (una caja cuenta todos sus sobres), o «minimoSobresAniversario» de 30 Aniversario.
  function totales() {
    var ls = lineas();
    var unidades = 0, subtotal = 0, sobres = 0, aniversario = 0;
    ls.forEach(function (l) {
      unidades += l.cantidad; subtotal += l.total;
      var n = l.cantidad * (Number(l.p.sobres) || 1);
      sobres += n;
      if (l.p.aniversario) aniversario += n;
    });
    var e = datos.envio || {};
    var gratisDesde = centimos(e.gratisDesde || 0);
    var envio = ls.length && subtotal < gratisDesde ? centimos(e.precio || 0) : 0;
    var minimo = Number(datos.minimoSobres) || 0, minimoAniv = Number(datos.minimoSobresAniversario) || minimo;
    var minimoOk = !ls.length || sobres >= minimo || aniversario >= minimoAniv;
    return { lineas: ls, unidades: unidades, subtotal: subtotal, envio: envio, total: subtotal + envio,
      sobres: sobres, aniversario: aniversario, minimoOk: minimoOk, faltaGratis: Math.max(0, gratisDesde - subtotal) };
  }
  function nombreLinea(p) {
    return p.nombre + ' · ' + (p.variante === 'sobre' ? 'sobre' : p.detalle.toLowerCase()) + (p.idioma ? ' (' + p.idioma + ')' : '');
  }

  // ── catálogo ───────────────────────────────────────
  function fotoHTML(p) {
    var j = JUEGOS[p.juego] || JUEGOS.pokemon;
    if (p.foto) return '<img src="' + esc(p.foto) + '" alt="' + esc(p.nombre) + '" loading="lazy" />';
    return '<div class="prod-sinfoto prod-sinfoto--' + esc(p.juego) + '">' +
      '<span class="prod-sinfoto-icono" aria-hidden="true">' + j.icono + '</span>' +
      '<span class="prod-sinfoto-txt">Foto próximamente</span></div>';
  }

  function accionHTML(p) {
    if (!p.disponible) return '<span class="prod-agotado">Agotado</span>';
    var n = cesta[p.id] || 0;
    if (!n) return '<button type="button" class="prod-add" data-add="' + esc(p.id) + '">Añadir</button>';
    return '<div class="prod-stepper" role="group" aria-label="Cantidad de ' + esc(nombreLinea(p)) + '">' +
      '<button type="button" data-menos="' + esc(p.id) + '" aria-label="Quitar uno">−</button>' +
      '<span aria-live="polite">' + n + '</span>' +
      '<button type="button" data-mas="' + esc(p.id) + '" aria-label="Añadir uno"' + (n >= maxPorProducto ? ' disabled' : '') + '>+</button></div>';
  }

  // Variante que se ve: la elegida, o el sobre si se puede comprar, o la primera que se pueda comprar.
  function variante(col) {
    var id = elegida[col.grupo];
    if (id && porId[id]) return porId[id];
    return col.items.filter(function (p) { return p.disponible; })[0] || col.items[0];
  }

  function tarjetaHTML(col) {
    var p = variante(col);
    var j = JUEGOS[p.juego] || JUEGOS.pokemon;
    var agotada = !col.items.some(function (q) { return q.disponible; });
    var tags = '<span class="prod-tag">' + j.icono + ' ' + j.nombre + '</span>';
    if (p.idioma) tags += '<span class="prod-idioma">' + esc(IDIOMAS[p.idioma] || p.idioma) + '</span>';
    var opciones = col.items.length > 1
      ? '<div class="prod-variantes" role="radiogroup" aria-label="Formato de ' + esc(p.nombre) + '">' +
        col.items.map(function (q) {
          var on = q.id === p.id;
          return '<button type="button" role="radio" aria-checked="' + on + '" class="prod-variante' + (on ? ' is-on' : '') +
            (q.disponible ? '' : ' is-agotada') + '" data-variante="' + esc(q.id) + '">' +
            '<span>' + VARIANTES[q.variante] + (q.variante === 'sobre' ? '' : ' · ' + q.sobres) + '</span>' +
            '<strong>' + (q.disponible ? euros(centimos(q.precio)) : 'Agotado') + '</strong></button>';
        }).join('') + '</div>'
      : '';
    var cuantos = cesta[p.id] ? ' <span class="prod-encesta">' + cesta[p.id] + ' en la cesta</span>' : '';
    return '<article class="prod' + (agotada ? ' is-agotado' : '') + (p.disponible ? '' : ' is-variante-agotada') +
      '" data-grupo="' + esc(col.grupo) + '" data-juego="' + esc(p.juego) + '">' +
      '<div class="prod-foto">' + fotoHTML(p) +
        (p.etiqueta ? '<span class="prod-etiqueta">' + esc(p.etiqueta) + '</span>' : '') + '</div>' +
      '<div class="prod-cuerpo">' +
        '<div class="prod-tags">' + tags + '</div>' +
        '<h3 class="prod-nombre">' + esc(p.nombre) + (p.codigo ? ' <small>' + esc(p.codigo) + '</small>' : '') + '</h3>' +
        opciones +
        '<p class="prod-detalle">' + esc(p.detalle) + (p.variante !== 'sobre' && p.disponible ? ' · ' + euros(Math.round(centimos(p.precio) / p.sobres)) + '/sobre' : '') + cuantos + '</p>' +
        '<div class="prod-pie"><span class="prod-precio">' + euros(centimos(p.precio)) + '</span>' +
        '<div class="prod-accion">' + accionHTML(p) + '</div></div>' +
      '</div></article>';
  }

  function pintarCatalogo() {
    var html = '';
    SECCIONES.forEach(function (s) {
      if (filtro !== 'todo' && filtro !== s.juego) return;
      var cols = colecciones.filter(function (c) { return c.items[0].juego === s.juego && c.items[0].idioma === s.idioma; });
      if (!cols.length) return;
      html += '<section class="tienda-grupo"><h2 class="tienda-grupo-titulo">' + s.titulo +
        ' <span>' + cols.length + '</span></h2><div class="tienda-grid">' +
        cols.map(tarjetaHTML).join('') + '</div></section>';
    });
    catalogoEl.innerHTML = html || '<p class="tienda-cargando">No hay productos de este juego ahora mismo.</p>';
  }

  // vuelve a pintar solo la tarjeta de una colección (al cambiar de variante o de cantidad)
  function pintarTarjeta(grupo) {
    var el = catalogoEl.querySelector('.prod[data-grupo="' + CSS.escape(grupo) + '"]');
    if (el && porGrupo[grupo]) el.outerHTML = tarjetaHTML(porGrupo[grupo]);
  }
  function pintarAccion(id) { if (porId[id]) pintarTarjeta(porId[id].grupo); }

  catalogoEl.addEventListener('click', function (e) {
    var b = e.target.closest('[data-variante]');
    if (!b) return;
    var id = b.getAttribute('data-variante'), p = porId[id];
    if (!p) return;
    elegida[p.grupo] = id;
    pintarTarjeta(p.grupo);
    var nuevo = catalogoEl.querySelector('[data-variante="' + CSS.escape(id) + '"]');
    if (nuevo) nuevo.focus();
  });

  // ── cesta ──────────────────────────────────────────
  function cambiar(id, delta) {
    var p = porId[id];
    if (!p || !p.disponible) return;
    var n = Math.max(0, Math.min(maxPorProducto, (cesta[id] || 0) + delta));
    if (n) cesta[id] = n; else delete cesta[id];
    guardarCesta();
    pintarAccion(id);
    pintarCesta();
    if (delta > 0) latido();
  }

  var fab = $('cestaFab');
  function latido() {
    fab.classList.remove('is-latido');
    void fab.offsetWidth; // reinicia la animación
    fab.classList.add('is-latido');
  }

  function pintarCesta() {
    var t = totales();
    fab.hidden = !t.unidades;
    $('cestaFabNum').textContent = t.unidades;
    $('cestaFabTotal').textContent = euros(t.total);

    $('cestaLineas').innerHTML = t.lineas.map(function (l) {
      var p = l.p;
      var foto = p.foto
        ? '<img src="' + esc(p.foto) + '" alt="" />'
        : '<span class="cesta-thumb-icono" aria-hidden="true">' + (JUEGOS[p.juego] || JUEGOS.pokemon).icono + '</span>';
      return '<li class="cesta-linea">' +
        '<div class="cesta-thumb">' + foto + '</div>' +
        '<div class="cesta-linea-info"><strong>' + esc(nombreLinea(p)) + '</strong>' +
          '<span>' + euros(centimos(p.precio)) + ' / ud.</span>' +
          '<div class="prod-stepper prod-stepper--sm" role="group" aria-label="Cantidad de ' + esc(p.nombre) + '">' +
            '<button type="button" data-menos="' + esc(p.id) + '" aria-label="Quitar uno">−</button>' +
            '<span>' + l.cantidad + '</span>' +
            '<button type="button" data-mas="' + esc(p.id) + '" aria-label="Añadir uno"' + (l.cantidad >= maxPorProducto ? ' disabled' : '') + '>+</button>' +
          '</div></div>' +
        '<div class="cesta-linea-der"><strong>' + euros(l.total) + '</strong>' +
          '<button type="button" class="cesta-quitar" data-quitar="' + esc(p.id) + '">Quitar</button></div>' +
        '</li>';
    }).join('');

    var vacia = !t.lineas.length;
    $('cestaVacia').hidden = !vacia;
    $('cestaPie').hidden = vacia;
    $('cestaSubtotal').textContent = euros(t.subtotal);
    $('cestaEnvio').textContent = t.envio ? euros(t.envio) : 'Gratis';
    var notas = [];
    if (!t.minimoOk) {
      notas.push('<span class="is-error">El pedido mínimo es de ' + datos.minimoSobres + ' sobres (o ' + datos.minimoSobresAniversario +
        ' de 30 Aniversario). Llevas ' + t.sobres + (t.sobres === 1 ? ' sobre' : ' sobres') + '.</span>');
    }
    if (t.envio && t.faltaGratis) notas.push('Te faltan <strong>' + euros(t.faltaGratis) + '</strong> para el envío gratis.');
    $('cestaNota').innerHTML = notas.join('<br>');
    $('cestaNota').hidden = !notas.length;
    $('cestaContinuar').disabled = !t.minimoOk;
    $('cestaTotal').textContent = euros(t.total);
    $('formTotal').textContent = euros(t.total);
    // si se vacía la cesta estando en el formulario, volvemos a la lista
    if ((vacia || !t.minimoOk) && pasoActual === 'envio') irPaso('cesta');
  }

  // ── panel lateral ──────────────────────────────────
  var panel = $('cesta');
  var velo = $('cestaVelo');
  var pasoActual = 'cesta';
  var ultimoFoco = null;

  function abrir() {
    ultimoFoco = document.activeElement;
    velo.hidden = false;
    panel.removeAttribute('inert');
    panel.setAttribute('aria-hidden', 'false');
    fab.setAttribute('aria-expanded', 'true');
    requestAnimationFrame(function () {
      velo.classList.add('is-abierto');
      panel.classList.add('is-abierto');
    });
    document.body.classList.add('cesta-abierta');
    setTimeout(function () { $('cestaCerrar').focus(); }, 50);
  }
  function cerrar() {
    velo.classList.remove('is-abierto');
    panel.classList.remove('is-abierto');
    panel.setAttribute('inert', '');
    panel.setAttribute('aria-hidden', 'true');
    fab.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('cesta-abierta');
    setTimeout(function () { velo.hidden = true; }, 300);
    if (pasoActual === 'hecho') irPaso('cesta');
    if (ultimoFoco && ultimoFoco.focus) ultimoFoco.focus();
  }
  function irPaso(paso) {
    pasoActual = paso;
    panel.querySelectorAll('.cesta-paso').forEach(function (s) { s.hidden = s.getAttribute('data-paso') !== paso; });
    $('cestaAtras').hidden = paso !== 'envio';
    $('cestaTitulo').textContent = paso === 'envio' ? 'Datos de envío' : paso === 'hecho' ? 'Pedido enviado' : 'Tu cesta';
    panel.scrollTop = 0;
    var cuerpo = panel.querySelector('.cesta-paso:not([hidden])');
    if (cuerpo) cuerpo.scrollTop = 0;
  }

  fab.addEventListener('click', abrir);
  velo.addEventListener('click', cerrar);
  $('cestaCerrar').addEventListener('click', cerrar);
  $('cestaAtras').addEventListener('click', function () { irPaso('cesta'); });
  $('cestaContinuar').addEventListener('click', function () {
    irPaso('envio');
    pedirToken();
    setTimeout(function () { $('pedidoForm').elements.nombre.focus(); }, 50);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && panel.classList.contains('is-abierto')) cerrar();
  });

  // clics en + / − / Añadir / Quitar, tanto en el catálogo como en la cesta
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-add],[data-mas],[data-menos],[data-quitar],[data-cerrar]');
    if (!b) return;
    if (b.hasAttribute('data-cerrar')) { cerrar(); return; }
    var id = b.getAttribute('data-add') || b.getAttribute('data-mas') || b.getAttribute('data-menos') || b.getAttribute('data-quitar');
    if (b.hasAttribute('data-quitar')) { cambiar(id, -(cesta[id] || 0)); return; }
    var enCatalogo = !!b.closest('.prod-accion');
    cambiar(id, b.hasAttribute('data-menos') ? -1 : 1);
    // tras pulsar en el catálogo, el foco vuelve al control que ha sustituido al botón
    if (enCatalogo && porId[id]) {
      var acc = catalogoEl.querySelector('.prod[data-grupo="' + CSS.escape(porId[id].grupo) + '"] .prod-accion');
      var foco = acc && (acc.querySelector(b.hasAttribute('data-menos') ? '[data-menos]' : '[data-mas]') || acc.querySelector('button'));
      if (foco) foco.focus();
    }
  });

  // filtros por juego
  document.querySelectorAll('.tienda-chip').forEach(function (chip) {
    chip.addEventListener('click', function () {
      filtro = chip.getAttribute('data-juego');
      document.querySelectorAll('.tienda-chip').forEach(function (c) {
        var on = c === chip;
        c.classList.toggle('is-active', on);
        c.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
      pintarCatalogo();
    });
  });

  // ── pedir por Instagram: copia el resumen y abre el chat ──
  function resumenTexto() {
    var t = totales();
    return '¡Hola! Quiero hacer este pedido desde la web:\n' +
      t.lineas.map(function (l) { return '• ' + l.cantidad + ' × ' + nombreLinea(l.p) + ' — ' + euros(l.total); }).join('\n') +
      '\nEnvío: ' + (t.envio ? euros(t.envio) : 'gratis') + '\nTotal: ' + euros(t.total);
  }
  // Copia en el momento (antes de abrir la otra pestaña, que quita el foco y hace fallar el portapapeles).
  function copiar(texto) {
    var ta = document.createElement('textarea');
    ta.value = texto;
    ta.setAttribute('readonly', '');
    ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0;';
    document.body.appendChild(ta);
    ta.select();
    var ok = false;
    try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
    ta.remove();
    if (!ok && navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(texto).catch(function () {});
      ok = true;
    }
    return ok;
  }
  $('cestaIg').addEventListener('click', function () {
    var copiado = copiar(resumenTexto());
    var win = window.open(INSTAGRAM, '_blank');
    if (win) win.opener = null;
    $('cestaIgNota').textContent = copiado
      ? 'Pedido copiado. Pégalo en el chat de Instagram' + (win ? ' que se ha abierto.' : ': búscanos como @tcgbarnavending.')
      : 'Escríbenos por Instagram a @tcgbarnavending con lo que quieres.';
  });

  // ── formulario de envío ────────────────────────────
  var form = $('pedidoForm');
  var status = $('pedidoStatus');
  var endpoint = form.getAttribute('data-endpoint');
  var token = '';
  var tokenPedido = false;

  function setStatus(text, kind) {
    status.textContent = text;
    status.className = 'sug-status' + (kind ? ' is-' + kind : '');
  }
  function pedirToken(forzar) {
    if (!endpoint || (tokenPedido && !forzar)) return;
    tokenPedido = true;
    fetch(endpoint, { headers: { Accept: 'application/json' } })
      .then(function (r) { return r.ok ? r.json() : {}; })
      .then(function (d) { token = (d && d.token) || ''; })
      .catch(function () {});
  }

  var REGLAS = {
    correo: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); },
    telefono: function (v) { return /^\+?[\d\s().-]{9,20}$/.test(v); },
    cp: function (v) { return /^\d{5}$/.test(v); }
  };

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var el = form.elements;
    var primero = null;
    form.querySelectorAll('.sug-field').forEach(function (field) {
      var input = field.querySelector('input, textarea');
      if (!input.required) return;
      var v = input.value.trim();
      var mal = !v || (REGLAS[input.name] && !REGLAS[input.name](v));
      field.classList.toggle('is-invalid', mal);
      if (mal && !primero) primero = input;
    });
    var acepta = el.acepto.checked;
    $('aceptoWrap').classList.toggle('is-invalid', !acepta);
    if (primero || !acepta) {
      setStatus(primero ? 'Revisa los campos marcados.' : 'Tienes que aceptar las condiciones de venta.', 'error');
      (primero || el.acepto).focus();
      return;
    }
    if (el.web.value) return; // campo trampa

    var t = totales();
    if (!t.lineas.length || !t.minimoOk) { irPaso('cesta'); return; }

    var boton = form.querySelector('button[type="submit"]');
    boton.disabled = true;
    setStatus('Enviando pedido…');

    var payload = {
      nombre: el.nombre.value.trim(), correo: el.correo.value.trim(), telefono: el.telefono.value.trim(),
      direccion: el.direccion.value.trim(), cp: el.cp.value.trim(), ciudad: el.ciudad.value.trim(),
      provincia: el.provincia.value.trim(), notas: el.notas.value.trim(), acepto: true,
      items: t.lineas.map(function (l) { return { id: l.p.id, cantidad: l.cantidad }; }),
      web: el.web.value, token: token
    };

    fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload)
    }).then(function (res) {
      return res.json().catch(function () { return {}; }).then(function (d) {
        if (!res.ok || !d.ok) { var err = new Error('pedido'); err.code = d.error || ('http-' + res.status); err.producto = d.producto; throw err; }
        return d;
      });
    }).then(function (d) {
      cesta = {};
      guardarCesta();
      pintarCatalogo();
      pintarCesta();
      form.reset();
      setStatus('');
      $('hechoNumero').textContent = 'Nº ' + d.numero;
      $('hechoTexto').textContent = d.confirmacion
        ? 'Te hemos mandado un correo con el resumen. En menos de 24 horas te escribimos con el total y los datos para el pago (Bizum o transferencia).'
        : 'Te escribimos en menos de 24 horas al correo que nos has dado con el total y los datos para el pago (Bizum o transferencia).';
      irPaso('hecho');
      fab.hidden = true;
      tokenPedido = false;
    }).catch(function (err) {
      var code = err && err.code;
      if (code === 'too-fast') { setStatus('Un momento… vuelve a pulsar «Enviar pedido» en unos segundos.', 'error'); return; }
      if (code === 'token') { pedirToken(true); setStatus('La página llevaba mucho rato abierta. Vuelve a pulsar «Enviar pedido».', 'error'); return; }
      if (code === 'minimo') { irPaso('cesta'); setStatus(''); return; }
      if (code === 'agotado') { setStatus((err.producto || 'Un producto') + ' se acaba de agotar. Quítalo de la cesta y vuelve a intentarlo.', 'error'); return; }
      setStatus('No se ha podido enviar el pedido. Escríbenos a tcgbarnavending@gmail.com o por Instagram.' + (code ? ' (' + code + ')' : ''), 'error');
    }).finally(function () { boton.disabled = false; });
  });

  form.addEventListener('input', function (e) {
    var f = e.target.closest('.sug-field, .cesta-acepto');
    if (f) f.classList.remove('is-invalid');
  });

  // ── arranque ───────────────────────────────────────
  fetch(CATALOGO_URL, { cache: 'no-cache' })
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(function (d) {
      datos = d;
      maxPorProducto = Number(d.maxPorProducto) || 20;
      d.productos.forEach(function (p) {
        porId[p.id] = p;
        var g = p.grupo || p.id;
        if (!porGrupo[g]) { porGrupo[g] = { grupo: g, items: [] }; colecciones.push(porGrupo[g]); }
        porGrupo[g].items.push(p);
      });
      // fuera de la cesta lo que ya no existe o se ha agotado
      Object.keys(cesta).forEach(function (id) {
        if (!porId[id] || !porId[id].disponible) delete cesta[id];
        else cesta[id] = Math.min(maxPorProducto, Math.max(1, parseInt(cesta[id], 10) || 1));
      });
      guardarCesta();
      if (d.aviso) { var a = $('tiendaAviso'); a.textContent = d.aviso; a.hidden = false; }
      pintarCatalogo();
      pintarCesta();
    })
    .catch(function () {
      catalogoEl.innerHTML = '<p class="tienda-cargando">No se han podido cargar los productos. Recarga la página o escríbenos por <a href="' + INSTAGRAM + '">Instagram</a>.</p>';
    });
})();
