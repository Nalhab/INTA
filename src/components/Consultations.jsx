import React, { useState, useEffect } from "react";
import axios from "axios";
import './Consultations.css';

const Consultations = ({ patientId, backendUrl = 'http://localhost:3001' }) => {
  const [consultations, setConsultations] = useState([]);
  const [consultation, setConsultation] = useState({
    motif: '',
    effectiveDateTime: '',
    description: '',
  });
  const [editingConsultation, setEditingConsultation] = useState(null);

  useEffect(() => {
    fetchConsultations();
  }, [patientId]);

  const fetchConsultations = async () => {
    try {
      const response = await axios.get(`${backendUrl}/patients/${patientId}/consultations`);
      setConsultations(response.data);
    } catch (error) {
      console.error('Erreur lors de la récupération des consultations:', error.response?.data || error.message);
      alert("Erreur lors de la récupération des consultations.");
    }
  };

  const addConsultation = async () => {
    if (!consultation.motif || !consultation.effectiveDateTime || !consultation.description) {
      alert("Veuillez remplir tous les champs avant d'ajouter une consultation.");
      return;
    }
    try {
      const formattedDateTime = new Date(consultation.effectiveDateTime).toISOString();
      const payload = {
        motif: consultation.motif,
        effectiveDateTime: formattedDateTime,
        description: consultation.description,
        patientId: patientId // Assurez-vous que patientId est inclus
      };
      await axios.post(`${backendUrl}/patients/${patientId}/consultations`, payload);
      alert("Consultation ajoutée avec succès !");
      setConsultation({ motif: '', effectiveDateTime: '', description: '' });
      fetchConsultations();
    } catch (error) {
      console.error("Erreur lors de l'ajout de la consultation :", error.response?.data || error.message);
      alert("Une erreur est survenue lors de l'ajout de la consultation.");
    }
  };

  const updateConsultation = async () => {
    if (!consultation.motif || !consultation.effectiveDateTime || !consultation.description) {
      alert("Veuillez remplir tous les champs avant de modifier la consultation.");
      return;
    }
    try {
      const formattedDateTime = new Date(consultation.effectiveDateTime).toISOString();
      const payload = {
        motif: consultation.motif,
        effectiveDateTime: formattedDateTime,
        description: consultation.description,
        patientId: patientId
      };
      await axios.put(`${backendUrl}/consultations/${editingConsultation.id}`, payload);
      alert("Consultation modifiée avec succès !");
      setConsultation({ motif: '', effectiveDateTime: '', description: '' });
      setEditingConsultation(null);
      fetchConsultations();
    } catch (error) {
      console.error("Erreur lors de la modification de la consultation :", error.response?.data || error.message);
      alert("Une erreur est survenue lors de la modification de la consultation.");
    }
  };

  const deleteConsultation = async (id) => {
    try {
      await axios.delete(`${backendUrl}/consultations/${id}`);
      alert("Consultation supprimée avec succès !");
      fetchConsultations();
    } catch (error) {
      console.error("Erreur lors de la suppression de la consultation :", error.response?.data || error.message);
      alert("Une erreur est survenue lors de la suppression de la consultation.");
    }
  };

  return (
    <div className="consultations-container">
      <h3 className="consultations-header">Consultations</h3>
      {consultations.length === 0 ? (
        <p className="no-consultations">Aucune consultation</p>
      ) : (
        <ul className="consultations-list">
          {consultations.map(cons => (
            <li key={cons.id} className="consultation-item">
              <div className="consultation-details">
                <p className="consultation-motif">
                  <strong>Motif :</strong> {cons.code.text}
                </p>
                <p className="consultation-date">
                  <strong>Date :</strong> {new Date(cons.effectiveDateTime).toLocaleString()}
                </p>
                <p className="consultation-notes">
                  <strong>Description :</strong> {cons.valueString}
                </p>
                {editingConsultation && editingConsultation.id === cons.id ? (
                  <div className="consultation-edit-form">
                    <input
                      type="text"
                      placeholder="Motif"
                      value={consultation.motif}
                      onChange={(e) => setConsultation({ ...consultation, motif: e.target.value })}
                    />
                    <input
                      type="datetime-local"
                      value={consultation.effectiveDateTime}
                      onChange={(e) => setConsultation({ ...consultation, effectiveDateTime: e.target.value })}
                    />
                    <textarea
                      placeholder="Description"
                      value={consultation.description}
                      onChange={(e) => setConsultation({ ...consultation, description: e.target.value })}
                    />
                    <button onClick={updateConsultation}>Sauvegarder</button>
                    <button onClick={() => {
                      setEditingConsultation(null);
                      setConsultation({ motif: '', effectiveDateTime: '', description: '' });
                    }}>Annuler</button>
                  </div>
                ) : (
                  <>
                    <button onClick={() => {
                      setConsultation({
                        motif: cons.code.text,
                        effectiveDateTime: cons.effectiveDateTime.slice(0, 16),
                        description: cons.valueString
                      });
                      setEditingConsultation(cons);
                    }}>
                      Modifier
                    </button>
                    <button onClick={() => deleteConsultation(cons.id)}>
                      Supprimer
                    </button>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
      <div className="consultation-form">
        <h4 className="form-header">Nouvelle Consultation</h4>
        <div className="form-group">
          <input
            type="text"
            className="form-input"
            placeholder="Motif"
            value={consultation.motif}
            onChange={(e) => setConsultation({ ...consultation, motif: e.target.value })}
          />
        </div>
        <div className="form-group">
          <input
            type="datetime-local"
            className="form-input"
            value={consultation.effectiveDateTime}
            onChange={(e) => setConsultation({ ...consultation, effectiveDateTime: e.target.value })}
          />
        </div>
        <div className="form-group">
          <textarea
            className="form-textarea"
            placeholder="Description"
            value={consultation.description}
            onChange={(e) => setConsultation({ ...consultation, description: e.target.value })}
          />
        </div>
        <button className="form-button" onClick={editingConsultation ? updateConsultation : addConsultation}>
          {editingConsultation ? "Modifier Consultation" : "Ajouter Consultation"}
        </button>
      </div>
    </div>
  );
};

export default Consultations;