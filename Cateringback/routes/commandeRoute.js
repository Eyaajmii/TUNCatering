const express = require("express");
const router = express.Router();
const user=require("../models/User");
const pn=require("../models/PersonnelTunisairModel");
const CommandeController = require("../controllers/commandeController");
const { authenticateToken } = require("../middlware/auth");
const notification = require("../models/NotificationModel");

module.exports = function (broadcastNewOrder, broadcastOrderStatusUpdate) {
  router.get("/", authenticateToken,async (req, res) => {
    try {
      const commandes = await CommandeController.getAllCommands();
      res.status(200).json(commandes);
    } catch (err) {
      res.status(500).send(err.message);
    }
  });
  router.get("/vol/:idVol", async (req, res) => {
    try {
      const { idVol } = req.params;
      const commandes = await CommandeController.getCommandesByNumVol(idVol);
      res.status(200).json({ success: true, data: commandes });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  });

  router.get("/Orders", authenticateToken, async (req, res) => {
    try {
      const Matricule = req.user.Matricule;
      const orders = await CommandeController.getMyOrders(Matricule);
      res.status(200).json(orders);
    } catch (err) {
      res.status(500).send(err.message);
    }
  });
  router.post("/addCommandeMenu", authenticateToken,async (req, res) => {
    try {
      //const numVol = parseInt(req.body.numVol);
      const { nom, numVol } = req.body;
      const Matricule = req.user.Matricule;
      const newcommande = await CommandeController.RequestCommandeMenu(
        numVol,
        nom,
        Matricule
      );
      const notifcreer = await notification.create({
        message: `Nouvelle commande créée par${Matricule} pour le vol ${numVol}`,
        emetteur: Matricule,
        destinataire: "tunisie_catering",
        notificationType: "new_order",
      });
     global.io.to("tunisie_catering").emit("newNotification", {
        ...notifcreer._doc,
        destinataire: "tunisie_catering",
      });
      broadcastNewOrder({
        ...notifcreer._doc,
        destinataire: "tunisie_catering",
        type: "Commande",
        items: [{ newcommande, quantite: 1 }],
      });

      res.status(200).json(newcommande);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  router.post("/addCommandePlat", authenticateToken ,async (req, res) => {
    try {
      const {
        numVol,
        nomEntree,
        nomPlatPrincipal,
        nomDessert,
        nomBoissons,
        nomsPetitdejuner,
      } = req.body;
      const Matricule = req.user.Matricule;
      const newCommande = await CommandeController.RequestCommandeMeal(
        numVol,
        nomEntree,
        nomPlatPrincipal,
        nomDessert,
        nomBoissons,
        nomsPetitdejuner,
        Matricule
      );
      // Send notification
      const notifcreer = await notification.create({
        message: `Nouvelle commande créée pour${Matricule} le vol ${numVol}`,
        emetteur: Matricule,
        destinataire: "tunisie_catering",
        notificationType: "new_order",
      });
      global.io.to("tunisie_catering").emit("newNotification", {
        ...notifcreer._doc,
        destinataire: "tunisie_catering",
      });
      broadcastNewOrder({
        ...notifcreer._doc,
        destinataire: "tunisie_catering",
      });
      res.status(200).json(newCommande);
    } catch (err) {
      res.status(500).send(err.message);
    }
  });

  router.get("/total", async (req, res) => {
    try {
      const total = await CommandeController.getTotalCommand();
      res.status(200).json(total);
    } catch (err) {
      res.status(500).send(err.message);
    }
  });

  router.get("/Commande/:id", async (req, res) => {
    try {
      const commande = await CommandeController.getCommandByID(req.params.id);
      res.status(200).json(commande);
    } catch (error) {
      if (error.message === "commande not found") {
        res.status(404).send(error.message);
      } else {
        res.status(500).send(error.message);
      }
    }
  });

  router.put("/updateStatut/:id", authenticateToken, async (req, res) => {
    try {
      const { Statut } = req.body;

      if (!Statut) {
        return res.status(400).send("Le champ 'Statut' est requis");
      }

      const updateCommande = await CommandeController.updateCommandeStatus(
        req.params.id,
        Statut.toLowerCase()
      );
      const User = await pn.findOne({ Matricule: updateCommande.Matricule });
      const userId = User.userId.toString();
      const notifcreer = await notification.create({
        message: `Statut de la commande par ${updateCommande.Matricule} mis à jour en ${Statut}`,
        emetteur: "tunisie_catering",
        destinataire: userId,
        notificationType: "update_status",
      });
       
      /*global.io.to(userId).emit("newNotification", {
        ...notifcreer._doc,
        destinataire: userId,
      });*/
      // Broadcast
      broadcastOrderStatusUpdate({
        ...notifcreer._doc,
        destinataire: userId,
        commandeId: updateCommande._id,
        Statut: updateCommande.Statut,
      });

      res.status(200).json(updateCommande);
    } catch (err) {
      if (err.message === "Commande not found") {
        res.status(404).send(err.message);
      } else {
        console.error("Erreur de mise à jour:", err);
        res.status(500).send(err.message);
      }
    }
  });
  router.put("/annulationVol/:id", authenticateToken, async (req, res) => {
    try {
      const cmdAnnule = await CommandeController.annulationCommandeVol(
        req.params.id
      );
      const User = await pn.findOne({ Matricule: cmdAnnule.Matricule });
      const userId = User.userId.toString();
      const notifcreer = await notification.create({
        message: `Annulation du vol :Commande de ${cmdAnnule.Matricule} a été annulée`,
        emetteur: "Direction_Catering_Tunisair",
        destinataire: userId,
        notificationType: "update_status",
      });

      /*global.io.to(userId).emit("newNotification", {
        ...notifcreer._doc,
        destinataire: userId,
      });*/
      // Broadcast
      broadcastOrderStatusUpdate({
        ...notifcreer._doc,
        destinataire: userId,
        commandeId: cmdAnnule._id,
        Statut: cmdAnnule.Statut,
      });
      res.status(200).json(cmdAnnule);
    } catch (err) {
      res.status(500).send(err.message);
    }
  });
  router.put("/ModifierMaCommande/:id", authenticateToken, async (req, res) => {
    try {
      const updatcmd = await CommandeController.updateCommande(
        req.params.id,
        req.body
      );
      res.status(200).json(updatcmd);
    } catch (err) {
      res.status(500).send(err.message);
    }
  });
  router.put("/:id",async(req,res)=>{
    try{
      const annulCmsd = await CommandeController.annulCmd(req.params.id);
      res.status(200).json(annulCmsd);
    }catch(err){
      res.status(500).send(err.message);
    }
  });
  return router;
};
