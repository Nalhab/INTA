const express = require('express');
const cors = require('cors');
const swaggerDocs = require('./swagger'); // Importez le fichier swagger.js
const usersRoutes = require('./routes/users'); // Importez le fichier de routes utilisateurs

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: 'http://localhost:3000', // Autorise uniquement le frontend
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Méthodes autorisées
    credentials: true, // Autorise les cookies
}));
app.use(express.json()); // Middleware pour parser les JSON

// Routes
app.use('/api', usersRoutes); // Routes utilisateurs

// Swagger
swaggerDocs(app, PORT); // Intègre Swagger

// Démarre le serveur
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

