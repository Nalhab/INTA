// src/Login.js
import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from './AuthProvider';

const Login = () => {
  const { authenticated, keycloak } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (authenticated) {
      navigate('/');
    } else {
      keycloak.login();
    }
  }, [authenticated, navigate, keycloak]);

  return <h1>Please log in</h1>;
};

export default Login;