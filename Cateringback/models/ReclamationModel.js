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
  MatriculePn: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "personnelnavigant",
    default: null,
  },
  MatriculeDirTunCater: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "PersonnelTunDirCatering",
    default: null,
  },
});
module.exports = mongoose.model(
  "Reclamation",
  ReclamationSchema
);