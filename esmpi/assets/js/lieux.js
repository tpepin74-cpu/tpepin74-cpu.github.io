/* ESM Portes de l'Isère — recherche de lieux de soins (liste + carte Leaflet) */
window.ESMPILieux = function () {
  'use strict';
  var D = window.ESMPI; if (!D) return;
  var PUB = [['tous', 'Tous'], ['adultes', 'Adultes'], ['enfants', 'Enfants'], ['adolescents', 'Adolescents'], ['perinatalite', 'Périnatalité'], ['seniors', '65 ans et plus']];
  var norm = function (s) { return (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); };
  var tel = function (n) { var d = n.replace(/\D/g, ''); return '+33' + d.slice(1); };
  var tone = function (l) { return l.publics.indexOf('adultes') > -1 ? '' : l.publics.indexOf('seniors') > -1 ? 'lime' : 'rose'; };
  var icon = function (name) { return '<svg aria-hidden="true"><use href="#i-' + name + '"/></svg>'; };
  var maps = function (l) { return 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent((l.adresse && l.adresse.indexOf('Intervient') !== 0 ? l.adresse : l.nom + ' ' + l.ville)); };
  var dist = function (a, b, c, d) { var R = 6371, x = (c - a) * Math.PI / 180, y = (d - b) * Math.PI / 180; var h = Math.sin(x / 2) * Math.sin(x / 2) + Math.cos(a * Math.PI / 180) * Math.cos(c * Math.PI / 180) * Math.sin(y / 2) * Math.sin(y / 2); return 2 * R * Math.asin(Math.sqrt(h)); };

  document.querySelectorAll('[data-finder]').forEach(function (root) {
    var limit = parseInt(root.dataset.limit || '0', 10);
    var q = root.querySelector('[data-f-q]'), list = root.querySelector('[data-f-list]'), count = root.querySelector('[data-f-count]');
    var pubBox = root.querySelector('[data-f-publics]'), typeSel = root.querySelector('[data-f-type]'), locBtn = root.querySelector('[data-f-locate]');
    var mapEl = root.querySelector('[data-f-map]'), fallback = root.querySelector('[data-f-fallback]');
    var params = new URLSearchParams(window.ESMPIQuery != null ? window.ESMPIQuery : location.search);
    var state = { pub: params.get('public') || 'tous', q: params.get('q') || '', type: params.get('type') || '', me: null, active: null };
    var zone = params.get('zone');
    var ZQ = { bourgoin: 'Bourgoin', tourdupin: 'Tour-du-Pin', villefontaine: 'Villefontaine', pontdecheruy: 'Chéruy', cremieu: 'Crémieu', morestel: 'Morestel', pontdebeauvoisin: 'Beauvoisin', vienne: 'Vienne', peage: 'Péage', beaurepaire: 'Beaurepaire' };
    if (zone && ZQ[zone]) state.q = ZQ[zone];
    if (q) q.value = state.q;

    PUB.forEach(function (p) {
      var b = document.createElement('button'); b.type = 'button'; b.className = 'chip-btn'; b.textContent = p[1]; b.dataset.pub = p[0];
      b.setAttribute('aria-pressed', p[0] === state.pub ? 'true' : 'false');
      b.addEventListener('click', function () { state.pub = p[0]; pubBox.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); }); render(); });
      pubBox.appendChild(b);
    });

    /* Carte */
    var map = null, markers = {};
    if (window.L && mapEl) {
      try {
        var touch = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
        /* Sur écran tactile, un doigt fait défiler la page : la carte ne se déplace qu'après un premier appui */
        map = L.map(mapEl, { scrollWheelZoom: false, dragging: !touch, tap: false, zoomControl: true, attributionControl: true }).setView([45.55, 5.15], 9);
        if (touch) {
          var hint = document.createElement('p'); hint.className = 'map-hint'; hint.textContent = 'Touchez la carte pour la déplacer';
          mapEl.parentNode.appendChild(hint);
          map.on('click', function () { map.dragging.enable(); hint.classList.add('is-off'); });
        }
        /* Fond de carte : Plan IGN (Géoplateforme, gratuit et sans clé) ; OpenStreetMap prend le relais en cas d'indisponibilité */
        var ign = L.tileLayer('https://data.geopf.fr/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=GEOGRAPHICALGRIDSYSTEMS.PLANIGNV2&STYLE=normal&TILEMATRIXSET=PM&FORMAT=image/png&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}', {
          minZoom: 6, maxZoom: 18, attribution: '&copy; <a href="https://www.ign.fr/" target="_blank" rel="noopener">IGN</a> – Géoplateforme'
        }).addTo(map);
        var tileErrors = 0;
        ign.on('tileerror', function () {
          if (++tileErrors === 4) {
            map.removeLayer(ign);
            L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
              maxZoom: 18, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>'
            }).addTo(map);
          }
        });
        if (fallback) fallback.remove();
        D.lieux.forEach(function (l) {
          var ic = L.divIcon({ className: '', html: '<div class="pin ' + (tone(l) ? 'pin--' + tone(l) : '') + '" data-id="' + l.id + '"></div>', iconSize: [26, 32], iconAnchor: [13, 32], popupAnchor: [0, -30] });
          var m = L.marker([l.lat, l.lng], { icon: ic, title: l.nom, keyboard: true });
          m.bindPopup('<b>' + l.nom + '</b>' + (l.adresse ? l.adresse + '<br>' : '') + '<a href="tel:' + tel(l.tel) + '">' + l.tel + '</a>');
          m.on('click', function () { select(l.id, false); });
          markers[l.id] = m;
        });
        map.on('click', function () { map.scrollWheelZoom.enable(); });
      } catch (e) { map = null; }
    }

    var item = function (l) {
      var li = document.createElement('li'); li.className = 'place'; li.dataset.id = l.id; li.tabIndex = 0;
      var km = state.me ? ' · ' + dist(state.me[0], state.me[1], l.lat, l.lng).toFixed(1).replace('.', ',') + ' km' : '';
      li.innerHTML = '<p class="place__type" style="margin:0"><i class="place__dot ' + (tone(l) ? 'place__dot--' + tone(l) : '') + '"></i>' + l.type_label + ' · ' + l.publics_label.join(', ') + km + '</p>' +
        '<h3>' + l.nom + '</h3><p class="place__addr">' + (l.adresse || l.ville) + (l.secteur ? ' · Secteur ' + l.secteur : '') + '</p>' +
        (l.horaires ? '<p class="place__hours">' + l.horaires + '</p>' : '') +
        '<div class="place__actions"><a class="is-call" href="tel:' + tel(l.tel) + '">' + icon('phone') + l.tel + '</a>' +
        '<a href="' + maps(l) + '" target="_blank" rel="noopener">' + icon('route') + 'Itinéraire</a>' +
        (l.email ? '<a href="mailto:' + l.email + '">' + icon('mail') + 'E-mail</a>' : '') + '</div>';
      li.addEventListener('click', function (e) { if (!e.target.closest('a')) select(l.id, true); });
      li.addEventListener('keydown', function (e) { if (e.key === 'Enter') select(l.id, true); });
      return li;
    };

    var select = function (id, fromList) {
      state.active = id;
      list.querySelectorAll('.place').forEach(function (p) { p.classList.toggle('is-active', p.dataset.id === id); });
      document.querySelectorAll('.pin').forEach(function (p) { p.classList.toggle('is-active', p.dataset.id === id); });
      var m = markers[id];
      if (map && m) { if (fromList) { map.flyTo(m.getLatLng(), 13, { duration: .8 }); } m.openPopup(); }
      if (!fromList) { var el = list.querySelector('[data-id="' + id + '"]'); if (el) el.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); }
    };

    var render = function () {
      var t = norm(state.q).trim();
      var res = D.lieux.filter(function (l) {
        if (state.pub !== 'tous' && l.publics.indexOf(state.pub) < 0) return false;
        if (state.type && l.type !== state.type) return false;
        if (!t) return true;
        return t.split(/\s+/).every(function (w) { return norm([l.nom, l.ville, l.adresse, l.secteur, l.type_label, l.publics_label.join(' '), l.desc].join(' ')).indexOf(w) > -1; });
      });
      if (state.me) res.sort(function (a, b) { return dist(state.me[0], state.me[1], a.lat, a.lng) - dist(state.me[0], state.me[1], b.lat, b.lng); });
      list.innerHTML = '';
      var shown = limit && !t && state.pub === 'tous' && !state.me ? res.slice(0, limit) : res;
      if (!res.length) list.innerHTML = '<li class="empty">Aucun lieu ne correspond. Essayez une autre commune ou appelez le standard au <a href="tel:+33474835300">04 74 83 53 00</a>.</li>';
      shown.forEach(function (l) { list.appendChild(item(l)); });
      if (count) count.textContent = res.length + (res.length > 1 ? ' lieux' : ' lieu') + (limit && shown.length < res.length ? ', ' + shown.length + ' affichés' : '');
      if (map) {
        Object.keys(markers).forEach(function (id) { map.removeLayer(markers[id]); });
        var pts = [];
        res.forEach(function (l) { markers[l.id].addTo(map); pts.push([l.lat, l.lng]); });
        if (state.me) pts.push(state.me);
        if (pts.length) map.fitBounds(pts, { padding: [40, 40], maxZoom: 13 });
      }
    };

    if (q) { var tm; q.addEventListener('input', function () { clearTimeout(tm); tm = setTimeout(function () { state.q = q.value; render(); }, 160); }); }
    if (typeSel) { typeSel.value = state.type; typeSel.addEventListener('change', function () { state.type = typeSel.value; render(); }); }
    if (locBtn) locBtn.addEventListener('click', function () {
      if (!navigator.geolocation) return;
      locBtn.textContent = 'Localisation…';
      navigator.geolocation.getCurrentPosition(function (p) {
        state.me = [p.coords.latitude, p.coords.longitude]; locBtn.innerHTML = icon('locate') + 'Triés par distance'; locBtn.setAttribute('aria-pressed', 'true');
        if (map) L.circleMarker(state.me, { radius: 8, color: '#fff', weight: 3, fillColor: '#212121', fillOpacity: 1 }).addTo(map);
        render();
      }, function () { locBtn.innerHTML = icon('locate') + 'Position indisponible'; }, { enableHighAccuracy: false, timeout: 8000 });
    });
    render();
  });
};
window.ESMPILieux();
