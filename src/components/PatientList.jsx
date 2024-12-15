import React from 'react';
import './PatientList.css';

const PatientList = ({ patients, searchTerm, setSearchTerm, handleSelectPatient }) => {
  const filteredPatients = patients.filter(patient => {
    if (!patient?.name?.[0]) return false;

    const given = patient.name[0].given?.join(' ') || '';
    const family = patient.name[0].family || '';
    const fullName = `${given} ${family}`.toLowerCase();

    return fullName.includes((searchTerm || '').toLowerCase());
  });

  return (
    <div className="patient-list">
      <div className="search-bar">
        <input
          type="text"
          placeholder="Rechercher un patient par nom..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      {filteredPatients.length === 0 ? (
        <p className="no-results">Aucun patient trouvé</p>
      ) : (
        <table className="patients-table">
          <thead>
            <tr>
              <th>Prénom</th>
              <th>Nom</th>
              <th>Docteur traitant</th>
            </tr>
          </thead>
          <tbody>
            {filteredPatients.map(patient => (
              <tr key={patient.id} className="patient-item">
                <td className="patient-firstname">
                  {patient.name[0].given?.join(' ') || 'N/A'}
                </td>
                <td className="patient-lastname">
                  {patient.name[0].family || 'N/A'}
                </td>
                <td className="patient-doctor">
                  {patient.generalPractitioner?.[0]?.display || 'N/A'}
                </td>
                <td>
                  <button 
                    onClick={() => handleSelectPatient(patient)}
                    className="view-button"
                  >
                    Voir détails
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default PatientList;