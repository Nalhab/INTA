import React, { useEffect, useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import axios from 'axios';

const PatientPage = ({userId}) => {
  const [patientData, setPatientData] = useState({ nom: '', prenom: '', dateNaissance: '', numeroSecu: '' });
  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        console.log("Fetching patient data for userId:", userId);
        const response = await axios.get(`http://localhost:3001/patient/${userId}`, {
          withCredentials: true,
        });

        // Mettre à jour patientData avec le premier élément du tableau
        const data = response.data[0];
        console.log("Patient data extracted:", data);
        setPatientData(data);
      } catch (error) {
        console.error("Erreur lors de la récupération des données du patient:", error);
      }
    };

    fetchPatientData();
  }, [userId]);

  if (!patientData) return <div>Chargement des données du patient...</div>;

  const formattedDate = new Date(patientData.datenaissance).toLocaleDateString();

  return (
    <Container>
      <Paper style={{ padding: '16px', marginTop: '20px' }}>
        <Typography variant="h4" gutterBottom>
          Informations du Patient
        </Typography>

        <List>
          <ListItem>
            <ListItemText primary="Nom" secondary={patientData.nom} />
          </ListItem>
          <ListItem>
            <ListItemText primary="Prénom" secondary={patientData.prenom} />
          </ListItem>
          <ListItem>
            <ListItemText primary="Date de Naissance" secondary={formattedDate} />
          </ListItem>
          <ListItem>
            <ListItemText primary="Numéro de Sécurité Sociale" secondary={patientData.numerosecu} />
          </ListItem>
        </List>
      </Paper>
    </Container>
  );
};

export default PatientPage;
