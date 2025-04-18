const mongoose = require("mongoose");
const ReclamationSchema = new mongoose.Schema({
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
    enum: ["En attente", "traité"],
    default: "En attente",
  },
  imageUrl: {
    type: String,
    default: "",
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