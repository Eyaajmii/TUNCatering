const mongoose = require("mongoose");
const ReclamationSchema = new mongoose.Schema(
  {
    NumeroReclamation: {
      type: String,
      required: true,
      unique: true,
    },
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
      enum: ["en attente", "traitée", "annulée"],
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
    Commande: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);
module.exports = mongoose.model(
  "Reclamation",
  ReclamationSchema
);