const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

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
  },
  {
    timestamps: true,
  }
);

// Hacher le mot de passe avant de sauvegarder l'utilisateur
userSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});

// Méthode pour vérifier le mot de passe
userSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', userSchema);