const mongoose = require("mongoose");
const personnelnavigantSchema = new mongoose.Schema(
  {
    PersonnelTunisiarId:{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PersonnelTunisair',
      required: true
    },
    TypePersonnel: {
      type: String,
      enum: ["Technique", "Commercial", "Stagiaire", "Chef de cabine","Affrété"],
      default: "Commercial",
    },
    Prelevement:{
      type:Number
    }
  },
  {
    timestamps: true,
  }
);
module.exports = mongoose.model("personnelnavigant", personnelnavigantSchema);
