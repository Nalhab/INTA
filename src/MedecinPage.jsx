import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
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
import axios from 'axios';

const MedecinPage = () => {
  const [patients, setPatients] = useState([]);
  const [newPatient, setNewPatient] = useState({ nom: '', prenom: '', dateNaissance: '', numeroSecu: '' });
  const [editPatient, setEditPatient] = useState(null); 
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false); 
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch des patients
  useEffect(() => {
    fetchPatients();
    fetchPatients2(searchTerm);
  }, [searchTerm]);

  const fetchPatients = async () => {
    try {
      const response = await axios.get('http://localhost:3001/patients', { withCredentials: true });
      setPatients(response.data);
    } catch (error) {
      console.error('Error fetching patients:', error);
    }
  };

  const fetchPatients2 = async (searchTerm = '') => {
    try {
      const response = await axios.get('http://localhost:3001/patients/search', {
        params: { searchTerm },
        withCredentials: true,
      });
      setPatients(response.data);
    } catch (error) {
      console.error('Erreur lors de la récupération des patients:', error);
    }
  };

  const handleAddPatient = async () => {
    try {
      await axios.post('http://localhost:3001/add-patient', newPatient, {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true,
      });
      fetchPatients();
      alert('Patient ajouté avec succès!');
    } catch (error) {
      console.error('Error adding patient:', error);
      alert("Erreur lors de l'ajout du patient");
    }
  };

  const handleEditPatient = (patient) => {
    setEditPatient(patient);
    setIsEditDialogOpen(true);
  };

  const handleDeletePatient = async (id) => {
    try {
      await axios.delete(`http://localhost:3001/delete-patient/${id}`, { withCredentials: true });
      fetchPatients();
      alert('Patient supprimé avec succès!');
    } catch (error) {
      console.error('Error deleting patient:', error);
      alert("Erreur lors de la suppression du patient");
    }
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    fetchPatients2(event.target.value);
  };

  return (
    <Container>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6">Page des Patients</Typography>
        </Toolbar>
      </AppBar>

      <Container style={{ marginTop: '20px' }}>
        {/* Recherche de patient */}
        <Paper style={{ padding: '16px' }}>
          <Typography variant="h6">Rechercher un Patient</Typography>
          <TextField
            label="Nom ou Prénom"
            value={searchTerm}
            onChange={handleSearch}
            fullWidth
            margin="normal"
            InputProps={{
              endAdornment: <Search />,
            }}
          />
        </Paper>
        <Paper style={{ padding: '16px', marginBottom: '20px' }}>
          <Typography variant="h6">Liste des Patients</Typography>
          <List>
            {patients
              .filter((patient) =>
                patient.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                patient.prenom.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map((patient) => {
                const date = new Date(patient.datenaissance);
                const formattedDate = date.toLocaleDateString();

                return (
                  <ListItem key={patient.id} style={{ borderBottom: '1px solid #ddd' }}>
                    <ListItemText
                      primary={`${patient.nom} ${patient.prenom}`}
                      secondary={`${formattedDate} - N° Sécu : ${patient.numerosecu}`}
                    />
                    <IconButton color="primary">
                      <Visibility />
                    </IconButton>
                    <IconButton color="secondary" onClick={() => handleEditPatient(patient)}>
                      <Edit />
                    </IconButton>
                    <IconButton color="error" onClick={() => handleDeletePatient(patient.id)}>
                      <Delete />
                    </IconButton>
                  </ListItem>
                );
              })}
          </List>
        </Paper>
        {/* Formulaire pour ajouter un patient */}
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

        {/* Modale pour éditer un patient */}
        <Dialog open={isEditDialogOpen} onClose={() => setIsEditDialogOpen(false)}>
          <DialogTitle>Modifier le Patient</DialogTitle>
          <DialogContent>
            <TextField
              label="Nom"
              value={editPatient?.nom || ''}
              onChange={(e) => setEditPatient({ ...editPatient, nom: e.target.value })}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Prénom"
              value={editPatient?.prenom || ''}
              onChange={(e) => setEditPatient({ ...editPatient, prenom: e.target.value })}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Date de Naissance"
              name="dateNaissance"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={editPatient?.datenaissance ? editPatient.datenaissance.split('T')[0] : ''}
              onChange={(e) => setEditPatient({ ...editPatient, dateNaissance: e.target.value })}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Numéro de Sécurité Sociale"
              value={editPatient?.numerosecu || ''}
              onChange={(e) => setEditPatient({ ...editPatient, numeroSecu: e.target.value })}
              fullWidth
              margin="normal"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsEditDialogOpen(false)} color="primary">Annuler</Button>
            <Button onClick={handleEditPatient} color="primary">Enregistrer</Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Container>
  );
};

export default MedecinPage;

