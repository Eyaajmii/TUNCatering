const mongoose=require('mongoose');

const CarnetsanteSchema = new mongoose.Schema({
  Matricule: {
    type: String,
    require: true,
  },
  Allergies: [
    {
      type: String,
    },
  ],
  Maladie: [
    {
      type: String,
    },
  ],
  Medicaments: [
    {
      type: String,
    },
  ],
  Commentaires: [
    {
      type: String,
    },
  ],
});
module.exports = mongoose.model("Carnetsante", CarnetsanteSchema);