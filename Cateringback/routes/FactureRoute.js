const express = require("express");
const router = express.Router();
const facturecontroller=require("../controllers/FactureController");
const notification = require("../models/NotificationModel");
const { authenticateToken } = require("../middlware/auth");

module.exports=function(broadcastNewFacture,broadcastFactureStatusUpdate){
router.post("/addFacture",authenticateToken,async(req,res)=>{
    try{
      const month = parseInt(req.query.month);
      const year = parseInt(req.query.year) || new Date().getFullYear();
        const facture = await facturecontroller.creerFacture(month, year);
        const notifcreer = await notification.create({
          message: `Nouvelle facture créée`,
          emetteur: "tunisie_catering",
          destinataire: "Direction_Catering_Tunisair",
          notificationType: "new_facture",
        });
        /*global.io.to("Direction_Catering_Tunisair").emit("newNotification", {
          ...notifcreer._doc,
          destinataire: "Direction_Catering_Tunisair",
        });*/
        broadcastNewFacture({
          ...facture._doc,
          ...notifcreer._doc,
          type: "Facture",
          items: [{ facture, quantite: 1 }],
          destinataire: "Direction_Catering_Tunisair",
        });
        res.status(200).json(facture);
    }catch(err){
        res.status(400).json({message:err.message});
    }
})
router.get("/tousfactures", authenticateToken, async (req, res) => {
  try {
    const factures = await facturecontroller.TousLesFacture();
    res.status(200).json(factures);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});
router.get("/factureDetail/:id", async (req, res) => {
  try {
    const factures = await facturecontroller.consulterDetailFacture(req.params.id);
    res.status(200).json(factures);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});
router.put("/updateStatusFacture/:id",authenticateToken,async(req,res)=>{
    try{
        const {Statut}=req.body;
        const update = await facturecontroller.updateFactureStatus(
          req.params.id,
          Statut.toLowerCase()
        );
        const notifcreer = await notification.create({
          message: `Facture bien mise a jour `,
          emetteur: "Direction_Catering_Tunisair",
          destinataire: "tunisie_catering",
          notificationType: "status_update_facture",
        });
        /*global.io.to("tunisie_catering").emit("newNotification", {
          ...notifcreer._doc,
          destinataire: "tunisie_catering",
        });*/
        broadcastFactureStatusUpdate({
          ...update._doc,
          _id: req.params.id,
          ...notifcreer._doc,
          Statut: Statut,
          destinataire: "tunisie_catering",
        });
        res.status(200).json(update);
    }catch(err){
        if (err.message === "facture not found") {
          res.status(404).send(err.message);
        } else {
          console.error("Erreur de mise à jour:", err);
          res.status(500).send(err.message);
        }
    }
});
router.put("/Annuler/:id", authenticateToken, async (req, res) => {
  try {
    const update = await facturecontroller.AnnulerFacture(req.params.id);
    res.status(200).json(update);
  } catch (err) {
    if (err.message === "facture not found") {
      return res.status(404).send("Facture introuvable.");
    }
    if (
      err.message === "Seules les factures en attente peuvent être annulées"
    ) {
      return res.status(400).send(err.message);
    }
    console.error("Erreur interne:", err);
    res.status(500).send("Erreur interne du serveur.");
  }
});

return router;
}