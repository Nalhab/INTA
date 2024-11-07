import React from 'react';
import { ReactKeycloakProvider } from '@react-keycloak/web';
import keycloak from './keycloak';
import Home from './Home';

const App = () => {
    return (
        <ReactKeycloakProvider authClient={keycloak}>
            <Home />
        </ReactKeycloakProvider>
    );
};

export default App;