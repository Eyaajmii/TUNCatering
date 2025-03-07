const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authRoutes = require('./routes/auth');
const mealRoutes = require('./routes/mealRoute');
const commandeRoute=require('./routes/commandeRoute');
const menuRoute=require('./routes/menuRoute');
require("./models/AdminTunCatering");
require("./models/Commande");
require("./models/Meal");
require("./models/Menu");
require("./models/ResponsableTunDirCatering");
require("./models/Stock");
require("./models/personnelnavigant");
require("./models/vol");
require("./models/User");
const app = express();
const PORT = 5000;

// Middleware pour parser les données JSON
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

app.use('/api/auth', authRoutes);
app.use('/api/meal', mealRoutes);
app.use("/api/commande", commandeRoute);
app.use("/api/menu", menuRoute);
// Connexion à MongoDB
mongoose
  .connect("mongodb://localhost:27017/Tuncatering")
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Error connecting to MongoDB:", err));



// Démarrer le serveur
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});