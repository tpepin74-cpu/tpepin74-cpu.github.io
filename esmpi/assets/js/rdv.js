/* ESM Portes de l'Isère — demande de rendez-vous en ligne, pas à pas */
window.ESMPIRdv = function () {
  'use strict';
  var root = document.getElementById('rdv'); if (!root) return;
  var D = window.ESMPI, byId = {}; D.lieux.forEach(function (l) { byId[l.id] = l; });
  var form = root.querySelector('form'), steps = [].slice.call(root.querySelectorAll('.rdv__step'));
  var prog = [].slice.call(document.querySelectorAll('.progress li')), bar = root.querySelector('.rdv__bar i');
  var prev = root.querySelector('[data-prev]'), next = root.querySelector('[data-next]'), nav = root.querySelector('.rdv__nav');
  var i = 0;
  var PUB = { moi: 'adultes', enfant: 'enfants', ado: 'adolescents', perinat: 'perinatalite', senior: 'seniors' };
  var POUR = { moi: 'Moi-même', enfant: 'Mon enfant (3-11 ans)', ado: 'Mon adolescent (12-17 ans)', perinat: 'Grossesse ou bébé', senior: 'Un proche de 65 ans et plus' };
  var tel = function (n) { var d = n.replace(/\D/g, ''); return '+33' + d.slice(1); };
  var val = function (name) { var f = form.querySelector('[name="' + name + '"]:checked') || form.querySelector('[name="' + name + '"]:not([type=radio]):not([type=checkbox])'); return f ? f.value : ''; };

  /* Zones */
  var zSel = form.querySelector('[name="zone"]');
  D.zones.forEach(function (z) { var o = document.createElement('option'); o.value = z.id; o.textContent = z.label; zSel.appendChild(o); });
  var other = document.createElement('option'); other.value = 'autre'; other.textContent = 'Autre commune ou je ne sais pas'; zSel.appendChild(other);

  var target = function () {
    var pour = val('pour'), zid = zSel.value;
    var z = D.zones.filter(function (x) { return x.id === zid; })[0];
    if (!z) return null;
    var pub = PUB[pour];
    if (z.nord && (pub === 'enfants' || pub === 'adolescents' || pub === 'perinatalite')) return byId.popin;
    return byId[z[pub]];
  };
  var sug = root.querySelector('.suggest');
  var showSuggest = function () {
    var l = target();
    if (zSel.value === 'autre') {
      sug.innerHTML = '<small>Votre interlocuteur</small><h3>Le standard de l\'établissement</h3><p>Il vous indiquera le service de votre secteur.</p><a class="btn btn--primary btn--sm" href="tel:+33474835300">04 74 83 53 00</a>';
      sug.classList.add('is-shown'); return;
    }
    if (!l) { sug.classList.remove('is-shown'); return; }
    sug.innerHTML = '<small>Votre demande sera transmise à</small><h3>' + l.nom + '</h3><p>' + (l.adresse || l.ville) + (l.horaires ? '<br>' + l.horaires : '') + '</p>' +
      '<div class="flex-gap"><a class="btn btn--primary btn--sm" href="tel:' + tel(l.tel) + '">Appeler le ' + l.tel + '</a><span style="color:#b9babc;font-size:.88rem">ou poursuivez votre demande en ligne</span></div>';
    sug.classList.add('is-shown');
  };
  zSel.addEventListener('change', showSuggest);
  form.querySelectorAll('[name="pour"]').forEach(function (r) { r.addEventListener('change', function () { showSuggest(); toggleLien(); }); });

  var lien = root.querySelector('[data-lien]');
  var toggleLien = function () { var on = val('pour') && val('pour') !== 'moi'; lien.hidden = !on; lien.querySelector('select').required = on; };

  /* Disponibilités : les 10 prochains jours ouvrés */
  var days = root.querySelector('.days');
  var d = new Date(); d.setHours(12); var n = 0;
  while (n < 10) {
    d.setDate(d.getDate() + 1);
    if (d.getDay() === 0 || d.getDay() === 6) continue;
    var id = 'd' + n, iso = d.toISOString().slice(0, 10);
    var w = d.toLocaleDateString('fr-FR', { weekday: 'short' }).replace('.', ''), m = d.toLocaleDateString('fr-FR', { month: 'short' }).replace('.', '');
    days.insertAdjacentHTML('beforeend', '<div class="day"><input type="checkbox" id="' + id + '" name="jours" value="' + iso + '"><label for="' + id + '"><small>' + w + '</small><b>' + d.getDate() + '</b><em>' + m + '</em></label></div>');
    n++;
  }

  /* Navigation entre étapes */
  var go = function (k, initial) {
    i = Math.max(0, Math.min(steps.length - 1, k));
    steps.forEach(function (s, j) { s.classList.toggle('is-active', j === i); });
    prog.forEach(function (p, j) { p.classList.toggle('is-current', j === i); p.classList.toggle('is-done', j < i); });
    if (bar) bar.style.width = ((i + 1) / steps.length * 100) + '%';
    prev.hidden = i === 0;
    next.innerHTML = i === steps.length - 1 ? 'Envoyer ma demande <svg aria-hidden="true"><use href="#i-send"/></svg>' : 'Continuer <svg aria-hidden="true"><use href="#i-arrow"/></svg>';
    if (i === steps.length - 1) recap();
    if (initial) return;
    var h = steps[i].querySelector('h2'); if (h) { h.tabIndex = -1; h.focus({ preventScroll: true }); }
    var top = root.getBoundingClientRect().top + window.scrollY - 110;
    if (window.scrollY > top) window.scrollTo({ top: top, behavior: 'smooth' });
  };
  next.addEventListener('click', function () {
    if (!window.ESMPIValidate(steps[i])) return;
    if (i === steps.length - 1) return submit();
    go(i + 1);
  });
  prev.addEventListener('click', function () { go(i - 1); });

  var recap = function () {
    var l = target();
    var jours = [].slice.call(form.querySelectorAll('[name="jours"]:checked')).map(function (c) { return new Date(c.value + 'T12:00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }); });
    var rows = [
      ['Pour', POUR[val('pour')] || '—'],
      ['Commune', zSel.options[zSel.selectedIndex] ? zSel.options[zSel.selectedIndex].text : '—'],
      ['Service', l ? l.nom : 'Standard de l\'établissement'],
      ['Demande', val('type') || '—'],
      ['Orientation médicale', val('orientation') || '—'],
      ['Disponibilités', (jours.length ? jours.join(', ') : 'Indifférent') + ' · ' + (val('moment') || 'indifférent')],
      ['Coordonnées', [val('prenom'), val('nom')].join(' ') + ' · ' + val('tel') + (val('email') ? ' · ' + val('email') : '')],
      ['Être contacté par', val('contact') || 'Téléphone']
    ];
    root.querySelector('.recap').innerHTML = rows.map(function (r) { return '<div><dt>' + r[0] + '</dt><dd>' + String(r[1]).replace(/</g, '&lt;') + '</dd></div>'; }).join('');
  };

  var submit = function () {
    var l = target();
    var ref = 'ESMPI-' + new Date().toISOString().slice(2, 10).replace(/-/g, '') + '-' + Math.random().toString(36).slice(2, 6).toUpperCase();
    next.disabled = true; next.textContent = 'Envoi en cours…';
    setTimeout(function () {
      form.hidden = true; nav.hidden = true; if (bar) bar.style.width = '100%';
      prog.forEach(function (p) { p.classList.remove('is-current'); p.classList.add('is-done'); });
      var t = root.querySelector('.ticket');
      t.querySelector('[data-ref]').textContent = ref;
      t.querySelector('[data-service]').textContent = l ? l.nom : 'le standard de l\'établissement';
      t.querySelector('[data-tel]').innerHTML = l ? '<a class="tel" href="tel:' + tel(l.tel) + '" style="color:#fff">' + l.tel + '</a>' : '<a class="tel" href="tel:+33474835300" style="color:#fff">04 74 83 53 00</a>';
      t.hidden = false; t.focus();
      window.scrollTo({ top: root.getBoundingClientRect().top + window.scrollY - 110, behavior: 'smooth' });
    }, 900);
  };

  /* Pré-remplissage depuis l'orientation ou l'assistant */
  var ps = new URLSearchParams(window.ESMPIQuery != null ? window.ESMPIQuery : location.search);
  if (ps.get('pour')) { var r = form.querySelector('[name="pour"][value="' + ps.get('pour') + '"]'); if (r) r.checked = true; }
  if (ps.get('zone')) zSel.value = ps.get('zone');
  toggleLien(); showSuggest(); go(0, true);
};
window.ESMPIRdv();
