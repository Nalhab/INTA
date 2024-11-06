const express = require('express');
const { Pool } = require('pg');
const session = require('express-session');
const Keycloak = require('keycloak-connect');
const cors = require('cors');

const app = express();
const port = 3001;

const pool = new Pool({
  connectionString: 'postgresql://keycloak:password@localhost:5432/medical_db'
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
    console.log('Database connected successfully');
  }
});

const memoryStore = new session.MemoryStore();
app.use(session({
  secret: 'some secret',
  resave: false,
  saveUninitialized: true,
  store: memoryStore,
}));

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

const keycloakConfig = {
  realm: 'medical-realm',
  'auth-server-url': 'http://localhost:8080',
  'ssl-required': 'external',
  resource: 'medical-client',
  'public-client': true,
  'confidential-port': 0
};

const keycloak = new Keycloak({ store: memoryStore }, keycloakConfig);
app.use(keycloak.middleware());

app.get('/patients', keycloak.protect(), async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM Patient');
    res.json(result.rows);
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ 
      error: 'Database error',
      details: err.message
    });
  }
});

app.get('/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({
      status: 'Connected',
      timestamp: result.rows[0].now,
      database: pool.options.database
    });
  } catch (err) {
    res.status(500).json({
      error: err.message,
      config: {
        host: pool.options.host,
        database: pool.options.database,
        user: pool.options.user
      }
    });
  }
});

app.post('/add-test-patient', async (req, res) => {
  try {
    const testPatient = {
      nom: 'Test',
      prenom: 'Patient',
      dateNaissance: '2000-01-01',
      numeroSecu: `${Math.floor(Math.random() * 999999999999999)}` // 15 digits random number
    };

    const query = `
      INSERT INTO Patient 
      (nom, prenom, dateNaissance, numeroSecu)
      VALUES ($1, $2, $3, $4)
      RETURNING *`;

    const values = [
      testPatient.nom,
      testPatient.prenom,
      testPatient.dateNaissance,
      testPatient.numeroSecu
    ];

    const result = await pool.query(query, values);

    // Create DossierPatient for the new patient
    const dossierQuery = `
      INSERT INTO DossierPatient (patient_id)
      VALUES ($1)
      RETURNING *`;
    
    await pool.query(dossierQuery, [result.rows[0].id]);

    res.status(201).json({
      message: 'Test patient created successfully',
      patient: result.rows[0]
    });
  } catch (err) {
    console.error('Error creating test patient:', err);
    res.status(500).json({
      error: 'Failed to create test patient',
      details: err.message
    });
  }
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Server error', 
    details: err.message 
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});