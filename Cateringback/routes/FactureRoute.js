const express = require("express");
const router = express.Router();
const facturecontroller=require("../controllers/FactureController");

module.exports=function(broadcastNewFacture,broadcastFactureStatusUpdate){
router.post("/addFacture",async(req,res)=>{
    try{
        const facture = await facturecontroller.creerFacture();
        broadcastNewFacture({
          ...facture._doc,
          type: "Facture",
          items: [{ facture, quantite: 1 }],
        });
        res.status(200).json(facture);
    }catch(err){
        res.status(400).json({message:err.message});
    }
})
router.get("/tousfactures",async(req,res)=>{
    try{
        const factures = await facturecontroller.TousLesFacture();
        res.status(200).json(factures);
    }catch(err){
        res.status(400).json({message:err.message});
    }
})
router.put("/updateStatusFacture/:id",async(req,res)=>{
    try{
        const {Statut}=req.body;
        const update = await facturecontroller.updateFactureStatus(
          req.params.id,
          Statut.toLowerCase()
        );
        broadcastFactureStatusUpdate({
          _id: req.params.id,
          statut: Statut,
          updatedAt: new Date(),
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
router.put("/Annuler/:id", async (req, res) => {
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