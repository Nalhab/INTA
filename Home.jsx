import React, { useState } from 'react';
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

const Home = () => {
  const [patients, setPatients] = useState([
    { id: 1, name: 'Jean Dupont', age: 42, gender: 'Homme' },
    { id: 2, name: 'Marie Martin', age: 35, gender: 'Femme' },
  ]);
  const [newPatient, setNewPatient] = useState({ name: '', age: '', gender: '' });
  const [searchTerm, setSearchTerm] = useState('');

  const handleAddPatient = () => {
    // Logic to add a new patient
    const id = patients.length + 1;
    setPatients([...patients, { id, ...newPatient }]);
    setNewPatient({ name: '', age: '', gender: '' });
  };

  const handleDeletePatient = (id) => {
    // Logic to delete a patient
    setPatients(patients.filter((patient) => patient.id !== id));
  };

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