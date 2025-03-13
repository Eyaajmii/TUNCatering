const mongoose=require('mongoose');
const userSchema = require("./User").schema;

const responsableTunDirCateringSchema = new mongoose.Schema({
  ...userSchema.obj,
  Matricule:{
    type:String,
    required:true,
    unique:true
  }
});
module.exports = mongoose.model(
  "ResponsableTunDirCatering",
  responsableTunDirCateringSchema
);