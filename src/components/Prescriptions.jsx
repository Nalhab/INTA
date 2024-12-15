import React, { useState, useEffect } from "react";
import axios from "axios";
import './Prescriptions.css';

const Prescriptions = ({ patientId, backendUrl = 'http://localhost:3001' }) => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [prescription, setPrescription] = useState({
    text: '',
    dosage: '',
    duration: '',
    instructions: '',
  });
  const [editingPrescription, setEditingPrescription] = useState(null);

  useEffect(() => {
    fetchPrescriptions();
  }, [patientId]);

  const fetchPrescriptions = async () => {
    try {
      const response = await axios.get(`${backendUrl}/patients/${patientId}/prescriptions`);
      setPrescriptions(response.data);
    } catch (error) {
      console.error('Erreur lors de la récupération des prescriptions:', error.response?.data || error.message);
      alert("Erreur lors de la récupération des prescriptions.");
    }
  };

  const addPrescription = async () => {
    if (!prescription.text || !prescription.dosage || !prescription.duration || !prescription.instructions) {
      alert("Veuillez remplir tous les champs avant d'ajouter une prescription.");
      return;
    }
    try {
      const payload = {
        text: prescription.text,
        dosage: prescription.dosage,
        duration: prescription.duration,
        instructions: prescription.instructions
      };
      await axios.post(`${backendUrl}/patients/${patientId}/prescriptions`, payload);
      alert("Prescription ajoutée avec succès!");
      setPrescription({ text: '', dosage: '', duration: '', instructions: '' });
      fetchPrescriptions();
    } catch (error) {
      console.error("Erreur lors de l'ajout de la prescription :", error.response?.data || error.message);
      alert("Une erreur est survenue lors de l'ajout de la prescription.");
    }
  };

  const updatePrescription = async () => {
    if (!prescription.text || !prescription.dosage || !prescription.duration || !prescription.instructions) {
      alert("Veuillez remplir tous les champs avant de modifier la prescription.");
      return;
    }
    try {
      const payload = {
        text: prescription.text,
        dosage: prescription.dosage,
        duration: prescription.duration,
        instructions: prescription.instructions,
        patientId: patientId,
      };
      await axios.put(`${backendUrl}/prescriptions/${editingPrescription.id}`, payload);
      alert("Prescription modifiée avec succès!");
      setPrescription({ text: '', dosage: '', duration: '', instructions: '' });
      setEditingPrescription(null);
      fetchPrescriptions();
    } catch (error) {
      console.error("Erreur lors de la modification de la prescription :", error.response?.data || error.message);
      alert("Une erreur est survenue lors de la modification de la prescription.");
    }
  };

  const deletePrescription = async (id) => {
    try {
      await axios.delete(`${backendUrl}/prescriptions/${id}`);
      alert("Prescription supprimée avec succès!");
      fetchPrescriptions();
    } catch (error) {
      console.error("Erreur lors de la suppression de la prescription :", error.response?.data || error.message);
      alert("Une erreur est survenue lors de la suppression de la prescription.");
    }
  };

  return (
    <div className="prescriptions-container">
      <h3 className="prescriptions-header">Prescriptions</h3>
      {prescriptions.length === 0 ? (
        <p className="no-prescriptions">Aucune prescription</p>
      ) : (
        <ul className="prescriptions-list">
          {prescriptions.map(pres => (
            <li key={pres.id} className="prescription-item">
              <div className="prescription-details">
                <p className="prescription-med">
                  <strong>Médicament :</strong> {pres.medicationCodeableConcept.text}
                </p>
                <p className="prescription-dosage">
                  <strong>Dosage :</strong> {pres.dosageInstruction[0]?.text}
                </p>
                <p className="prescription-duration">
                  <strong>Durée :</strong> {pres.dosageInstruction[0]?.timing?.repeat?.boundsPeriod?.start}
                </p>
                <p className="prescription-instructions">
                  <strong>Instructions :</strong> {pres.dosageInstruction[0]?.route?.text}
                </p>
                <button onClick={() => {
                  setPrescription({
                    text: pres.medicationCodeableConcept.text,
                    dosage: pres.dosageInstruction[0]?.text || '',
                    duration: pres.dosageInstruction[0]?.timing?.repeat?.boundsPeriod?.start || '',
                    instructions: pres.dosageInstruction[0]?.route?.text || ''
                  });
                  setEditingPrescription(pres);
                }}>
                  Modifier
                </button>
                <button onClick={() => deletePrescription(pres.id)}>
                  Supprimer
                </button>
              </div>
              {editingPrescription && editingPrescription.id === pres.id && (
                <div className="prescription-edit-form">
                  <input
                    type="text"
                    placeholder="Médicament"
                    value={prescription.text}
                    onChange={(e) => setPrescription({ ...prescription, text: e.target.value })}
                  />
                  <input
                    type="text"
                    placeholder="Dosage"
                    value={prescription.dosage}
                    onChange={(e) => setPrescription({ ...prescription, dosage: e.target.value })}
                  />
                  <input
                    type="date"
                    placeholder="Durée"
                    value={prescription.duration}
                    onChange={(e) => setPrescription({ ...prescription, duration: e.target.value })}
                  />
                  <textarea
                    placeholder="Instructions"
                    value={prescription.instructions}
                    onChange={(e) => setPrescription({ ...prescription, instructions: e.target.value })}
                  />
                  <button onClick={updatePrescription}>Sauvegarder</button>
                  <button onClick={() => {
                    setEditingPrescription(null);
                    setPrescription({ text: '', dosage: '', duration: '', instructions: '' });
                  }}>Annuler</button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
      <div className="prescription-form">
        <h4 className="form-header">Ajouter une Prescription</h4>
        <div className="form-group">
          <input
            type="text"
            className="form-input"
            placeholder="Médicament"
            value={prescription.text}
            onChange={(e) => setPrescription({ ...prescription, text: e.target.value })}
          />
        </div>
        <div className="form-group">
          <input
            type="text"
            className="form-input"
            placeholder="Dosage"
            value={prescription.dosage}
            onChange={(e) => setPrescription({ ...prescription, dosage: e.target.value })}
          />
        </div>
        <div className="form-group">
          <input
            type="date"
            className="form-input"
            value={prescription.duration}
            onChange={(e) => setPrescription({ ...prescription, duration: e.target.value })}
          />
        </div>
        <div className="form-group">
          <textarea
            className="form-textarea"
            placeholder="Instructions"
            value={prescription.instructions}
            onChange={(e) => setPrescription({ ...prescription, instructions: e.target.value })}
          />
        </div>
        <button className="form-button" onClick={editingPrescription ? updatePrescription : addPrescription}>
          {editingPrescription ? "Modifier Prescription" : "Ajouter Prescription"}
        </button>
      </div>
    </div>
  );
}

export default Prescriptions;