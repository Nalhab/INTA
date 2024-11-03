import axios from 'axios';
import keycloak from '../keycloak';

const API_URL = 'http://localhost:5000/api';

export const fetchPatients = async () => {
  const token = keycloak.token;
  const response = await axios.get(`${API_URL}/patients`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};