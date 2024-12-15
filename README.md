# Projet Médical

## Description
Ce projet est une application web médicale utilisant Keycloak pour l'authentification et FHIR pour le stockage des données (et l'inter-opérabilité des données). L'application permet aux médecins, patients et secrétaires de se connecter et d'accéder à différentes fonctionnalités en fonction de leurs rôles. C'est 3 roles font partie du meme cabinet medical.

## Prérequis
- Docker
- Node.js
- npm

## Installation
1. Clonez le dépôt :
    ```sh
    git clone https://github.com/Nalhab/INTA.git
    cd INTA
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
Cet identifiant correnspond au patient ayant le plus ID lors du GET dans la base de données.

### Secrétaire
- Nom d'utilisateur: secretaire.secretaire
- Mot de passe: secretaire

## Structure du projet
- `docker-compose.yml` : Configuration des services Docker (PostgreSQL et Keycloak).
- `keycloak-config/realm-export.json` : Configuration de Keycloak.
- `public/` : Contient les fichiers statiques de l'application React.
- `src/` : Contient le code source de l'application React.
- `server.js` : Serveur Node.js pour l'application.
- `run_project.sh` : Script pour démarrer et arrêter le projet.

## Utilisation du site
Un médecin exemple à été créé :
```
    username : medecin.medecin
    password : medecin
```

Un patient exemple à été créé :

 /!\ Par défaut le patient n'existe pas, il faut en créer minimum un avec le compte médecin. /!\
```
    username : patient.patient
    password : patient
```

Une secretaire exemple à été créé :
```
    username : secretaire.secretaire
    password : secretaire
```

Les possibilités par role :
```
    Medecin : possède le plus de fonctionnalités
        - Ajout, vision, modification, suppresion de fiches patient
        - Ajout, vision, modification, suppresion de rendez-vous
        - Ajout, vision, modification, suppresion de consultations
        - Ajout, vision, modification, suppresion de prescriptions
        - Ajout, vision, modification, suppresion de mesures de signes vitaux
    
    Patient :
        - Vision de sa fiche patient
        - Vision de ses rendez-vous
        - Vision de ses consultations
        - Vision de ses prescriptions
        - Vision de mesures de signes vitaux
    
    Secretaire :
        - Vision de fiches patient
        - Vision de rendez-vous
```

Pour facilite les tests un bouton "Simulation de patient" a été ajouté sur la page médecin, et un bouton "Simuler données" sur la page détails patient du médecin. Ils sont en font de page. Le premier ajoute 2 patient exemple, le second ajoute 2 rendez-vous, 2 consultations et 2 prescriptions.

#### Attention a la réactivité d serveur FHIR. En effet il faut attendre parfois 1 minute pour que les données s'actualise sur la page lors d'un ajout. 

## Développement
Pour commencer le développement, vous pouvez utiliser les commandes suivantes :

### Démarrer l'application en mode développement :
```sh
npm start
```
l'ardresse de connexion est :
```
http://localhost:3000/
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
