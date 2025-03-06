const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authRoutes = require('./routes/auth');
const mealRoutes = require('./routes/Meal');

// Importer les modèles pour assurer leur création dans MongoDB
require('./models/User');
require('./models/Meal');
require('./models/vol');
require('./models/personnelnavigant');

const app = express();
const PORT = 5000;

// Middleware pour parser les données JSON
app.use(bodyParser.json());
app.use('/api/auth', authRoutes);
app.use('/api', mealRoutes);

// Connexion à MongoDB
mongoose.connect('mongodb://localhost:27017/Tuncatering')
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch(err => console.error('❌ Could not connect to MongoDB', err));

// Démarrer le serveur
app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
