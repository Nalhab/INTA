import React, { useState, useEffect } from 'react';
import keycloak from './keycloak';
import KeycloakProvider from '@react-keycloak/web';
import Patients from './components/Patients';

const App = () => {
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    keycloak.init({ onLoad: 'login-required' }).then((auth) => {
      setAuthenticated(auth);
    });
  }, []);

  return (
    <KeycloakProvider keycloak={keycloak}>
      <div className="App">
        <h1>Application Médicale</h1>
        {authenticated ? <Patients /> : <div>Veuillez vous connecter</div>}
      </div>
    </KeycloakProvider>
  );
};

export default App;