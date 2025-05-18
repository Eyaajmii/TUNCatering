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
    dateCreation: {
      type: Date,
      default: Date.now,
    },
    DateFacture: {
      type: Date,
      required: true,
    },
    Statut: {
      type: String,
      enum: ["en attente", "annulé", "confirmé"],
      default: "en attente",
    },
    BonsLivraison: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "bonLivraison",
      },
    ],
    montantTotal: {
      type: Number,
      default: 0,
    },
    montantParVol: [
      {
        vol: {
          type:String,
        },
        montant: Number,
      },
    ],
    montantParPn: [
      {
        personnel: {
          type:String
        },
        montant: Number,
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

module.exports = mongoose.model("Facture", FactureSchema);
