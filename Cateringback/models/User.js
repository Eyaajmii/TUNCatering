const mongoose = require('mongoose');
const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: false,
      match: /.+\@.+\..+/,
    },
    password: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      unique: true,
      required: true,
    },
    nom: { type: String, required: false },
    prenom: { type: String, required: false },
    telephone: {
      type: String,
      required: false,
      match: /^[0-9]{8}$/,
    },
    token:{
      type:String,
      required:false
    },
  },
  {
    timestamps: true,
  }
);
module.exports = mongoose.model('User', userSchema);