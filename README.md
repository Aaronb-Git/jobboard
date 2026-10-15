# Job board — démarrage local avec Docker Compose

## Prérequis

- Docker Desktop démarré, avec l’intégration WSL activée pour Ubuntu.
- Le dépôt cloné dans le système de fichiers Linux, par exemple `~/epitech/Jobboard/T-WEB-501-NCY-5-1-job_board-4`.

## Premier lancement

1. Copier `.env.example` vers `.env` à la racine. Dans Ubuntu/WSL :

   ```bash
   cp .env.example .env
   ```

   ```Powershell
   Copy-Item .env.example .env
   ```
2. Depuis la racine du dépôt, démarrer les services :

   ```bash
   docker compose up --build
   ```

3. Ouvrir le front : <http://localhost:5173>
4. Vérifier l’API : <http://localhost:3000/api/health>

Pour arrêter les services, utiliser `Ctrl+C`, puis `docker compose down`.
La base reste conservée dans le volume Docker `mariadb_data`.

Pour réinitialiser la base et effacer ses données locales : `docker compose down -v`.

## Connexions

- Le navigateur accède au front sur `localhost:5173`.
- Le front Vite transmet les requêtes `/api` au service `backend`.
- L’API joint MariaDB avec l’hôte `db` et le port interne `3306`.
- Le port `3306` est aussi publié sur l’ordinateur pour permettre l’utilisation d’un outil SQL local.

Les valeurs du `.env` fourni sont réservées au développement local. Ne mettez jamais de vrais secrets dans Git.

## Tests unitaires rapides

### Frontend : 10 tests

Avec Node.js 22 à jour, depuis la racine du projet :

```sh
cd frontend
npm install
npm run test:run
```

Pour relancer les tests automatiquement pendant les modifications : `npm test`.
Docker, MariaDB et le serveur API ne sont pas nécessaires : les réponses HTTP sont simulées.

Sous Windows PowerShell, utiliser `npm.cmd` pour conserver la politique
de sécurité des scripts du système :

```powershell
cd frontend
npm.cmd install
npm.cmd run test:run
```

Après la première installation, seule la commande `npm.cmd run test:run` est nécessaire.
Pour relancer les tests à chaque modification : `npm.cmd test`.

Les 10 tests couvrent les filtres et compteurs des annonces, les visiteurs, la liste vide,
les erreurs de chargement, l'affichage d'une carte, le cache des détails,
le statut « déjà postulé », la désactivation du bouton après une erreur
et la redirection vers la connexion.

Les tests se lancent localement, sans GitHub Actions ni connexion à GitHub.

### Backend : 10 tests

Depuis la racine du projet, sous Windows PowerShell :

```powershell
cd backend
npm.cmd install
npm.cmd run test:run
```

Après la première installation, utiliser uniquement `npm.cmd run test:run`.
Pour relancer les tests automatiquement pendant les modifications : `npm.cmd test`.
Sous Linux ou macOS, remplacer `npm.cmd` par `npm`.

Ces tests vérifient l'inscription (validation, nettoyage et utilisation du hash),
la connexion (refus et sauvegarde de la session), le refus d'accès administrateur
et les candidatures (connexion requise, identifiant invalide, annonce absente,
enregistrement et erreur de base de données).

Les gestionnaires de routes sont appelés en isolation : Express, les sessions,
les requêtes SQL et Argon2 sont simulés. Aucun serveur HTTP, Docker, secret réel
ou accès à MariaDB n'est nécessaire. Ces tests ne vérifient pas les requêtes SQL
sur une vraie base ni le fonctionnement réel des cookies et du hachage Argon2.
