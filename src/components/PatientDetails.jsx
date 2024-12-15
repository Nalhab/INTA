import React from 'react';
import Appointments from './Appointments';
import Consultations from './Consultations';
import Prescriptions from './Prescriptions';
import VitalSigns from './VitalSigns';
import './PatientDetails.css';
import axios from 'axios';

const PatientDetails = ({
  patient,
  onEdit,
  onDelete,
  isEditing,
  editPatient,
  setEditPatient,
  onCancelEdit,
  onSaveEdit,
  isSecretaryView = false,
}) => {
  const backendUrl = 'http://localhost:3001';

  const handleSimulateData = async () => {
    try {
      // Ajouter des rendez-vous
      const appointments = [
        {
          start: new Date("2024-01-15T14:00:00").toISOString(),
          end: new Date("2024-01-15T14:30:00").toISOString(),
          description: "Consultation générale",
        },
        {
          start: new Date("2024-02-01T10:30:00").toISOString(),
          end: new Date("2024-02-01T11:00:00").toISOString(),
          description: "Suivi médical",
        }
      ];

      for (const apt of appointments) {
        await axios.post(`${backendUrl}/patients/${patient.id}/appointments`, apt);
      }

      // Ajouter des consultations
      const consultations = [
        {
          motif: "Douleurs abdominales",
          effectiveDateTime: new Date("2024-01-15T14:00:00").toISOString(),
          description: "Patient se plaint de douleurs abdominales depuis 3 jours"
        },
        {
          motif: "Suivi tension",
          effectiveDateTime: new Date("2024-01-01T10:30:00").toISOString(),
          description: "Contrôle régulier de la tension artérielle"
        }
      ];

      for (const consult of consultations) {
        await axios.post(`${backendUrl}/patients/${patient.id}/consultations`, consult);
      }

      // Ajouter des prescriptions
      const prescriptions = [
        {
          text: "Doliprane 1000mg",
          dosage: "1 comprimé 3 fois par jour",
          duration: "2024-01-15",
          instructions: "À prendre pendant les repas"
        },
        {
          text: "Spasfon",
          dosage: "2 comprimés 2 fois par jour",
          duration: "2024-01-15",
          instructions: "En cas de douleurs"
        }
      ];

      for (const presc of prescriptions) {
        await axios.post(`${backendUrl}/patients/${patient.id}/prescriptions`, presc);
      }

      alert("Données simulées ajoutées avec succès!");
    } catch (error) {
      console.error("Erreur lors de la simulation des données:", error);
      alert("Erreur lors de la simulation des données");
    }
  };

  const handleEditClick = () => {
    onEdit(patient);
  };

  const handleCancelClick = () => {
    onCancelEdit();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
  
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setEditPatient((prev) => ({
        ...prev,
        address: [
          {
            ...prev.address[0],
            [addressField]: value,
          },
        ],
      }));
    } else if (name.startsWith('name.given') || name.startsWith('name.family')) {
      const nameField = name.split('.')[1];
      const index = name.split('.')[2];
      if (nameField === 'given') {
        setEditPatient((prev) => ({
          ...prev,
          name: [
            {
              ...prev.name[0],
              given: [
                ...prev.name[0].given.slice(0, parseInt(index)),
                value,
                ...prev.name[0].given.slice(parseInt(index) + 1),
              ],
            },
          ],
        }));
      } else {
        setEditPatient((prev) => ({
          ...prev,
          name: [
            {
              ...prev.name[0],
              [nameField]: value,
            },
          ],
        }));
      }
    } else if (name.startsWith('telecom.')) {
      const telecomIndex = parseInt(name.split('.')[1]);
      const telecomField = name.split('.')[2];
      setEditPatient((prev) => ({
        ...prev,
        telecom: prev.telecom.map((telecom, index) =>
          index === telecomIndex
            ? { ...telecom, [telecomField]: value }
            : telecom
        ),
      }));
    } else if (name === 'generalPractitioner') {
      setEditPatient((prev) => ({
        ...prev,
        generalPractitioner: [
          {
            ...prev.generalPractitioner[0],
            display: value,
          },
        ],
      }));
    } else {
      setEditPatient((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSaveClick = () => {
    onSaveEdit(editPatient);
  };

  return (
    <div className="patient-details">
      <div className="header">
        <h2>Détails du Patient</h2>
        <div className="action-buttons">
          {!isEditing && (
            <>
              <button onClick={handleEditClick} className="edit-button">Modifier</button>
              <button onClick={() => onDelete(patient.id)} className="delete-button">Supprimer</button>
            </>
          )}
        </div>
      </div>
      
      <div className="patient-info">
        {isEditing ? (
          <form className="edit-form">
            <div>
              <label>Prénom :</label>
              <input
                type="text"
                name="name.given.0"
                placeholder="Prénom"
                value={editPatient.name?.[0]?.given?.[0] || ''}
                onChange={handleChange}
              />
            </div>
            <div>
              <label>Nom de Famille :</label>
              <input
                type="text"
                name="name.family"
                placeholder="Nom de Famille"
                value={editPatient.name?.[0]?.family || ''}
                onChange={handleChange}
              />
            </div>
            <div>
              <label>Genre :</label>
              <select
                name="gender"
                value={editPatient.gender || ''}
                onChange={handleChange}
              >
                <option value="">Sélectionner</option>
                <option value="male">Masculin</option>
                <option value="female">Féminin</option>
                <option value="other">Autre</option>
              </select>
            </div>
            <div>
              <label>Date de Naissance :</label>
              <input
                type="date"
                name="birthDate"
                placeholder="Date de Naissance"
                value={editPatient.birthDate || ''}
                onChange={handleChange}
              />
            </div>
            <div>
              <label>Téléphone :</label>
              <input
                type="tel"
                name="telecom.0.value"
                placeholder="Téléphone"
                value={editPatient.telecom?.[0]?.value || ''}
                onChange={handleChange}
              />
            </div>
            <div>
              <label>Email :</label>
              <input
                type="email"
                name="telecom.1.value"
                placeholder="Email"
                value={editPatient.telecom?.[1]?.value || ''}
                onChange={handleChange}
              />
            </div>
            <div>
              <label>Médecin Traitant :</label>
              <select
                name="generalPractitioner"
                value={editPatient.generalPractitioner?.[0]?.display || ''}
                onChange={handleChange}
              >
                <option value="">Médecin Traitant</option>
                <option value="Dr. Linux">Dr. Linux</option>
                <option value="Dr. Windows">Dr. Windows</option>
              </select>
            </div>
            <div>
              <label>Adresse :</label>
              <input
                type="text"
                name="address.line.0"
                placeholder="Adresse"
                value={editPatient.address?.[0]?.line?.[0] || ''}
                onChange={handleChange}
              />
            </div>
            <div className="address-fields">
              <input
                type="text"
                name="address.city"
                placeholder="Ville"
                value={editPatient.address?.[0]?.city || ''}
                onChange={handleChange}
              />
              <input
                type="text"
                name="address.postalCode"
                placeholder="Code Postal"
                value={editPatient.address?.[0]?.postalCode || ''}
                onChange={handleChange}
              />
              <input
                type="text"
                name="address.country"
                placeholder="Pays"
                value={editPatient.address?.[0]?.country || ''}
                onChange={handleChange}
              />
            </div>
            <div className="form-buttons">
              <button type="button" onClick={handleSaveClick} className="save-button">Sauvegarder</button>
              <button type="button" onClick={handleCancelClick} className="cancel-button">Annuler</button>
            </div>
          </form>
        ) : (
          <>
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
          </>
        )}
      </div>

      {/* Rendez-vous */}
      <div className="appointments">
        <h3>Rendez-vous</h3>
        <Appointments patientId={patient.id} appointments={[]} />
      </div>

      {/* Consultations */}
      { !isSecretaryView && (
        <>
          <div className="consultations">
            <h3>Consultations</h3>
            <Consultations patientId={patient.id} />
          </div>

          {/* Prescriptions */}
          <div className="prescriptions">
            <h3>Prescriptions</h3>
            <Prescriptions patientId={patient.id} />
          </div>

          {/* Signes Vitaux */}
          <div className="vital-signs">
            <h3>Signes Vitaux</h3>
            <VitalSigns patientId={patient.id} isDoctor={true} />
          </div>
        </>
      )}

      <button onClick={handleSimulateData} className="simulate-button">Simuler Données</button>
    </div>
  );
};

export default PatientDetails;