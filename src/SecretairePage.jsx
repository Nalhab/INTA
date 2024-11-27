import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SecretairePage = () => {
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState({});
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Fetch patients data
    const fetchPatients = async () => {
      try {
        const response = await axios.get('http://localhost:8081/fhir/Patient');
        setPatients(response.data.entry ? response.data.entry.map(entry => entry.resource) : []);
      } catch (error) {
        console.error('Erreur lors de la récupération des patients:', error);
      }
    };
    fetchPatients();
  }, []);

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
  };

  const filteredPatients = patients.filter(patient => {
    const fullName = `${patient.name?.[0]?.family} ${patient.name?.[0]?.given?.[0]}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase());
  });

  return (
    <div style={styles.container}>
      <h2 style={styles.header}>Liste des Patients</h2>
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
                <strong>{patient.name?.[0]?.family} {patient.name?.[0]?.given?.[0]}</strong>
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
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const styles = {
  container: {
    fontFamily: 'Arial, sans-serif',
    margin: '20px',
  },
  header: {
    color: '#333',
  },
  list: {
    listStyleType: 'none',
    padding: 0,
  },
  listItem: {
    background: '#f9f9f9',
    border: '1px solid #ddd',
    borderRadius: '5px',
    marginBottom: '20px',
    padding: '15px',
    transition: 'background 0.3s',
  },
  listItemHover: {
    background: '#f1f1f1',
  },
  info: {
    display: 'flex',
    flexDirection: 'column',
  },
  button: {
    background: '#007bff',
    border: 'none',
    borderRadius: '5px',
    color: 'white',
    cursor: 'pointer',
    marginTop: '10px',
    padding: '10px 20px',
  },
  buttonHover: {
    background: '#0056b3',
  },
  searchInput: {
    padding: '10px',
    marginBottom: '20px',
    width: '100%',
    boxSizing: 'border-box',
  },
};

export default SecretairePage;