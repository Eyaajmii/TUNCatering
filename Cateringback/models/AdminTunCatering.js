const mongoose = require("mongoose");
const userSchema = require("./User").schema;

const adminTunCateringSchema = new mongoose.Schema({
  ...userSchema.obj,
});
module.exports = mongoose.model(
  "AdminTunCatering",
  
  adminTunCateringSchema
);
