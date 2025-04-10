const mongoose=require('mongoose');
const userSchema = require("./User").schema;

const PersonnelTunDirCateringSchema = new mongoose.Schema({
  ...userSchema.obj,
  Matricule: {
    type: String,
    match: /^[A-Za-z0-9]{5}$/,
    required: true,
    unique: true,
  },
});
module.exports = mongoose.model(
  "PersonnelTunDirCatering",
  PersonnelTunDirCateringSchema
);