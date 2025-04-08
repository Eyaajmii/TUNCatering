const express = require("express");
const router = express.Router();
const multer = require('multer');
const upload = multer();
const CommandeController = require("../controllers/commandeController");

module.exports = function(broadcastNewOrder, broadcastOrderStatusUpdate) {
  // Route pour obtenir toutes les commandes
  router.get('/vol/:numVol', async (req, res) => {
    try {
      const { numVol } = req.params;
      const commandes = await CommandeController.getCommandesByNumVol(numVol);
      res.status(200).json({ success: true, data: commandes });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  });
  
// Dans votre contrôleur
router.get('/vol/:numVol', CommandeController.getCommandesByNumVol);

  router.post("/addCommandeMenu", upload.none(), async (req, res) => {
    try {
      const numVol = parseInt(req.body.numVol);
      const { nom, MatriculeResTun, MatriculePn } = req.body;
      const newcommande = await CommandeController.RequestCommandeMenu(
        numVol,
        nom,
        MatriculePn,
        MatriculeResTun
      );
      
      // Broadcast new order to all connected admin clients
      broadcastNewOrder({
        ...newcommande._doc,
        type: 'menu',
        items: [{ nom, quantite: 1 }]
      });
      
      res.status(200).json(newcommande);
    } catch (error) {
      res.status(500).send(error.message);
    }
  });

  router.post("/addCommandePlat", upload.none(), async (req, res) => {
    try {
      const numVol = parseInt(req.body.numVol);
      const { nomEntree, nomPlatPrincipal, nomDessert, nomBoissons, nomPetitDejuner, MatriculeResTun, MatriculePn } = req.body;
      const newcommande = await CommandeController.RequestCommandeMeal(
        numVol,
        nomEntree,
        nomPlatPrincipal,
        nomDessert,
        nomBoissons,
        nomPetitDejuner,
        MatriculePn,
        MatriculeResTun
      );
      
      // Broadcast new order to all connected admin clients
      broadcastNewOrder({
        ...newcommande._doc,
        type: 'plat',
        items: [
          { nom: nomEntree, quantite: 1 },
          { nom: nomPlatPrincipal, quantite: 1 },
          { nom: nomDessert, quantite: 1 },
          { nom: nomBoissons, quantite: 1 },
          { nom: nomPetitDejuner, quantite: 1 }
        ].filter(item => item.nom)
      });
      
      res.status(200).json(newcommande);
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

  router.put('/updateStatut/:id', async (req, res) => {
    try {
      const { Statut } = req.body; // Notez la majuscule ici pour correspondre à votre requête
      
      if (!Statut) {
        return res.status(400).send("Le champ 'Statut' est requis");
      }
  
      const updateCommande = await CommandeController.updateCommandeStatus(
        req.params.id,
        Statut.toLowerCase() // Convertir en minuscule si nécessaire
      );
      
      // Broadcast
      broadcastOrderStatusUpdate({
        _id: req.params.id,
        statut: Statut,
        updatedAt: new Date()
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