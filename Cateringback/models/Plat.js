const mongoose = require('mongoose');

const PlatSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: true,
    unique:true,
  },
  description: {
    type: String,
    required: true,
  },
  typePlat: {
    type: String,
    enum: ["Entrée", "Plat Principal", "Dessert","Boisson","Petit déjuner"],
    required: true,
  },
  Categorie: {
    type: String, //exemple:["Standard", "Végétarien", "Sans gluten"]
    required: true,
  },
  Disponibilite: {
    type: Boolean,
    required: true,
  },
  personnelTunisieCatering: {
    type: String
  },
  image: {
    type: String,
    required: false,
  },
  quantite: {
    type: Number,
    required: true,
  },
});
module.exports = mongoose.model("Plat", PlatSchema);