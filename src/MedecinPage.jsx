import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  Collapse,
} from '@mui/material';
import axios from 'axios';
import KeycloakService from './keycloak';

const MedecinPage = () => {
  const [patients, setPatients] = useState([]);
  const [newPatient, setNewPatient] = useState({id:'', nom: '', prenom: '', dateNaissance: '', numeroSecu: '' });
  const [newDispositif, setNewDispositif] = useState({ type: '', numeroSerie: '', patient_id: '' });
  const [newDossier, setNewDossier] = useState({ patient_id: '' });
  const [newCompteR, setNewCompteR] = useState({ contenu: '', professionnel_id: '', dossier_id: ''});
  const [searchTerm, setSearchTerm] = useState('');
  const [visibleDossiers, setVisibleDossiers] = useState({});
  const [visibleDispositifs, setVisibleDispositifs] = useState({});
  const [dossiers, setDossiers] = useState({});
  const [dispositifs, setDispositifs] = useState({});
  
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await axios.get('http://localhost:3001/patients', {
          withCredentials: true,
        });
        setPatients(response.data);
      } catch (error) {
        console.error('Error fetching patients:', error);
      }
    };
    const getPatients = async () => {
      try {
        const response = await axios.get("http://localhost:8081/fhir/Patient", {
          headers: {
            "Accept": "application/json",
          },
        });
        console.log(response.data); // Affiche les patients retournés
            if (response.data && response.data.entry) {
      // Parcours des patients et affichage du nom (famille et prénom)
      response.data.entry.forEach(entry => {
        const patient = entry.resource; // Chaque patient est dans 'resource'
        
        if (patient.name && patient.name[0]) {
          const familyName = patient.name[0].family; // Nom de famille
          const givenName = patient.name[0].given ? patient.name[0].given.join(" ") : ""; // Prénom
          
          console.log(`Nom: ${familyName}, Prénom: ${givenName}`);
        }
      });
    } else {
      console.log("Aucun patient trouvé.");
    }

        return response.data;
      } catch (error) {
        console.error("Erreur lors de la récupération des patients :", error);
        throw error;
      }
    };
    fetchPatients();
    getPatients();
  }, []);

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredPatients = patients.filter(
    (patient) =>
      patient.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.prenom.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleDossiers = async (patientId) => {
    setVisibleDossiers((prev) => ({ ...prev, [patientId]: !prev[patientId] }));
    if (!dossiers[patientId]) {
      try {
        const response = await axios.get(`http://localhost:3001/dossierPatient/${patientId}`, {
          withCredentials: true,
        });
        setDossiers((prev) => ({ ...prev, [patientId]: response.data }));
      } catch (error) {
        console.error('Error fetching dossiers:', error);
      }
    }
  };

  const toggleDispositifs = async (patientId) => {
    setVisibleDispositifs((prev) => ({ ...prev, [patientId]: !prev[patientId] }));
    if (!dispositifs[patientId]) {
      try {
        const response = await axios.get(`http://localhost:3001/dispositif-medical/${patientId}`, {
          withCredentials: true,
        });
        setDispositifs((prev) => ({ ...prev, [patientId]: response.data }));
      } catch (error) {
        console.error('Error fetching dispositifs:', error);
      }
    }
  };
  const fetchPatients = async () => {
    try {
      const response = await axios.get('http://localhost:3001/patients', {
        withCredentials: true
      });
      setPatients(response.data);
    } catch (error) {
      console.error('Error fetching patients:', error);
    }
  };
  const handleAddPatient = async () => {
    try {
      await axios.post('http://localhost:3001/add-patient', newPatient, {  
        withCredentials: true
      });
      fetchPatients();
      alert('Patient ajouté avec succès!');
    } catch (error) {
      console.error('Error adding patient:', error);
      alert("Erreur lors de l'ajout du patient");
    }
  };
  const handleCompteRendu = async (dossierId) => {
    try {
      const response = await axios.get(`http://localhost:3001/compte-rendu/${dossierId}`, {
        withCredentials: true,
      });
      alert(response.data[0].contenu); // Affichage du contenu du compte-rendu
    } catch (error) {
      console.error('Error fetching compte rendu:', error);
      alert("Erreur lors de la récupération du compte rendu");
    }
  };

  const handleAddDossier = async () => {
    try {
      const response = await axios.post('http://localhost:3001/dossierPatient', newDossier);
      alert('Dossier ajouté avec succès');
      setNewDossier({ patient_id: '' }); // Reset form
    } catch (error) {
      console.error('Erreur lors de l\'ajout du dossier', error);
      alert("Erreur lors de l'ajout du dossier");
    }
  };

  const handleAddDispositif = async () => {
    try {
      await axios.post('http://localhost:3001/dispositif-medical', newDispositif);
      alert('Dispositif médical ajouté avec succès');
      setNewDispositif({ type: '', numeroSerie: '', patient_id: '' }); // Reset form
    } catch (error) {
      console.error('Erreur lors de l\'ajout du dispositif médical', error);
      alert("Erreur lors de l'ajout du dispositif médical");
    }
  };

  const handleAddCompteRendu = async () => {
    try {
      await axios.post('http://localhost:3001/compte-rendu', newCompteR);
      alert('Compte rendu ajouté avec succès');
      setNewCompteR({ contenu: '', professionnel_id: '', dossier_id: '' }); // Reset form
    } catch (error) {
      console.error('Erreur lors de l\'ajout du compte rendu', error);
      alert("Erreur lors de l'ajout du compte rendu");
    }
  };

  const handleLogout = () => {
    KeycloakService.logout();
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Espace Médecin
      </Typography>

      <TextField
        label="Rechercher un patient"
        variant="outlined"
        fullWidth
        value={searchTerm}
        onChange={handleSearch}
        style={{ marginBottom: '20px' }}
      />

      {filteredPatients.map((patient) => (
        <Paper key={patient.id} style={{ padding: '16px', marginTop: '20px' }}>
          <Typography variant="h5">
            {patient.nom} {patient.prenom}
          </Typography>
          <Typography variant="h6">
            {`ID: ${patient.id}`}
          </Typography>
          <Typography variant="subtitle1">Date de Naissance: {new Date(patient.datenaissance).toLocaleDateString()}</Typography>
          <Typography variant="subtitle1">Numéro de Sécurité Sociale: {patient.numerosecu}</Typography>

          {/* Toggle Bouton pour les dossiers */}
          <Button
            onClick={() => toggleDossiers(patient.id)}
            variant="outlined"
            style={{ marginTop: '10px' }}
          >
            {visibleDossiers[patient.id] ? 'Masquer Dossiers Médicaux' : 'Voir les Dossiers Médicaux'}
          </Button>
          <Collapse in={visibleDossiers[patient.id]}>
            <List>
              {dossiers[patient.id] && dossiers[patient.id].length > 0 ? (
                dossiers[patient.id].map((dossier) => (
                  <ListItem key={dossier.id}>
                    <ListItemText primary={`Dossier créé le ${new Date(dossier.datecreation).toLocaleDateString()}`} />
                    <ListItemText primary={`Dossier ID: ${dossier.id}`} />
                    <Button
                      onClick={() => handleCompteRendu(dossier.id)}
                      variant="contained"
                      color="primary"
                    >
                      Voir Compte Rendu
                    </Button>
                  </ListItem>
                ))
              ) : (
                <ListItem>
                  <ListItemText primary="Pas de dossiers disponibles pour ce patient." />
                </ListItem>
              )}
            </List>
          </Collapse>

          {/* Toggle Bouton pour les dispositifs */}
          <Button
            onClick={() => toggleDispositifs(patient.id)}
            variant="outlined"
            style={{ marginTop: '10px' }}
          >
            {visibleDispositifs[patient.id] ? 'Masquer Dispositifs Médicaux' : 'Voir les Dispositifs Médicaux'}
          </Button>
          <Collapse in={visibleDispositifs[patient.id]}>
            <List>
              {dispositifs[patient.id] && dispositifs[patient.id].length > 0 ? (
                dispositifs[patient.id].map((dispositif) => (
                  <ListItem key={dispositif.id}>
                    <ListItemText
                      primary={`${dispositif.type} - Numéro de Série: ${dispositif.numeroserie}`}
                    />
                  </ListItem>
                ))
              ) : (
                <ListItem>
                  <ListItemText primary="Pas de dispositifs médicaux pour ce patient." />
                </ListItem>
              )}
            </List>
          </Collapse>
        </Paper>
      ))}
        <Paper style={{ padding: '16px', marginBottom: '20px' }}>
          <Typography variant="h6">Ajouter un Patient</Typography>
          <TextField
            label="Nom"
            name="nom"
            value={newPatient.nom}
            onChange={(e) => setNewPatient({ ...newPatient, nom: e.target.value })}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Prénom"
            name="prenom"
            value={newPatient.prenom}
            onChange={(e) => setNewPatient({ ...newPatient, prenom: e.target.value })}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Date de Naissance"
            name="dateNaissance"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={newPatient.dateNaissance}
            onChange={(e) => setNewPatient({ ...newPatient, dateNaissance: e.target.value })}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Numéro de Sécurité Sociale"
            name="numeroSecu"
            value={newPatient.numeroSecu}
            onChange={(e) => setNewPatient({ ...newPatient, numeroSecu: e.target.value })}
            fullWidth
            margin="normal"
          />
          <Button variant="contained" color="primary" fullWidth onClick={handleAddPatient}>
            Ajouter le Patient
          </Button>
        </Paper>
      {/* Formulaire Dossier Médical */}
      <Paper style={{ padding: '16px', marginBottom: '20px' }}>
        <Typography variant="h6">Ajouter un Dossier Médical</Typography>
        <TextField
          label="Patient ID"
          name="patient_id"
          value={newDossier.patient_id}
          onChange={(e) => setNewDossier({ ...newDossier, patient_id: e.target.value })}
          fullWidth
          margin="normal"
        />
        <Button variant="contained" color="primary" fullWidth onClick={handleAddDossier}>
          Ajouter le Dossier Médical
        </Button>
      </Paper>
      <Paper style={{ padding: '16px', marginBottom: '20px' }}>
        <Typography variant="h6">Ajouter un Dispositif Médical</Typography>
        <TextField
          label="Type de Dispositif"
          name="type"
          value={newDispositif.type}
          onChange={(e) => setNewDispositif({ ...newDispositif, type: e.target.value })}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Numéro de Série"
          name="numeroSerie"
          value={newDispositif.numeroSerie}
          onChange={(e) => setNewDispositif({ ...newDispositif, numeroSerie: e.target.value })}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Patient ID"
          name="patient_id"
          value={newDispositif.patient_id}
          onChange={(e) => setNewDispositif({ ...newDispositif, patient_id: e.target.value })}
          fullWidth
          margin="normal"
        />
        <Button variant="contained" color="primary" fullWidth onClick={handleAddDispositif}>
          Ajouter le Dispositif Médical
        </Button>
      </Paper>
      <Paper style={{ padding: '16px', marginBottom: '20px' }}>
        <Typography variant="h6">Ajouter un Compte Rendu</Typography>
        <TextField
          label="Contenu du Compte Rendu"
          name="contenu"
          value={newCompteR.contenu}
          onChange={(e) => setNewCompteR({ ...newCompteR, contenu: e.target.value })}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Professionnel ID"
          name="professionnel_id"
          value={newCompteR.professionnel_id}
          onChange={(e) => setNewCompteR({ ...newCompteR, professionnel_id: e.target.value })}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Dossier ID"
          name="dossier_id"
          value={newCompteR.dossier_id}
          onChange={(e) => setNewCompteR({ ...newCompteR, dossier_id: e.target.value })}
          fullWidth
          margin="normal"
        />
        <Button variant="contained" color="primary" fullWidth onClick={handleAddCompteRendu}>
          Ajouter le Compte Rendu
        </Button>
      </Paper>
      <Button
        onClick={handleLogout}
        variant="contained"
        color="secondary"
        style={{ marginTop: '20px' }}
	  >
        Déconnexion
      </Button>
    </Container>
  );
};

export default MedecinPage;

