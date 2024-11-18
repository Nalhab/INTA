import React, { useState, useEffect } from "react";
import axios from "axios";

const FhirPatientPage = () => {
  const [patients, setPatients] = useState([]);
  const [newPatient, setNewPatient] = useState({
    firstName: "",
    lastName: "",
    gender: "",
    birthDate: "",
    address: "",
    phone: "",
    email: "",
    language: "",
  });

  // Fonction pour récupérer la liste des patients
  const getPatients = async () => {
    try {
      const response = await axios.get("http://localhost:8081/fhir/Patient", {
        headers: {
          "Accept": "application/json",
        },
      });
      setPatients(response.data.entry || []); // Garde les patients sous forme d'array
    } catch (error) {
      console.error("Erreur lors de la récupération des patients :", error);
    }
  };

  // Fonction pour ajouter un nouveau patient
  const addPatient = async () => {
    try {
      const response = await axios.post("http://localhost:8081/fhir/Patient", 
        {
          resourceType: "Patient",
          name: [
            {
              use: "official",
              family: newPatient.lastName,
              given: [newPatient.firstName],
            },
          ],
          gender: newPatient.gender,
          birthDate: newPatient.birthDate,
          address: [
            {
              use: "home",
              line: [newPatient.address],
              city: "Paris", // Exemple de valeur, à ajuster selon le besoin
              country: "France", // Exemple de valeur
            },
          ],
          telecom: [
            {
              system: "phone",
              value: newPatient.phone,
              use: "mobile",
            },
            {
              system: "email",
              value: newPatient.email,
            },
          ],
          communication: [
            {
              language: {
                coding: [
                  {
                    system: "urn:ietf:bcp:47",
                    code: newPatient.language,
                  },
                ],
              },
            },
          ],
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      alert("Patient ajouté avec succès!");
      setNewPatient({
        firstName: "",
        lastName: "",
        gender: "",
        birthDate: "",
        address: "",
        phone: "",
        email: "",
        language: "",
      }); // Réinitialiser le formulaire
      getPatients(); // Rafraîchir la liste des patients
    } catch (error) {
      console.error("Erreur lors de l'ajout du patient :", error);
      alert("Erreur lors de l'ajout du patient.");
    }
  };

  // Utiliser useEffect pour charger les patients lors du chargement initial
  useEffect(() => {
    getPatients();
  }, []);

  // Gérer la modification des champs du formulaire
  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewPatient((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div>
      <h1>Gestion des Patients FHIR</h1>

      {/* Formulaire pour ajouter un patient */}
      <h2>Ajouter un Nouveau Patient</h2>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          addPatient();
        }}
      >
        <div>
          <label htmlFor="firstName">Prénom:</label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            value={newPatient.firstName}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor="lastName">Nom:</label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            value={newPatient.lastName}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor="gender">Sexe:</label>
          <select
            id="gender"
            name="gender"
            value={newPatient.gender}
            onChange={handleChange}
            required
          >
            <option value="">Sélectionnez le sexe</option>
            <option value="male">Homme</option>
            <option value="female">Femme</option>
            <option value="other">Autre</option>
            <option value="unknown">Inconnu</option>
          </select>
        </div>
        <div>
          <label htmlFor="birthDate">Date de naissance:</label>
          <input
            type="date"
            id="birthDate"
            name="birthDate"
            value={newPatient.birthDate}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor="address">Adresse:</label>
          <input
            type="text"
            id="address"
            name="address"
            value={newPatient.address}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor="phone">Numéro de téléphone:</label>
          <input
            type="text"
            id="phone"
            name="phone"
            value={newPatient.phone}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor="email">E-mail:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={newPatient.email}
            onChange={handleChange}
          />
        </div>
        <div>
          <label htmlFor="language">Langue:</label>
          <input
            type="text"
            id="language"
            name="language"
            value={newPatient.language}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit">Ajouter Patient</button>
      </form>

      {/* Affichage des patients récupérés */}
      <h2>Liste des Patients</h2>
      <table>
        <thead>
          <tr>
            <th>Nom</th>
            <th>Prénom</th>
            <th>Sexe</th>
            <th>Date de naissance</th>
            <th>Email</th>
            <th>Téléphone</th>
          </tr>
        </thead>
        <tbody>
          {patients.length > 0 ? (
            patients.map((patient, index) => (
              <tr key={index}>
                <td>{patient.resource.name[0]?.family}</td>
                <td>{patient.resource.name[0]?.given?.join(" ")}</td>
                <td>{patient.resource.gender}</td>
                <td>{patient.resource.birthDate}</td>
                <td>{patient.resource.telecom?.find(t => t.system === "email")?.value || "N/A"}</td>
                <td>{patient.resource.telecom?.find(t => t.system === "phone")?.value || "N/A"}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6">Aucun patient trouvé.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default FhirPatientPage;

