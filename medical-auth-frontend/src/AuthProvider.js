// src/AuthProvider.js
import React, { createContext, useState, useEffect } from 'react';
import keycloak from './Keycloak';

export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [authenticated, setAuthenticated] = useState(false);
  const [keycloakInitialized, setKeycloakInitialized] = useState(false);

  useEffect(() => {
    let isMounted = true;

    if (!keycloakInitialized) {
      keycloak.init({ onLoad: 'login-required' }).then(authenticated => {
        if (isMounted) {
          setAuthenticated(authenticated);
          setKeycloakInitialized(true);
        }
      }).catch(error => {
        console.error('Keycloak initialization failed', error);
      });
    }

    return () => {
      isMounted = false;
    };
  }, [keycloakInitialized]);

  return (
    <AuthContext.Provider value={{ authenticated, keycloak }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;