import React, { useState, useEffect } from "react";
import axios from "axios";
import keycloak from "./keycloak";
import PatientDetails from "./components/PatientDetails";
import PatientList from "./components/PatientList";
import AddPatient from "./components/AddPatient";
import VitalSigns from "./components/VitalSigns";
import "./MedecinPage.css";

const MedecinPage = () => {
  const backendUrl = 'http://localhost:3001';
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [newPatient, setNewPatient] = useState({
    firstName: "",
    lastName: "",
    gender: "",
    birthDate: "",
    address: {
      line: "",
      city: "",
      postalCode: "",
      country: "",
    },
    phone: "",
    email: "",
    doctor: "",
  });
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editPatient, setEditPatient] = useState(null);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const response = await axios.get(`${backendUrl}/patients`);
      setPatients(response.data);
    }
    catch (error) {
      console.error('Erreur lors de la récupération des patients:', error.response?.data || error.message);
      alert("Erreur lors de la récupération des patients.");
    }
  };

  const validateDate = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    
    // Vérifier si la date est valide et l'année est raisonnable (entre 1900 et aujourd'hui)
    if (isNaN(date.getTime()) || year < 1900 || year > new Date().getFullYear()) {
      return false;
    }
    return true;
  };

  const addPatient = async (p) => {
    try {
      if (!validateDate(p.birthDate)) {
        alert("Date de naissance invalide. Veuillez entrer une date valide entre 1900 et aujourd'hui.");
        return;
      }

      // Formater la date au format FHIR (YYYY-MM-DD)
      const formattedDate = new Date(p.birthDate).toISOString().split('T')[0];
      const patientData = {
        ...p,
        birthDate: formattedDate
      };

      console.log("Ajout du patient:", patientData);
      const response = await axios.post(`${backendUrl}/patients`, patientData);
      console.log("Patient ajouté avec succès:", response.data);
      alert("Patient ajouté avec succès!");
      fetchPatients();
      setNewPatient({
        firstName: "",
        lastName: "",
        gender: "",
        birthDate: "",
        address: {
          line: "",
          city: "",
          postalCode: "",
          country: "",
        },
        phone: "",
        email: "",
        doctor: "",
      });
    } catch (error) {
      console.error("Erreur lors de l'ajout du patient :", error.response?.data || error.message);
      alert("Une erreur est survenue lors de l'ajout du patient.");
    }
  };

  const handleSelectPatient = (patient) => {
    setSelectedPatient(patient);
  };

  const handleEditPatient = (patient) => {
    const patientCopy = JSON.parse(JSON.stringify(patient));
    setEditPatient(patientCopy);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setEditPatient(null);
    setIsEditing(false);
  };

  const handleSaveEdit = async (updatedPatient) => {
    try {
      console.log('Envoi de la mise à jour du patient:', updatedPatient);
      const response = await axios.put(`${backendUrl}/patients/${updatedPatient.id}`, updatedPatient);
      console.log('Patient modifié avec succès:', response.data);
      alert('Patient modifié avec succès !');
      fetchPatients();
      setIsEditing(false);
      setEditPatient(null);
      setSelectedPatient(response.data); // Utiliser les données mises à jour du serveur
    } catch (error) {
      console.error('Erreur lors de la modification du patient :', error.response?.data || error.message);
      alert('Une erreur est survenue lors de la modification du patient.');
    }
  };

  const handleDeletePatient = async (patientId) => {
    try {
      await axios.delete(`${backendUrl}/patients/${patientId}`);
      alert("Patient supprimé avec succès !");
      fetchPatients();
      setSelectedPatient(null);
    } catch (error) {
      console.error("Erreur lors de la suppression du patient :", error.response?.data || error.message);
      alert("Une erreur est survenue lors de la suppression du patient.");
    }
  };

  const handleLogout = () => {
    keycloak.logout();
  };

  const handleBack = () => {
    handleCancelEdit();
    setSelectedPatient(null);
  };

  const handleSimulation = async () => {
    try {
      const patientsSimules = [
        {
          firstName: "Jean",
          lastName: "Dupont",
          gender: "male",
          birthDate: "1980-05-15",
          address: {
            line: "123 Rue de Paris",
            city: "Paris",
            postalCode: "75001",
            country: "France",
          },
          phone: "0123456789",
          email: "jean.dupont@email.com",
          doctor: "Dr. Martin",
        },
        {
          firstName: "Marie",
          lastName: "Laurent",
          gender: "female",
          birthDate: "1992-09-23",
          address: {
            line: "456 Avenue Victor Hugo",
            city: "Lyon",
            postalCode: "69002",
            country: "France",
          },
          phone: "0687654321",
          email: "marie.laurent@email.com",
          doctor: "Dr. Martin",
        }
      ];

      for (const patient of patientsSimules) {
        await axios.post(`${backendUrl}/patients`, patient);
      }
      
      alert("Patients de simulation créés avec succès!");
      fetchPatients();
    } catch (error) {
      console.error("Erreur lors de la création des patients simulés:", error);
      alert("Erreur lors de la création des patients simulés");
    }
  };

  return (
    <div className="MedecinPage">
      <div className="header">
        <h1 className="Title">Cabinet Médical - Vue d'un médecin</h1>
        <button className="logoutButton" onClick={handleLogout}>
          Déconnexion
        </button>
      </div>

      {/* Formulaire d'ajout de patient */}
      {!selectedPatient && (
        <div className="container">
          <AddPatient newPatient={newPatient} setNewPatient={setNewPatient} addPatient={addPatient} />
        </div>
      )}       

      {/* Liste des patients */}
      {!selectedPatient && (
        <div className="container">
          <PatientList
            patients={patients}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            handleSelectPatient={handleSelectPatient}
          />
        </div>
      )}

      {/* Détails du patient sélectionné */}
      {selectedPatient && (
        <div className="container">
          <button className="logoutButton" onClick={handleBack}>Retour à la Liste</button>
          <PatientDetails
            patient={isEditing ? editPatient : selectedPatient}
            onDelete={handleDeletePatient}
            onEdit={handleEditPatient}
            onCancelEdit={handleCancelEdit}
            onSaveEdit={handleSaveEdit}
            isEditing={isEditing}
            editPatient={editPatient}
            setEditPatient={setEditPatient}
          />
        </div>
      )}

      {/* Bouton de simulation de patients */}
      {!selectedPatient && (
        <div className="container">
          <button className="simulationButton" onClick={handleSimulation}>
            Simulation de patients
          </button>
        </div>
      )}
    </div>
  );
};

export default MedecinPage;