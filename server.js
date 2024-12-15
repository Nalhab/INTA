const express = require('express');
const cors = require('cors');
const axios = require('axios');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3001;

const FHIR_SERVER_BASE_URL = 'http://localhost:8081/fhir';

app.use(cors({ origin: 'http://localhost:3000' }));

app.use(bodyParser.json());

app.get('/patients', async (req, res) => {
  try {
    const response = await axios.get(`${FHIR_SERVER_BASE_URL}/Patient`);
    const patients = response.data.entry ? response.data.entry.map((entry) => entry.resource) : [];
    res.json(patients);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Récupérer un patient spécifique
app.get('/patients/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const response = await axios.get(`${FHIR_SERVER_BASE_URL}/Patient/${id}`, {
      headers: {
        'Content-Type': 'application/fhir+json',
        'Accept': 'application/fhir+json'
      }
    });
    
    // Vérifiez si la réponse contient des données valides
    if (response.data && response.data.resourceType === 'Patient') {
      res.json(response.data);
    } else {
      throw new Error('Patient non trouvé ou données invalides');
    }
  } catch (error) {
    console.error('Erreur détaillée:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: 'Erreur lors de la récupération du patient',
      details: error.response?.data || error.message
    });
  }
});

// Ajouter un patient
app.post('/patients', async (req, res) => {
  const patientData = req.body;
  try {
    let practitionerId = null;
    const searchResponse = await axios.get(`${FHIR_SERVER_BASE_URL}/Practitioner`, {
      params: {
        name: patientData.doctor,
      },
      headers: {
        'Content-Type': 'application/fhir+json',
      },
    });

    if (searchResponse.data.entry && searchResponse.data.entry.length > 0) {
      practitionerId = searchResponse.data.entry[0].resource.id;
    } else {
      const practitionerResponse = await axios.post(`${FHIR_SERVER_BASE_URL}/Practitioner`, {
        resourceType: 'Practitioner',
        name: [
          {
            text: patientData.doctor,
          },
        ],
      }, {
        headers: {
          'Content-Type': 'application/fhir+json',
        },
      });

      practitionerId = practitionerResponse.data.id;
    }

    const response = await axios.post(`${FHIR_SERVER_BASE_URL}/Patient`, {
      resourceType: 'Patient',
      name: [
        {
          family: patientData.lastName,
          given: [patientData.firstName],
        },
      ],
      gender: patientData.gender,
      birthDate: patientData.birthDate,
      address: [
        {
          line: [patientData.address.line],
          city: patientData.address.city,
          postalCode: patientData.address.postalCode,
          country: patientData.address.country,
        },
      ],
      telecom: [
        {
          system: "phone",
          value: patientData.phone,
          use: "mobile",
        },
        {
          system: "email",
          value: patientData.email,
        },
      ],
      communication: [
        {
          language: {
            coding: [
              {
                system: "urn:ietf:bcp:47",
                code: "fr",
              },
            ],
          },
        },
      ],
      generalPractitioner: [
        {
          reference: `Practitioner/${practitionerId}`,
          display: patientData.doctor,
        },
      ],
    }, {
      headers: {
        'Content-Type': 'application/fhir+json',
      },
    });

    res.status(201).json(response.data);
  } catch (error) {
    const errorMessage = error.response?.data || error.message;
    console.error('Erreur lors de la création du patient sur le serveur FHIR:', errorMessage);
    res.status(500).json({ error: errorMessage });
  }
});

app.put('/patients/:id', async (req, res) => {
  const { id } = req.params;
  const patientData = req.body;
  try {
    let practitionerId = null;
    const searchResponse = await axios.get(`${FHIR_SERVER_BASE_URL}/Practitioner`, {
      params: {
        name: patientData.doctor,
      },
      headers: {
        'Content-Type': 'application/fhir+json',
      },
    });

    if (searchResponse.data.entry && searchResponse.data.entry.length > 0) {
      practitionerId = searchResponse.data.entry[0].resource.id;
    } else {
      const practitionerResponse = await axios.post(`${FHIR_SERVER_BASE_URL}/Practitioner`, {
        resourceType: 'Practitioner',
        name: [
          {
            text: patientData.doctor,
          },
        ],
      }, {
        headers: {
          'Content-Type': 'application/fhir+json',
        },
      });

      practitionerId = practitionerResponse.data.id;
    }

    const response = await axios.put(`${FHIR_SERVER_BASE_URL}/Patient/${id}`, {
      resourceType: 'Patient',
      id: id,
      name: [
        { 
          family: patientData.name[0]?.family || '',
          given: patientData.name[0]?.given || [],
        },
      ],
      gender: patientData.gender || '',
      birthDate: patientData.birthDate || '',
      address: [
        {
          line: patientData.address[0]?.line || [],
          city: patientData.address[0]?.city || '',
          postalCode: patientData.address[0]?.postalCode || '',
          country: patientData.address[0]?.country || '',
        },
      ],
      telecom: [
        { 
          system: "phone", 
          value: patientData.telecom[0]?.value || '', 
          use: "mobile" 
        },
        { 
          system: "email", 
          value: patientData.telecom[1]?.value || '' 
        },
      ],
      communication: [
        {
          language: {
            coding: [
              { system: "urn:ietf:bcp:47", code: "fr" },
            ],
          },
        },
      ],
      generalPractitioner: [
        { 
          reference: `Practitioner/${practitionerId}`, 
          display: patientData.generalPractitioner[0]?.display || '' 
        },
      ],
    }, {
      headers: {
        'Content-Type': 'application/fhir+json',
      },
    });
    
    res.status(200).json(response.data);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du patient sur le serveur FHIR:', error.response?.data || error.message);
    res.status(500).json({ error: error.response?.data || error.message });
  }
});


const deletePatientDependencies = async (patientId) => {
  // Supprimer les rendez-vous
  const appointmentsResponse = await axios.get(`${FHIR_SERVER_BASE_URL}/Appointment`, {
    params: { patient: `Patient/${patientId}` },
  });
  const appointments = appointmentsResponse.data.entry ? appointmentsResponse.data.entry.map((entry) => entry.resource) : [];
  for (const appointment of appointments) {
    await axios.delete(`${FHIR_SERVER_BASE_URL}/Appointment/${appointment.id}`);
  }

  // Supprimer les consultations
  const consultationsResponse = await axios.get(`${FHIR_SERVER_BASE_URL}/Encounter`, {
    params: { patient: `Patient/${patientId}` },
  });
  const consultations = consultationsResponse.data.entry ? consultationsResponse.data.entry.map((entry) => entry.resource) : [];
  for (const consultation of consultations) {
    await axios.delete(`${FHIR_SERVER_BASE_URL}/Encounter/${consultation.id}`);
  }

  // Supprimer les prescriptions
  const prescriptionsResponse = await axios.get(`${FHIR_SERVER_BASE_URL}/MedicationRequest`, {
    params: { patient: `Patient/${patientId}` },
  });
  const prescriptions = prescriptionsResponse.data.entry ? prescriptionsResponse.data.entry.map((entry) => entry.resource) : [];
  for (const prescription of prescriptions) {
    await axios.delete(`${FHIR_SERVER_BASE_URL}/MedicationRequest/${prescription.id}`);
  }

  // Supprimer les signes vitaux
  const vitalsResponse = await axios.get(`${FHIR_SERVER_BASE_URL}/Observation`, {
    params: { patient: `Patient/${patientId}` },
  });
  const vitals = vitalsResponse.data.entry ? vitalsResponse.data.entry.map((entry) => entry.resource) : [];
  for (const vital of vitals) {
    await axios.delete(`${FHIR_SERVER_BASE_URL}/Observation/${vital.id}`);
  }
};

// Supprimer un patient et ses dépendances
app.delete('/patients/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await deletePatientDependencies(id);
    const response = await axios.delete(`${FHIR_SERVER_BASE_URL}/Patient/${id}`);
    res.status(200).json(response.data);
  } catch (error) {
    console.error('Erreur lors de la suppression du patient:', error.response?.data || error.message);
    res.status(500).json({ error: error.response?.data || error.message });
  }
});

// Récupérer les rendez-vous d'un patient
app.get('/patients/:id/appointments', async (req, res) => {
  const { id } = req.params;
  try {
    const response = await axios.get(`${FHIR_SERVER_BASE_URL}/Appointment`, {
      params: {
        patient: `Patient/${id}`,
      },
    });
    const appointments = response.data.entry ? response.data.entry.map((entry) => entry.resource) : [];
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Ajouter un rendez-vous à un patient
app.post('/patients/:id/appointments', async (req, res) => {
  const { id } = req.params;
  const appointmentData = req.body;
  try {
    const response = await axios.post(`${FHIR_SERVER_BASE_URL}/Appointment`, {
      resourceType: 'Appointment',
      status: 'booked',
      participant: [
        {
          actor: {
            reference: `Patient/${id}`,
          },
        },
      ],
      start: new Date(appointmentData.start).toISOString(),
      end: new Date(appointmentData.end).toISOString(),
      description: appointmentData.description,
    }, {
      headers: { 'Content-Type': 'application/json' },
    });
    res.status(201).json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mettre à jour un rendez-vous
app.put('/patients/:patientId/appointments/:id', async (req, res) => {
  const { patientId, id } = req.params;
  const appointmentData = req.body;
  try {
    const response = await axios.put(`${FHIR_SERVER_BASE_URL}/Appointment/${id}`, {
      resourceType: 'Appointment',
      id: id,
      status: 'booked',
      start: new Date(appointmentData.start).toISOString(),
      end: new Date(appointmentData.end).toISOString(),
      participant: [
        {
          actor: {
            reference: `Patient/${patientId}`,
          },
        },
      ],
      description: appointmentData.description,
    }, {
      headers: { 'Content-Type': 'application/json' },
    });
    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Supprimer un rendez-vous
app.delete('/patients/:patientId/appointments/:appointmentId', async (req, res) => {
  const { patientId, appointmentId } = req.params;
  try {
    const response = await axios.delete(`${FHIR_SERVER_BASE_URL}/Appointment/${appointmentId}`);
    res.status(200).json({ message: 'Rendez-vous supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression du rendez-vous:', error.response?.data || error.message);
    res.status(500).json({ error: error.response?.data || error.message });
  }
});

// Récupérer les consultations d'un patient
app.get('/patients/:id/consultations', async (req, res) => {
  const { id } = req.params;
  try {
    const response = await axios.get(`${FHIR_SERVER_BASE_URL}/Observation?subject=Patient/${id}`);
    const consultations = response.data.entry ? response.data.entry.map((entry) => entry.resource) : [];
    res.json(consultations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Ajouter une consultation à un patient
app.post('/patients/:id/consultations', async (req, res) => {
  const { id } = req.params;
  const consultationData = req.body;
  try {
    const response = await axios.post(`${FHIR_SERVER_BASE_URL}/Observation`,
      {
        resourceType: 'Observation',
        status: 'final',
        category: [
          {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/observation-category',
                code: 'exam',
                display: 'Exam'
              }
            ],
            text: 'Consultation'
          }
        ],
        code: {
          coding: [
            {
              system: 'http://loinc.org',
              code: '34765-5', // Code LOINC pour une consultation générale
              display: 'General examination of patient'
            }
          ],
          text: consultationData.motif
        },
        subject: {
          reference: `Patient/${id}`
        },
        effectiveDateTime: consultationData.effectiveDateTime,
        valueString: consultationData.description
        },
        {
        headers: { 'Content-Type': 'application/fhir+json' },
      }
    );
    res.status(201).json(response.data);
  } catch (error) {
    console.error('Erreur lors de l\'ajout de la consultation:', error.response?.data || error.message);
    res.status(500).json({ error: error.response?.data || error.message });
  }
});

// Mettre à jour une consultation
app.put('/consultations/:id', async (req, res) => {
  const { id } = req.params;
  const consultationData = req.body;
  try {
    const response = await axios.put(`${FHIR_SERVER_BASE_URL}/Observation/${id}`, {
      resourceType: 'Observation',
      id: id,
      status: 'final',
      category: [
        {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/observation-category',
              code: 'exam',
              display: 'Exam'
            }
          ],
          text: 'Consultation'
        }
      ],
      code: {
        coding: [
          {
            system: 'http://loinc.org',
            code: '34765-5',
            display: 'General examination of patient'
          }
        ],
        text: consultationData.motif
      },
      subject: {
        reference: `Patient/${consultationData.patientId}`
      },
      effectiveDateTime: consultationData.effectiveDateTime,
      valueString: consultationData.description
    }, {
      headers: { 'Content-Type': 'application/fhir+json' },
    });
    res.status(200).json(response.data);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la consultation:', error.response?.data || error.message);
    res.status(500).json({ error: error.response?.data || error.message });
  }
});

// Supprimer une consultation
app.delete('/consultations/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const response = await axios.delete(`${FHIR_SERVER_BASE_URL}/Observation/${id}`);
    res.status(201).json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Récupérer les prescriptions d'un patient
app.get('/patients/:id/prescriptions', async (req, res) => {
  const { id } = req.params;
  try {
    const response = await axios.get(`${FHIR_SERVER_BASE_URL}/MedicationRequest?subject=Patient/${id}`);
    const prescriptions = response.data.entry ? response.data.entry.map((entry) => entry.resource) : [];
    res.json(prescriptions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Ajouter une prescription à un patient
app.post('/patients/:id/prescriptions', async (req, res) => {
  const { id } = req.params;
  const prescriptionData = req.body;
  try {
    const response = await axios.post(`${FHIR_SERVER_BASE_URL}/MedicationRequest`,
      {
        resourceType: "MedicationRequest",
        status: "active",
        intent: "order",
        medicationCodeableConcept: {
          text: prescriptionData.text,
        },
        subject: {
          reference: `Patient/${id}`,
        },
        authoredOn: new Date().toISOString(),
        dosageInstruction: [
          {
            text: prescriptionData.dosage,
            timing: {
              repeat: {
                boundsPeriod: {
                  start: prescriptionData.duration,
                }
              }
            },
            route: {
              text: prescriptionData.instructions,
            }
          },
        ],
      },
      {
        headers: { 'Content-Type': 'application/fhir+json' },
      }
    );
    res.status(201).json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mettre à jour une prescription
app.put('/prescriptions/:id', async (req, res) => {
  const { id } = req.params;
  const prescriptionData = req.body;
  try {
    let patientId = prescriptionData.patientId;
    if (!patientId) {
      const existingPrescription = await axios.get(`${FHIR_SERVER_BASE_URL}/MedicationRequest/${id}`);
      patientId = existingPrescription.data.subject.reference.split('/')[1];
    }

    const response = await axios.put(`${FHIR_SERVER_BASE_URL}/MedicationRequest/${id}`, {
      resourceType: "MedicationRequest",
      id: id,
      status: "active",
      intent: "order",
      medicationCodeableConcept: {
        text: prescriptionData.text,
      },
      subject: {
        reference: `Patient/${patientId}`,
      },
      authoredOn: new Date().toISOString(),
      dosageInstruction: [
        {
          text: prescriptionData.dosage,
          timing: {
            repeat: {
              boundsPeriod: {
                start: prescriptionData.duration,
              }
            }
          },
          route: {
            text: prescriptionData.instructions,
          }
        },
      ],
    }, {
      headers: { 'Content-Type': 'application/fhir+json' },
    });
    res.status(200).json(response.data);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la prescription:', error.response?.data || error.message);
    res.status(500).json({ error: error.response?.data || error.message });
  }
});

// Supprimer une prescription
app.delete('/prescriptions/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const response = await axios.delete(`${FHIR_SERVER_BASE_URL}/MedicationRequest/${id}`);
    res.status(201).json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Assigner un médecin en charge à un patient
app.post('/patients/:id/assign-doctor', async (req, res) => {
  const { id } = req.params;
  const { practitionerId } = req.body;
  try {
    const patientResponse = await axios.get(`${FHIR_SERVER_BASE_URL}/Patient/${id}`);
    const patientData = patientResponse.data;

    if (!patientData.careProvider) {
      patientData.careProvider = [];
    }
    patientData.careProvider.push({ reference: `Practitioner/${practitionerId}` });

    const updateResponse = await axios.put(`${FHIR_SERVER_BASE_URL}/Patient/${id}`, patientData, {
      headers: { 'Content-Type': 'application/fhir+json' },
    });
    res.status(200).json(updateResponse.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Récupérer les signes vitaux d'un patient
app.get('/patients/:id/vitals', async (req, res) => {
  const { id } = req.params;
  try {
    const response = await axios.get(`${FHIR_SERVER_BASE_URL}/Observation`, {
      params: {
        subject: `Patient/${id}`,
        category: 'vital-signs',
        _sort: '-date'
      }
    });
    const vitals = response.data.entry ? response.data.entry.map(entry => entry.resource) : [];
    res.json(vitals);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Ajouter des signes vitaux pour un patient
app.post('/patients/:id/vitals', async (req, res) => {
  const { id } = req.params;
  const { type, value, unit, effectiveDateTime } = req.body;

  const vitalSignsMapping = {
    'blood-pressure': {
      code: '85354-9',
      display: 'Blood pressure panel',
      system: 'http://loinc.org'
    },
    'heart-rate': {
      code: '8867-4',
      display: 'Heart rate',
      system: 'http://loinc.org'
    },
    'oxygen-saturation': {
      code: '2708-6',
      display: 'Oxygen saturation',
      system: 'http://loinc.org'
    }
  };

  try {
    const observation = {
      resourceType: 'Observation',
      status: 'final',
      category: [{
        coding: [{
          system: 'http://terminology.hl7.org/CodeSystem/observation-category',
          code: 'vital-signs',
          display: 'Vital Signs'
        }]
      }],
      code: {
        coding: [{
          system: vitalSignsMapping[type].system,
          code: vitalSignsMapping[type].code,
          display: vitalSignsMapping[type].display
        }]
      },
      subject: {
        reference: `Patient/${id}`
      },
      effectiveDateTime: effectiveDateTime || new Date().toISOString(),
      valueQuantity: {
        value: value,
        unit: unit,
        system: 'http://unitsofmeasure.org'
      }
    };

    const response = await axios.post(
      `${FHIR_SERVER_BASE_URL}/Observation`,
      observation,
      { headers: { 'Content-Type': 'application/fhir+json' } }
    );

    res.status(201).json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});