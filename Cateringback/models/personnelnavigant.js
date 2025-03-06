const mongoose = require("mongoose");
const userSchema=require("./User");
const personnelNavigantSchema = new mongoose.Schema({
  ...userSchema.obj,
  Matricule: {
    type: String,
    required: true,
    match: /^\d{5}$/,
    unique: true,
  },
  TypePersonnel: {
    type: String,
    enum: ["Technique", "Commercial", "Stagiaire"],
    default: "Commercial",
  },
});
module.exports = mongoose.model("personnelnavigant", personnelNavigantSchema);
