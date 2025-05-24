const express = require("express");
const router = express.Router();
const reclamation=require("../models/ReclamationModel");
const notification=require("../models/NotificationModel");
const user = require("../models/User");
const personnelTunisair = require("../models/PersonnelTunisairModel");
const reclamationController=require("../controllers/ReclamationController");
const { authenticateToken } = require("../middlware/auth");
const upload = require("../middlware/upload");

module.exports=function(broadcastNewReclamation,broadcastReclamationStatusUpdate){
router.post("/creerReclamation", authenticateToken,upload.single("imageUrl"),async(req,res)=> {
  try {
    const Matricule = req.user.Matricule;
    const randomPart=Math.floor(Math.random()*1000).toString().padStart(3,'0');
    const NumeroReclamation = `REC-${randomPart}`;
    const { Objet, MessageEnvoye, imageUrl } = req.body;
    const newReclamation = await reclamation.create({
      NumeroReclamation,
      Objet,
      MessageEnvoye,
      MessageReponse: null,
      MatriculePn:Matricule,
      MatriculeDirTunCater: null,
      dateSoumission: Date.now(),
      Statut: "en attente",
      imageUrl: req.file ? req.file.filename : null,
    });

    const notifcreer = await notification.create({
      message: `Nouvelle réclamation créée pour le personnel navigant ${Matricule}`,
      user:Matricule,
      notificationType: "reclamation",
    });
    global.io.emit("newNotification", {
      _id: notifcreer._id,
      message: notifcreer.message,
      createdAt: notifcreer.createdAt,
      user: notifcreer.user,
      notificationType: notifcreer.notificationType,
    });
    broadcastNewReclamation({
      ...newReclamation._doc,
      type: "Reclamation",
      items: [{ newReclamation, quantite: 1 }],
      destinataire: Matricule,
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
        const reclamations = await reclamationController.MesReclamations(MatriculePn);
        res.status(200).json({ reclamations });
    }catch(err){
        res.status(500).json({message:err.message});
    }
});
router.get("/reclamation/detail/:id",async (req,res)=>{
    try{
        const reclamation = await reclamationController.detailReclamation(req.params.id);
        res.status(200).json({ reclamation });
    }catch(err){
        res.status(500).json({message:err.message});
    }
});

router.put("/repondre/:id", authenticateToken, async (req, res) => {
  try {
    const { newStatut, MessageReponse } = req.body;
    const Matricule = req.user.Matricule;
    const reponse = await reclamationController.reponseReclamation(
      req.params.id,
      newStatut,
      MessageReponse,
      MatriculeDirTunCater
    );
    broadcastReclamationStatusUpdate({
      _id: req.params.id,
      statut: newStatut,
      MessageReponse,
      MatriculeDirTunCater,
      updatedAt: new Date().toISOString(),
      destinataire: reponse.MatriculePn,
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

