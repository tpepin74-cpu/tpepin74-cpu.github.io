# SNUUG

Site autonome publié à https://tpepin74-cpu.github.io/snuug/

Les neuf pages, photos, animations, carte et liens de réservation Mews sont inclus.

## Reconstruction

Dans `source`, avec Node 22.13 ou supérieur : `npm install`, puis `npm run build`. Copier ensuite le contenu de `source/dist` dans le dossier `snuug`, sans toucher aux autres dossiers du dépôt.

## Agenda

Le workflow `SNUUG agenda` actualise `snuug/agenda.json` chaque jour. Il conserve les dernières données si la source est indisponible. Le site masque les événements terminés selon la date suisse et affiche les périodes en cours. L'actualisation dépend de la disponibilité de la source et de GitHub Actions.

Les réservations sont finalisées dans Mews. Les vues de l'immersion sont des reconstitutions illustrées.
