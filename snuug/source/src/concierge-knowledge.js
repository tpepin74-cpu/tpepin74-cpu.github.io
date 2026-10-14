import {practicalGroups} from './official.js';
import {experiences} from './data.js';
import {stay,equipment} from './stays.js';
const root='/snuug';
const info=root+'/informations';
const aliases=[
 ['personne voyageurs capacite enfants enfant bebe famille age adolescent mineur','equipement interieur lit douche toilettes salle bain aesop seche cheveux wifi internet chauffage poele cuisine cuisiner','animal animaux chien chat compagnie','fumer fumeur tabac cigarette vapotage','mobilite fauteuil handicap pmr accessible accessibilite'],
 ['horaire heure arrivee depart check in check out tardif','confirmation email sms whatsapp apres reservation','reception accueil gardien assistance libre service humain','parking stationnement voiture velo recharge acceder acces','train gare transfert transport','guest app application commandes'],
 ['inclus compris prestations services prix comprend','petit dejeuner petit dej brunch matin dejeuner','diner restaurant repas manger boire champagne vin boissons'],
 ['prix tarif cout combien coute budget disponibilite disponible dates reserver reservation paiement payer carte libre','caution garantie pre autorisation depot 750','annuler annulation rembourser remboursement reporter report deplacer modifier','minimum nuits nuit saison fevrier juillet aout noel nouvel an','cadeau offrir bon anniversaire','shooting photo commercial presse']
];
export const knowledge=practicalGroups.flatMap((g,gi)=>g.items.map(([question,answer],i)=>({id:g.id+'-'+i,question,answer,aliases:aliases[gi][i],href:info+(gi===3?'#conditions':'#questions'),label:gi===3?'Lire les conditions':'Toutes les réponses',...(gi===3&&i===0?{href:root+'/reservation',label:'Choisir mes dates'}:{}),...(gi===3&&i===4?{href:root+'/offrir',label:'Offrir un séjour'}:{})})));
knowledge.push(
 {id:'lieu',question:'Où se trouve la SNUUG ?',aliases:'ou lieu adresse situation localisation neuchatel saint blaise porrentruy golf domaine',answer:`Votre séjour se déroule au ${stay.name}, ${stay.address}. C’est la première adresse SNUUG. Les collections Nature et Vignes sont annoncées pour la suite.`,href:root+'/sejours/neuchatel#le-lieu',label:'Découvrir le lieu'},
 {id:'concept',question:'Quel est le concept SNUUG ?',aliases:'concept snuug hotel cabane tiny house hebergement suite design surface taille metres terrasse',answer:'Une suite autonome pour deux, dans un cadre remarquable : 20 m² à soi et une terrasse protégée de 5 m². Une hôtellerie éphémère, sans réception centrale, accompagnée par la Guest App et votre Ange-Gardien.',href:root+'/la-suite#concept',label:'Entrer dans la suite'},
 {id:'agenda',question:'Que faire dans la région ?',aliases:'activites activite agenda evenement evenements concert sortie sorties visiter alentours randonnee balades musee lac tourisme region week end weekend',answer:'Balades, découvertes culturelles et gourmandes autour de Neuchâtel : composez votre escapade à votre rythme. L’agenda du site présente les événements à venir ou encore en cours avec leurs dates.',href:info+'#agenda',label:'Consulter l’agenda'},
 {id:'ecologie',question:'Quels sont vos engagements ?',aliases:'ecologie ecologique durable durabilite environnement responsable fabrication energie suisse engagements',answer:'Découvrez les engagements SNUUG autour de la fabrication, des matières et de l’ancrage local, ainsi que les équipements de la suite.',href:root+'/la-suite#engagements',label:'Lire nos engagements'},
 {id:'contact',question:'Comment contacter l’équipe ?',aliases:'contact contacter telephone appeler joindre equipe probleme urgence aide humain parler message mail email',answer:'L’équipe SNUUG est joignable à hello@snuug.ch. Pour un séjour déjà réservé, retrouvez les coordonnées de votre Ange-Gardien dans la confirmation et la Guest App. Ce concierge est un guide automatique, pas une messagerie surveillée par l’équipe.',href:info+'#contact',label:'Contacter SNUUG'},
 ...experiences.map(e=>({id:e.id,question:e.label,aliases:({amoureux:'amoureux couple romantique amour deux lune miel mariage',vacances:'vacances sejour escapade vacances',deconnexion:'deconnexion calme repos detente tranquille silence',golf:'jouer golf parcours green trous voiturette'})[e.id],answer:e.intro+(e.id==='golf'?' Le parcours compte 18 trous. Organisation et éventuels suppléments à confirmer avec l’équipe.':' Repas, activités et attentions sont à confirmer avec l’équipe, selon les disponibilités et les éventuels suppléments.'),href:root+'/experiences#'+e.id,label:'Imaginer cette échappée'})),
 {id:'confort',question:'Le confort en détail',aliases:'equipements literie nespresso newby loxone ligne roset minibar dimensions terrasse',answer:equipment.map(e=>e[2]).join(' '),href:root+'/sejours/neuchatel#equipements',label:'Voir les équipements'}
);
export const suggestions=['Que comprend le séjour ?','Une escapade en amoureux','Quels sont les prix ?','Que faire dans la région ?'];
export const normalize=s=>s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[’']/g,' ').replace(/[^a-z0-9]+/g,' ').trim();
const stop=new Set('a au aux avec ce ces c est de des du en et elle elles il ils j je la le les leur l m ma me mes mon ne nos nous on ou par pas pour qu que quel quelle quelles quels qui s sa se ses son sur t ta te tes ton tu un une vos votre vous y dans peut peux puis est sont fait faire voudrais savoir merci bonjour bonsoir salut svp bien aussi snuug suite sejour hotel peut possible avez avons avoir venir trouve trouvee faut dois doit comment quel sont est til il cette ce ce que'.split(' '));
const tokens=s=>normalize(s).split(' ').filter(w=>w.length>1&&!stop.has(w));
export function answerQuestion(input){
 const n=normalize(input);
 if(/^(bonjour|bonsoir|salut|hello|merci|merci beaucoup)$/.test(n))return {kind:'greeting',items:[],message:'Avec plaisir. Quelle envie vous amène chez SNUUG ? Je peux vous aider à choisir votre séjour ou à préparer votre arrivée.'};
 const exact=knowledge.find(k=>normalize(k.question)===n);
 if(exact)return {kind:'answer',items:[exact]};
 const words=tokens(input);
 const ranked=knowledge.map(k=>{const q=tokens(k.question),a=normalize(k.aliases).split(' ');const matches=words.filter(w=>q.includes(w)||a.includes(w));return {k,score:matches.reduce((s,w)=>s+(q.includes(w)?3:2),0),matches};}).filter(x=>x.score>=2).sort((a,b)=>b.score-a.score);
 if(!ranked.length)return {kind:'fallback',items:[],message:'Je n’ai pas trouvé de réponse suffisamment précise dans les contenus SNUUG. L’équipe pourra vous renseigner. Vous pouvez aussi choisir un sujet ci-dessous.'};
 // Prefer specific policies over generic booking/location vocabulary.
 const specific=ranked.filter(x=>['votre-suite-2','votre-suite-4','reservation-1','reservation-2','reservation-3','reservation-4'].includes(x.k.id)&&x.matches.some(w=>normalize(x.k.aliases).split(' ').includes(w)));
 const selected=[...(specific.length?specific.slice(0,1):[]),...ranked].filter((x,i,arr)=>arr.findIndex(y=>y.k.id===x.k.id)===i).filter((x,i,arr)=>i===0||x.matches.some(w=>!arr[0].matches.includes(w))).slice(0,2);
 return {kind:'answer',items:selected.map(x=>x.k)};
}
