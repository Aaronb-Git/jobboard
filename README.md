# Job Board

Application web de recherche d'emploi : consultation des annonces, inscription et connexion, gestion du profil et envoi de candidatures. Un espace administrateur permet de gérer les utilisateurs, les entreprises, les annonces et les candidatures.

## Technologies et organisation

| Composant | Technologies | Rôle |
| --- | --- | --- |
| Frontend | Vue 3, TypeScript, Vue Router, Vite 6, Tailwind CSS 4 | Pages, navigation et appels à l'API |
| Backend | Node.js 22, TypeScript, Express 5, mysql2 | API REST et accès à la base de données |
| Authentification | express-session, Argon2 | Sessions par cookie et hachage des mots de passe |
| Base de données | MariaDB 11.4 | Utilisateurs, entreprises, annonces et candidatures |
| Environnement local | Docker Compose | Démarrage des trois services et volumes persistants |
| Tests | Vitest, Vue Test Utils, jsdom | Tests unitaires du frontend et du backend |

```text
.
├── compose.yaml                    # Services frontend, backend et db
├── .env.example                    # Modèle de configuration locale
├── job_board.sql                   # Schéma initial de la base
├── migrations/                     # Migration pour les anciennes bases
├── backend/
│   ├── src/index.ts                # Serveur Express, sessions et routes API
│   ├── src/types/session.d.ts       # Typage de l'identifiant en session
│   └── tests/                      # Tests des gestionnaires de routes
└── frontend/
    ├── src/App.vue                 # Navigation selon la session
    ├── src/router/index.ts         # Routes des pages
    ├── src/views/                  # Pages de l'application
    ├── src/components/             # Cartes d'annonces et navigation
    ├── vite.config.ts              # Serveur de développement et proxy API
    └── tests/                      # Tests des composants et des vues
```

## Installation et configuration

### Prérequis

- Git pour cloner le dépôt, puis un terminal ouvert à sa racine.
- Docker Desktop démarré avec les conteneurs Linux, ou Docker Engine avec le plugin Docker Compose (`docker compose`). Sous Windows avec WSL 2, activer l'intégration de la distribution utilisée dans Docker Desktop.
- Les ports locaux `5173`, `3000` et `3306` disponibles.
- Node.js 22 et npm uniquement pour lancer les tests ou compiler hors Docker. Les conteneurs installent eux-mêmes leurs dépendances.

### Fichier `.env`

Copier le fichier d'exemple à la racine du dépôt.

Sous Linux, macOS ou Ubuntu/WSL :

```bash
cp .env.example .env
```

Sous Windows PowerShell :

```powershell
Copy-Item .env.example .env
```

Modifier ensuite les valeurs dans `.env` :

| Variable | Utilisation |
| --- | --- |
| `MARIADB_DATABASE` | Nom de la base, `job_board` par défaut dans l'exemple |
| `MARIADB_USER` | Utilisateur SQL utilisé par le backend |
| `MARIADB_PASSWORD` | Mot de passe de cet utilisateur SQL |
| `MARIADB_ROOT_PASSWORD` | Mot de passe du compte d'administration MariaDB |
| `SESSION_SECRET` | Secret utilisé pour signer le cookie de session ; obligatoire et non vide |

La ligne `SESSION_SECRET` du fichier d'exemple contient une commande : elle n'est pas exécutée automatiquement par Compose. Remplacer toute sa valeur par un secret généré. Par exemple, cette commande fonctionne avec Docker, sans installer Node.js sur l'ordinateur :

```sh
docker run --rm node:22-alpine node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

Copier uniquement la chaîne affichée après `SESSION_SECRET=` dans `.env`. Ce fichier est ignoré par Git ; conserver les secrets hors du dépôt.

Compose transmet les paramètres MariaDB au backend sous les noms `DB_NAME`, `DB_USER` et `DB_PASSWORD`. Il fixe également `DB_HOST=db`, `DB_PORT=3306` et `PORT=3000`. Il n'est pas nécessaire de les ajouter au `.env` pour le lancement Docker.

## Lancement du projet

Depuis la racine du dépôt :

```sh
docker compose up --build
```

Le premier lancement construit les images, installe les dépendances npm et initialise MariaDB avec `job_board.sql`. Le backend démarre lorsque le contrôle de santé de la base réussit.

| Service | Adresse | Utilisation |
| --- | --- | --- |
| Application | <http://localhost:5173> | Interface web |
| API | <http://localhost:3000/api/health> | Vérification de la connexion à MariaDB |
| MariaDB | `localhost:3306` | Connexion depuis un outil SQL local avec les identifiants du `.env` |

La route de santé renvoie `{"status":"ok","database":"connected"}` lorsque la base est accessible, ou un statut HTTP `503` si elle est indisponible.

Le navigateur appelle les routes relatives `/api` depuis le frontend. Le proxy Vite les transmet à `http://backend:3000`, puis l'API interroge MariaDB à `db:3306` sur le réseau Docker.

Pour lancer les services en arrière-plan :

```sh
docker compose up --build -d
```

Commandes utiles :

```sh
docker compose ps
docker compose logs -f backend db
docker compose down
```

En mode interactif, utiliser d'abord `Ctrl+C`, puis `docker compose down`. Les données restent conservées dans le volume `mariadb_data` ; les dépendances utilisent les volumes `frontend_node_modules` et `backend_node_modules`.

### Premier compte administrateur et premières annonces

Le script SQL crée une base vide, sans compte ni annonce de démonstration.

1. Ouvrir <http://localhost:5173/register> et créer un compte avec un nom, un prénom, un email et un mot de passe.
2. Ouvrir une console SQL dans le conteneur, puis saisir le mot de passe `MARIADB_ROOT_PASSWORD` à l'invite :

   ```sh
   docker compose exec db mariadb -u root -p job_board
   ```

   Si `MARIADB_DATABASE` a été modifié, remplacer `job_board` par le nom choisi.

3. Donner le rôle administrateur au compte créé en remplaçant l'email ci-dessous :

   ```sql
   UPDATE users SET is_admin = TRUE WHERE email = 'admin@example.com';
   SELECT id, email, is_admin FROM users WHERE email = 'admin@example.com';
   ```

4. Quitter la console avec `exit`, puis se connecter sur <http://localhost:5173/login>. Un administrateur est redirigé vers `/admin`.
5. Dans l'administration, créer d'abord une entreprise, puis une annonce liée à son identifiant. L'annonce apparaît sur la page d'accueil. Un utilisateur connecté peut ensuite envoyer une candidature.

### Initialisation, migrations et réinitialisation

`job_board.sql` est exécuté automatiquement uniquement lorsque le volume MariaDB est vide. Modifier ce fichier ou les identifiants du `.env` ne met pas à jour une base déjà initialisée.

Le fichier `migrations/001_add_password_hash.sql` ajoute `password_hash` et `is_admin` à une ancienne table `users`. Cette migration n'est pas appliquée automatiquement. Vérifier les colonnes existantes avant de l'exécuter manuellement : le schéma initial actuel contient déjà ces deux colonnes, et la migration ne doit donc pas être rejouée sur une nouvelle installation. Les anciens comptes dont `password_hash` est `NULL` ne peuvent pas se connecter.

Pour supprimer toutes les données locales et tous les volumes du projet, puis recréer une base vide :

```sh
docker compose down -v
docker compose up --build
```

Cette réinitialisation efface les comptes, les entreprises, les annonces et les candidatures enregistrés.

## Schéma de la base de données

Le schéma de référence est [job_board.sql](job_board.sql). Les quatre tables utilisent InnoDB et l'encodage `utf8mb4`. Chaque table possède une clé primaire `id` entière auto-incrémentée. Les champs indiqués comme facultatifs acceptent `NULL`.

| Table | Champs principaux | Contraintes et rôle |
| --- | --- | --- |
| `users` | `id`, `name` VARCHAR(100), `firstname` VARCHAR(100), `email` VARCHAR(255), `phone` VARCHAR(30), `address` VARCHAR(255), `password_hash` VARCHAR(255), `is_admin` BOOLEAN | Nom, prénom et email obligatoires ; email unique ; téléphone, adresse et hash facultatifs ; rôle administrateur à `FALSE` par défaut. Les comptes créés par l'API ont un hash Argon2. |
| `companies` | `id`, `name` VARCHAR(255), `company_description` TEXT | Nom obligatoire ; description facultative. |
| `ads` | `id`, `title` VARCHAR(255), `company_id` INT, `one_sentence_description` VARCHAR(500), `full_description` TEXT, `wages` DECIMAL(10,2), `place` VARCHAR(255), `working_time` VARCHAR(100), `advantages` TEXT, `diploma_needed` VARCHAR(255) | Titre et entreprise obligatoires ; autres informations facultatives ; `company_id` référence `companies.id`. |
| `applications` | `id`, `ad_id` INT, `user_id` INT, `message` TEXT, `applied_at` DATETIME | Annonce et candidat obligatoires ; message facultatif ; date courante par défaut ; clés étrangères vers `ads.id` et `users.id`. |

Relations :

```text
companies (1) ──── (N) ads (1) ──── (N) applications (N) ──── (1) users
```

Une entreprise possède plusieurs annonces. Une candidature relie un utilisateur à une annonce. Les clés étrangères sont indexées et ne prévoient pas de suppression en cascade : supprimer d'abord les candidatures avant leur utilisateur ou leur annonce, et les annonces avant leur entreprise.

Il n'existe pas de contrainte d'unicité sur le couple `(ad_id, user_id)`. L'interface signale une annonce déjà postulée, mais l'API et le schéma n'interdisent pas les candidatures multiples.

## Routes API

Les routes sont définies dans [backend/src/index.ts](backend/src/index.ts). Les corps des requêtes et les réponses utilisent JSON. Pour les requêtes avec un corps, envoyer `Content-Type: application/json`.

La connexion crée une session identifiée par le cookie `connect.sid`. Un client HTTP doit conserver et renvoyer ce cookie pour les routes protégées. Les mots de passe sont hachés avec Argon2 ; le hash n'est pas renvoyé dans les listes d'utilisateurs ni dans le profil.

Accès : **Public** = sans connexion ; **Connecté** = session requise ; **Admin** = session d'un utilisateur avec `is_admin` actif ; **Propriétaire ou admin** = compte concerné ou auteur de la candidature, ou administrateur.

### Authentification et utilisateurs

| Méthode | Route | Accès | Fonction / corps JSON |
| --- | --- | --- | --- |
| GET | `/api/health` | Public | État de l'API et de la connexion SQL |
| POST | `/api/users` | Public | Inscription : `name`, `firstname`, `email`, `password` obligatoires ; crée un utilisateur sans rôle administrateur |
| POST | `/api/login` | Public | Connexion avec `email` et `password` ; création du cookie de session |
| GET | `/api/me` | Connecté | Profil courant : `id`, `name`, `firstname`, `email`, `phone`, `address`, `is_admin` |
| POST | `/api/logout` | Public | Destruction de la session et suppression du cookie |
| GET | `/api/users` | Admin | Liste des utilisateurs sans leurs hashes |
| PUT | `/api/users/:id` | Propriétaire ou admin | Modification : `name`, `firstname`, `email` obligatoires ; `phone`, `address` facultatifs |
| DELETE | `/api/users/:id` | Propriétaire ou admin | Suppression du compte ; déconnexion si le compte supprimé est le compte courant |
| PUT | `/api/users/:id/password` | Propriétaire uniquement | Changement du mot de passe avec `newPassword` non vide |

### Entreprises

| Méthode | Route | Accès | Fonction / corps JSON |
| --- | --- | --- | --- |
| GET | `/api/companies` | Public | Liste des entreprises |
| POST | `/api/companies` | Admin | Création : `name` obligatoire, `company_description` facultatif |
| PUT | `/api/companies/:id` | Admin | Modification : `name` obligatoire, `company_description` facultatif |
| DELETE | `/api/companies/:id` | Admin | Suppression d'une entreprise sans annonce liée |

### Annonces

| Méthode | Route | Accès | Fonction / corps JSON |
| --- | --- | --- | --- |
| GET | `/api/ads` | Public | Liste complète des annonces avec le nom de l'entreprise |
| GET | `/api/ads/preview` | Public | Résumés des annonces et indicateur `applied` pour l'utilisateur courant |
| GET | `/api/ads/:id/details` | Public | Description complète, salaire, temps de travail, avantages et diplôme requis |
| GET | `/api/ads/:id/applied` | Connecté | Renvoie `{ "applied": true }` ou `{ "applied": false }` pour l'utilisateur courant |
| POST | `/api/ads` | Admin | Création avec les champs d'annonce décrits ci-dessous |
| PUT | `/api/ads/:id` | Admin | Modification avec les mêmes champs |
| DELETE | `/api/ads/:id` | Admin | Suppression d'une annonce sans candidature liée |

Pour créer ou modifier une annonce, `title` et `company_id` sont obligatoires ; `company_id` doit être un entier positif correspondant à une entreprise existante. Les champs `one_sentence_description`, `full_description`, `wages`, `place`, `working_time`, `advantages` et `diploma_needed` sont facultatifs. Les routes `PUT` remplacent les champs concernés : renvoyer toutes les valeurs à conserver.

### Candidatures

| Méthode | Route | Accès | Fonction / corps JSON |
| --- | --- | --- | --- |
| POST | `/api/ads/:id/applications` | Connecté | Postuler à l'annonce : `message` doit être une chaîne, éventuellement vide |
| GET | `/api/applications` | Admin | Liste des candidatures avec le nom, le prénom du candidat et le titre de l'annonce |
| POST | `/api/applications` | Connecté | Création : `ad_id` entier positif obligatoire, `message` facultatif |
| PUT | `/api/applications/:id` | Propriétaire ou admin | Modification du `message`, facultatif |
| DELETE | `/api/applications/:id` | Propriétaire ou admin | Suppression d'une candidature |

Les deux routes de création utilisent toujours l'identifiant de l'utilisateur connecté comme `user_id`, y compris depuis l'administration.

Les succès renvoient généralement `200`, ou `201` pour une création. Selon la route, les erreurs renvoient `400` (données invalides), `401` (absence de session ou identifiants incorrects), `403` (droits insuffisants), `404` (ressource introuvable), `409` (suppression d'un utilisateur ou d'une annonce ayant des candidatures), `500` (erreur serveur) ou `503` (base indisponible sur `/api/health`), avec un message JSON ou un état de santé.

## Pages et composants du frontend

Les routes sont déclarées dans [frontend/src/router/index.ts](frontend/src/router/index.ts).

| Chemin | Vue | Fonctionnalités |
| --- | --- | --- |
| `/` | `HomeView.vue` | Liste des annonces, filtres et compteurs « déjà postulé » / « non postulé » pour l'utilisateur connecté |
| `/register` | `RegisterView.vue` | Formulaire de création de compte |
| `/login` | `LoginView.vue` | Connexion ; redirection vers l'administration pour un administrateur, sinon vers l'accueil |
| `/Profil` | `ProfilView.vue` | Chargement et modification du profil courant, coordonnées et mot de passe ; session requise par l'API |
| `/ads/:id/apply` | `ApplicationView.vue` | Formulaire de candidature avec un message ; session requise pour l'envoi |
| `/admin` | `AdminView.vue` | Gestion des utilisateurs, entreprises, annonces et candidatures ; vérifie le rôle administrateur et affiche une page 404 aux autres visiteurs |

`JobCard.vue` affiche une annonce, charge ses détails à la demande, les garde en cache et vérifie si l'utilisateur a déjà postulé. Le bouton de candidature conduit au formulaire ou à la connexion selon la session. `Navbar.vue` et `UserNavbar.vue` affichent la navigation adaptée aux visiteurs et aux utilisateurs connectés. `App.vue` choisit la barre de navigation à partir de `/api/me` et actualise les vues lors des changements de connexion.

## Tests et compilation

Avec Node.js 22 et npm installés, exécuter les commandes suivantes depuis la racine du dépôt, dans deux terminaux distincts.

Frontend :

```sh
cd frontend
npm install
npm run test:run
npm run build
```

Backend :

```sh
cd backend
npm install
npm run test:run
npm run build
```

Sous Windows PowerShell, utiliser `npm.cmd` à la place de `npm` si l'exécution de `npm.ps1` est bloquée par la politique de scripts. Après installation des dépendances, il suffit de relancer `npm run test:run`. La commande `npm test` active le mode de surveillance.

Les tests frontend couvrent les filtres et compteurs des annonces, les visiteurs, les états vides et les erreurs de chargement, les cartes et le cache des détails, le statut « déjà postulé », la redirection vers la connexion et les changements de session. Les réponses HTTP sont simulées.

Les tests backend couvrent l'inscription, la connexion, les restrictions administrateur et l'envoi de candidatures. Les gestionnaires de routes sont appelés en isolation : Express, les sessions, les requêtes SQL et Argon2 sont simulés. Les tests ne nécessitent ni Docker, ni MariaDB, ni serveur HTTP, ni secret réel. Ils ne vérifient pas les requêtes sur une vraie base, les cookies réels ou le hachage Argon2 réel.

La compilation produit `frontend/dist` pour l'interface et `backend/dist` pour l'API. Le script backend `npm start` lance `dist/index.js` et attend les variables `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` et `SESSION_SECRET` dans son environnement. Le backend ne charge pas automatiquement le fichier `.env`. Le proxy Vite fourni cible le nom Docker `backend` : pour développer le frontend hors Docker, adapter sa cible à `http://localhost:3000`.

La configuration Compose fournie lance les serveurs de développement. Les sessions sont stockées en mémoire et disparaissent au redémarrage du backend ; le cookie utilise `httpOnly`, `sameSite: lax` et `secure: false` pour le HTTP local.

## Dépannage local

- **Variable manquante au démarrage de Compose** : vérifier que `.env` existe à la racine et que les cinq variables sont renseignées.
- **Port déjà utilisé** : arrêter le service local concerné ou adapter le port publié dans `compose.yaml` ; utiliser ensuite l'adresse correspondante.
- **API ou base indisponible** : consulter `docker compose ps` et `docker compose logs -f backend db`, puis vérifier les identifiants SQL et l'état du service `db`.
- **Identifiants SQL modifiés sans effet** : les paramètres d'initialisation MariaDB ne changent pas les comptes d'un volume existant. Mettre à jour les comptes SQL ou réinitialiser les volumes si leurs données peuvent être effacées.
- **Aucune annonce à l'accueil** : une nouvelle base est vide ; créer une entreprise et une annonce depuis le premier compte administrateur.
