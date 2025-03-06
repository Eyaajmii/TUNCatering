const mongoose = require("mongoose");
const User = require("./User"); // Importer le modèle

const personnelNavigantSchema = new mongoose.Schema({
  ...User.schema.obj, // Extraire le schéma à partir du modèle
  Matricule: {
    type: String,
    required: true,
    match: /^\d{5}$/, 
    unique: true
  },
  TypePersonnel: {
    type: String,
    enum: ["Technique", "Commercial", "Stagiaire"],
    default: "Commercial"
  }
});

module.exports = mongoose.model("PersonnelNavigant", personnelNavigantSchema);
