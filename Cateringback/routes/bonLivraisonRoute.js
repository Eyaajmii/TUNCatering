const express = require("express");
const router = express.Router();
const bonLivraisonController = require("../controllers/bonLivraisonController");
const BonLivraison = require("../models/bonLivraison");
const path = require("path");
const fs = require("fs");

router.post("/add", bonLivraisonController.createBonLivraison);
router.get("/all", bonLivraisonController.getAllBonsLivraisons);
router.get("/:id", bonLivraisonController.getBonLivraisonById);
router.get("/vol/:volId", bonLivraisonController.getBonByVolId);
router.put("/:id/statut", bonLivraisonController.updateStatutBonLivraison);
router.get("/pdf/:numeroBon", async (req, res) => {
  try {
    const { numeroBon } = req.params;

    const bon = await BonLivraison.findOne({ numeroBon });

    if (!bon || !bon.pdfPath) {
      return res.status(404).json({
        success: false,
        message: "PDF non trouvé dans la base de données",
      });
    }

    const absolutePath = path.join(__dirname, "..", "public", bon.pdfPath);

    if (!fs.existsSync(absolutePath)) {
      return res.status(404).json({
        success: false,
        message: "Fichier PDF manquant sur le serveur",
      });
    }

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="bon_${numeroBon}.pdf"`
    );

    const fileStream = fs.createReadStream(absolutePath);
    fileStream.pipe(res);

    fileStream.on("error", (err) => {
      console.error("Erreur de stream:", err);
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          message: "Erreur lors de l'envoi du PDF",
        });
      }
    });
  } catch (error) {
    console.error("Erreur serveur:", error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur",
    });
  }
});
module.exports = router;
