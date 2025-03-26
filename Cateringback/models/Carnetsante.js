const mongoose=require('mongoose');

const CarnetsanteSchema = new mongoose.Schema({
  MatriculePn: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "personnelnavigant",
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