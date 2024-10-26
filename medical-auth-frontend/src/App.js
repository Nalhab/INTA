// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AuthProvider from './AuthProvider';
import PrivateRoute from './PrivateRoute';
import Home from './Home';
import Login from './Login';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<PrivateRoute component={Home} />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;