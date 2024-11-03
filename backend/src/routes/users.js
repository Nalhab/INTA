const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const bcrypt = require('bcrypt');
const pool = require('../db'); // Importer la connexion à la DB
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');

const SECRET_KEY = 'your_secret_key'; // Remplacez par une clé secrète forte et gardez-la secrète

// Limitation des requêtes pour les endpoints de connexion
const loginLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 15 minutes
    max: 200, // Limite chaque IP à 5 requêtes par `window` (ici, par 15 minutes)
    message: 'Trop de tentatives de connexion de cette IP, veuillez réessayer plus tard.',
});

// Middleware d'authentification
const authenticateJWT = (req, res, next) => {
    const token = req.header('Authorization') && req.header('Authorization').split(' ')[1];

    if (!token) return res.sendStatus(403); // Forbidden

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.sendStatus(403); // Forbidden
        req.user = user;
        next();
    });
};

// Endpoint pour enregistrer un utilisateur
router.post(
    '/register',
    [
        body('email').isEmail().withMessage('Email is required and must be valid'),
        body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
        body('username').notEmpty().withMessage('Username is required'),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password, username } = req.body;

        try {
            const hashedPassword = await bcrypt.hash(password, 10);
            const result = await pool.query(
                'INSERT INTO users (email, password_hash, username) VALUES ($1, $2, $3) RETURNING *',
                [email, hashedPassword, username]
            );

            res.status(201).json({
                message: 'User registered successfully',
                user: result.rows[0],
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error registering user' });
        }
    }
);

// Endpoint pour la connexion
router.post(
    '/login',
    [
        body('email').isEmail().withMessage('Email is required and must be valid'),
        body('password').notEmpty().withMessage('Password is required'),
    ],
    loginLimiter, // Appliquer le limiteur de requêtes ici
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;

        try {
            const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
            const user = result.rows[0];

            if (!user) {
                return res.status(401).json({ message: 'Invalid email or password' });
            }

            const isMatch = await bcrypt.compare(password, user.password_hash);

            if (!isMatch) {
                return res.status(401).json({ message: 'Invalid email or password' });
            }

            const token = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, { expiresIn: '1h' });
            res.status(200).json({ message: 'Login successful', user, token });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error logging in' });
        }
    }
);

// Endpoint pour voir la liste des utilisateurs
router.get('/users', async (req, res) => {
    try {
        const result = await pool.query('SELECT id, email, username, created_at FROM users');
        res.status(200).json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching users' });
    }
});

module.exports = router; // Assurez-vous d'exporter le router

