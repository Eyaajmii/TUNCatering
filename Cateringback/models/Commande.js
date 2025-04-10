const mongoose = require('mongoose');

// Liste des statuts valides (version normalisée)
const validStatuses = [
  "en attente",
  "traité",
  "annulé",
  "en retard",
  "livré"
];

const commandeSchema = new mongoose.Schema({
  NombreCommande: {
    type: Number,
    required: true,
    default: 1,
  },
  dateCommnade: {
    type: Date,
    default: Date.now,
  },
  Statut: {
    type: String,
    validate: {
      validator: function (v) {
        // Validation insensible à la casse
        return validStatuses.includes(v.toLowerCase());
      },
      message: (props) => `${props.value} n'est pas un statut valide!`,
    },
    default: "en attente",
    set: (v) => v.toLowerCase(),
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
  vol: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "vol",
    required: true,
  },
  menu: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Menu",
  },
  plats: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Meal",
    },
  ],
});

// Méthode pour obtenir les statuts valides (peut être utilisée dans le frontend)
commandeSchema.statics.getValidStatuses = function() {
  return validStatuses;
};

module.exports = mongoose.model("Commande", commandeSchema);