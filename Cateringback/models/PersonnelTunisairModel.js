const mongoose = require("mongoose");
const PersonnelTunisairSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  Matricule: {
    type: String,
    required: true,
    match: /^\d{5}$/,
    unique: true,
  },
  roleTunisair: {
    type: String,
    enum: [
      "Personnel navigant",
      "Personnel de Direction du Catering Tunisiar",
      "Personnel de Direction du Personnel Tunisiar",
    ],
    required: true,
  },
});
module.exports = mongoose.model("PersonnelTunisair", PersonnelTunisairSchema);
