import React, { useState, useEffect } from "react";
import axios from "axios";

const PatientPage = () => {
  const backendUrl = 'http://localhost:8081/fhir';
  const patientId = 1; // Patient ID statique

  const [patient, setPatient] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [consultations, setConsultations] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);

  // Chargement initial des données du patient
  useEffect(() => {
    fetchPatientDetails();
    fetchAppointments();
    fetchConsultations();
    fetchPrescriptions();
  }, []);

  // Récupérer les détails du patient
  const fetchPatientDetails = async () => {
    try {
      const response = await axios.get(`${backendUrl}/Patient/${patientId}`);
      setPatient(response.data);
    } catch (error) {
      console.error('Erreur lors de la récupération des détails du patient:', error);
    }
  };

  // Récupérer les rendez-vous
  const fetchAppointments = async () => {
    try {
      const response = await axios.get(`${backendUrl}/Appointment?patient=${patientId}`);
      setAppointments(response.data.entry ? response.data.entry.map(entry => entry.resource) : []);
    } catch (error) {
      console.error('Erreur lors de la récupération des rendez-vous:', error);
    }
  };

  // Récupérer les consultations
  const fetchConsultations = async () => {
    try {
      const response = await axios.get(`${backendUrl}/Observation?subject=Patient/${patientId}`);
      setConsultations(response.data.entry ? response.data.entry.map(entry => entry.resource) : []);
    } catch (error) {
      console.error('Erreur lors de la récupération des consultations:', error);
    }
  };

  // Récupérer les prescriptions
  const fetchPrescriptions = async () => {
    try {
      const response = await axios.get(`${backendUrl}/MedicationRequest?subject=Patient/${patientId}`);
      setPrescriptions(response.data.entry ? response.data.entry.map(entry => entry.resource) : []);
    } catch (error) {
      console.error('Erreur lors de la récupération des prescriptions:', error);
    }
  };

  if (!patient) {
    return <div>Chargement des informations du patient...</div>;
  }

  return (
    <div style={styles.container}>
      <h1>Espace Patient</h1>

      {/* Informations personnelles du patient */}
      <div style={styles.section}>
        <h2>Mes Informations Personnelles</h2>
        <div style={styles.patientInfo}>
          <p>
            <strong>Nom:</strong> {patient.name?.[0]?.family} {patient.name?.[0]?.given?.[0]}
          </p>
          <p>
            <strong>Date de Naissance:</strong> {new Date(patient.birthDate).toLocaleDateString()}
          </p>
          <p>
            <strong>Genre:</strong> {patient.gender === 'male' ? 'Homme' : 'Femme'}
          </p>
          <p>
            <strong>Téléphone:</strong> {patient.telecom?.find(t => t.system === 'phone')?.value}
          </p>
          <p>
            <strong>Email:</strong> {patient.telecom?.find(t => t.system === 'email')?.value}
          </p>
        </div>
      </div>

      {/* Rendez-vous */}
      <div style={styles.section}>
        <h2>Mes Rendez-vous</h2>
        {appointments.length === 0 ? (
          <p>Aucun rendez-vous programmé</p>
        ) : (
          <ul style={styles.list}>
            {appointments.map((appointment) => (
              <li key={appointment.id} style={styles.listItem}>
                <div style={styles.info}>
                  <p><strong>Date:</strong> {new Date(appointment.start).toLocaleString()}</p>
                  <p><strong>Description:</strong> {appointment.description}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Consultations */}
      <div style={styles.section}>
        <h2>Mes Consultations</h2>
        {consultations.length === 0 ? (
          <p>Aucune consultation enregistrée</p>
        ) : (
          <ul style={styles.list}>
            {consultations.map((consultation) => (
              <li key={consultation.id} style={styles.listItem}>
                <div style={styles.info}>
                  <p><strong>Date:</strong> {new Date(consultation.effectiveDateTime).toLocaleString()}</p>
                  <p><strong>Motif:</strong> {consultation.code.text}</p>
                  <p><strong>Notes:</strong> {consultation.valueString}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Prescriptions */}
      <div style={styles.section}>
        <h2>Mes Prescriptions</h2>
        {prescriptions.length === 0 ? (
          <p>Aucune prescription enregistrée</p>
        ) : (
          <ul style={styles.list}>
            {prescriptions.map((prescription) => (
              <li key={prescription.id} style={styles.listItem}>
                <div style={styles.info}>
                  <p><strong>Médicament:</strong> {prescription.medicationCodeableConcept?.text}</p>
                  <p><strong>Dosage:</strong> {prescription.dosageInstruction?.[0]?.text}</p>
                  <p><strong>Durée:</strong> {new Date(prescription.dosageInstruction?.[0]?.timing?.repeat?.boundsPeriod?.start).toLocaleString()}</p>
                  <p><strong>Instructions:</strong> {prescription.dosageInstruction?.[0]?.route?.text}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
    maxWidth: '1200px',
    margin: '0 auto',
    backgroundColor: '#f0f4f8', // Light blue-gray background
    minHeight: '100vh'
  },
  section: {
    marginBottom: '30px',
    padding: '20px',
    backgroundColor: '#ffffff', // White background for sections
    borderRadius: '12px',
    boxShadow: '0 4px 6px rgba(0, 105, 255, 0.1)', // Subtle blue shadow
    border: '1px solid #e6eaf0' // Soft border
  },
  patientInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    backgroundColor: '#e9f5ff', // Very light blue background
    padding: '20px',
    borderRadius: '8px'
  },
  list: {
    listStyleType: 'none',
    padding: 0
  },
  listItem: {
    padding: '15px',
    marginBottom: '15px',
    backgroundColor: '#f7f9fc', // Soft blue-white
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0, 105, 255, 0.08)', // Subtle shadow
    borderLeft: '4px solid #2c7be5', // Accent border
    transition: 'transform 0.2s ease-in-out'
  },
  info: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    color: '#1a2b45' // Dark blue-gray text
  },
  headings: {
    color: '#2c7be5', // Bright blue for headings
    borderBottom: '2px solid #2c7be5', // Underline effect
    paddingBottom: '10px'
  }
};


export default PatientPage;