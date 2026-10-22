/* Service worker : consultation hors connexion des pages essentielles (numéros, lieux, urgences) */
const CACHE = 'esmpi-840f4384';
const CORE = ["./", "index.html", "perinatalite-enfants-adolescents.html", "psychiatrie-adulte.html", "geronto-psychiatrie.html", "proches-aidants.html", "votre-sejour.html", "droits-patients.html", "engagements-qualite.html", "professionnels-de-sante.html", "lieux-de-soins.html", "rendez-vous.html", "actualites.html", "contact.html", "faq.html", "plan-du-site.html", "assets/css/site.css", "assets/js/app.js", "assets/js/chatbot.js", "assets/js/data.js", "assets/js/lieux.js", "assets/js/rdv.js", "assets/fonts/figtree-latin-wght-normal.woff2", "assets/icons/favicon.svg", "assets/img/logo.webp", "assets/img/logo-blanc.webp"];
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).then((res) => { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); return res; })
      .catch(() => caches.match(req).then((r) => r || caches.match('contact.html'))));
    return;
  }
  e.respondWith(caches.match(req).then((hit) => hit || fetch(req).then((res) => {
    if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); }
    return res;
  })));
});
