const mongoose = require("mongoose");
const validStatuses = [
  "en attente",
  "annulé",
  "Confirmé"
];
const FactureSchema = new mongoose.Schema(
  {
    numeroFacture: {
      type: String,
      required: true,
      unique: true,
    },
    Preleve: {
      type: Boolean,
      default: false,
    },
    DateFacture: {
      type: Date,
      required: true,
      default: Date.now,
    },
    Statut: {
      type: String,
      enum: ["en attente", "annulé", "confirmé"],
      default: "en attente",
    },
    BonsLivraison: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "BonLivraison",
      },
    ],
    montantTotal: {
      type: Number,
      default: 0,
    },
    montantParVol: [
      {
        vol: {
          type: String,
        },
        montant: Number,
      },
    ],
    montantParPn: [
      {
        personnel: {
          type: String,
        },
        montant: Number,
      },
    ],
    DureeFacture: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

module.exports = mongoose.model("Facture", FactureSchema);
