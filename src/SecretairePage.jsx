import React, { useState, useEffect } from 'react';
import axios from 'axios';
import keycloak from "./keycloak";
import PatientList from "./components/PatientList";
import PatientDetails from "./components/PatientDetails";
import "./SecretairePage.css"; // Réutilisation du style existant

const SecretairePage = () => {
  const backendUrl = 'http://localhost:3001';
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [appointments, setAppointments] = useState({});

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const response = await axios.get(`${backendUrl}/patients`);
      setPatients(response.data);
    } catch (error) {
      console.error('Erreur lors de la récupération des patients:', error.response?.data || error.message);
      alert("Erreur lors de la récupération des patients.");
    }
  };

  const fetchAppointments = async (patientId) => {
    try {
      const response = await axios.get(`${backendUrl}/appointments/${patientId}`);
      setAppointments(prevAppointments => ({
        ...prevAppointments,
        [patientId]: response.data
      }));
    } catch (error) {
      console.error('Erreur lors de la récupération des rendez-vous:', error);
    }
  };

  const handleSelectPatient = (patient) => {
    setSelectedPatient(patient);
    fetchAppointments(patient.id);
  };

  const handleBack = () => {
    setSelectedPatient(null);
    setAppointments({});
  };

  const handleLogout = () => {
    keycloak.logout();
  };

  return (
    <div className="SecretairePage">
      <div className="header">
        <h1 className="Title">Cabinet Médical - Vue Secrétariat</h1>
        <button className="logoutButton" onClick={handleLogout}>
          Déconnexion
        </button>
      </div>

      {!selectedPatient ? (
        <div className="container">
          <PatientList
            patients={patients}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            handleSelectPatient={handleSelectPatient}
          />
        </div>
      ) : (
        <div className="container">
          <button className="logoutButton" onClick={handleBack}>Retour à la Liste</button>
          <PatientDetails
            patient={selectedPatient}
            isSecretaryView={true}
          />
          {appointments[selectedPatient.id] && (
            <div className="appointments-section">
              <h3>Rendez-vous du patient</h3>
              <ul>
                {appointments[selectedPatient.id].map((appointment) => (
                  <li key={appointment.id}>
                    <p>Date: {new Date(appointment.start).toLocaleString()}</p>
                    <p>Motif: {appointment.description}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SecretairePage;