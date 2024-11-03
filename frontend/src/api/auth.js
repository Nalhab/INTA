import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

// Enregistrement d'un utilisateur
export const registerUser = (userData) => {
    return axios.post(`${API_URL}/register`, userData);
};

// Connexion d'un utilisateur
export const loginUser = (userData) => {
    return axios.post(`${API_URL}/login`, userData);
};

// Récupération des utilisateurs
export const fetchUsers = (token) => {
    return axios.get(`${API_URL}/users`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
};

