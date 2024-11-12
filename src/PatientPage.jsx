import React, { useEffect, useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  Button,
  Divider,
} from '@mui/material';
import axios from 'axios';
import KeycloakService from './keycloak';

const PatientDetailsPage = ({ userId }) => {
  const [patient, setPatient] = useState(null);
  const [dossiers, setDossiers] = useState([]);
  const [dispositifs, setDispositifs] = useState([]);
  const [loading, setLoading] = useState(true);
useEffect(() => {
  const fetchPatientData = async () => {
    try {
      // Récupérer les informations du patient par son nom et prénom
      const patientResponse = await axios.get(`http://localhost:3001/patient/${userId}`, {
        withCredentials: true,
      });
      
      if (patientResponse.data.length > 0) {
        const patientId = patientResponse.data[0].id; // Récupérer l'id du patient

        setPatient(patientResponse.data[0]);

        // Récupérer les dossiers du patient en utilisant l'id
        const dossierResponse = await axios.get(`http://localhost:3001/dossierPatient/${patientId}`, {
          withCredentials: true,
        });
        setDossiers(dossierResponse.data);

        // Récupérer les dispositifs médicaux du patient en utilisant l'id
        const dispositifResponse = await axios.get(`http://localhost:3001/dispositif-medical/${patientId}`, {
          withCredentials: true,
        });
        setDispositifs(dispositifResponse.data);
      } else {
        console.error('Patient non trouvé');
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des données:", error);
    } finally {
      setLoading(false);
    }
  };

  fetchPatientData();
}, [userId]);

  const handleViewCompteRendu = async (dossierId) => {
    try {
      // Remplace l'URL par celle de votre API pour accéder au compte rendu
      const response = await axios.get(`http://localhost:3001/compte-rendu/${dossierId}`, { withCredentials: true });
      alert("Compte rendu du dossier : " + response.data[0].contenu);
    } catch (error) {
      console.error('Erreur lors de l\'accès au compte rendu:', error);
    }
  };

  if (loading) return <div>Chargement des données...</div>;

  const handleLogout = () => {
    KeycloakService.logout();
  };

  return (
    <Container>
      <Paper style={{ padding: '16px', marginTop: '20px' }}>
        <Typography variant="h4" gutterBottom>
          Informations du Patient
        </Typography>
        {patient && (
          <List>
            <ListItem>
              <ListItemText primary="Nom" secondary={patient.nom} />
            </ListItem>
            <ListItem>
              <ListItemText primary="Prénom" secondary={patient.prenom} />
            </ListItem>
            <ListItem>
              <ListItemText primary="Date de Naissance" secondary={new Date(patient.datenaissance).toLocaleDateString()} />
            </ListItem>
            <ListItem>
              <ListItemText primary="Numéro de Sécurité Sociale" secondary={patient.numerosecu} />
            </ListItem>
          </List>
        )}
      </Paper>

      {/* Section Dossiers */}
      <Paper style={{ padding: '16px', marginTop: '20px' }}>
        <Typography variant="h5">Dossiers Médicaux</Typography>
        {dossiers.map((dossier) => (
          <div key={dossier.id}>
            <ListItem>
              <ListItemText
                primary={`Dossier créé le : ${new Date(dossier.datecreation).toLocaleDateString()}`}
                secondary={`ID du Dossier : ${dossier.id}`}
              />
              <Button
                variant="contained"
                color="primary"
                onClick={() => handleViewCompteRendu(dossier.id)}
              >
                Voir le Compte Rendu
              </Button>
            </ListItem>
            <Divider />
          </div>
        ))}
      </Paper>

      {/* Section Dispositifs Médicaux */}
      <Paper style={{ padding: '16px', marginTop: '20px' }}>
        <Typography variant="h5">Dispositifs Médicaux</Typography>
        {dispositifs.map((dispositif) => (
          <div key={dispositif.id}>
            <ListItem>
              <ListItemText
                primary={`Type : ${dispositif.type}`}
                secondary={`Numéro de Série : ${dispositif.numeroserie}`}
              />
            </ListItem>
            <Divider />
          </div>
        ))}
      </Paper>
      <Button onClick={handleLogout} variant="contained" color="secondary" style={{ marginTop: '20px' }}>
        Déconnexion
      </Button>
    </Container>
  );
};

export default PatientDetailsPage;

