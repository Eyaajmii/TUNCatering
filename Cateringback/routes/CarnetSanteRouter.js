const express = require("express");
const router = express.Router();
const CarnetSanteController=require("../controllers/CarnetSanteController");
const { authenticateToken } = require("../middlware/auth");

router.post("/addCarnet", authenticateToken, async (req, res) => {
  try {
    const {Allergies, Maladie, Medicaments, Commentaires } =req.body;
    const MatriculePn=req.user.Matricule;
    const CarnetNouveau = await CarnetSanteController.creerCarnet(
      MatriculePn,
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
router.get("/Carnet",async(req,res)=>{
    try{
        const carnet = await CarnetSanteController.getCarnet();
        res.status(200).json({message:"Carnet récupéré avec succès",carnet});
    }catch(err){
        console.log(err);
    }
})
router.put('/updateCarnet/:id',async(req,res)=>{
    try{
        const carnetUpdate = await CarnetSanteController.modifCarnet(
          req.params.id,
          req.body
        );
        res.status(200).json({message:"Carnet modifié avec succès",carnetUpdate});
    }catch(err){
        res.status(500).json({message:"Erreur lors de la modification du carnet",err});
    }
})
router.delete("/:id",async(req,res)=>{
  try{
        const carnet = await CarnetSanteController.supprimerCarnet(req.params.id);
        res.status(200).json({ message: "Carnet modifié avec succès", carnet });
    }catch(err){
        res.status(500).json({message:"Erreur lors de la modification du carnet",err});
    }
})
module.exports=router;