import React, { useState, useEffect } from "react";
import axios from "axios";
import './Appointments.css';


const Appointments = ({ patientId, backendUrl = 'http://localhost:3001' }) => {
  const [appointments, setAppointments] = useState([]);
  const [appointment, setAppointment] = useState({
    date: '',
    description: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editAppointmentId, setEditAppointmentId] = useState(null);

  useEffect(() => {
    if (patientId) {
      fetchAppointments();
    }
  }, [patientId]);

  const fetchAppointments = async () => {
    if (!backendUrl || !patientId) {
      console.error('URL du backend ou ID du patient manquant');
      return;
    }
    try {
      const response = await axios.get(`${backendUrl}/patients/${patientId}/appointments`);
      console.log('Rendez-vous récupérés:', response.data);
      setAppointments(response.data || []);
    } catch (error) {
      console.error('Erreur lors de la récupération des rendez-vous:', error.response?.data || error.message);
      setAppointments([]);
    }
  };

  const addAppointment = async () => {
    if (!backendUrl || !patientId) {
      alert('URL du backend ou ID du patient manquant');
      return;
    }

    if (!appointment.date || !appointment.description) {
      alert("Veuillez remplir tous les champs avant d'ajouter un rendez-vous.");
      return;
    }

    if (isNaN(new Date(appointment.date).getTime())) {
      alert("La date du rendez-vous est invalide.");
      return;
    }

    try {
      const payload = {
        start: new Date(appointment.date).toISOString(),
        end: new Date(new Date(appointment.date).getTime() + 30 * 60000).toISOString(), // Ajoute 30 minutes à la date de début
        description: appointment.description,
      };
      await axios.post(`${backendUrl}/patients/${patientId}/appointments`, payload);
      alert("Rendez-vous ajouté avec succès!");
      setAppointment({ date: '', description: '' });
      fetchAppointments();
    } catch (error) {
      console.error("Erreur lors de l'ajout du rendez-vous :", error.response?.data || error.message);
      alert(`Une erreur est survenue lors de l'ajout du rendez-vous: ${error.response?.data || error.message}`);
    }
  };

  const editAppointmentDetails = (appt) => {
    setAppointment({
      date: new Date(appt.start).toISOString().slice(0, 16),
      description: appt.description,
    });
    setIsEditing(true);
    setEditAppointmentId(appt.id);
  };

  const updateAppointment = async () => {
    if (!backendUrl || !patientId || !editAppointmentId) {
      alert('URL du backend, ID du patient ou ID du rendez-vous manquant');
      return;
    }

    if (!appointment.date || !appointment.description) {
      alert("Veuillez remplir tous les champs avant de modifier le rendez-vous.");
      return;
    }

    try {
      const payload = {
        start: new Date(appointment.date).toISOString(),
        end: new Date(new Date(appointment.date).getTime() + 30 * 60000).toISOString(),
        description: appointment.description,
      };
      await axios.put(`${backendUrl}/patients/${patientId}/appointments/${editAppointmentId}`, payload);
      alert("Rendez-vous modifié avec succès!");
      console.log("Rendez-vous modifié:", payload);
      setAppointment({ date: '', description: '' });
      setIsEditing(false);
      setEditAppointmentId(null);
      fetchAppointments();
    } catch (error) {
      console.error("Erreur lors de la modification du rendez-vous :", error.response?.data || error.message);
      alert("Une erreur est survenue lors de la modification du rendez-vous.");
    }
  };

  const deleteAppointment = async (appointmentId) => {
    if (!backendUrl || !patientId || !appointmentId) {
      alert('URL du backend, ID du patient ou ID du rendez-vous manquant');
      return;
    }

    try {
      console.log(`Suppression du rendez-vous ID: ${appointmentId} pour le patient ID: ${patientId}`);
      await axios.delete(`${backendUrl}/patients/${patientId}/appointments/${appointmentId}`);
      alert("Rendez-vous supprimé avec succès!");
      fetchAppointments();
    } catch (error) {
      console.error("Erreur lors de la suppression du rendez-vous :", error.response?.data || error.message);
      alert("Une erreur est survenue lors de la suppression du rendez-vous.");
    }
  };

  if (!patientId) {
    return <div>ID du patient manquant</div>;
  }

  return (
    <div className="appointments-container">
      <h3 className="appointments-header">Rendez-vous</h3>
      {(!appointments || !Array.isArray(appointments) || appointments.length === 0) ? (
        <p className="no-appointments">Aucun rendez-vous</p>
      ) : (
        <ul className="appointments-list">
          {appointments.map((appt) => (
            <li key={appt.id} className="appointment-item">
              <div className="appointment-details">
                <p className="appointment-date">
                  <strong>Date :</strong> {new Date(appt.start).toLocaleString('fr-FR')}
                </p>
                <p className="appointment-description">
                  <strong>Notes :</strong> {appt.description}
                </p>
                <button className="edit-appointment" onClick={() => editAppointmentDetails(appt)}>
                  Modifier
                </button>
                <button className="delete-appointment" onClick={() => deleteAppointment(appt.id)}>
                  Supprimer
                </button>
                {isEditing && editAppointmentId === appt.id && (
                  <div className="edit-form">
                    <div className="form-group">
                      <input
                        type="datetime-local"
                        className="form-input"
                        value={appointment.date || ''}
                        onChange={(e) => setAppointment({ ...appointment, date: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <textarea
                        className="form-textarea"
                        value={appointment.description || ''}
                        onChange={(e) => setAppointment({ ...appointment, description: e.target.value })}
                        placeholder="Notes"
                      />
                    </div>
                    <button className="form-button" onClick={updateAppointment}>
                      Enregistrer les modifications
                    </button>
                    <button className="form-button cancel-button" onClick={() => {
                      setIsEditing(false);
                      setAppointment({ date: '', description: '' });
                      setEditAppointmentId(null);
                    }}>
                      Annuler
                    </button>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
      <div className="appointment-form">
        <h4 className="form-header">Ajouter un Rendez-vous</h4>
        <div className="form-group">
          <input
            type="datetime-local"
            className="form-input"
            value={appointment.date}
            onChange={(e) => setAppointment({ ...appointment, date: e.target.value })}
          />
        </div>
        <div className="form-group">
          <textarea
            className="form-textarea"
            value={appointment.description}
            onChange={(e) => setAppointment({ ...appointment, description: e.target.value })}
            placeholder="Notes"
          />
        </div>
        <button className="form-button" onClick={addAppointment}>
          Ajouter Rendez-vous
        </button>
      </div>
    </div>
  );
};

export default Appointments;