const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'API Documentation',
            version: '1.0.0',
            description: 'API pour gérer les utilisateurs, tâches et événements',
        },
        servers: [
            {
                url: 'http://localhost:5000', // URL de base pour les requêtes
            },
        ],
    },
    apis: ['./src/routes/*.js'], // Chemin vers les fichiers de routes pour les annotations Swagger
};

const swaggerSpec = swaggerJsdoc(options);

function swaggerDocs(app, port) {
    app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
    console.log(`Swagger Docs disponible à http://localhost:${port}/docs`);
}

module.exports = swaggerDocs;

