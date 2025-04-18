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
      required: true,
    },
    nom: { type: String, required: false },
    prenom: { type: String, required: false },
    telephone: {
      type: String,
      required: false,
      match: /^[0-9]{8}$/,
    },
    role: {
      type: String,
      enum: [
        "Personnel navigant",
        "Personnel Tunisie Catering",
        "Personnel de Direction du Catering Tunisiar",
        "Personnel de Direction du Personnel Tunisiar",
        "Administrateur"
      ],
      required: true,
    },
    token: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);
module.exports = mongoose.model('User', userSchema);