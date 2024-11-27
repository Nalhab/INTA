const express = require('express');
const cors = require('cors');
const axios = require('axios');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3001;

// Configurer l'URL du serveur FHIR
const FHIR_SERVER_BASE_URL = 'http://localhost:8081/fhir'; // Adresse du serveur FHIR (HAPI FHIR)

app.use(cors({ origin: 'http://localhost:3000' }));

// Middleware pour parser les requêtes JSON
app.use(bodyParser.json());

app.get('/patients', async (req, res) => {
  try {
    const response = await axios.get('http://localhost:8081/fhir/Patient');
    res.json(response.data.entry.map((entry) => entry.resource));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Ajouter un patient
app.post('/patients', async (req, res) => {
  const patientData = req.body; // Le JSON doit contenir les données FHIR du patient
  try {
    const response = await axios.post(`${FHIR_SERVER_BASE_URL}/Patient`, patientData, {
      headers: { 'Content-Type': 'application/fhir+json' },
    });
    res.status(201).json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Supprimer un patient
app.delete('/patients/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const response = await axios.delete(`${FHIR_SERVER_BASE_URL}/Patient/${id}`);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Ajouter une prescription à un patient
app.post('/patients/:id/prescriptions', async (req, res) => {
  const { id } = req.params;
  const prescriptionData = req.body; // Le JSON doit contenir les données FHIR du MedicationRequest
  try {
    // Associer la prescription au patient
    prescriptionData.subject = { reference: `Patient/${id}` };

    const response = await axios.post(`${FHIR_SERVER_BASE_URL}/MedicationRequest`, prescriptionData, {
      headers: { 'Content-Type': 'application/fhir+json' },
    });
    res.status(201).json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Assigner un médecin en charge à un patient
app.post('/patients/:id/assign-doctor', async (req, res) => {
  const { id } = req.params;
  const { practitionerId } = req.body; // Le JSON doit contenir l'ID du médecin (Practitioner)
  try {
    // Récupérer les données du patient
    const patientResponse = await axios.get(`${FHIR_SERVER_BASE_URL}/Patient/${id}`);
    const patientData = patientResponse.data;

    // Ajouter le médecin en charge dans la liste de "careProvider"
    if (!patientData.careProvider) {
      patientData.careProvider = [];
    }
    patientData.careProvider.push({ reference: `Practitioner/${practitionerId}` });

    // Mettre à jour le patient
    const updateResponse = await axios.put(`${FHIR_SERVER_BASE_URL}/Patient/${id}`, patientData, {
      headers: { 'Content-Type': 'application/fhir+json' },
    });
    res.status(200).json(updateResponse.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});

