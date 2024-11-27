import React, { useState, useEffect } from "react";
import axios from "axios";

const MedecinPage = () => {
  const backendUrl = 'http://localhost:8081/fhir';
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [newPatient, setNewPatient] = useState({
    firstName: "",
    lastName: "",
    gender: "",
    birthDate: "",
    address: "",
    phone: "",
    email: "",
  });
  const [selectedPatient, setSelectedPatient] = useState(null);

  const [appointments, setAppointments] = useState({});
  const [appointment, setAppointment] = useState({
    date: '',
    notes: '',
  });

  const [consultations, setConsultations] = useState({});
  const [consultation, setConsultation] = useState({
    motif: '',
    effectiveDateTime: '',
    notes: '',
  });

  const [prescriptions, setPrescriptions] = useState({});
  const [prescription, setPrescription] = useState({
    text: '',
    dosage: '',
    duration: '',
    instructions: '',
  });

  // Utiliser useEffect pour charger les patients lors du chargement initial puis pour la recherche des patients
  useEffect(() => {
    getPatients();
  }, []);

  // Recherche de patients par noms/prenoms
  const fetchPatients = async () => {
    try {
      const response = await axios.get(`${backendUrl}/Patient`);
      setPatients(response.data.entry ? response.data.entry.map(entry => entry.resource) : []);
    }
    catch (error) {
      console.error('Erreur lors de la récupération des patients:', error);
    }
  };

  // Gestion des rendez-vous
  const fetchAppointments = async (patientId) => {
    try {
      const response = await axios.get(`http://localhost:8081/fhir/Appointment?patient=${patientId}`);
      setAppointments(prevAppointments => ({
        ...prevAppointments,
        [patientId]: response.data.entry ? response.data.entry.map(entry => entry.resource) : []
      }));
    } catch (error) {
      console.error('Erreur lors de la récupération des rendez-vous:', error);
    }
  };
  
  // Gestion des consultations
  const fetchConsultation = async (patientId) => {
    try {
      const response = await axios.get(`http://localhost:8081/fhir/Observation?subject=Patient/${patientId}`);
      setConsultations(prevConsultations => ({
        ...prevConsultations,
        [patientId]: response.data.entry ? response.data.entry.map(entry => entry.resource) : []
      }));
    } catch (error) {
      console.error('Erreur lors de la récupération des consultations:', error);
    }
  };

  // Gestion des prescriptions
  const fetchPrescription = async (patientId) => {
    try {
      const response = await axios.get(`http://localhost:8081/fhir/MedicationRequest?subject=Patient/${patientId}`);
      console.log('Prescriptions:', response.data);
      setPrescriptions(prevPrescriptions => ({
        ...prevPrescriptions,
        [patientId]: response.data.entry ? response.data.entry.map(entry => entry.resource) : []
      }));
    } catch (error) {
      console.error('Erreur lors de la récupération des prescriptions:', error);
    }
  };


  // Fonction pour récupérer la liste des patients
  const getPatients = async () => {
    try {
      const response = await axios.get("http://localhost:8081/fhir/Patient", {
        headers: {
          "Accept": "application/json",
        },
      });
      console.log("Réponse API brute:", response.data);

      // Accéder à l'entrée et extraire les ressources des patients
      const patientData = response.data.entry.map((entry) => entry.resource);
      setPatients(patientData); // Mettre à jour l'état avec les ressources patients
      console.log("Patients extraits:", patientData);
    } catch (error) {
      console.error("Erreur lors de la récupération des patients :", error);
    }
  };

  // Fonction pour ajouter un nouveau patient
  const addPatient = async () => {
    try {
      console.log("Nouveau patient à ajouter :", newPatient);
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
              city: "Paris",
              country: "France",
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
                    code: "fr",
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
      getPatients(); // Rafraîchir la liste des patients

      setNewPatient({
        firstName: "",
        lastName: "",
        gender: "",
        birthDate: "",
        address: "",
        phone: "",
        email: "",
      }); // Réinitialiser le formulaire
    } catch (error) {
      console.error("Erreur lors de l'ajout du patient :", error);
      alert("Erreur lors de l'ajout du patient.");
    }
  };

  // Fonction pour supprimer un patient
  const deletePatient = async (patientId) => {
    try {
      const response = await axios.delete(`http://localhost:8081/fhir/Patient/${patientId}`);
      console.log("Patient supprimé :", response.data);
      alert("Patient supprimé avec succès !");
      getPatients(); // Rafraîchir la liste des patients
    } catch (error) {
      console.error("Erreur lors de la suppression du patient :", error);
      alert("Erreur lors de la suppression du patient.");
    }
  };

  // Fonction pour ajouter un rendez-vous
  const addAppointment = async () => {
    if (!selectedPatient || !selectedPatient.id) {
      console.error("Aucun patient sélectionné ou ID du patient manquant !");
      alert("Veuillez sélectionner un patient valide avant d'ajouter un rendez-vous.");
      return;
    }
    try {
      const newAppointment = {
        resourceType: "Appointment",
        status: "booked",
        participant: [
          {
            actor: {
              reference: `Patient/${selectedPatient.id}`,
            },
          },
        ],
        start: appointment.date,
        description: appointment.notes,
      };
      const response = await axios.post(
        "http://localhost:8081/fhir/Appointment",
        newAppointment,
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      alert("Rendez-vous ajouté avec succès !");
      console.log("Rendez-vous ajouté :", response.data);
      setAppointment({ date: '', notes: '' });
    }
    catch (error) {
      console.error("Erreur lors de l'ajout du rendez-vous :", error.response?.data || error.message);
      alert("Une erreur est survenue lors de l'ajout du rendez-vous.");
    }
  };

  // Fonction pour ajouter une consultation
  const addConsultation = async () => {
    if (!selectedPatient || !selectedPatient.id) {
      console.error("Aucun patient sélectionné ou ID du patient manquant !");
      alert("Veuillez sélectionner un patient valide avant d'ajouter une consultation.");
      return;
    }

    try {
      const newConsultation = {
        resourceType: "Observation",
        status: "final",
        category: [
          {
            coding: [
              {
                system: "http://terminology.hl7.org/CodeSystem/observation-category",
                code: "exam",
                display: "Exam",
              },
            ],
          },
        ],
        code: {
          coding: [
            {
              system: "http://loinc.org",
              code: "11210-0",
              display: "Consultation",
            },
          ],
          text: consultation.motif,
        },
        subject: {
          reference: `Patient/${selectedPatient.id}`,
        },
        effectiveDateTime: consultation.effectiveDateTime,
        valueString: consultation.notes,
      };

      const response = await axios.post(
        "http://localhost:8081/fhir/Observation",
        newConsultation,
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      alert("Consultation ajoutée avec succès !");
      console.log("Consultation ajoutée :", response.data);
      setConsultation({ motif: '', effectiveDateTime: '', notes: ''});
    } catch (error) {
      console.error("Erreur lors de l'ajout de la consultation :", error.response?.data || error.message);
      alert("Une erreur est survenue lors de l'ajout de la consultation.");
    }
  };

  // Fonction pour ajouter une prescription
  const addPrescription = async () => {
    if (!selectedPatient || !selectedPatient.id) {
      console.error("Aucun patient sélectionné ou ID du patient manquant !");
      alert("Veuillez sélectionner un patient valide avant d'ajouter une prescription.");
      return;
    }

    try {
      console.log("Nouvelle prescription à ajouter :", prescription);
      const newPrescription = {
        resourceType: "MedicationRequest",
        status: "active",
        intent: "order",
        medicationCodeableConcept: {
          text: prescription.text,
        },
        subject: {
          reference: `Patient/${selectedPatient.id}`,
        },
        authoredOn: new Date().toISOString(),
        dosageInstruction: [
          {
            text: prescription.dosage,
            timing: {
              repeat: {
                boundsPeriod: {
                  start: prescription.duration,
                }
              }
            },
            route: {
              text: prescription.instructions,
            }
          },
        ],
      };

      const response = await axios.post(
        "http://localhost:8081/fhir/MedicationRequest",
        newPrescription,
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      alert("Prescription ajoutée avec succès !");
      console.log("Prescription ajoutée :", response.data);

      setPrescription({ text: '', dosage: '', duration: '', instructions: '' });
      fetchConsultation(selectedPatient.id);
    } catch (error) {
      console.error("Erreur lors de l'ajout de la prescription :", error.response?.data || error.message);
      alert("Une erreur est survenue lors de l'ajout de la prescription.");
    }
  };

  const medecinstyles = {
    container: {
      padding: "20px",
      backgroundColor: "#f5f5f5",
      borderRadius: "5px",
    },
    title: {
      fontSize: "24px",
      fontWeight: "bold",
      color: "#333",
    },
  };

  // Filtrer les patients en fonction du terme de recherche
  const filteredPatients = patients.filter((patient) => {
    const fullName = `${patient.name?.[0]?.family} ${patient.name?.[0]?.given?.[0]}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase());
  });

  const toggleAppointments = (patientId) => {
    if (appointments[patientId]) {
      setAppointments(prevAppointments => {
        const newAppointments = { ...prevAppointments };
        delete newAppointments[patientId];
        return newAppointments;
      });
    } else {
      fetchAppointments(patientId);
    }
  }

  const toggleConsultation = (patientId) => {
    if (consultations[patientId]) {
      setConsultations(prevConsultations => {
        const newConsultations = { ...prevConsultations };
        delete newConsultations[patientId];
        return newConsultations;
      });
    } else {
      fetchConsultation(patientId);
    }
  }

  const togglePrescription = (patientId) => {
    if (prescriptions[patientId]) {
      setPrescriptions(prevPrescriptions => {
        const newPrescriptions = { ...prevPrescriptions };
        delete newPrescriptions[patientId];
        return newPrescriptions;
      });
    } else {
      fetchPrescription(patientId);
    }
  }

  return (
    <div style={medecinstyles.container}>
      <h1>Cabinet Médical - Gestion des Patients</h1>

      {/* Ajouter un nouveau patient */}
      <div style={styles.section}>
        <h2>Nouveau Patient</h2>
        <div style={styles.formGroup}>
          <input
            type="text"
            placeholder="Prénom"
            value={newPatient.firstName}
            onChange={(e) => setNewPatient({ ...newPatient, firstName: e.target.value })}
            style={styles.input}
          />
          <input
            type="text"
            placeholder="Nom"
            value={newPatient.lastName}
            onChange={(e) => setNewPatient({ ...newPatient, lastName: e.target.value })}
            style={styles.input}
          />
          <select
            value={newPatient.gender}
            onChange={(e) => setNewPatient({ ...newPatient, gender: e.target.value })}
            style={styles.input}
          >
            <option value="">Sélectionnez le genre de naissance</option>
            <option value="male">Homme</option>
            <option value="female">Femme</option>
          </select>
          <input
            type="date"
            value={newPatient.birthDate}
            onChange={(e) => setNewPatient({ ...newPatient, birthDate: e.target.value })}
            style={styles.input}
          />
          <input
            type="text"
            placeholder="Adresse"
            value={newPatient.address}
            onChange={(e) => setNewPatient({ ...newPatient, address: e.target.value })}
            style={styles.input}
          />
          <input
            type="tel"
            placeholder="Téléphone"
            value={newPatient.phone}
            onChange={(e) => setNewPatient({ ...newPatient, phone: e.target.value })}
            style={styles.input}
          />
          <input
            type="email"
            placeholder="Email"
            value={newPatient.email}
            onChange={(e) => setNewPatient({ ...newPatient, email: e.target.value })}
            style={styles.input}
          />
          <button onClick={addPatient} style={styles.button}>
            Ajouter le Patient
          </button>
        </div>
      </div>

      {/* Recherche de patients selon nom/prénom et liste des patients*/}
      <div>
        <h2>Liste des Patients</h2>
        <input
          type="text"
          placeholder="Rechercher par nom ou prénom"
          style={styles.searchInput}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {Array.isArray(filteredPatients) && filteredPatients.length === 0 ? (
          <p>Aucun patient enregistré</p>
        ) : (
          <ul style={styles.list}>
            {Array.isArray(filteredPatients) && filteredPatients.map((patient) => (
              <li key={patient.id} style={styles.listItem}>
                <div style={styles.info}>
                  <strong style={styles.patientName}>{patient.name?.[0]?.family} {patient.name?.[0]?.given?.[0]}</strong>
                  <p>Né(e) le: {new Date(patient.birthDate).toLocaleDateString()}</p>
                  <p>Tél: {patient.telecom?.find(t => t.system === 'phone')?.value}</p>
                  <button
                    style={styles.button}
                    onMouseOver={(e) => e.currentTarget.style.background = styles.buttonHover.background}
                    onMouseOut={(e) => e.currentTarget.style.background = styles.button.background}
                    onClick={() => toggleAppointments(patient.id)}
                  >
                    {appointments[patient.id] ? 'Masquer les rendez-vous' : 'Voir les rendez-vous'}
                  </button>
                  {/* Toggle liste des rendez-vous */}
                  {appointments[patient.id] && (
                    <div>
                      <h3>Rendez-vous</h3>
                      {appointments[patient.id].length === 0 ? (
                        <p>Aucun rendez-vous enregistré</p>
                      ) : (
                        <ul style={styles.list}>
                          {appointments[patient.id].map((appointment) => (
                            <li key={appointment.id} style={styles.listItem}>
                              <div style={styles.info}>
                                <p>Date: {new Date(appointment.start).toLocaleString()}</p>
                                <p>Motif: {appointment.description}</p>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                  <button
                    style={styles.button}
                    onMouseOver={(e) => e.currentTarget.style.background = styles.buttonHover.background}
                    onMouseOut={(e) => e.currentTarget.style.background = styles.button.background}
                    onClick={() => toggleConsultation(patient.id)}
                  >
                    {consultations[patient.id] ? 'Masquer les consultations' : 'Voir les consultations'}
                  </button>
                  {/* Toggle liste des consultations */}
                  {consultations[patient.id] && (
                    <div>
                      <h3>Consultations</h3>
                      {consultations[patient.id].length === 0 ? (
                        <p>Aucune consultation enregistrée</p>
                      ) : (
                        <ul style={styles.list}>
                          {consultations[patient.id].map((consultation) => (
                            <li key={consultation.id} style={styles.listItem}>
                              <div style={styles.info}>
                                <p>Date: {new Date(consultation.effectiveDateTime).toLocaleString()}</p>
                                <p>Motif: {consultation.code.text}</p>
                                <p>Notes: {consultation.valueString}</p>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                  <button
                    style={styles.button}
                    onMouseOver={(e) => e.currentTarget.style.background = styles.buttonHover.background}
                    onMouseOut={(e) => e.currentTarget.style.background = styles.button.background}
                    onClick={() => togglePrescription(patient.id)}
                  >
                    {prescriptions[patient.id] ? 'Masquer les prescriptions' : 'Voir les prescriptions'}
                  </button>
                  {/* Toggle liste des prescriptions */}
                  {prescriptions[patient.id] && (
                    <div>
                      <h3>Prescriptions</h3>
                      {prescriptions[patient.id].length === 0 ? (
                        <p>Aucune prescription enregistrée</p>
                      ) : (
                        <ul style={styles.list}>
                          {prescriptions[patient.id].map((prescription) => (
                            <li key={prescription.id} style={styles.listItem}>
                              <div style={styles.info}>
                                <p>Médicament: {prescription.medicationCodeableConcept?.text}</p>
                                <p>Dosage: {prescription.dosageInstruction[0]?.text}</p>
                                <p>Durée: { new Date(prescription.dosageInstruction[0]?.timing?.repeat?.boundsPeriod?.start).toLocaleString()}</p>
                                <p>Instructions: {prescription.dosageInstruction[0]?.route?.text}</p>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                  <button
                    style={styles.buttonPrimary}
                    onClick={() => setSelectedPatient(patient)}
                  >
                    Ajouter une consultation
                  </button>
                  <button
                    style={styles.buttonDelete}
                    onClick={() => deletePatient(patient.id)}
                  >
                    Supprimer
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Formulaire de prises de rendez-vous */}
      {selectedPatient && (
        <div style={styles.section}>
          <h2>Ajouter un rendez-vous au patient</h2>
          <div style={styles.formGroup}>
            <input
              type="date"
              value={appointment.date}
              onChange={(e) => setAppointment({ ...appointment, date: e.target.value })}
              style={styles.input}
            />
            <textarea
              placeholder="Notes du rendez-vous"
              value={appointment.notes}
              onChange={(e) => setAppointment({ ...appointment, notes: e.target.value })}
              style={styles.textarea}
            />
            <button onClick={addAppointment} style={styles.button}>
              Ajouter le Rendez-vous
            </button>
          </div>
        </div>
      )}

      {/* Formulaire de consultation */}
      {selectedPatient && (
        <div style={styles.section}>
          <h2>Ajouter une consultation</h2>
          <div style={styles.formGroup}>
            <input
              type="date"
              value={consultation.effectiveDateTime}
              onChange={(e) => setConsultation({ ...consultation, effectiveDateTime: e.target.value })}
              style={styles.input}
            />
            <input
              type="text"
              placeholder="Motif de la consultation"
              value={consultation.motif}
              onChange={(e) => setConsultation({ ...consultation, motif: e.target.value })}
              style={styles.input}
            />
            <textarea
              placeholder="Notes de la consultation"
              value={consultation.notes}
              onChange={(e) => setConsultation({ ...consultation, notes: e.target.value })}
              style={styles.textarea}
            />
            <button onClick={addConsultation} style={styles.button}>
              Ajouter la Consultation
            </button>
          </div>
        </div>
      )}

      

      {/* Formulaire de prescription */}
      {selectedPatient && (
        <div style={styles.section}>
          <h2>Ajouter une prescription</h2>
          <div style={styles.formGroup}>
            <input
              type="text"
              placeholder="Médicament"
              value={prescription.text}
              onChange={(e) => setPrescription({ ...prescription, text: e.target.value })}
              style={styles.input}
            />
            <input
              type="text"
              placeholder="Dosage"
              value={prescription.dosage}
              onChange={(e) => setPrescription({ ...prescription, dosage: e.target.value })}
              style={styles.input}
            />
            <input
              type="date"
              placeholder="Durée"
              value={prescription.duration}
              onChange={(e) => setPrescription({ ...prescription, duration: e.target.value })}
              style={styles.input}
            />
            <textarea
              placeholder="Instructions"
              value={prescription.instructions}
              onChange={(e) => setPrescription({ ...prescription, instructions: e.target.value })}
              style={styles.textarea}
            />
            <button onClick={addPrescription} style={styles.button}>
              Ajouter la Prescription
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: '20px',
    fontFamily: 'Arial',
    maxWidth: '1200px',
    margin: '0 auto'
  },
  section: {
    marginBottom: '30px',
    padding: '20px',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  input: {
    padding: '8px 12px',
    borderRadius: '4px',
    border: '1px solid #ddd',
    fontSize: '14px'
  },
  textarea: {
    padding: '8px 12px',
    borderRadius: '4px',
    border: '1px solid #ddd',
    fontSize: '14px',
    minHeight: '100px',
    resize: 'vertical'
  },
  button: {
    padding: '10px 15px',
    backgroundColor: '#007BFF',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  buttonDelete: {
    padding: '10px 15px',
    backgroundColor: '#DC3545',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  buttonPrimary: {
    padding: '10px 15px',
    backgroundColor: '#28A745',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  list: {
    listStyleType: 'none',
    padding: 0
  },
  listItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '15px',
    marginBottom: '10px',
    backgroundColor: 'white',
    borderRadius: '4px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  patientInfo: {
    display: 'flex',
    gap: '20px',
    alignItems: 'center'
  },
  buttonGroup: {
    display: 'flex',
    gap: '10px'
  },
  searchInput: {
    padding: '8px 12px',
    borderRadius: '4px',
    border: '1px solid #ddd',
    fontSize: '14px',
    width: '100%'
  },
  buttonHover: {
    background: '#0056b3'
  },
  patientName: {
    fontSize: '30px',
    fontWeight: 'bold',
    color: '#333'
  }
};

export default MedecinPage;
