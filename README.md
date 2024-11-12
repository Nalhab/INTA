# Projet Médical

## Description
Ce projet est une application web médicale utilisant Keycloak pour l'authentification et PostgreSQL comme base de données. L'application permet aux médecins, patients et secrétaires de se connecter et d'accéder à différentes fonctionnalités en fonction de leurs rôles.

## Prérequis
- Docker
- Node.js
- npm

## Installation
1. Clonez le dépôt :
    ```sh
    git clone <URL_DU_DEPOT>
    cd <NOM_DU_DEPOT>
    ```

2. Installez les dépendances :
    ```sh
    npm install
    ```

## Démarrage du projet
Pour démarrer le projet, exécutez le script `run_project.sh` à la racine du projet :
```sh
./run_project.sh
```

Ce script va :
- Démarrer les services Docker (PostgreSQL et Keycloak) en mode détaché.
- Démarrer le serveur Node.js.
- Démarrer l'application front-end avec npm.

## Arrêter le projet
Pour arrêter le projet, utilisez `ctrl+c` dans le terminal où le script `run_project.sh` est en cours d'exécution. Cela arrêtera tous les processus enfants du script.

## Connexions avec Keycloak
Voici des exemples de connexions pour différents rôles :

### Médecin
- Nom d'utilisateur: medecin.medecin
- Mot de passe: medecin

### Patient
- Nom d'utilisateur: patient.patient
- Mot de passe: patient

### Secrétaire
- Nom d'utilisateur: secretaire.secretaire
- Mot de passe: secretaire

## Structure du projet
- `docker-compose.yml` : Configuration des services Docker (PostgreSQL et Keycloak).
- `keycloak-config/realm-export.json` : Configuration de Keycloak.
- `medical_db.sql` : Script SQL pour initialiser la base de données.
- `public/` : Contient les fichiers statiques de l'application React.
- `src/` : Contient le code source de l'application React.
- `server.js` : Serveur Node.js pour l'application.
- `run_project.sh` : Script pour démarrer et arrêter le projet.

## Développement
Pour commencer le développement, vous pouvez utiliser les commandes suivantes :

### Démarrer l'application en mode développement :
```sh
npm start
```

### Créer un bundle de production :
```sh
npm run build
```

## Tests
Pour exécuter les tests, utilisez la commande suivante :
```sh
npm test
```

## Contribution
Les contributions sont les bienvenues ! Veuillez soumettre une pull request pour toute amélioration ou correction de bug.

## Licence
Ce projet est sous licence MIT.