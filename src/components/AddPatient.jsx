// AddPatient.jsx
import React, { useState } from 'react';
import './AddPatient.css';

const AddPatient = ({ addPatient }) => {
  const [newPatient, setNewPatient] = useState({
    firstName: "",
    lastName: "",
    gender: "",
    birthDate: "",
    address: {
      line: "",
      city: "",
      postalCode: "",
      country: "",
    },
    phone: "",
    email: "",
    doctor: "",
  });

  const handleAdd = () => {
    const { firstName, lastName, gender, birthDate, phone, email, doctor, address } = newPatient;
    if (firstName && lastName && gender && birthDate && phone && email && doctor && address.line && address.city && address.postalCode && address.country) {
      addPatient(newPatient);
      setNewPatient({ firstName: "", lastName: "", gender: "", birthDate: "", address: { line: "", city: "", postalCode: "", country: "" }, phone: "", email: "", doctor: "" });
    } else {
      alert("Veuillez remplir tous les champs.");
      console.error("Veuillez remplir tous les champs:", newPatient);
    }
  };

  return (
    <div className="add-patient">
      <h2>Ajouter un Nouveau Patient</h2>
      <input
        type="text"
        placeholder="Prénom"
        value={newPatient.firstName}
        onChange={(e) => setNewPatient({ ...newPatient, firstName: e.target.value })}
      />
      <input
        type="text"
        placeholder="Nom de Famille"
        value={newPatient.lastName}
        onChange={(e) => setNewPatient({ ...newPatient, lastName: e.target.value })}
      />
      <select
        value={newPatient.gender}
        onChange={(e) => setNewPatient({ ...newPatient, gender: e.target.value })}
      >
        <option value="">Sexe</option>
        <option value="male">Masculin</option>
        <option value="female">Féminin</option>
        <option value="other">Autre</option>
      </select>
      <input
        type="date"
        placeholder="Date de Naissance"
        value={newPatient.birthDate}
        onChange={(e) => setNewPatient({ ...newPatient, birthDate: e.target.value })}
      />
      <input
        type="tel"
        placeholder="Téléphone"
        value={newPatient.phone}
        onChange={(e) => setNewPatient({ ...newPatient, phone: e.target.value })}
      />
      <input
        type="email"
        placeholder="Email"
        value={newPatient.email}
        onChange={(e) => setNewPatient({ ...newPatient, email: e.target.value })}
      />
      <select
        value={newPatient.doctor}
        onChange={(e) => setNewPatient({ ...newPatient, doctor: e.target.value })}
      >
        <option value="">Médecin Traitant</option>
        <option value="Dr. Linux">Dr. Linux</option>
        <option value="Dr. Windows">Dr. Windows</option>
      </select>
      <input
        type="text"
        placeholder="Adresse"
        value={newPatient.address.line}
        onChange={(e) => setNewPatient({ ...newPatient, address: { ...newPatient.address, line: e.target.value } })}
      />
      <div className="address-fields">
        <input
          type="text"
          placeholder="Ville"
          value={newPatient.address.city}
          onChange={(e) =>
            setNewPatient({
              ...newPatient,
              address: { ...newPatient.address, city: e.target.value },
            })
          }
        />
        <input
          type="text"
          placeholder="Code Postal"
          value={newPatient.address.postalCode}
          onChange={(e) =>
            setNewPatient({
              ...newPatient,
              address: { ...newPatient.address, postalCode: e.target.value },
            })
          }
        />
        <input
          type="text"
          placeholder="Pays"
          value={newPatient.address.country}
          onChange={(e) =>
            setNewPatient({
              ...newPatient,
              address: { ...newPatient.address, country: e.target.value },
            })
          }
        />
      </div>
      <button onClick={handleAdd}>Ajouter Patient</button>
    </div>
  );
};

export default AddPatient;