const express = require("express");
const router = express.Router();
const BonLivraison = require("../models/bonLivraison");
const { authenticateToken } = require("../middlware/auth");
module.exports = function (broadcastNewBonLivraison,broadcastBonLivraisonStatusUpdate) {
  const bonLivraisonController =require("../controllers/bonLivraisonController")(broadcastNewBonLivraison,broadcastBonLivraisonStatusUpdate);
  router.post("/add", bonLivraisonController.createBonLivraison); //pour tunisie catering
  router.get("/all", bonLivraisonController.getAllBonsLivraisons); //pour tunisie catering et tunisair
  router.get('/tousBons',authenticateToken,bonLivraisonController.consulterBonsParChef);
  router.get("/:id", bonLivraisonController.getBonLivraisonById);
  router.put("/:id/statut",authenticateToken,bonLivraisonController.updateStatutBonLivraison); //pour chef de cabine
  router.put("/modifier/:id",bonLivraisonController.updateBonLivraison); /*Ceci pour tunisie catering*/
  router.put("/annule/:id",bonLivraisonController.AnnulerBn); /*Ceci pour tunisie catering*/
  router.put("/scan/:id",authenticateToken,bonLivraisonController.scanBonLivraison); //pour chef de cabine
  router.get("/pdf/:numeroBon", async (req, res) => {
    /*Ceci pour tunisie catering*/
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
  return router;
};
