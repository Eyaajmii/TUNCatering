const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path=require('path');
const authRoutes = require('./routes/auth');
const mealRoutes = require('./routes/mealRoute');
const commandeRoute=require('./routes/commandeRoute');
const menuRoute=require('./routes/menuRoute');
const methodOverride = require("method-override");

const app = express();
const PORT = 5000;

// Middleware pour parser les données JSON
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use('/image',express.static(path.join(__dirname,'image')));
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