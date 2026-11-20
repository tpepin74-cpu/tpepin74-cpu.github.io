# SNUUG

Site autonome : [tpepin74-cpu.github.io/snuug](https://tpepin74-cpu.github.io/snuug/).

Les 10 pages sont : Accueil, Le concept, Expériences, Réserver, Golf de Neuchâtel, Carte cadeau, Votre séjour, **Actualités**, Partenaires et Mentions légales. La nouvelle page [Actualités et presse](https://tpepin74-cpu.github.io/snuug/actualites) possède son URL `/snuug/actualites`.

Les photographies réelles fournies sont conservées. Les photos s’ouvrent en galerie sur fond noir. Les animations respectent la préférence système de mouvement réduit. Les réservations et paiements se finalisent sur le service officiel Mews ; les favoris restent sur l’appareil du visiteur.

## Reconstruire et préparer la publication

Depuis la racine du dépôt, avec Node 22.13 ou supérieur :

```bash
cd snuug/source
npm ci
npm run prepare:publish
```

Cette commande construit le site dans `snuug/source/dist`, puis synchronise les fichiers publiables dans `snuug/`. Le script `snuug/source/sync-publish.mjs` remplace les anciens médias et bundles générés, **préserve `snuug/agenda.json`** et ne touche pas aux autres projets du dépôt.

Après vérification du rendu mobile et ordinateur, publier sur GitHub les sources modifiées et les fichiers générés. La préparation locale seule ne met pas le site en ligne.

## Réglages courants

Tous les chemins suivants sont relatifs à la racine du dépôt. Il n’y a pas d’interface CMS : chaque modification nécessite une reconstruction et une publication.

| Réglage | Fichier | Modification |
|---|---|---|
| Typographie de réservation | `snuug/source/src/booking-bar.css` | `--booking-label-size` pour les libellés ; `--booking-control-size` pour les champs et le bouton. Valeurs par défaut : 14 px et 16 px. Capsule blanche sur ordinateur, recherche compacte ouvrant une feuille sur mobile. |
| Étapes de l’itinéraire | `snuug/source/src/journey-stops.json` | Modifier `name`, `place`, `href` et `icon` pour chaque étape. |
| Rythme de l’itinéraire | `snuug/source/src/itinerary-motion.json` | `stepDuration`, en millisecondes, vaut 1900 ; une valeur plus faible accélère l’animation. `dwell` règle la part de pause sur chaque étape. |

Exemple à ajouter dans `booking-bar.css` pour définir explicitement les tailles :

```css
:root {
  --booking-label-size: 0.875rem;
  --booking-control-size: 1rem;
}
```

Les pictogrammes disponibles dans `journey-stops.json` sont `snuug`, `restaurant`, `lac`, `train`, `vigne` et `fromage`. Conserver les sept entrées pour un changement de contenu simple. Ajouter ou retirer une étape demande également d’adapter les coordonnées desktop/mobile et le nombre d’étapes utilisé dans `snuug/source/src/HomeItinerary.jsx`.

## Agenda

Le workflow `SNUUG agenda` actualise `snuug/agenda.json` chaque jour. Il conserve les dernières données si la source est indisponible. Le site masque les événements terminés selon la date suisse et affiche les périodes en cours. L'actualisation dépend de la disponibilité de la source et de GitHub Actions.
