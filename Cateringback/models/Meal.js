// models/Meal.js
const mongoose = require('mongoose');

const mealSchema = new mongoose.Schema({
    nom: {
        type: String,
        required: true,
    },
    description: {
        type: String, 
        required: true,
    },
    prix: {
        type: Number,
        required: true,
    },
    typePlat:{
        type: String,
        enum:["Entrée","Plat Principal","Dessert"],
        required:true
    },
});

module.exports = mongoose.model('Meal', mealSchema);