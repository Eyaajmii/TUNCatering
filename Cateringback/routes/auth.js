const express = require('express');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const logAction = require('../middlware/logAction'); // Import du middleware
const router = express.Router();

// Middleware logAction pour chaque requête sur ces routes
router.use(logAction);

// Route pour l'inscription
router.post('/register', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Hashing the password before saving it to the database
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({ email, password: hashedPassword });
        await user.save();
        res.status(201).send('User registered successfully');
    } catch (error) {
        res.status(400).send(error.message);
    }
});

// Route pour le login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).send('Invalid email or password');
        }

        // Compare the entered password with the hashed password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).send('Invalid email or password');
        }

        // Générer un token JWT

    } catch (error) {
        res.status(400).send(error.message);
    }
});

module.exports = router;
