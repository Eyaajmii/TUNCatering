const mongoose = require("mongoose");
const userSchema = require("./User").schema;

const PersonnelTunisieSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});
module.exports = mongoose.model(
  "PersonnelTunisieCatering",
  PersonnelTunisieSchema
);
