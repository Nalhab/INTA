import React, { useEffect, useState } from 'react';
import { fetchPatients } from '../services/api';

const Patients = () => {
  const [patients, setPatients] = useState([]);

  useEffect(() => {
    fetchPatients().then(setPatients).catch(console.error);
  }, []);

  return (
    <div>
      <h2>Liste des Patients</h2>
      <ul>
        {patients.map((patient) => (
          <li key={patient.id}>{patient.nom} - {patient.prenom}</li>
        ))}
      </ul>
    </div>
  );
};

export default Patients;