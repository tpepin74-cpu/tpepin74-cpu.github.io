# Run Spark — cadres personnalisés

Site : https://tpepin74-cpu.github.io/runspark/

Cette publication est entièrement contenue dans le dossier `runspark/`. Les autres fichiers et sites du dépôt ne sont pas modifiés.

Les fichiers servis par GitHub Pages sont ici. Les sources React, les images et les scripts de construction se trouvent dans `source/`.

## Modifier et reconstruire

```bash
cd runspark/source
npm ci
npm run build:github
```

Copier ensuite le contenu de `source/dist/` dans `runspark/` uniquement. Ne pas remplacer la racine du dépôt ni ses réglages GitHub Pages.

Le site utilise le préfixe `/runspark/` pour ses images, polices et pages courses. Le configurateur envoie la personnalisation à la boutique Run Spark existante pour le paiement. Les mises en situation générées restent signalées dans le site.

Version initiale : source Sites `7ca0831b2e37f5d34bd0a51c65351c3be37b8bb2`, 13 octobre 2026.
