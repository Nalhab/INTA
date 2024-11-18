import React, { useEffect, useState } from 'react';
import axios from 'axios';

const SecretairePage = () => {
  const [patient, setPatient] = useState(null);

  useEffect(() => {
    async function fetchPatient() {
      const response = await axios.get("http://localhost:8081/fhir/Patient");
      setPatient(response.data);
    }
    fetchPatient();
  }, []);

  return (
    <div>
      <h1>Patient Data</h1>
      {patient ? <pre>{JSON.stringify(patient, null, 2)}</pre> : <p>Loading...</p>}
    </div>
  );
}

export default SecretairePage;
