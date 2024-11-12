const express = require('express');
const { Pool } = require('pg');
const session = require('express-session');
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

app.use(express.json());

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

app.get('/patient/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [prenom, nom] = id.split('.'); // Ajout d'une déstructuration pour extraire directement prenom et nom
    const result = await pool.query(
      `SELECT * FROM Patient WHERE nom = $1 AND prenom = $2`,
      [nom, prenom]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ 
      error: 'Database error',
      details: err.message
    });
  }
});

app.get('/patients', async (req, res) => {
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

app.get('/patients/search', async (req, res) => {
  const searchTerm = req.query.searchTerm || '';

  try {
    const patients = await Patient.find({
      $or: [
        { nom: { $regex: searchTerm, $options: 'i' } }, // Recherche insensible à la casse
        { prenom: { $regex: searchTerm, $options: 'i' } }
      ]
    });

    res.status(200).json(patients);
  } catch (error) {
    console.error('Erreur lors de la recherche de patients:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

app.get('/dossierPatient/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM DossierPatient WHERE patient_id=$1', [id]);
    res.json(result.rows);
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ 
      error: 'Database error',
      details: err.message
    });
  }
});

app.get('/dispositif-medical/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM DispositifMedical WHERE patient_id=$1', [id]);
    res.json(result.rows);
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ 
      error: 'Database error',
      details: err.message
    });
  }
});

app.get('/donnees-DM/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM DonneesDM WHERE dispositif_id=$1', [id]);
    res.json(result.rows);
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ 
      error: 'Database error',
      details: err.message
    });
  }
});

app.get('/compte-rendu/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM CompteRendu WHERE dossier_id=$1', [id]);
    res.json(result.rows);
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ 
      error: 'Database error',
      details: err.message
    });
  }
});

app.post('/add-patient', async (req, res) => {
  try {
    let { nom, prenom, dateNaissance, numeroSecu } = req.body;
    numeroSecu = numeroSecu ||`${Math.floor(100000000000000 + Math.random() * 900000000000000)}`;
   
    let result = await pool.query('SELECT * FROM patient WHERE nom = $1 AND prenom = $2', [nom, prenom]);

    if (result.rows.length > 0) {
      return res.status(400).json({ message: "Ce patient existe déjà" });
    }

    const query = `
      INSERT INTO Patient (nom, prenom, dateNaissance, numeroSecu)
      VALUES ($1, $2, $3, $4)
      RETURNING *`;

    const values = [nom, prenom, dateNaissance, numeroSecu];

    result = await pool.query(query, values);

    const dossierQuery = `
      INSERT INTO DossierPatient (patient_id)
      VALUES ($1)
      RETURNING *`;

    await pool.query(dossierQuery, [result.rows[0].id]);

    res.status(201).json({
      message: 'Patient créé avec succès',
      patient: result.rows[0]
    });
  } catch (err) {
    console.error('Erreur lors de la création du patient:', err);
    res.status(500).json({
      error: 'Échec de la création du patient',
      details: err.message
    });
  }
});

app.post('/donnees-DM', async (req, res) => {
  const { type, numeroSerie, patient_id } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO DonneesDM (dateMesure, tensionArterielle, rythmeCardiaque, oxymetrie, dispositif_id)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [type, numeroSerie, patient_id]
    );

    res.status(200).json({
      message: 'Dispositif médical ajouté avec succès',
      dispositif: result.rows[0]
    });
  } catch (error) {
    console.error('Erreur lors de l\'ajout du dispositif médical:', error);
    res.status(500).json({ error: 'Erreur lors de l\'ajout du dispositif médical' });
  }
});

app.post('/dispositif-medical', async (req, res) => {
  const { type, numeroSerie, patient_id } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO DispositifMedical (type, numeroSerie, patient_id)
       VALUES ($1, $2, $3) RETURNING *`,
      [type, numeroSerie, patient_id]
    );

    res.status(200).json({
      message: 'Dispositif médical ajouté avec succès',
      dispositif: result.rows[0]
    });
  } catch (error) {
    console.error('Erreur lors de l\'ajout du dispositif médical:', error);
    res.status(500).json({ error: 'Erreur lors de l\'ajout du dispositif médical' });
  }
});

app.post('/dossierPatient', async (req, res) => {
  const { patient_id } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO DossierPatient (patient_id) VALUES ($1) RETURNING id`,
      [patient_id]
    );
    res.status(201).json({ id: result.rows[0].id });
  } catch (err) {
    console.error('Erreur lors de l\'ajout du dossier médical', err);
    res.status(500).json({ error: 'Erreur lors de l\'ajout du dossier médical' });
  }
});

app.post('/dispositif-medical', async (req, res) => {
  const { type, numeroSerie, patient_id } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO DispositifMedical (type, numeroserie, patient_id)
       VALUES ($1, $2, $3) RETURNING id`,
      [type, numeroSerie, patient_id]
    );
    res.status(201).json({ id: result.rows[0].id });
  } catch (err) {
    console.error('Erreur lors de l\'ajout du dispositif médical', err);
    res.status(500).json({ error: 'Erreur lors de l\'ajout du dispositif médical' });
  }
});

app.post('/compte-rendu', async (req, res) => {
  const { contenu, professionnel_id, dossier_id } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO CompteRendu (contenu, professionnel_id, dossier_id)
       VALUES ($1, $2, $3) RETURNING id`,
      [contenu, professionnel_id, dossier_id]
    );
    res.status(201).json({ id: result.rows[0].id });
  } catch (err) {
    console.error('Erreur lors de l\'ajout du compte rendu', err);
    res.status(500).json({ error: 'Erreur lors de l\'ajout du compte rendu' });
  }
});

app.put('/patients/:id', async (req, res) => {
  const { id } = req.params;

  try {
    let { nom, prenom, dateNaissance, numeroSecu } = req.body;
    numeroSecu = numeroSecu ||`${Math.floor(100000000000000 + Math.random() * 900000000000000)}`;
    let result = await pool.query('SELECT * FROM patient WHERE nom = $1 AND prenom = $2', [nom, prenom]);
    
    if (result.rows.length > 0) {
      return res.status(400).json({ message: "Ce patient existe déjà" });
    } 

    console.log(`${dateNaissance}`);
    result = await pool.query(
      'UPDATE Patient SET nom = $1, prenom = $2, dateNaissance = $3, numeroSecu = $4 WHERE id = $5 RETURNING *',
      [nom, prenom, dateNaissance, numeroSecu, id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating patient', error);
    res.status(500).json({ error: 'Failed to update patient' });
  }
});

app.delete('/patients/:id', async (req, res) => {
  const { id } = req.params;
  try {
    let result = await pool.query('DELETE FROM dossierpatient WHERE id = $1', [id]);
    result = await pool.query('DELETE FROM patient WHERE id = $1 RETURNING *', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    res.status(200).json({ message: 'Patient deleted successfully' });
  } catch (error) {
    console.error('Error deleting patient:', error);
    res.status(500).json({ message: 'Error deleting patient' });
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
