const mongoose=require('mongoose');
const userSchema = require("./User").schema;

const responsableTunDirCateringSchema = new mongoose.Schema({
  ...userSchema.obj,
});
module.exports = mongoose.model(
  "ResponsableTunDirCatering",
  responsableTunDirCateringSchema
);