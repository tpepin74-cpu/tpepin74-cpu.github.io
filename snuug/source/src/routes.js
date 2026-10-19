// Nine destinations, with in-page chapters for related content.
export const routes={
 '/snuug':['SNUUG · Ailleurs. Ensemble.','Une suite pour deux, des paysages suisses et quatre façons de s’évader.'],
 '/snuug/la-suite':['Découvrir SNUUG · Le concept, la suite & les engagements','Une suite indépendante de 20 m², le confort d’un hôtel et une autre idée de l’hospitalité suisse.'],
 '/snuug/experiences':['Les expériences · SNUUG','Évasion romantique, découverte gourmande, contemplation silencieuse et escapades sportives : vivez SNUUG à votre rythme.'],
 '/snuug/reservation':['Choisir votre séjour · SNUUG','Découvrez la collection sur la carte, enregistrez vos favoris et préparez votre échappée.'],
 '/snuug/sejours/neuchatel':['Golf de Neuchâtel · Votre suite SNUUG','Photos, équipements, services, activités alentour et réservation de votre suite au Golf de Neuchâtel.'],
 '/snuug/offrir':['Offrir une échappée · SNUUG','Offrez du temps à partager : préparez votre demande de bon cadeau SNUUG.'],
 '/snuug/informations':['Votre séjour · Services, informations & contact SNUUG','Guest App, petit-déjeuner, arrivée, questions fréquentes, conditions et contact : préparez votre séjour simplement.'],
 '/snuug/partenaires':['Anges-Gardiens et partenaires · SNUUG','Proposez un domaine, devenez Ange-Gardien ou rejoignez l’aventure SNUUG.'],
 '/snuug/mentions-legales':['Informations légales & confidentialité · SNUUG','Identité de SNUUG SA, contacts, confidentialité et informations légales.']
};
export const redirects={
 '/snuug/le-concept':'/snuug/la-suite#concept',
 '/snuug/le-sejour':'/snuug/informations#services',
 '/snuug/tourisme-durable':'/snuug/la-suite#engagements',
 '/snuug/autour-de-neuchatel':'/snuug/sejours/neuchatel#alentours',
 '/snuug/conditions':'/snuug/informations#conditions',
 '/snuug/contact':'/snuug/informations#contact',
 '/snuug/confidentialite':'/snuug/mentions-legales#confidentialite',
 '/snuug/experiences/amoureux':'/snuug/experiences#amoureux',
 '/snuug/experiences/vacances':'/snuug/experiences#vacances',
 '/snuug/experiences/deconnexion':'/snuug/experiences#deconnexion',
 '/snuug/experiences/golf':'/snuug/experiences#golf',
 '/snuug/adresses':'/snuug/reservation',
 '/snuug/journal':'/snuug/experiences#inspirations',
 '/snuug/journal/rituels':'/snuug/experiences#rituels',
 '/snuug/journal/design':'/snuug/la-suite#design-histoire',
 '/snuug/journal/escapade':'/snuug/experiences#escapade'
};
export function redirectTarget(path,search='',hash=''){
 const destination=redirects[path];if(!destination)return path+search+hash;
 const [page,anchor]=destination.split('#');
 return page+search+(hash|| (anchor?'#'+anchor:''));
}
