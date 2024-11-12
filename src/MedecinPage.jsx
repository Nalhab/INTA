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
    fetchPatients();
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

