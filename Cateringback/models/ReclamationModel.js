const mongoose = require("mongoose");
const ReclamationSchema = new mongoose.Schema({
  /*NumeroReclamation: {
    type: String,
    required: true,
    unique: true,
  },*/
  dateSoumission: {
    type: Date,
    default: Date.now,
  },
  Objet: {
    type: String,
    required: true,
  },
  MessageEnvoye: {
    type: String,
    required: true,
  },
  MessageReponse: {
    type: String,
  },
  Statut: {
    type: String,
    enum: ["en attente", "traité", "annulée"],
    default: "En attente",
  },
  imageUrl: {
    type: String,
    default: "",
  },
  image: {
    type: String,
    required: false,
  },
  MatriculePn: {
    type: String,
  },
  MatriculeDirTunCater: {
    type: String,
  },
});
module.exports = mongoose.model(
  "Reclamation",
  ReclamationSchema
);