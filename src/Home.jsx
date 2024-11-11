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
import { useKeycloak } from '@react-keycloak/web';
import axios from 'axios';

const Home = () => {
  const { keycloak, initialized } = useKeycloak();
  const [patients, setPatients] = useState([]);
  const [newPatient, setNewPatient] = useState({ nom: '', prenom: '', dateNaissance: '', numeroSecu: '' });
  const [editPatient, setEditPatient] = useState(null); // Pour l'édition des données du patient
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false); // Contrôle de l'ouverture de la modale
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (initialized && keycloak.authenticated) {
      fetchPatients();
      fetchPatients2();
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
	
  const fetchPatients2 = async (searchTerm = '') => {
    try {
      const response = await axios.get('http://localhost:3001/patients/search', {
        params: { searchTerm }, // Passer le terme de recherche à l'API
        headers: {
          Authorization: `Bearer ${keycloak.token}`, // Ajouter le token Keycloak
        },
        withCredentials: true,
      });
      setPatients(response.data); // Mettre à jour les patients avec la réponse de l'API
    } catch (error) {
      console.error('Erreur lors de la récupération des patients:', error);
    }
  };

  const handleAddPatient = async () => {
    try {
      await axios.post('http://localhost:3001/add-patient', newPatient, {  
        headers: {
          Authorization: `Bearer ${keycloak.token}`,
          'Content-Type': 'application/json'
        },
        withCredentials: true
      });
      fetchPatients();
      alert('Patient ajouté avec succès!');
    } catch (error) {
      console.error('Error adding patient:', error);
      alert("Erreur lors de l'ajout du patient");
    }
  };

  // Ouvrir la modale d'édition et charger les données du patient
  const openEditDialog = (patient) => {
    const formattedDate = formatDateMMDDYYYY(patient.dateNaissance);
    setEditPatient({
      ...patient,
      dateNaissance: formattedDate,
    });
    setIsEditDialogOpen(true);
  };

  // Fermer la modale sans enregistrer
  const closeEditDialog = () => {
    setIsEditDialogOpen(false);
    setEditPatient(null);
  };

  const formatDateMMDDYYYY = (date) => {
	  console.log(date);
    const d = new Date(date);  // Crée un objet Date à partir de la chaîne
  
    // Vérifie si la date est valide
    if (isNaN(d.getTime())) {
      console.error('Date invalide:', date);
      return ''; // Retourne une chaîne vide ou vous pouvez retourner un message d'erreur
    }
  
    // Formater le mois, jour, et année
    const month = (d.getMonth() + 1).toString().padStart(2, '0');  // Mois au format MM
    const day = d.getDate().toString().padStart(2, '0');  // Jour au format DD
    const year = d.getFullYear();  // Année au format YYYY
  
    return `${month}-${day}-${year}`;
  };
  
  // Mettre à jour un patient
  const handleEditPatient = async () => {
    if (!editPatient.nom) {
      alert(`Le champ "Nom" est requis. Détails : ${JSON.stringify(editPatient)}`);
      return;
    }
    if (!editPatient.prenom) {
      alert(`Le champ "Prénom" est requis. Détails : ${JSON.stringify(editPatient)}`);
      return;
    }
    if (!editPatient.datenaissance) {
      alert(`Le champ "Date de Naissance" est requis. Détails : ${JSON.stringify(editPatient)}`);
      return;
    }
    if (!editPatient.numerosecu) {
      alert(`Le champ "Numéro de Sécurité Sociale" est requis. Détails : ${JSON.stringify(editPatient)}`);
      return;
    }
    try {
      await axios.put(`http://localhost:3001/patients/${editPatient.id}`, {
        nom: editPatient.nom,
        prenom: editPatient.prenom,
        dateNaissance: editPatient.datenaissance,
        numeroSecu: editPatient.numeroSecu
      }, {
        headers: {
          Authorization: `Bearer ${keycloak.token}`,
          'Content-Type': 'application/json'
        },
        withCredentials: true
      });

      fetchPatients(); // Recharger les patients après la mise à jour
      closeEditDialog(); // Fermer la modale
      alert('Patient mis à jour avec succès!');
    } catch (error) {
      console.error('Error updating patient:', error);
      alert('Erreur lors de la mise à jour du patient');
    }
  };

  const handleSearchChange = (event) => {
    const term = event.target.value;
    setSearchTerm(term);
    fetchPatients(term); // Rechercher en temps réel dès que l'utilisateur tape
  };

  const handleDeletePatient = async (id) => {
    console.log('Deleting patient with ID:', id);
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
            onChange={(e) => setSearchTerm(e.target.value)}
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
              // Déclaration de la date et du formatage
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
                  <IconButton color="secondary" onClick={() => openEditDialog(patient)}>
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
        <Dialog open={isEditDialogOpen} onClose={closeEditDialog}>
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
            <Button onClick={closeEditDialog} color="primary">Annuler</Button>
            <Button onClick={handleEditPatient} color="primary">Enregistrer</Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Container>
  );
};

export default Home;

