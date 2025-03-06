const mongoose = require('mongoose');
const userSchema=require('./User').schema;
const personnelnavigantSchema = new mongoose.Schema({
  ...userSchema.obj,
  Matricule: {
    type: String,
    required: true,
    match: /^\d{5}$/,
    unique: true,
  },
  TypePersonnel: {
    type: String,
    enum: ["Technique", "Commercial", "Stagiaire","Chef de cabine"],
    default: "Commercial",
  },
},
{
    timestamps: true,
}
);
module.exports = mongoose.model("personnelnavigant", personnelnavigantSchema);
