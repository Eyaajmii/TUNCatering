const mongoose=require('mongoose');

const commandeSchema = new mongoose.Schema({
  NombreCommande: {
    type: Number,
    required: true,
    default: 1,
  },
  dateCommnade:{
    type:Date,
    default:Date.now
  },
  Statut: {
    type: String,
    enum: [
      "En attente",
      "En cours de préparation",
      "Traité",
      "Annulé",
      "En retard",
      "Livré",
    ],
    default: "En attente",
  },
  MatriculePn: {
    //si le pn passe commande
    type: mongoose.Schema.Types.ObjectId,
    ref: "personnelnavigant",
    default:null
  }, //si dir catering passe commande
  MatriculeResTun: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ResponsableTunDirCatering",
    default:null
  },
  vol: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "vol",
    required:true,    
  },
  menu:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Menu",
  },
  plats:[{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Meal",
  }],
});
module.exports = mongoose.model("Commande", commandeSchema);