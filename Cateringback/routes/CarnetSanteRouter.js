const express = require("express");
const router = express.Router();
const CarnetSanteController=require("../controllers/CarnetSanteController");
const user = require("../models/User");
const personnelTunisair = require("../models/PersonnelTunisairModel");
const { authenticateToken } = require("../middlware/auth");
router.post("/addCarnet", authenticateToken, async (req, res) => {
  try {
    const {Allergies, Maladie, Medicaments, Commentaires } =req.body;
    const username = req.user.username;
    const User = await user.findOne({ username: username });
    const pn = await personnelTunisair.findOne({ userId: User._id });
    if (!pn) return res.status(404).json({ message: "Matricule non trouvé" });
    const Matricule = pn.Matricule;
    const CarnetNouveau = await CarnetSanteController.creerCarnet(
      Matricule,
      Allergies,
      Maladie,
      Medicaments,
      Commentaires
    );
    res.status(201).json({ message: "Carnet ajouté avec succès", CarnetNouveau });
  } catch (err) {
    res.status(err.status || 500).json({
      message: err.message || "Erreur lors de l'ajout du carnet",
    });
  }
});
router.get("/Carnet", authenticateToken, async (req, res) => {
  try {
    const username = req.user.username;
    const User = await user.findOne({ username: username });
    const pn = await personnelTunisair.findOne({ userId: User._id });
    if (!pn) return res.status(404).json({ message: "Matricule non trouvé" });
    const Matricule = pn.Matricule;
    const carnet = await CarnetSanteController.getCarnet(Matricule);
    res.status(200).json({ message: "Carnet récupéré avec succès", carnet });
  } catch (err) {
    console.log(err);
  }
});
router.put("/updateCarnet", authenticateToken,async (req, res) => {
  try {
    const username = req.user.username;
    const User = await user.findOne({ username: username });
    const pn = await personnelTunisair.findOne({ userId: User._id });
    if (!pn) return res.status(404).json({ message: "Matricule non trouvé" });
    const Matricule = pn.Matricule;
    const carnetUpdate = await CarnetSanteController.modifCarnet(
      Matricule,
      req.body
    );
    res.status(200).json(carnetUpdate);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Erreur lors de la modification du carnet", err });
  }
});
router.delete("/supprimer", authenticateToken, async (req, res) => {
  try {
    const username = req.user.username;
    const User = await user.findOne({ username: username });
    const pn = await personnelTunisair.findOne({ userId: User._id });
    if (!pn) return res.status(404).json({ message: "Matricule non trouvé" });
    const Matricule = pn.Matricule;
    const carnet = await CarnetSanteController.supprimerCarnet(
      Matricule
    );
    res.status(200).json({ message: "Carnet modifié avec succès", carnet });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Erreur lors de la modification du carnet", err });
  }
});
module.exports=router;