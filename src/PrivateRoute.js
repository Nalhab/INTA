import React from 'react';
import { Route, Navigate } from 'react-router-dom';

const PrivateRoute = ({ component: Component, role, requiredRole, ...rest }) => {
  // Vérification du rôle et redirection si nécessaire
  if (!role.includes(requiredRole)) {
    return <Navigate to="/unauthorized" />; // Rediriger vers une page d'accès interdit
  }

  // Si l'utilisateur a le rôle requis, afficher la route
  return <Route {...rest} render={(props) => <Component {...props} />} />;
};

export default PrivateRoute;

