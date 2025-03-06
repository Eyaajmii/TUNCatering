// routes/meal.js
const express = require('express');
const Meal = require('../models/Meal');
const router = express.Router();


// Récupérer tous les repas
router.get('/meals', async (req, res) => {
    try {
        const meals = await Meal.find();
        res.status(200).json(meals);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// routes/meal.js
router.post('/meals', async (req, res) => {
    const meal = new Meal({
        nom: req.body.nom,
        rotation: req.body.rotation,
        prix: req.body.prix,
    });

    try {
        const newMeal = await meal.save();
        res.status(201).json(newMeal);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});
module.exports = router;