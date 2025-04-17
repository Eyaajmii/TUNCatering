const mongoose = require("mongoose");
const User = require("./User"); 
const personnelnavigantSchema = new mongoose.Schema(
  {
    userId:{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    
    Matricule: {
      type: String,
      required: true,
      match: /^\d{5}$/,
      unique: true,
    },
    TypePersonnel: {
      type: String,
      enum: ["Technique", "Commercial", "Stagiaire", "Chef de cabine"],
      default: "Commercial",
    },
  },
  {
    timestamps: true,
  }
);
module.exports = mongoose.model("personnelnavigant", personnelnavigantSchema);
