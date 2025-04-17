const mongoose = require("mongoose");
const userSchema = require("./User").schema;

const adminTunCateringSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});
module.exports = mongoose.model(
  "AdminTunCatering",
  
  adminTunCateringSchema
);
