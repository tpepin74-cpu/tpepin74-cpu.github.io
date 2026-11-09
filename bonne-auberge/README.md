# La Bonne Auberge — V12 légère

Même interface et contenus que la V11, optimisés pour GitHub Pages.

## Publication
Déposer `bonne-auberge-leger.zip` sans le renommer ni le décompresser à la racine du dépôt `tpepin74-cpu/tpepin74-cpu.github.io`, branche `main`, puis valider le commit. Le workflow `bonne-auberge-pages.yml` doit être mis à jour avec l’empreinte exacte de cette archive. Cette livraison ne remplace aucun autre site du dépôt.

## Structure
`index.html` : accueil ; `restaurant.html`, `epicerie.html`, `chambres.html` : trois rubriques ; les autres petits fichiers HTML redirigent les anciens liens vers la bonne rubrique et son ancre. Les photographies ne sont présentes qu’une fois dans assets/images. Ne pas ajouter l’aperçu HTML autonome à ce dossier : il contient les mêmes images intégrées et doublerait inutilement le poids.

## Optimisations
54 photographies AVIF, métadonnées supprimées, dimensions plafonnées selon l’usage ; conservation des neuf vues de chambres. Formes vectorielles du logo optimisées sans supprimer les 621 tracés ni leur animation. Suppression des sélecteurs CSS inutilisés et des copies du contenu initial, géré par une seule source dans site-data.js. Chargement différé des images hors écran, dimensions explicites et priorité au visuel d’accueil. Les identifiants du panier et tous les liens externes sont conservés.

## Conditions de lecture
Navigateurs récents prenant en charge AVIF. JavaScript est nécessaire à la navigation interne. Un message de contact reste disponible sans JavaScript. Pour une prévisualisation hors ligne autonome, utiliser le fichier HTML distinct fourni avec la livraison.

## Démonstration et confidentialité
Catalogue, tarifs et retrait restent démonstratifs ; aucun paiement ni commande réelle ne sont transmis automatiquement. La configuration noindex/nofollow existante est conservée. L’allègement des photos utilise une compression avec perte et ne remplace pas un archivage des originaux ; ceux-ci restent dans les livraisons précédentes.
