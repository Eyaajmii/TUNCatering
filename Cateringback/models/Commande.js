const mongoose=require('mongoose');

const commandeSchema = new mongoose.Schema({
  NombreCommande: {
    type: Number,
    required: true,
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
    type: mongoose.Schema.Types.ObjectId,
    ref: "personnelnavigant",
    required: true,
  }, //a partir de pn on prend le numvol et nomvol
  nomMenu: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Menu",
    required: true,
  },
  dateVolDep: {
    type: Date,
    required: true,
  },
  numVol: {
    type: Number,
    required: true,
  },
});
module.exports = mongoose.model("Commande", commandeSchema);