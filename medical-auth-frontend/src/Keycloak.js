// src/keycloak.js
import Keycloak from 'keycloak-js';

const keycloak = new Keycloak({
  url: 'https://localhost:8080/auth',
  realm: 'medical-realm',
  clientId: 'medical-client',
});

export default keycloak;