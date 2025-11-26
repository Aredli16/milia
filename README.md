# Smart Kitchen 🍳

Une application moderne pour gérer votre stock de cuisine et générer des recettes intelligentes avec l'IA.

## Fonctionnalités

- **Gestion du Stock** : Ajoutez et supprimez facilement les ingrédients de votre garde-manger.
- **Chef IA** : Génère des recettes basées sur vos ingrédients disponibles (actuellement en mode simulation).
- **Design Premium** : Interface sombre, moderne et fluide.

## Installation

1.  Installer les dépendances :
    ```bash
    npm install
    ```

2.  Lancer le serveur de développement :
    ```bash
    npm run dev
    ```

3.  Ouvrir [http://localhost:3000](http://localhost:3000) dans votre navigateur.

## Intégration IA (Future)

Pour connecter une vraie IA (comme OpenAI ou Gemini) :
1.  Créez une API Route dans `src/app/api/generate/route.ts`.
2.  Utilisez le SDK de votre choix pour envoyer la liste des ingrédients.
3.  Remplacez le mock dans `src/app/page.tsx` par un appel `fetch('/api/generate')`.
