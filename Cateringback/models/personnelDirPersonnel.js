const mongoose = require("mongoose");
const userSchema = require("./User").schema;

const PersonnelTunDirPersonnelSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  Matricule: {
    type: String,
    match: /^[A-Za-z0-9]{5}$/,
    required: true,
    unique: true,
  },
});
module.exports = mongoose.model(
  "PersonnelTunDirPersonnel",
  PersonnelTunDirPersonnelSchema
);
