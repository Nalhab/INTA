import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import KeycloakService from './keycloak'; // Assurez-vous que le chemin est correct

import MedecinPage from './MedecinPage';
import PatientPage from './PatientPage';
import SecretairePage from './SecretairePage';
import DashboardPage from './DashboardPage';
import UnauthorizedPage from './UnauthorizedPage';
import PrivateRoute from './PrivateRoute';

const App = () => {
  const [authenticated, setAuthenticated] = useState(false);
  const [role, setRole] = useState([]);
  const [name, setName] = useState([]);
  const [loading, setLoading] = useState(true);

  // Initialisation de Keycloak
  useEffect(() => {
    KeycloakService.init().then((authenticated) => {
      setAuthenticated(authenticated);
      if (authenticated) {
        const roles = KeycloakService.getRoles(); // Récupération des rôles de l'utilisateur
        setRole(roles);
        const name = KeycloakService.getName(); // Récupération des rôles de l'utilisateur
        setRole(name);
      }
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div>Chargement...</div>;
  }

  if (!authenticated) {
    return <div>Vous devez être connecté pour accéder à cette application.</div>;
  }

  // Fonction pour vérifier si l'utilisateur a le rôle requis
  const hasRole = (requiredRole) => role.includes(requiredRole);

  return (
    <Router>
      <Routes>
        {/* Routes protégées avec vérification des rôles */}
        <Route
          path="/medecin"
          element={
            hasRole('medecin') ? <MedecinPage userId=name /> : <Navigate to="/unauthorized" />
          }
        />
        <Route
          path="/patient"
          element={
            hasRole('patient') ? <PatientPage userId=name/> : <Navigate to="/unauthorized" />
          }
        />
        <Route
          path="/secretaire"
          element={
            hasRole('secretaire') ? <SecretairePage userId=name /> : <Navigate to="/unauthorized" />
          }
        />
        <Route
          path="/dashboard"
          element={
            hasRole('medecin') || hasRole('secretaire') || hasRole('patient') ? (
              <DashboardPage />
            ) : (
              <Navigate to="/unauthorized" />
            )
          }
        />
        {/* Route pour la page d'accès interdit */}
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
      </Routes>
    </Router>
  );
};

export default App;

