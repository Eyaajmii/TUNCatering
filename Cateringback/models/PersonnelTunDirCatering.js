const mongoose=require('mongoose');
const PersonnelTunDirCateringSchema = new mongoose.Schema({
  PersonnelTunisiarId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "PersonnelTunisair",
    required: true,
  },
});
module.exports = mongoose.model(
  "PersonnelTunDirCatering",
  PersonnelTunDirCateringSchema
);