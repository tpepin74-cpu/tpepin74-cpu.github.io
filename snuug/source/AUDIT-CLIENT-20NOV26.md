# SNUUG : contrôle des corrections client du 20 novembre 2026

Audit réalisé à partir du PDF « CORRECTIONS_MAQUETTE_SITE_SNUUG_20NOV26.pdf » et de l’email « Précisions - corrections site ». La demande ultérieure d’une barre de réservation inspirée d’Airbnb prévaut sur sa précédente présentation. Les statuts ci-dessous concernent l’implémentation et les contrôles décrits ; ils ne constituent pas une validation éditoriale de la cliente.

Base des URL : https://tpepin74-cpu.github.io/snuug/

| Référence | Page / URL | Demandes regroupées | Statut |
|---|---|---|---|
| PDF p.1 | Toutes les pages | CTA plus petits et sans cadre ni soulignement, flèches homogènes, hover gras ; CTA Réserver noirs ; petites mentions ; séparateurs fins des accordéons | Réalisé. Exceptions secondaires corrigées lors de cet audit. |
| PDF p.1 et email | Galeries du site | Ouverture plein écran sur noir, navigation par petites flèches blanches sans cadres | Réalisé. L’instruction écrite du PDF prévaut sur les fonds ronds présents dans l’image d’inspiration de l’email. |
| PDF p.2 et email | [Accueil](https://tpepin74-cpu.github.io/snuug/) | Barre de réservation arrondie ; pastille Actualité rotative, en haut sur mobile ; bandeau photo aux seuls angles extérieurs arrondis ; légendes ; filets Quatre collections ; mouvement Souffler ; CTA destinations sans traits ; itinéraire sinusoïdal plus rapide ; liens cadeau/séjour séparés par un filet | Réalisé. Barre actualisée selon la dernière demande Airbnb. |
| PDF p.3 | [Réserver](https://tpepin74-cpu.github.io/snuug/reservation/) | Recherche arrondie ; filtres en petites capitales, sans bulles, soulignement vert ; « à venir » plus petit ; note favoris réduite ; suppression du libellé superflu ; cœur et flèches sans cadres ; cœur rouge au survol ; carte arrondie et marqueur lisible | Réalisé. Le résumé mobile affiche maintenant la collection effectivement choisie. |
| PDF p.4–5 | [Le concept](https://tpepin74-cpu.github.io/snuug/le-concept/) | Ancre finale « Choisir sa SNUUG » ; galerie aux angles extérieurs arrondis, interstices fins et légendes ; accordéons fins ; photos retirées des engagements, en-tête ajouté ; suppression de « Un concept, plusieurs paysages » ; final commun On part quand / domaines / Réserver | Réalisé. Séparateurs des accordéons Nature et Signature et petites largeurs des caractéristiques corrigés lors de cet audit. |
| PDF p.6 | [Votre séjour](https://tpepin74-cpu.github.io/snuug/informations/) | Cartes arrondies et heures agrandies ; filets FAQ/conditions ; retrait du bloc Nous contacter et des anciens blocs Actualité/Presse | Réalisé. Marges imbriquées et retours à la ligne des FAQ/conditions corrigés. Le contact global du pied de page reste disponible. |
| PDF p.7 | [Actualité et Presse](https://tpepin74-cpu.github.io/snuug/actualites/) | Page dédiée, deux ancres Actualité/Espace presse ; accès depuis la pastille et la section d’accueil ; contenu éditorial et ressources presse | Réalisé. Validation des nouveaux textes par la cliente encore à obtenir. |
| PDF p.8 | [Expériences](https://tpepin74-cpu.github.io/snuug/experiences/) | Cartes arrondies ; packs et départs de groupes de liens alignés ; ancre Packs ; retrait Rituels/Échappées ; final commun | Réalisé. Les packs passent en colonne lorsque la largeur le nécessite. |
| PDF p.3,9–10 | [Golf de Neuchâtel](https://tpepin74-cpu.github.io/snuug/sejours/neuchatel/) | Menu aligné avec la photo et hover vert ; bouton photos blanc arrondi ; Galerie photo ; réservation arrondie et aérée ; suppression des quatre sections désignées ; fusion lieu/carnet avec activités à gauche et carte à droite ; final commun | Réalisé. Carte sticky dégagée sous les menus sur grand écran, laissée dans le flux sur écran court pour rester entièrement accessible. |
| PDF p.11 | Concierge, accessible depuis le menu inférieur | Suppression des fonds carrés derrière fermeture/icône ; texte réduit ; saisie arrondie ; présentation moins dense | Réalisé. Vérification de la fenêtre à 320 × 568 px. |

## Corrections supplémentaires identifiées pendant l’audit

- Harmonisation des CTA secondaires : aide à la réservation, prochaines collections, conditions officielles, itinéraire et « Voir sur la carte ».
- Suppression du soulignement résiduel de « Conditions de réservation » et harmonisation des flèches Carte cadeau/Votre séjour.
- Séparateurs fins cohérents pour les accordéons secondaires, sans double ligne entre Nature et Signature.
- Réduction des notices de programme et de l’introduction aux conditions.
- Correction des marges des contenus FAQ/conditions imbriqués, du retour à la ligne des légendes Nature et des caractéristiques du concept sur petit écran.
- Centrage des libellés du dock sous leurs icônes, y compris Accueil et Concierge.
- Correction du focus clavier du lien « Aller au contenu ».
- Actualisation du texte de confidentialité pour décrire le diaporama de photographies officielles effectivement utilisé.

## Vérifications effectuées

Contrôle des 10 routes : accueil, concept, séjour, expériences, réservation, Golf, carte cadeau, partenaires, actualités et mentions légales. Largeurs d’iframe vérifiées : **320, 390, 768, 1024, 1440 et 1920 px**. La largeur intérieure utile était inférieure de 15 px du fait de la barre de défilement verticale. Les mesures finales n’ont pas relevé de débordement horizontal sur ces configurations après correction.

Interactions vérifiées : ouverture et photo suivante de la galerie mobile, fermeture par Échap ; ancres intérieures, Packs, Presse et FAQ ; concierge et recherche à 320 × 568 px ; transfert du focus par le lien d’évitement. Sur Golf à 1440 × 900 px, la carte sticky occupait verticalement les positions 180 à 778 px ; à 568 px de hauteur, elle restait dans le flux.

## Limites et points à confirmer

- Les contrôles ont été effectués dans un navigateur avec dimensions simulées, **sans essais sur de vrais appareils iOS ou Android**.
- Les nouveaux contenus Actualité/Presse restent soumis à l’approbation éditoriale de la cliente.
- Il n’existe pas de CMS : typographie et icônes sont réglables dans les fichiers CSS/JSON documentés dans le README, puis nécessitent une reconstruction et une publication.
- La réservation et le paiement se poursuivent sur le site officiel. Cet audit ne constitue pas une vérification transactionnelle de ce service externe.
- Aucune certification d’accessibilité AAA ni garantie de 60 images par seconde n’est revendiquée.
- Ce compte rendu décrit les corrections et contrôles ; il ne constitue pas, à lui seul, une preuve de mise en ligne.
