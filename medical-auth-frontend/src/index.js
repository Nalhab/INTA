import React from 'react';
import ReactDOM from 'react-dom/client';
//import './index.css';
import reportWebVitals from './reportWebVitals.js';
import express from 'express';
import session from 'express-session';
import Keycloak from 'keycloak-connect';
import dotenv from 'dotenv';
import pg from 'pg';
dotenv.config();

const app = express();
const port = 5000;
const { Pool } = pg;

// Configuration de la base de données PostgreSQL
const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

const memoryStore = new session.MemoryStore();
app.use(
  session({
    secret: 'some-secret-key',
    resave: false,
    saveUninitialized: true,
    store: memoryStore,
  })
);

const keycloak = new Keycloak({ store: memoryStore }, 'keycloak-config.json');
app.use(keycloak.middleware());

// Middleware pour traiter les données JSON
app.use(express.json());

// Route protégée : retourne tous les patients
app.get('/api/patients', keycloak.protect(), async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM patients');
    res.json(result.rows);
  } catch (error) {
    console.error('Erreur de requête:', error);
    res.status(500).send('Erreur serveur');
  }
});

// Démarrage du serveur
app.listen(port, () => {
  console.log(`Serveur backend démarré sur le port ${port}`);
});

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
