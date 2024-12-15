#!/bin/bash

# Fonction pour arrêter tous les processus enfants
cleanup() {
  echo "Arrêt en cours..."
  # Arrête tous les processus enfants du script
  kill -s SIGTERM $DOCKER_PID $NODE_PID $NPM_PID
  wait $DOCKER_PID $NODE_PID $NPM_PID
  echo "Tous les processus ont été arrêtés."
}

# Met en place le gestionnaire de sortie
trap cleanup SIGINT SIGTERM

# Démarrer Docker Compose en mode détaché
docker compose up &
DOCKER_PID=$!
echo "Docker Compose démarré avec PID $DOCKER_PID"

# Attendre que Docker Compose soit prêt
sleep 5

# Démarrer le serveur Node.js pour le back-end avec server.js
node server.js &
NODE_PID=$!
echo "Serveur Node.js démarré avec PID $NODE_PID"

# Démarrer le front-end React avec npm (npm start)
npm run start &
NPM_FRONT_PID=$!
echo "Application front-end React démarrée avec PID $NPM_FRONT_PID"

# Attendre que tous les processus soient terminés
wait $DOCKER_PID $NODE_PID $NPM_PID

