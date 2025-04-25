const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer();
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

  router.get("/vol/:numVol", CommandeController.getCommandesByNumVol);

  router.get("/Orders", authenticateToken ,async (req, res) => {
    try {
      const  MatriculePn  = req.user.Matricule;
      const orders = await CommandeController.getMyOrders(MatriculePn);
      res.status(200).json(orders);
    } catch (err) {
      res.status(500).send(err.message);
    }
  });
  router.post("/addCommandeAffrete", authenticateToken,upload.none(), async (req, res) => {
    try {
      const numvol = parseInt(req.body.numVol);
      const { nom,nbrCmd } = req.body;
      const MatriculeDirTunCater = req.user.Matricule;
      const newcommande = await CommandeController.RequestCommande(
        numvol,
        nom,
        MatriculeDirTunCater,
        nbrCmd,
        
      );
      res.status(200).json(newcommande);
    } catch (err) {
      res.status(500).send(err.message);
    }
  });
  router.post("/addCommandeMenu", authenticateToken,upload.none(), async (req, res) => {
    try {
      const numVol = parseInt(req.body.numVol);
      const { nom } = req.body;
       const MatriculePn = req.user.Matricule;
      const newcommande = await CommandeController.RequestCommandeMenu(
        numVol,
        nom,
        MatriculePn,
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
  router.post("/addCommandePlat", authenticateToken,upload.none(), async (req, res) => {
    try {
      const numVol = parseInt(req.body.numVol);
      const {
        nomEntree,
        nomPlatPrincipal,
        nomDessert,
        nomBoissons,
        nomsPetitdejuner,
        MatriculeDirTunCater,
      } = req.body;
       const MatriculePn = req.user.Matricule;
      const newCommande = await CommandeController.RequestCommandeMeal(
        numVol,
        nomEntree,
        nomPlatPrincipal,
        nomDessert,
        nomBoissons,
        nomsPetitdejuner,
        MatriculePn,
        MatriculeDirTunCater
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
      const total = await CommandeController.getTotalCommandes();
      res.status(200).json(total);
    } catch (err) {
      res.status(500).send(err.message);
    }
  });

  router.get("/:id", async (req, res) => {
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

      // Broadcast
      broadcastOrderStatusUpdate({
        _id: req.params.id,
        statut: Statut,
        updatedAt: new Date(),
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

  router.delete("/:id", async (req, res) => {
    try {
      await CommandeController.deleteCommande(req.params.id);
      res.status(200).send("Commande deleted successfully");
    } catch (err) {
      res.status(500).send(err.message);
    }
  });

  return router;
};
