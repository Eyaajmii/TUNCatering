const mongoose=require('mongoose');

const commandeSchema = new mongoose.Schema({
  NombreCommande: {
    type: Number,
    required: true,
    default: 1,
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
    required: function () {
      return !this.MatriculeResTun;
    },
  }, //a partir de pn on prend le numvol et nomvol
  MatriculeResTun: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ResponsableTunDirCatering",
    required: function () {
      return !this.MatriculePn;
    },
  },
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