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
        "Personnel Tunisair",
        "Personnel Tunisie Catering",
        "Administrateur",
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
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
userSchema.virtual("personneltunisair", {
  ref: "PersonnelTunisair",
  localField: "_id",
  foreignField: "userId",
  justOne: true,
});
module.exports = mongoose.model('User', userSchema);