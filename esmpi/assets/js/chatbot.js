/* ESM Portes de l'Isère — assistant d'orientation (arbre de décision + reconnaissance de mots-clés, 100 % local) */
(function () {
  'use strict';
  var chat = document.getElementById('chat'); if (!chat) return;
  var log = document.getElementById('chat-log'), quick = document.getElementById('chat-quick');
  var form = document.getElementById('chat-form'), input = document.getElementById('chat-input');
  var fab = document.querySelector('.chat-fab');
  var D = window.ESMPI || { lieux: [], zones: [] };
  var byId = {}; D.lieux.forEach(function (l) { byId[l.id] = l; });
  var zoneById = {}; D.zones.forEach(function (z) { zoneById[z.id] = z; });
  var KEY = 'esmpi-chat-v1';

  var tel = function (n) { var d = n.replace(/\D/g, ''); return d.length <= 4 ? d : '+33' + d.slice(1); };
  var call = function (label, num, sub) { return '<a class="tel-big" href="tel:' + tel(num) + '">' + label + ' <b class="tel">' + num + '</b>' + (sub ? '<span>' + sub + '</span>' : '') + '</a>'; };
  var card = function (id) {
    var l = byId[id]; if (!l) return '';
    return '<a class="msg__card" href="tel:' + tel(l.tel) + '"><b>' + l.nom + '</b><span>' + (l.adresse || l.ville) + ' · ' + l.tel + '</span></a>';
  };
  var SOS = [['Urgence vitale', '15', 'SAMU'], ['Prévention du suicide', '3114', '24 h/24, gratuit']];
  var BACK = ['Revenir au début', 'start'];

  var N = {
    start: { text: ["Bonjour, je suis l'assistant d'orientation de l'ESM Portes de l'Isère.", "Je vous aide à trouver le bon service, le bon numéro ou la bonne page. Je ne remplace pas un avis médical.", '<strong>Pour qui cherchez-vous de l\'aide ?</strong>'],
      quick: [['Pour moi (adulte)', 'adulte'], ['Pour mon enfant (3-11 ans)', 'enfant'], ['Pour mon adolescent', 'ado'], ['Grossesse ou bébé', 'perinat'], ['Pour un proche de 65 ans et plus', 'senior'], ['Je suis un proche, un aidant', 'proche'], ['Je suis professionnel de santé', 'pro'], ['Prendre rendez-vous', 'rdv'], ['Infos pratiques', 'pratique'], ['C\'est urgent', 'urgence', 'sos']] },
    urgence: { alert: true, text: ['<strong>Si une vie est en danger, appelez immédiatement le 15 ou le 112.</strong>', 'Si vous avez des pensées suicidaires, ou si vous vous inquiétez pour quelqu\'un, le 3114 vous répond gratuitement, 24 h/24 et 7 j/7.', 'Vous pouvez aussi vous rendre aux urgences les plus proches : à Bourgoin-Jallieu (centre hospitalier Pierre-Oudot) et à Vienne, une équipe de psychiatrie intervient.'],
      calls: [['SAMU', '15'], ['Prévention du suicide', '3114', '24 h/24'], ['Urgences européennes', '112']],
      quick: [['Psychiatrie d\'urgence à Bourgoin', 'urg_bj'], ['Psychiatrie d\'urgence à Vienne', 'urg_vienne'], BACK] },
    urg_bj: { text: ['Psychiatrie d\'urgence et de liaison adultes au centre hospitalier Pierre-Oudot, à Bourgoin-Jallieu.'], cards: ['urgence-chpo'], calls: [SOS[0]], quick: [BACK] },
    urg_vienne: { text: ['Psychiatrie d\'urgence et de liaison adultes au centre hospitalier de Vienne.'], cards: ['urgence-chv'], calls: [SOS[0]], quick: [BACK] },

    adulte: { text: ['Pour un adulte, la porte d\'entrée est le <strong>centre médico-psychologique (CMP)</strong> de votre secteur : consultations, évaluation et orientation.', '<strong>Où habitez-vous ?</strong>'], zones: 'adultes',
      more: [['Une addiction', 'addiction'], ['Un traumatisme', 'trauma'], ['Sans logement, précarité', 'precarite'], ['Une hospitalisation', 'admission']] },
    addiction: { text: ['L\'<strong>équipe mobile d\'addictologie</strong> accompagne les personnes confrontées à une dépendance : alcool, drogues, médicaments. Évaluation, soutien psychologique et lien avec les ressources de sevrage.'], cards: ['addicto'], links: [['L\'offre adultes', 'psychiatrie-adulte.html#specialisees']], quick: [['Prendre rendez-vous', 'rdv_moi'], BACK] },
    trauma: { text: ['L\'<strong>unité de prise en charge psychologique post-traumatique</strong> propose des approches adaptées pour retrouver un équilibre après un événement traumatique.'], cards: ['post-trauma'], quick: [['Prendre rendez-vous', 'rdv_moi'], BACK] },
    precarite: { text: ['L\'<strong>équipe mobile précarité psychiatrie et la PASS Psy</strong> facilitent l\'accès aux soins des personnes à la rue, mal logées ou en grande précarité.'], cards: ['empp-bj', 'empp-vienne'], quick: [BACK] },

    enfant: { text: ['Pour un enfant de 3 à 11 ans, tout dépend de votre lieu de vie.', '<strong>Vous habitez :</strong>'], quick: [['En Nord-Isère (Bourgoin, La Tour-du-Pin, Villefontaine, Crémieu…)', 'popin'], ['En Isère rhodanienne (Vienne, Péage-de-Roussillon, Beaurepaire)', 'enfant_vienne'], BACK] },
    ado: { text: ['Pour un adolescent de 12 à 17 ans, tout dépend de votre lieu de vie.', '<strong>Vous habitez :</strong>'], quick: [['En Nord-Isère', 'popin_ado'], ['En Isère rhodanienne', 'ado_vienne'], ['Il traverse une crise', 'urgence', 'sos'], BACK] },
    popin: { text: ['En Nord-Isère, depuis le 1er janvier 2026, <strong>POP\'IN</strong> est le point d\'entrée unique pour toute première demande concernant un enfant ou un adolescent.', 'Après un échange téléphonique, l\'équipe évalue la situation et vous oriente vers la prise en charge adaptée.'], calls: [['Appeler POP\'IN', '04 74 85 80 20', 'lun-ven, 8 h 30 – 16 h 30']], links: [['Tout savoir sur POP\'IN', 'perinatalite-enfants-adolescents.html#popin'], ['Les CMP enfants et ados', 'lieux-de-soins.html?public=enfants']], quick: [['Demander un rendez-vous en ligne', 'rdv_enfant'], ['Soutien aux parents', 'parents'], BACK] },
    popin_ado: { text: ['En Nord-Isère, <strong>POP\'IN</strong> reçoit toutes les premières demandes pour les 12-17 ans, y compris en cas de crise, d\'anxiété importante ou d\'idées suicidaires.', 'L\'<strong>équipe mobile MILA</strong> peut intervenir au domicile ou au collège et au lycée, sur saisine de POP\'IN. Un <strong>hôpital de jour adolescents de crise</strong> accueille les jeunes à Bourgoin-Jallieu.'], calls: [['Appeler POP\'IN', '04 74 85 80 20', 'lun-ven, 8 h 30 – 16 h 30']], quick: [['C\'est urgent', 'urgence', 'sos'], ['Demander un rendez-vous', 'rdv_ado'], BACK] },
    enfant_vienne: { text: ['En Isère rhodanienne, les modalités d\'entrée restent inchangées : contactez directement le CMP enfants de votre secteur.'], cards: ['cmpe-vienne', 'cmpe-peage'], links: [['Toute l\'offre enfants', 'perinatalite-enfants-adolescents.html#enfants']], quick: [['Demander un rendez-vous', 'rdv_enfant'], BACK] },
    ado_vienne: { text: ['En Isère rhodanienne, le <strong>CMP adolescents de Vienne</strong> accueille les jeunes et leur famille. L\'hôpital de jour A.T.I.C.A. propose une prise en charge plus soutenue.'], cards: ['cmp-ado-vienne', 'atica'], quick: [['Demander un rendez-vous', 'rdv_ado'], BACK] },
    parents: { text: ['Être parent d\'un enfant en difficulté n\'est pas simple. Nous proposons des entretiens réguliers, de la psychoéducation, des groupes de parole entre parents et de la pair-aidance avec l\'association ESPAIRS38.'], links: [['Le soutien aux parents', 'perinatalite-enfants-adolescents.html#parents']], quick: [BACK] },
    perinat: { text: ['L\'équipe de <strong>psychiatrie périnatale</strong> accompagne les futurs et jeunes parents : grossesse, arrivée du bébé, allaitement, sommeil, angoisses, lien parent-enfant.', 'Elle propose un CMP, un hôpital de jour mère-bébé et une équipe mobile qui se déplace à domicile.'], cards: ['perinat-cmp', 'perinat-em'], quick: [['Un deuil périnatal', 'deuil'], ['J\'habite en Nord-Isère', 'popin'], ['Demander un rendez-vous', 'rdv_perinat'], BACK] },
    deuil: { text: ['Des <strong>consultations pour le deuil périnatal</strong> accompagnent les parents après une perte de grossesse, une mort fœtale ou le décès d\'un nouveau-né. Nos professionnels vous aident à traverser cette épreuve.', 'En cas d\'urgence, contactez votre maternité de référence, votre médecin traitant ou le 15.'], cards: ['deuil-perinatal'], quick: [BACK] },
    senior: { text: ['L\'<strong>équipe mobile de géronto-psychiatrie</strong> se déplace à domicile, en EHPAD ou en résidence pour les personnes de 65 ans et plus : dépression, anxiété, troubles du comportement, démences.', 'Elle peut être sollicitée par le médecin traitant, un établissement, un travailleur social ou la famille.'], cards: ['emgp-bj', 'emgp-vienne'], links: [['La géronto-psychiatrie', 'geronto-psychiatrie.html']], quick: [['Je suis aidant', 'proche'], ['Demander un rendez-vous', 'rdv_senior'], BACK] },

    proche: { text: ['Accompagner un proche en souffrance psychique est une épreuve : vous avez droit à du soutien.', '<strong>Qu\'est-ce qui vous aiderait ?</strong>'], quick: [['Le programme BREF', 'bref'], ['Le Temps Écoute Famille', 'tef'], ['Un groupe de parole, la pair-aidance', 'pair'], ['La Maison des usagers', 'mdu'], ['Être informé sur mon proche', 'informer'], ['Faire une réclamation', 'reclamation'], BACK] },
    bref: { text: ['Le <strong>programme BREF</strong>, conçu avec l\'UNAFAM, s\'adresse aux proches d\'une personne suivie en psychiatrie, quel que soit le diagnostic : trois séances d\'une heure avec deux professionnels, pour une seule famille à la fois.'], links: [['S\'inscrire au programme BREF', 'proches-aidants.html#programmes']], quick: [['Le Temps Écoute Famille', 'tef'], BACK] },
    tef: { text: ['Le <strong>Temps Écoute Famille</strong> réunit les proches d\'adultes suivis à l\'ESMPI, un lundi par mois de 18 h 30 à 20 h, de septembre à juillet. Il est animé par deux psychologues, gratuit et confidentiel.'], links: [['Les dates et l\'inscription', 'proches-aidants.html#programmes']], quick: [['Le programme BREF', 'bref'], BACK] },
    pair: { text: ['L\'association <strong>ESPAIRS38</strong> intervient dans l\'établissement : permanences d\'accueil et groupes de parole animés par des pairs ayant une expérience de la psychiatrie. Nous vous orientons aussi vers l\'UNAFAM et les groupes d\'entraide mutuelle (GEM).'], links: [['Pair-aidance et associations', 'proches-aidants.html#pair-aidance']], quick: [BACK] },
    mdu: { text: ['La <strong>Maison des usagers</strong>, à Bourgoin-Jallieu et à Vienne, est un espace neutre et confidentiel pour être écouté, informé sur vos droits et orienté. Ce n\'est ni un lieu de soins, ni un lieu de règlement des conflits.'], links: [['Programme et informations', 'contact.html#maison-des-usagers']], quick: [BACK] },
    informer: { text: ['Vous êtes associé à la prise en charge de votre proche et pouvez participer à des entretiens réguliers avec l\'équipe, dans le respect du secret médical et de sa volonté. Votre proche peut vous désigner comme <strong>personne de confiance</strong>.'], links: [['Les droits des patients', 'droits-patients.html#personne-de-confiance']], quick: [BACK] },
    reclamation: { text: ['Vous pouvez en parler à l\'équipe, écrire au responsable des relations avec les usagers, saisir la <strong>Commission des usagers</strong> ou déclarer un événement indésirable sur signalement.social-sante.gouv.fr.'], links: [['Réclamations et médiation', 'droits-patients.html#reclamations'], ['Écrire à l\'établissement', 'contact.html#formulaire']], quick: [BACK] },

    pro: { text: ['Bienvenue. Que souhaitez-vous faire ?'], quick: [['Adresser un patient', 'href:professionnels-de-sante.html#adresser'], ['Critères d\'orientation', 'href:professionnels-de-sante.html#criteres'], ['Numéro direct d\'un service', 'href:lieux-de-soins.html'], ['Enfant ou ado du Nord-Isère', 'popin'], ['Stage ou partenariat', 'href:professionnels-de-sante.html#partenariats'], BACK] },

    rdv: { text: ['Je vous accompagne vers la demande de rendez-vous en ligne. Le secrétariat du service concerné vous recontacte ensuite pour fixer la date.', '<strong>Pour qui est le rendez-vous ?</strong>'], quick: [['Pour moi', 'rdv_moi'], ['Mon enfant', 'rdv_enfant'], ['Mon adolescent', 'rdv_ado'], ['Grossesse ou bébé', 'rdv_perinat'], ['Un proche de 65 ans et plus', 'rdv_senior'], BACK] },
    rdv_moi: { go: 'rendez-vous.html?pour=moi' }, rdv_enfant: { go: 'rendez-vous.html?pour=enfant' }, rdv_ado: { go: 'rendez-vous.html?pour=ado' },
    rdv_perinat: { go: 'rendez-vous.html?pour=perinat' }, rdv_senior: { go: 'rendez-vous.html?pour=senior' },

    pratique: { text: ['Quelle information cherchez-vous ?'], quick: [['Admission et documents', 'admission'], ['Frais d\'hospitalisation', 'frais'], ['Visites', 'visites'], ['Dossier médical', 'dossier'], ['Soins sans consentement', 'ssc'], ['Adresse et accès', 'acces'], ['Horaires d\'accueil', 'horaires'], BACK] },
    admission: { text: ['Le <strong>bureau des entrées</strong> est ouvert du lundi au vendredi, de 8 h 30 à 16 h 30. En dehors de ces horaires, les admissions se font directement dans les unités, 24 h/24.', 'Pensez à apporter : pièce d\'identité, carte Vitale ou attestation, carte de mutuelle ou de complémentaire santé solidaire.'], links: [['Préparer votre séjour', 'votre-sejour.html#admission']], quick: [['Frais d\'hospitalisation', 'frais'], BACK] },
    frais: { text: ['Les frais comprennent le tarif journalier et le forfait journalier fixé par arrêté ministériel. L\'Assurance maladie prend en charge 80 % des frais jusqu\'au 30e jour, puis 100 % à partir du 31e ; une affection de longue durée ouvre droit à 100 % dès le premier jour pour cette affection.', 'Les assistants sociaux accompagnent les personnes qui ne peuvent pas régler leurs frais.'], links: [['Le détail des frais', 'votre-sejour.html#frais']], quick: [BACK] },
    visites: { text: ['Les visites sont possibles ; leurs horaires varient selon les unités et vous sont communiqués à l\'arrivée. Le médecin peut les restreindre dans l\'intérêt du patient, et le patient peut refuser une visite.'], links: [['La vie quotidienne', 'votre-sejour.html#vie-quotidienne']], quick: [BACK] },
    dossier: { text: ['Pour accéder à votre dossier médical : courrier au responsable des relations avec les usagers, 100 avenue du Médipôle, CS 43016, 38307 Bourgoin-Jallieu Cedex, avec une copie de votre pièce d\'identité.', 'Consultation sur place et envoi électronique gratuits. Délai : 8 jours si votre dernier passage date de moins de 5 ans, 2 mois au-delà.'], links: [['Vos droits en détail', 'droits-patients.html#dossier-medical']], quick: [BACK] },
    ssc: { text: ['Les soins libres, avec votre consentement, sont la règle. Les soins sans consentement, à la demande d\'un tiers ou du représentant de l\'État, sont strictement encadrés par le Code de la santé publique, avec un contrôle du juge et des certificats médicaux réguliers.'], links: [['Les modes de soins', 'votre-sejour.html#modes-de-soins']], quick: [BACK] },
    acces: { text: ['<strong>Site de Bourgoin-Jallieu</strong> : 100 avenue du Médipôle. <strong>Site de Vienne</strong> : Montée du Docteur Chapuis, sur le site de l\'hôpital Lucien-Hussel. Des places de stationnement, dont des places réservées, sont disponibles sur chaque site.'], links: [['Plans et accès', 'contact.html#acces'], ['Tous les lieux de soins', 'lieux-de-soins.html']], quick: [BACK] },
    horaires: { text: ['Accueil administratif : du lundi au vendredi, de 8 h 30 à 16 h 30. Les unités d\'hospitalisation sont ouvertes 24 h/24. Les CMP, hôpitaux de jour et CATTG fonctionnent selon leurs propres horaires.'], calls: [['Standard', '04 74 83 53 00']], quick: [BACK] },
    fallback: { text: ['Je n\'ai pas bien compris votre demande. Je reconnais les questions sur un âge (enfant, ado, adulte, personne âgée), une commune, un rendez-vous, une urgence, les visites, les frais ou le dossier médical.', 'Vous pouvez aussi appeler le standard.'], calls: [['Standard', '04 74 83 53 00', 'lun-ven, 8 h 30 – 16 h 30']], quick: [['Revenir au menu', 'start']] }
  };

  /* Reconnaissance de mots-clés (sans accents, minuscules) */
  var norm = function (s) { return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/['’]/g, ' '); };
  var RULES = [
    [/suicid|me tuer|mourir|en finir|plus envie de vivre|danger|urgen|crise|samu|3114/, 'urgence'],
    [/rendez|rdv|consulter|prendre un|consultation/, 'rdv'],
    [/deuil|fausse couche|mort.?ne/, 'deuil'],
    [/bebe|grossesse|enceinte|accouch|post.?partum|naissance|perinat|allait|nourrisson/, 'perinat'],
    [/ado|college|lycee|12 ans|13 ans|14 ans|15 ans|16 ans|17 ans|jeune/, 'ado'],
    [/enfant|fils|fille|ecole|maternelle|primaire|pedopsy/, 'enfant'],
    [/pop.?in/, 'popin'],
    [/\bagee?s?\b|personne agee|ehpad|alzheimer|dement|vieill|grand.?(pere|mere)|retraite|\b65\b/, 'senior'],
    [/alcool|drogue|addict|cannabis|dependan|sevrage/, 'addiction'],
    [/trauma|agress|attentat|accident|stress post/, 'trauma'],
    [/rue|logement|precar|sdf|sans abri|pass psy/, 'precarite'],
    [/dossier/, 'dossier'],
    [/visite|visiter/, 'visites'],
    [/tarif|prix|frais|cout|forfait|payer|mutuelle|rembours/, 'frais'],
    [/plainte|reclam|cdu|mecontent|signal/, 'reclamation'],
    [/sans consentement|sdre|sdt|tiers|prefet|hospitalisation d office/, 'ssc'],
    [/admission|hospitalis|entree|documents|carte vitale/, 'admission'],
    [/adresse|acces|venir|parking|bus|train|itineraire|plan/, 'acces'],
    [/horaire|ouvert|ferme/, 'horaires'],
    [/maison des usagers|mdu/, 'mdu'],
    [/bref|unafam/, 'bref'],
    [/ecoute famille|tef/, 'tef'],
    [/pair|espairs|gem|groupe de parole/, 'pair'],
    [/proche|famille|aidant|conjoint|mari|femme|parent/, 'proche'],
    [/medecin|professionnel|adresser|prescri|confrere|generaliste/, 'pro'],
    [/telephone|numero|appeler|standard|joindre|contact/, 'horaires'],
    [/adulte|\bmoi\b|depress|anxi|angoiss|bipol|schizo|psychose|psychiatre|psychologue|cmp/, 'adulte']
  ];
  var ZONE_WORDS = [[/bourgoin|jallieu|isle d abeau|saint.?savin|ruy/, 'bourgoin'], [/tour du pin|saint.?clair|cessieu/, 'tourdupin'], [/villefontaine|vaulx|four/, 'villefontaine'],
    [/pont de cheruy|charvieu|tignieu|chavanoz/, 'pontdecheruy'], [/cremieu|haut.?rhone|optevoz/, 'cremieu'], [/morestel|avenieres|bouvesse/, 'morestel'],
    [/pont de beauvoisin|abrets|pont.?de.?b/, 'pontdebeauvoisin'], [/vienne|estrablin|pont.?eveque|chasse/, 'vienne'], [/peage|roussillon|salaise|saint.?maurice/, 'peage'], [/beaurepaire|bievre|saint.?barthelemy/, 'beaurepaire']];

  var zoneNode = function (zid, pub) {
    var z = zoneById[zid]; if (!z) return N.fallback;
    var pubs = pub ? [pub] : ['adultes', 'enfants', 'adolescents', 'seniors'];
    var labels = { adultes: 'Adultes', enfants: 'Enfants', adolescents: 'Adolescents', seniors: '65 ans et plus', perinatalite: 'Périnatalité' };
    var ids = [], seen = {};
    pubs.forEach(function (p) { var id = (z.nord && (p === 'enfants' || p === 'adolescents')) ? 'popin' : z[p]; if (id && !seen[id]) { seen[id] = 1; ids.push(id); } });
    var txt = pub ? ['Pour <strong>' + z.label + '</strong>, voici votre interlocuteur ' + (pub === 'adultes' ? '(CMP adultes de secteur)' : '') + ' :']
                  : ['Pour <strong>' + z.label + '</strong>, voici vos interlocuteurs de proximité (adultes, enfants et adolescents, 65 ans et plus) :'];
    var q = pub === 'adultes' ? [['Demander un rendez-vous', 'rdv_moi'], ['Un besoin spécifique', 'adulte_more'], BACK] : [['Demander un rendez-vous', 'rdv'], BACK];
    return { text: txt, cards: ids, links: [['Voir sur la carte', 'lieux-de-soins.html?zone=' + zid]], quick: q };
  };

  /* Rendu */
  var history = [];
  var save = function () { try { sessionStorage.setItem(KEY, JSON.stringify({ html: log.innerHTML, quick: quick.innerHTML, open: chat.classList.contains('is-open') })); } catch (e) {} };
  var scroll = function () { log.scrollTop = log.scrollHeight; };
  var bubble = function (html, cls) { var m = document.createElement('div'); m.className = 'msg ' + cls; m.innerHTML = html; log.appendChild(m); scroll(); return m; };
  var renderQuick = function (items) {
    quick.innerHTML = '';
    (items || []).forEach(function (q) {
      var b;
      if (q[1].indexOf('href:') === 0) { b = document.createElement('a'); b.href = q[1].slice(5); }
      else { b = document.createElement('button'); b.type = 'button'; b.dataset.node = q[1]; }
      b.textContent = q[0];
      if (q[2] === 'sos') b.className = 'is-sos';
      quick.appendChild(b);
    });
  };
  var show = function (node) {
    if (node.go) { bubble('<p>Je vous emmène vers le formulaire de demande…</p>', 'msg--bot'); save(); setTimeout(function () { (window.ESMPINav || function (u) { window.location.href = u; })(node.go); }, 600); return; }
    var typing = document.createElement('div'); typing.className = 'typing'; typing.innerHTML = '<i></i><i></i><i></i>'; typing.setAttribute('aria-label', 'L\'assistant écrit');
    log.appendChild(typing); scroll(); renderQuick([]);
    var delay = Math.min(900, 350 + (node.text ? node.text.join('').length : 80) * 2.2);
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) delay = 0;
    setTimeout(function () {
      typing.remove();
      var html = (node.text || []).map(function (t) { return '<p>' + t + '</p>'; }).join('');
      if (node.calls) html += node.calls.map(function (c) { return call(c[0], c[1], c[2]); }).join('');
      if (node.cards && node.cards.length) html += '<div class="msg__cards">' + node.cards.map(card).join('') + '</div>';
      if (node.links) html += '<p style="margin-top:10px">' + node.links.map(function (l) { return '<a href="' + l[1] + '">' + l[0] + '</a>'; }).join('<br>') + '</p>';
      bubble(html, 'msg--bot' + (node.alert ? ' msg--alert' : ''));
      var q = node.quick || [];
      if (node.zones) q = D.zones.map(function (z) { return [z.label, 'zone:' + node.zones + ':' + z.id]; }).concat((node.more || []).concat([BACK]));
      renderQuick(q);
      save();
    }, delay);
  };
  var go = function (id, label) {
    if (label) bubble(label, 'msg--me');
    if (id.indexOf('zone:') === 0) { var p = id.split(':'); show(zoneNode(p[2], p[1])); return; }
    if (id === 'adulte_more') { show({ text: ['Quel besoin spécifique ?'], quick: N.adulte.more.concat([BACK]) }); return; }
    show(N[id] || N.fallback);
  };
  var understand = function (text) {
    var t = norm(text);
    for (var i = 0; i < RULES.length; i++) { if (RULES[i][0].test(t)) { var id = RULES[i][1]; if (id !== 'urgence') { for (var j = 0; j < ZONE_WORDS.length; j++) { if (ZONE_WORDS[j][0].test(t)) { var pub = { adulte: 'adultes', enfant: 'enfants', ado: 'adolescents', senior: 'seniors' }[id]; return function () { show(zoneNode(ZONE_WORDS[j][1], pub)); }; } } } return function () { show(N[id]); }; } }
    for (var k = 0; k < ZONE_WORDS.length; k++) { if (ZONE_WORDS[k][0].test(t)) { var zid = ZONE_WORDS[k][1]; return function () { show(zoneNode(zid)); }; } }
    return function () { show(N.fallback); };
  };

  /* Ouverture / fermeture */
  var lastFocus = null;
  var open = function (node) {
    lastFocus = document.activeElement;
    chat.classList.add('is-open'); chat.setAttribute('aria-hidden', 'false');
    if (fab) fab.classList.add('is-hidden');
    document.documentElement.style.overflow = window.innerWidth < 980 ? 'hidden' : '';
    if (node && node !== 'true' && node !== '') { if (!log.children.length) { bubble('<p>Bonjour, je suis l\'assistant d\'orientation de l\'ESM Portes de l\'Isère.</p>', 'msg--bot'); } go(node, labelFor(node)); }
    else if (!log.children.length) show(N.start);
    setTimeout(function () { input.focus({ preventScroll: true }); }, 380);
    save();
  };
  var labelFor = function (node) {
    var all = N.start.quick.concat(N.rdv.quick); for (var i = 0; i < all.length; i++) if (all[i][1] === node) return all[i][0];
    return null;
  };
  var close = function () {
    chat.classList.remove('is-open'); chat.setAttribute('aria-hidden', 'true');
    if (fab) fab.classList.remove('is-hidden');
    document.documentElement.style.overflow = '';
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
    save();
  };
  document.addEventListener('click', function (e) {
    var o = e.target.closest('[data-chat-open]');
    if (o) { e.preventDefault(); open(o.getAttribute('data-chat-open')); return; }
    if (e.target.closest('[data-chat-close]')) { close(); return; }
    if (e.target.closest('[data-chat-reset]')) { log.innerHTML = ''; show(N.start); return; }
    var q = e.target.closest('#chat-quick button');
    if (q) go(q.dataset.node, q.textContent);
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && chat.classList.contains('is-open')) close(); });
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var v = input.value.trim(); if (!v) return;
    bubble(v.replace(/</g, '&lt;'), 'msg--me'); input.value = '';
    understand(v)();
  });

  /* Reprise de la conversation d'une page à l'autre */
  try {
    var s = JSON.parse(sessionStorage.getItem(KEY) || 'null');
    if (s && s.html) { log.innerHTML = s.html; quick.innerHTML = s.quick; if (s.open && window.innerWidth >= 980) { chat.classList.add('is-open'); chat.setAttribute('aria-hidden', 'false'); if (fab) fab.classList.add('is-hidden'); } }
  } catch (e) {}
  if (/[?&]assistant=1/.test(location.search)) open();
})();
