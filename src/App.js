import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ReactKeycloakProvider, useKeycloak } from '@react-keycloak/web';
import keycloak from './keycloak';

const App = () => {
    const { keycloak, initialized } = useKeycloak();
    const [patients, setPatients] = useState([]);
    const [roles, setRoles] = useState([]);

    const addTestPatient = async () => {
        try {
            await axios.post('http://localhost:3001/add-test-patient', {}, {
                headers: {
                    Authorization: `Bearer ${keycloak.token}`
                },
                withCredentials: true
            });

            // Actualiser la liste des patients
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

    useEffect(() => {
        if (initialized && keycloak.authenticated) {
            const userRoles = keycloak.tokenParsed.realm_access.roles;
            setRoles(userRoles);

            axios.get('http://localhost:3001/patients', {
                headers: {
                    Authorization: `Bearer ${keycloak.token}`
                },
                withCredentials: true
            })
            .then(response => {
                setPatients(response.data);
            })
            .catch(error => {
                console.error('Error fetching patients:', error);
            });
        }
    }, [initialized, keycloak]);

    if (!initialized) {
        return <div>Loading...</div>;
    }

    if (!keycloak.authenticated) {
        return (
            <div>
                <div>Not authenticated</div>
                <button onClick={() => keycloak.login()}>Login</button>
            </div>
        );
    }

    return (
        <div>
            <p>Welcome, {keycloak.tokenParsed.name}</p>
            <p>Your roles: {roles.join(', ')}</p>
            <button onClick={() => keycloak.logout()}>Logout</button>
            
            {/* Ajout du bouton test patient */}
            {(roles.includes('admin') || roles.includes('medecin')) && (
                <button onClick={addTestPatient}>Ajouter Patient Test</button>
            )}
            
            <h2>Patients</h2>
            <ul>
                {patients.map(patient => (
                    <li key={patient.id}>{patient.nom} {patient.prenom}</li>
                ))}
            </ul>
        </div>
    );
};



const WrappedApp = () => (
    <ReactKeycloakProvider authClient={keycloak}>
        <App />
    </ReactKeycloakProvider>
);

export default WrappedApp;