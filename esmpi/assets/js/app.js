/* ESM Portes de l'Isère — interactions générales */
(function () {
  'use strict';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* En-tête : état au défilement */
  var header = $('#header');
  var fabEl = $('.chat-fab');
  var onScroll = function () {
    var heroEl = $('.hero');
    if (header) header.classList.toggle('is-scrolled', window.scrollY > 40);
    if (fabEl) fabEl.classList.toggle('is-away', !!heroEl && window.scrollY < heroEl.offsetHeight * 0.55);
  };
  window.ESMPIScroll = onScroll;
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* Méga-menu */
  $$('[data-mega]').forEach(function (btn) {
    var panel = document.getElementById(btn.getAttribute('aria-controls'));
    var item = btn.parentElement, t;
    var open = function (v) { btn.setAttribute('aria-expanded', v ? 'true' : 'false'); panel.classList.toggle('is-open', v); };
    btn.addEventListener('click', function () { open(btn.getAttribute('aria-expanded') !== 'true'); });
    item.addEventListener('mouseenter', function () { clearTimeout(t); open(true); });
    item.addEventListener('mouseleave', function () { t = setTimeout(function () { open(false); }, 180); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { open(false); } });
    document.addEventListener('click', function (e) { if (!item.contains(e.target)) open(false); });
  });

  /* Menu mobile (feuille glissante) */
  var sheet = $('#menu');
  $$('[data-menu-open]').forEach(function (b) { b.addEventListener('click', function () { if (sheet && sheet.showModal) sheet.showModal(); }); });
  $$('[data-menu-close]').forEach(function (b) { b.addEventListener('click', function () { sheet.close(); }); });
  if (sheet) sheet.addEventListener('click', function (e) { if (e.target === sheet) sheet.close(); });

  window.ESMPINav = window.ESMPINav || function (url) { window.location.href = url; };

  /* Contenu de page (réexécutable) */
  window.ESMPIInitPage = function () {
  /* Formulaire d'orientation (« Vous êtes ? / Vous recherchez ? ») */
  var ORIENT = {
    patient: { label: 'Un adulte qui souhaite consulter', needs: [
      ['Un premier rendez-vous', 'rendez-vous.html?pour=moi'],
      ['Le CMP le plus proche de chez moi', 'lieux-de-soins.html?public=adultes'],
      ["L'offre de soins pour adultes", 'psychiatrie-adulte.html'],
      ['Une aide pour une addiction', 'psychiatrie-adulte.html#specialisees'],
      ['Préparer une hospitalisation', 'votre-sejour.html#admission'],
      ['Mes droits, mon dossier médical', 'droits-patients.html#dossier-medical'],
      ['Une aide en urgence', 'contact.html#urgence'] ] },
    parent: { label: "Parent d'un enfant ou d'un adolescent", needs: [
      ["Contacter POP'IN (Nord-Isère)", 'perinatalite-enfants-adolescents.html#popin'],
      ['Un CMP enfants ou adolescents', 'lieux-de-soins.html?public=enfants'],
      ['Un premier rendez-vous', 'rendez-vous.html?pour=enfant'],
      ['Les soins pour les 3-11 ans', 'perinatalite-enfants-adolescents.html#enfants'],
      ['Les soins pour les 12-17 ans', 'perinatalite-enfants-adolescents.html#adolescents'],
      ['Du soutien en tant que parent', 'perinatalite-enfants-adolescents.html#parents'],
      ['Une aide en urgence', 'contact.html#urgence'] ] },
    perinat: { label: 'Future maman ou jeune parent', needs: [
      ['Être accompagnée pendant la grossesse ou après', 'perinatalite-enfants-adolescents.html#perinatalite'],
      ['Un soutien après un deuil périnatal', 'perinatalite-enfants-adolescents.html#deuil-perinatal'],
      ['Un premier rendez-vous', 'rendez-vous.html?pour=perinat'],
      ['Les lieux de soins en périnatalité', 'lieux-de-soins.html?public=perinatalite'] ] },
    senior: { label: "Personne âgée ou son entourage", needs: [
      ["L'équipe mobile de géronto-psychiatrie", 'geronto-psychiatrie.html#equipe-mobile'],
      ["Joindre l'équipe de mon secteur", 'geronto-psychiatrie.html#contact'],
      ['Un premier rendez-vous', 'rendez-vous.html?pour=senior'],
      ['Du soutien en tant qu\'aidant', 'geronto-psychiatrie.html#aidants'] ] },
    proche: { label: 'Proche ou aidant', needs: [
      ['Le programme BREF ou le Temps Écoute Famille', 'proches-aidants.html#programmes'],
      ['Un groupe de parole ou la pair-aidance', 'proches-aidants.html#pair-aidance'],
      ['La Maison des usagers', 'contact.html#maison-des-usagers'],
      ['Être informé sur la situation de mon proche', 'proches-aidants.html#informer'],
      ['Faire une remarque ou une réclamation', 'droits-patients.html#reclamations'] ] },
    pro: { label: 'Professionnel de santé', needs: [
      ['Adresser un patient', 'professionnels-de-sante.html#adresser'],
      ["Les critères d'orientation", 'professionnels-de-sante.html#criteres'],
      ['Le numéro direct d\'un service', 'lieux-de-soins.html'],
      ['Les ressources institutionnelles', 'professionnels-de-sante.html#ressources'] ] },
    partenaire: { label: 'Partenaire, étudiant ou candidat', needs: [
      ['Proposer un partenariat', 'professionnels-de-sante.html#partenariats'],
      ['Faire une demande de stage', 'professionnels-de-sante.html#formation'],
      ['Consulter les offres d\'emploi', 'https://fondationboissel-career.talent-soft.com/offre-de-emploi/liste-offres.aspx'],
      ['Les actualités de l\'établissement', 'actualites.html'] ] }
  };
  var orient = $('#orient');
  if (orient) {
    var sP = $('#o-profil', orient), sB = $('#o-besoin', orient), go = $('button[type=submit]', orient);
    var st1 = $('[data-step="1"]', orient), st2 = $('[data-step="2"]', orient), hint = $('#orient-hint');
    Object.keys(ORIENT).forEach(function (k) { var o = document.createElement('option'); o.value = k; o.textContent = ORIENT[k].label; sP.appendChild(o); });
    sP.addEventListener('change', function () {
      sB.innerHTML = '';
      var d = ORIENT[sP.value];
      var o0 = document.createElement('option'); o0.value = ''; o0.textContent = d ? 'Choisissez votre besoin' : "Choisissez d'abord votre profil"; sB.appendChild(o0);
      if (d) d.needs.forEach(function (n) { var o = document.createElement('option'); o.value = n[1]; o.textContent = n[0]; sB.appendChild(o); });
      sB.disabled = !d; go.disabled = true;
      st1.classList.toggle('is-done', !!d); st2.classList.toggle('is-locked', !d); st2.classList.remove('is-done');
      if (hint) hint.textContent = d ? 'Choisissez maintenant ce que vous recherchez.' : 'Le second choix se débloque après le premier.';
      if (d) sB.focus();
    });
    sB.addEventListener('change', function () { go.disabled = !sB.value; st2.classList.toggle('is-done', !!sB.value); });
    orient.addEventListener('submit', function (e) { e.preventDefault(); if (sB.value) window.ESMPINav(sB.value); });
  }

  /* Sous-navigation d'ancres : défilement fluide sous l'en-tête, section active suivie au défilement */
  var subnav = $('.subnav');
  if (!subnav && window.__esmpiSpy) { window.removeEventListener('scroll', window.__esmpiSpy); window.__esmpiSpy = null; }
  if (subnav) {
    var ul = $('ul', subnav), sublinks = $$('a', subnav), targets = [];
    sublinks.forEach(function (a) { var t = document.getElementById(a.getAttribute('href').slice(1)); if (t) targets.push([t, a]); });
    var offset = function () { return (header ? header.getBoundingClientRect().height : 0) + subnav.getBoundingClientRect().height; };
    var current = null;
    var activate = function (a) {
      if (a === current) return; current = a;
      sublinks.forEach(function (x) { x.classList.toggle('is-active', x === a); if (x === a) x.setAttribute('aria-current', 'location'); else x.removeAttribute('aria-current'); });
      if (a && ul && ul.scrollWidth > ul.clientWidth + 2) { var li = a.parentElement; ul.scrollTo({ left: li.offsetLeft - (ul.clientWidth - li.offsetWidth) / 2, behavior: 'smooth' }); }
    };
    var locked = false, lockT;
    var spy = function () {
      if (locked) return;
      var line = offset() + 24, pick = null, best = -Infinity;
      targets.forEach(function (p) {
        var top = Math.round(p[0].getBoundingClientRect().top);
        if (top > line) return;
        /* sections côte à côte (même hauteur) : on garde celle déjà active */
        if (top > best + 2 || (Math.abs(top - best) <= 2 && p[1] === current)) { best = top; pick = p[1]; }
      });
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4 && targets.length) pick = targets[targets.length - 1][1];
      activate(pick);
    };
    var ticking = false;
    if (window.__esmpiSpy) window.removeEventListener('scroll', window.__esmpiSpy);
    window.__esmpiSpy = function () { if (!ticking) { ticking = true; requestAnimationFrame(function () { ticking = false; spy(); }); } };
    window.addEventListener('scroll', window.__esmpiSpy, { passive: true });
    sublinks.forEach(function (a) {
      a.addEventListener('click', function (e) {
        var t = document.getElementById(a.getAttribute('href').slice(1)); if (!t) return;
        e.preventDefault();
        var y = t.getBoundingClientRect().top + window.scrollY - offset() + 1;
        activate(a); locked = true; clearTimeout(lockT);
        var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        window.scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' });
        if (history.replaceState) history.replaceState(null, '', '#' + t.id);
        lockT = setTimeout(function () { locked = false; spy(); }, 900);
        t.setAttribute('tabindex', '-1'); t.focus({ preventScroll: true });
      });
    });
    /* fondus latéraux seulement quand la barre déborde */
    var edges = function () { if (!ul) return; var max = ul.scrollWidth - ul.clientWidth; ul.classList.toggle('fade-l', ul.scrollLeft > 2); ul.classList.toggle('fade-r', max > 2 && ul.scrollLeft < max - 2); };
    if (ul) { ul.addEventListener('scroll', edges, { passive: true }); window.addEventListener('resize', edges); edges(); }
    spy();
  }

  /* Onglets */
  $$('[role="tablist"]').forEach(function (list) {
    var tabs = $$('[role="tab"]', list);
    var select = function (tab) {
      tabs.forEach(function (t) {
        var on = t === tab; t.setAttribute('aria-selected', on); t.tabIndex = on ? 0 : -1;
        document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
      });
    };
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { select(t); });
      t.addEventListener('keydown', function (e) {
        var k = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
        if (k) { e.preventDefault(); var n = tabs[(i + k + tabs.length) % tabs.length]; select(n); n.focus(); }
      });
    });
    var wanted = window.ESMPIHash || (location.hash || '').slice(1);
    var initial = tabs.filter(function (t) { return t.dataset.key === wanted; })[0];
    if (initial) select(initial);
  });

  /* Formulaires : validation et confirmation */
  window.ESMPIValidate = function (scope) {
    var ok = true, first = null;
    $$('[required]', scope).forEach(function (f) {
      if (f.closest('[hidden]') || f.disabled) return;
      var valid = f.type === 'checkbox' ? f.checked : f.type === 'email' ? /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.value.trim()) : !!f.value.trim();
      if (f.type === 'radio') { valid = !!$('input[name="' + f.name + '"]:checked', scope); }
      var field = f.closest('.field');
      if (field) field.classList.toggle('has-error', !valid);
      f.setAttribute('aria-invalid', valid ? 'false' : 'true');
      if (!valid) { ok = false; if (!first) first = f; }
    });
    if (first) first.focus();
    return ok;
  };
  $$('form[data-form]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!window.ESMPIValidate(form)) return;
      var btn = $('button[type=submit]', form); btn.disabled = true; btn.textContent = 'Envoi en cours…';
      setTimeout(function () {
        form.hidden = true;
        var ok = form.parentElement.querySelector('.form-success');
        if (ok) { ok.classList.add('is-shown'); ok.focus(); }
      }, 700);
    });
    $$('input,select,textarea', form).forEach(function (f) {
      f.addEventListener('input', function () { var fd = f.closest('.field'); if (fd && fd.classList.contains('has-error')) { fd.classList.remove('has-error'); f.setAttribute('aria-invalid', 'false'); } });
    });
  });

  /* Fenêtres d'inscription (BREF, Temps Écoute Famille…) */
  $$('[data-dialog]').forEach(function (b) {
    b.addEventListener('click', function () {
      var d = document.getElementById(b.dataset.dialog); if (!d) return;
      var sel = d.querySelector('[data-prefill]'); if (sel && b.dataset.value) sel.value = b.dataset.value;
      d.showModal();
    });
  });
  $$('dialog.sheet:not(#menu)').forEach(function (d) {
    d.addEventListener('click', function (e) { if (e.target === d) d.close(); });
    $$('[data-close]', d).forEach(function (b) { b.addEventListener('click', function () { d.close(); }); });
  });

  /* Prochaine date du Temps Écoute Famille */
  $$('[data-tef]').forEach(function (el) {
    var today = new Date(); today.setHours(0, 0, 0, 0);
    var dates = (window.ESMPI && ESMPI.tef) || [];
    var next = dates.map(function (d) { return new Date(d + 'T12:00:00'); }).filter(function (d) { return d >= today; })[0];
    el.textContent = next ? next.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }) : 'dates de la saison 2026-2027 communiquées par l\'équipe';
    $$('[data-tef-date]').forEach(function (s) { if (new Date(s.dataset.tefDate + 'T23:59:00') < today) s.classList.add('is-past'); });
  });

  };
  window.ESMPIInitPage();

  /* Mode application : service worker (hors aperçu local) */
  if ('serviceWorker' in navigator && location.protocol === 'https:' && !window.ESMPIPreview) {
    window.addEventListener('load', function () { navigator.serviceWorker.register('sw.js').catch(function () {}); });
  }
})();
