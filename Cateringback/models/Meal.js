// models/Meal.js
const mongoose = require('mongoose');

const mealSchema = new mongoose.Schema({
    nom: {
        type: String,
        required: true,
    },
    rotation: {
        type: String, // Ou un autre type selon vos besoins
        required: true,
    },
    prix: {
        type: Number,
        required: true,
    },
});

module.exports = mongoose.model('Meal', mealSchema);