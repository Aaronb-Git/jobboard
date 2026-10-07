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
