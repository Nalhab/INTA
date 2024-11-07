import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Button,
  Container,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Paper,
  TextField,
  Toolbar,
  Typography,
} from '@mui/material';
import { Visibility, Edit, Delete, Search } from '@mui/icons-material';
import { useKeycloak } from '@react-keycloak/web';
import axios from 'axios';

const Home = () => {
  const { keycloak, initialized } = useKeycloak();
  const [patients, setPatients] = useState([]);
  const [newPatient, setNewPatient] = useState({ name: '', age: '', gender: '' });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (initialized && keycloak.authenticated) {
      fetchPatients();
    }
  }, [initialized, keycloak]);

  const fetchPatients = async () => {
    try {
      const response = await axios.get('http://localhost:3001/patients', {
        headers: {
          Authorization: `Bearer ${keycloak.token}`
        },
        withCredentials: true
      });
      setPatients(response.data);
    } catch (error) {
      console.error('Error fetching patients:', error);
    }
  };

  const handleAddPatient = async () => {
    try {
      await axios.post('http://localhost:3001/add-test-patient', {}, {
          headers: {
              Authorization: `Bearer ${keycloak.token}`
          },
          withCredentials: true
      });

      const response = await axios.get('http://localhost:3001/patients', {
          headers: {
              Authorization: `Bearer ${keycloak.token}`
          },
          withCredentials: true
      });
      setPatients(response.data);
      alert('Patient test ajouté avec succès!');
    } catch (error) {
      console.error('Error adding test patient:', error);
      alert('Erreur lors de l\'ajout du patient test');
    }
  };

  const handleDeletePatient = async (id) => {
    try {
      await axios.delete(`http://localhost:3001/patients/${id}`, {
        headers: {
          Authorization: `Bearer ${keycloak.token}`
        },
        withCredentials: true
      });
      fetchPatients();
    } catch (error) {
      console.error('Error deleting patient:', error);
      alert('Erreur lors de la suppression du patient');
    }
  };

  if (!initialized) {
    return <div>Loading...</div>;
  }

  if (!keycloak.authenticated) {
    keycloak.login();
    return null;
  }

  return (
    <Container>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6">Page Title</Typography>
        </Toolbar>
      </AppBar>

      <Container style={{ marginTop: '20px' }}>
        <Paper style={{ padding: '16px', marginBottom: '20px' }}>
          <Typography variant="h6">Liste des Patients</Typography>
          <List>
            {patients.map((patient) => (
              <ListItem key={patient.id} style={{ borderBottom: '1px solid #ddd' }}>
                <ListItemText
                  primary={`${patient.name}`}
                  secondary={`${patient.age} ans - ${patient.gender}`}
                />
                <IconButton color="primary">
                  <Visibility />
                </IconButton>
                <IconButton color="secondary">
                  <Edit />
                </IconButton>
                <IconButton color="error" onClick={() => handleDeletePatient(patient.id)}>
                  <Delete />
                </IconButton>
              </ListItem>
            ))}
          </List>
        </Paper>

        <Paper style={{ padding: '16px', marginBottom: '20px' }}>
          <Typography variant="h6">Ajouter un Patient</Typography>
          <TextField
            label="Nom"
            value={newPatient.name}
            onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Âge"
            value={newPatient.age}
            onChange={(e) => setNewPatient({ ...newPatient, age: e.target.value })}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Genre"
            value={newPatient.gender}
            onChange={(e) => setNewPatient({ ...newPatient, gender: e.target.value })}
            fullWidth
            margin="normal"
          />
          <Button variant="contained" color="primary" fullWidth onClick={handleAddPatient}>
            Ajouter le Patient
          </Button>
        </Paper>
        
        <h2>Patients</h2>
            <ul>
                {patients.map(patient => (
                    <li key={patient.id}>{patient.nom} {patient.prenom}</li>
                ))}
            </ul>

        <Paper style={{ padding: '16px' }}>
          <Typography variant="h6">Rechercher un Patient</Typography>
          <TextField
            label="Nom ou Prénom"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            fullWidth
            margin="normal"
            InputProps={{
              endAdornment: <Search />,
            }}
          />
          <Button variant="contained" color="secondary" fullWidth>
            Rechercher
          </Button>
        </Paper>
      </Container>
    </Container>
  );
};

export default Home;