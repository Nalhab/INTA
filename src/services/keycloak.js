import Keycloak from 'keycloak-js';

const keycloak = new Keycloak({
  url: 'http://localhost:3000',
  realm: 'medical-realm',
  clientId: 'medical-client',
});

export default keycloak;