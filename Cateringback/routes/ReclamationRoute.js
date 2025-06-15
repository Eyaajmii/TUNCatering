const express = require("express");
const router = express.Router();
const reclamation=require("../models/ReclamationModel");
const notification=require("../models/NotificationModel");
const user = require("../models/User");
const pn = require("../models/PersonnelTunisairModel");
const commande=require("../models/Commande");
const reclamationController=require("../controllers/ReclamationController");
const { authenticateToken } = require("../middlware/auth");
const upload = require("../middlware/upload");

module.exports=function(broadcastNewReclamation,broadcastReclamationStatusUpdate){
router.post("/creerReclamation", authenticateToken,upload.single("imageUrl"),async(req,res)=> {
  try {
    const Matricule = req.user.Matricule;
    const randomPart=Math.floor(Math.random()*1000).toString().padStart(3,'0');
    const NumeroReclamation = `REC-${randomPart}`;
    const { Objet, MessageEnvoye, numeroCommande } = req.body;
    const cmd = await commande.findOne({ numeroCommande: numeroCommande ,Matricule:Matricule});
    if (!cmd) {
      return res.status(404).json({ message: "Commande non trouvée ou ne vous appartient pas." });
    }
    const now = new Date();
    const diffInDays = (now - new Date(cmd.dateCommnade)) / (1000 * 60 * 60 * 24);
    if (diffInDays > 5) {
      return res.status(400).json({ message: "La réclamation ne peut pas être soumise après 5 jours de la commande." });
    }
    const reclamationExistante = await reclamation.findOne({
      Commande: numeroCommande,
      MatriculePn: Matricule,
    });

    if (reclamationExistante) {
      return res.status(400).json({message: "Réclamation déjà existante pour cette commande.",
        });
    }
    const newReclamation = await reclamation.create({
      NumeroReclamation,
      Objet,
      MessageEnvoye,
      MessageReponse: null,
      MatriculePn: Matricule,
      MatriculeDirTunCater: null,
      dateSoumission: Date.now(),
      Statut: "en attente",
      imageUrl: req.file ? req.file.filename : null,
      Commande: numeroCommande,
    });
    const notifcreer = await notification.create({
      message: `Nouvelle réclamation créée pour le personnel navigant ${Matricule}`,
      emetteur: Matricule,
      destinataire: "Direction_Catering_Tunisair",
      notificationType: "new_reclamation",
    });
    global.io.to("Direction_Catering_Tunisair").emit("newNotification", {
      ...notifcreer._doc,
      destinataire: "Direction_Catering_Tunisair",
    });
    broadcastNewReclamation({
      ...newReclamation._doc,
      destinataire: "Direction_Catering_Tunisair",
      type: "Reclamation",
      items: [{ newReclamation, quantite: 1 }],
    });
    res.status(200).json(newReclamation);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});
router.get("/reclamation",authenticateToken,async(req,res)=>{
    try{
        const Matricule = req.user.Matricule;
        const reclamations = await reclamationController.MesReclamations(Matricule);
        res.status(200).json({ reclamations });
    }catch(err){
        res.status(500).json({message:err.message});
    }
});
router.get("/reclamation/detail/:id",async (req,res)=>{
    try{
        const reclamation = await reclamationController.detailReclamation(req.params.id);
        res.status(200).json(reclamation);
    }catch(err){
        res.status(500).json({message:err.message});
    }
});

router.put("/repondre/:id", authenticateToken, async (req, res) => {
  try {
    const {MessageReponse } = req.body;
    const MatriculeDirTunCater = req.user.Matricule;
    const rec = await reclamation.findById(req.params.id);
    const reponse = await reclamationController.reponseReclamation(
      req.params.id,
      MessageReponse,
      MatriculeDirTunCater
    );
    const User = await pn.findOne({ Matricule: rec.MatriculePn });
    const userId = User.userId.toString();
    const notifcreer = await notification.create({
      message: `Statut de la réclamation mis à jour en traitée`,
      emetteur: MatriculeDirTunCater,
      destinataire: userId,
      notificationType: "update_reclamation",
    });
    /*global.io.to(userId).emit("newNotification", {
      ...notifcreer._doc,
      destinataire: userId,
    });*/
    broadcastReclamationStatusUpdate({
      ...notifcreer._doc,
      ...reponse._doc,
      Statut: "traitée",
      MessageReponse: MessageReponse,
      destinataire: userId,
    });
    res.status(200).json({ message: "Reponse envoyee avec succes", reponse });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
router.get('/reclamations',async(req,res)=>{
    try{
        const reclamations = await reclamationController.TousReclamations();
        res.status(200).json({ reclamations });
    }catch(err){
        res.status(500).json({message:err.message});
    }
})
router.put("/annuler/:id", async (req, res) => {
  try {
    const rec = await reclamationController.AnnuleReclamation(req.params.id);
    res.status(200).json(rec);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
router.put("/modifier/:id",async(req,res)=>{
  try{
    const rec=await reclamationController.ModifReclamation(req.params.id,req.body);
    res.status(200).json(rec);
  }catch(err){
    res.status(400).json({ error: err.message });
  }
})
return router;
}

