import React, { useState, useEffect } from "react";
import axios from "axios";
import keycloak from "./keycloak";
import VitalSigns from "./components/VitalSigns";
import "./PatientPage.css";

const PatientPage = () => {
  const backendUrl = 'http://localhost:3001';
  const [patientId, setPatientId] = useState(null);
  
  // Ajouter une fonction pour trouver le premier patient disponible
  const findFirstPatient = async () => {
    try {
      const response = await axios.get(`${backendUrl}/patients`);
      if (response.data && response.data.length > 0) {
        setPatientId(response.data[0].id);
      } else {
        throw new Error('Aucun patient trouvé');
      }
    } catch (error) {
      console.error('Erreur lors de la recherche du patient:', error);
      alert('Vous n\'existez pas dans notre système.');
      handleLogout();
    }
  };

  // Modifier useEffect pour d'abord trouver le patient
  useEffect(() => {
    findFirstPatient();
  }, []);

  useEffect(() => {
    if (patientId) {
      fetchPatientDetails();
      fetchAppointments();
      fetchConsultations();
      fetchPrescriptions();
    }
  }, [patientId]);

  const [patient, setPatient] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [consultations, setConsultations] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);

  // Récupérer les détails du patient
  const fetchPatientDetails = async () => {
    try {
      const response = await axios.get(`${backendUrl}/patients/${patientId}`);
      if (response.data) {
        setPatient(response.data);
      } else {
        throw new Error('Données du patient non disponibles');
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des détails du patient:', error.response?.data || error);
      // Optionnel : Afficher un message d'erreur à l'utilisateur
      alert('Impossible de charger les informations du patient. Veuillez réessayer plus tard.');
    }
  };

  // Récupérer les rendez-vous
  const fetchAppointments = async () => {
    try {
      const response = await axios.get(`${backendUrl}/patients/${patientId}/appointments`);
      setAppointments(response.data || []);
    } catch (error) {
      console.error('Erreur lors de la récupération des rendez-vous:', error);
    }
  };

  // Récupérer les consultations
  const fetchConsultations = async () => {
    try {
      const response = await axios.get(`${backendUrl}/patients/${patientId}/consultations`);
      setConsultations(response.data || []);
    } catch (error) {
      console.error('Erreur lors de la récupération des consultations:', error);
    }
  };

  // Récupérer les prescriptions
  const fetchPrescriptions = async () => {
    try {
      const response = await axios.get(`${backendUrl}/patients/${patientId}/prescriptions`);
      setPrescriptions(response.data || []);
    } catch (error) {
      console.error('Erreur lors de la récupération des prescriptions:', error);
    }
  };

  const handleLogout = () => {
    keycloak.logout();
  };

  // Modifier la condition de chargement
  if (!patientId || !patient) {
    return <div className="loading">Chargement des informations du patient...</div>;
  }

  return (
    <div className="PatientPage">
      <div className="header">
        <h1 className="Title">Espace Patient</h1>
        <button className="logoutButton" onClick={handleLogout}>
          Déconnexion
        </button>
      </div>

      {/* Informations personnelles */}
      <div className="container">
        <h2>Mes Informations Personnelles</h2>
        <div className="infoCard">
        <p><strong>Prénom :</strong> {patient?.name?.[0]?.given?.[0] || 'N/A'}</p>
            <p><strong>Nom :</strong> {patient?.name?.[0]?.family || 'N/A'}</p>
            <p><strong>Genre :</strong> {patient?.gender || 'N/A'}</p>
            <p><strong>Date de Naissance :</strong> {patient?.birthDate || 'N/A'}</p>
            <p><strong>Adresse :</strong> {patient?.address?.[0]?.line?.[0] || 'N/A'}</p>
            <p><strong>Ville :</strong> {patient?.address?.[0]?.city || 'N/A'}</p>
            <p><strong>Code Postal :</strong> {patient?.address?.[0]?.postalCode || 'N/A'}</p>
            <p><strong>Pays :</strong> {patient?.address?.[0]?.country || 'N/A'}</p>
            <p><strong>Téléphone :</strong> {patient?.telecom?.[0]?.value || 'N/A'}</p>
            <p><strong>Email :</strong> {patient?.telecom?.[1]?.value || 'N/A'}</p>
            <p><strong>Médecin Traitant :</strong> {patient?.generalPractitioner?.[0]?.display || 'N/A'}</p>
        </div>
      </div>

      {/* Rendez-vous */}
      <div className="container">
        <h2>Mes Rendez-vous</h2>
        {appointments.length === 0 ? (
          <p className="emptyMessage">Aucun rendez-vous programmé</p>
        ) : (
          <div className="cardList">
            {appointments.map((appointment) => (
              <div key={appointment.id} className="card">
                <p><strong>Date:</strong> {new Date(appointment.start).toLocaleString()}</p>
                <p><strong>Description:</strong> {appointment.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Prescriptions */}
      <div className="container">
        <h2>Mes Prescriptions</h2>
        {prescriptions.length === 0 ? (
          <p className="emptyMessage">Aucune prescription enregistrée</p>
        ) : (
          <div className="cardList">
            {prescriptions.map((prescription) => (
              <div key={prescription.id} className="card">
                <p><strong>Médicament:</strong> {prescription.medicationCodeableConcept?.text}</p>
                <p><strong>Dosage:</strong> {prescription.dosageInstruction?.[0]?.text}</p>
                <p><strong>Durée:</strong> {new Date(prescription.dosageInstruction?.[0]?.timing?.repeat?.boundsPeriod?.start).toLocaleString()}</p>
                <p><strong>Instructions:</strong> {prescription.dosageInstruction?.[0]?.route?.text}</p>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Consultations */}
      <div className="container">
        <h2>Mes Consultations</h2>
        {consultations.length === 0 ? (
          <p className="emptyMessage">Aucune consultation enregistrée</p>
        ) : (
          <div className="cardList">
            {consultations.map((consultation) => (
              <div key={consultation.id} className="card">
                <p><strong>Date:</strong> {new Date(consultation.effectiveDateTime).toLocaleString()}</p>
                <p><strong>Motif:</strong> {consultation.code.text}</p>
                <p><strong>Notes:</strong> {consultation.valueString}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Données de santé */}
      <div className="container">
        <h2>Mes Données de Santé</h2>
        {patientId && <VitalSigns patientId={patientId} />}
      </div>

      
    </div>
  );
};

export default PatientPage;