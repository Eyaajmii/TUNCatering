const express = require("express");
const router = express.Router();
const user=require("../models/User");
const personnelTunisair=require("../models/PersonnelTunisairModel");
const CommandeController = require("../controllers/commandeController");
const { authenticateToken } = require("../middlware/auth");

module.exports = function (broadcastNewOrder, broadcastOrderStatusUpdate) {
  router.get("/", async (req, res) => {
    try {
      const commandes = await CommandeController.getAllCommands();
      res.status(200).json(commandes);
    } catch (err) {
      res.status(500).send(err.message);
    }
  });
  router.get("/vol/:numVol", async (req, res) => {
    try {
      const { numVol } = req.params;
      const commandes = await CommandeController.getCommandesByNumVol(numVol);
      res.status(200).json({ success: true, data: commandes });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  });

  router.get("/vol/:numVol", CommandeController.getCommandesByNumVol);//a supprimé apres verification avec wajih

  router.get("/Orders", authenticateToken ,async (req, res) => {
    try {
      const username = req.user.username;
      const User = await user.findOne({ username: username });
      const pn = await personnelTunisair.findOne({ userId: User._id });
      if (!pn) return res.status(404).json({ message: "Matricule non trouvé" });
      const Matricule = pn.Matricule;
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
      const username = req.user.username;
      const User = await user.findOne({ username: username });
      const pn = await personnelTunisair.findOne({ userId: User._id });
      if (!pn) return res.status(404).json({ message: "Matricule non trouvé" });
      const Matricule = pn.Matricule;
      const newcommande = await CommandeController.RequestCommandeMenu(
        numVol,
        nom,
        Matricule
      );
      broadcastNewOrder({
        ...newcommande._doc,
        type: "menu",
        items: [{ nom, quantite: 1 }],
      });

      res.status(200).json(newcommande);
    } catch (error) {
      res.status(500).send(error.message);
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
        nomsPetitdejuner
      } = req.body;
      const username = req.user.username;
      const User = await user.findOne({ username: username });
      const pn = await personnelTunisair.findOne({ userId: User._id });
      if (!pn) return res.status(404).json({ message: "Matricule non trouvé" });
      const Matricule = pn.Matricule;
      const newCommande = await CommandeController.RequestCommandeMeal(
        numVol,
        nomEntree,
        nomPlatPrincipal,
        nomDessert,
        nomBoissons,
        nomsPetitdejuner,
        Matricule
      );

      // Broadcast new order to all connected admin clients
      broadcastNewOrder({
        ...newCommande._doc,
        type: "plat",
        items: [
          { nom: nomEntree, quantite: 1 },
          { nom: nomPlatPrincipal, quantite: 1 },
          { nom: nomDessert, quantite: 1 },
          { nom: nomBoissons, quantite: 1 },
        ].filter((item) => item.nom),
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

  router.put("/updateStatut/:id", async (req, res) => {
    try {
      const { Statut } = req.body; 

      if (!Statut) {
        return res.status(400).send("Le champ 'Statut' est requis");
      }

      const updateCommande = await CommandeController.updateCommandeStatus(
        req.params.id,
        Statut.toLowerCase() 
      );
      const destinataireNotification = updateCommande ? updateCommande.Matricule: null;
      if (!destinataireNotification) {
        console.error(`[CommandeRoute /updateStatut/:id] ERREUR: updateCommande.Matricule (créateur de la commande ${req.params.id}) est indéfini ou la réponse du contrôleur est invalide. La notification de mise à jour ne sera pas ciblée.`);
      }
      // Broadcast
      broadcastOrderStatusUpdate({
        _id: req.params.id,
        statut: Statut,
        updatedAt: new Date(),
        destinataire: destinataireNotification,
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
  router.put("/ModifierMaCommande/:id",async(req,res)=>{
    try{
      const updatcmd = await CommandeController.updateCommande(req.params.id,req.body);
      res.status(200).json(updatcmd);
    }catch(err){
      res.status(500).send(err.message);
    }
  })
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
