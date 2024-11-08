import React from 'react';
import { ReactKeycloakProvider } from '@react-keycloak/web';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import keycloak from './services/keycloak';
import Home from './components/Home';
import LoginPage from './components/LoginPage';

const App = () => {
    return (
        <ReactKeycloakProvider authClient={keycloak}>
            <Router>
                <Routes>
                    <Route path="/" element={<LoginPage />} />
                    <Route path="/home" element={<Home />} />
                </Routes>
            </Router>
        </ReactKeycloakProvider>
    );
};

export default App;
