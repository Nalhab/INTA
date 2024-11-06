import Keycloak from 'keycloak-js';

const keycloak = new Keycloak({
  url: 'http://localhost:8080',
  realm: 'medical-realm',
  clientId: 'medical-client',
});

export default keycloak;