const mongoose=require('mongoose');

const menuSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: true,
  },
  /*Rotation: {
    type: String,
    enum: ["Matin", "Midi", "Soir"],
    required: true,
  },*/
  Disponible:{
    type:Boolean,
    default:true
  },
  PlatsPrincipaux: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Meal",
    },
  ],
  PlatsEntree: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Meal",
    },
  ],
  PlatsDessert: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Meal",
    },
  ],
  Boissons:[
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Meal"
    }
  ],
  PetitDejuner:[{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Meal"
  }],
  AdminTn: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "AdminTunCatering",
  },
  DateAjout:{
    type:Date,
    default:Date.now
  }
  
});
menuSchema.path("PlatsPrincipaux").validate(function(value){
    return value.length===1;
  },"Un seul plat principal doit etre ajouté");

  menuSchema.path("PlatsEntree").validate(function (value) {
    return value.length === 1;
  }, "Un seul plat entrée doit etre ajouté");

  menuSchema.path("PlatsDessert").validate(function (value) {
    return value.length === 1;
  }, "Un seul plat dessert doit etre ajouté");
  
module.exports = mongoose.model("Menu", menuSchema);
