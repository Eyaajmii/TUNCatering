const express = require("express");
const router = express.Router();
const prelevementcontroller=require("../controllers/PrelevementController");
const { authenticateToken } = require("../middlware/auth");

router.post("/creer",async(req,res)=>{
    try{
        const {dateDebut,dateFin}=req.body;
        if (!dateDebut || !dateFin) {
            return res.status(400).json({ message: "dateDebut et dateFin sont requis." });
        }
        const prelevement = await prelevementcontroller.creerPrelevement(dateDebut,dateFin);
        return res.status(201).json(prelevement);
    }catch(err){
        res.status(500).json({message:err.message});
    }
})
router.get("/tousPrelvement",async(req,res)=>{
    try{
        const prelevements = await prelevementcontroller.tousPrelevement();
        return res.status(200).json(prelevements);
    }catch(err){
        res.status(500).json({message: err.message});
    }
})
router.put("/annule/:id",async(req,res)=>{
    try {
      await prelevementcontroller.AnnulerPrelevement(req.params.id);
      res.status(200).json({ message: "Prélèvement annulé avec succès." });
    }catch (err) {
      if (err.message === "Prélevement not found") {
        return res.status(404).send("Prélevement introuvable.");
      }
      console.error("Erreur interne:", err);
      res.status(500).send("Erreur interne du serveur.");
    }
})
router.get("/MesPrelevement",authenticateToken,async(req,res)=>{
    try{
        const Matricule = req.user.Matricule;
        const preleve = await prelevementcontroller.MesPrelevement(Matricule);
        res.status(200).json(preleve);
    }catch(err){
      if (err.message === "Prélevement not found") {
        return res.status(404).send("Prélevement introuvable.");
      }
      console.error("Erreur interne:", err);
      res.status(500).send("Erreur interne du serveur.");
    }
})
router.get("/detail/:id", authenticateToken, async (req, res) => {
  try {
    const detail = await prelevementcontroller.detailPrelevement(req.params.id);
    res.status(200).json(detail);
  } catch (err) {
    console.error("Erreur dans /detail/:id", err);
    res.status(500).json({ message: err.message });
  }
});

module.exports=router;