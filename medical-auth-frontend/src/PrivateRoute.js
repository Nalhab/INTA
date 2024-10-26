// src/PrivateRoute.js
import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from './AuthProvider';

const PrivateRoute = ({ component: Component }) => {
  const { authenticated } = useContext(AuthContext);

  return authenticated ? <Component /> : <Navigate to="/login" />;
};

export default PrivateRoute;