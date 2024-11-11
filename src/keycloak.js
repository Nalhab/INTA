import Keycloak from 'keycloak-js';

class KeycloakService {
  constructor() {
    this.keycloak = new Keycloak({
      url: 'http://localhost:8080',
      realm: 'medical-realm',
      clientId: 'medical-client',
    });
  }

  // Initialiser Keycloak et retourner une promesse
  init() {
    return this.keycloak.init({ onLoad: 'login-required' });
  }

  // Retourne le token de l'utilisateur
  getToken() {
    return this.keycloak.token;
  }

  // Retourne les rôles de l'utilisateur
  getRoles() {
    return this.keycloak.tokenParsed?.realm_access?.roles || [];
  }

  getName() {
    return this.keycloak.tokenParsed?.preferred_username || '';
  }

  // Vérifier si l'utilisateur est authentifié
  isAuthenticated() {
    return this.keycloak.authenticated;
  }

  // Rafraîchir le token
  updateToken() {
    return this.keycloak.updateToken(60);  // Rafraîchir le token chaque minute
  }
}

export default new KeycloakService();

