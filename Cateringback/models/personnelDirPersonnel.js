const mongoose = require("mongoose");
const PersonnelTunDirPersonnelSchema = new mongoose.Schema({
  PersonnelTunisiarId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "PersonnelTunisair",
    required: true,
  },
});
module.exports = mongoose.model(
  "PersonnelTunDirPersonnel",
  PersonnelTunDirPersonnelSchema
);
