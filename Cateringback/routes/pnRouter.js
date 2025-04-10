const express = require("express");
const router = express.Router();
const pnController=require("../controllers/pnController");

router.post("/add",async(req,res)=>{
    try{
        const{ email,password,username,nom,prenom,telephone,Matricule,TypePersonnel}=req.body;
        const newPn=await pnController.addPn(email,password,username,nom,prenom,telephone,Matricule,TypePersonnel);
        res.status(201).json({message:"Personnel ajouté avec succès",newPn});
    }catch(err){
        res.status(500).json({message:"Erreur lors de l'ajout du personnel",err});
    }
})
//personnel direction du catering tunisair
router.post("/addDirTun",async(req,res)=>{
    try {
        const{ email,password,username,nom,prenom,telephone,Matricule}=req.body;
        const newPn=await pnController.creatPnDirCatering(email,password,username,nom,prenom,telephone,Matricule);
        res.status(201).json({message:"Personnel ajouté avec succès",newPn});
    } catch (err) {
      res
        .status(500)
        .json({ message: "Erreur lors de l'ajout du personnel", err });
    }
})
router.post("/addCarnet",async(req,res)=>{
    try{
        const{MatriculePn,Allergies,Maladie,Medicaments,Commentaires}=req.body;
        const CarnetNouveau=await pnController.addCarnet(MatriculePn,Allergies,Maladie,Medicaments,Commentaires);
        res.status(201).json({ message: "Carnet ajouté avec succès",CarnetNouveau });
    }catch(err){
        res.status(500).json({message:"Erreur lors de l'ajout du carnet",err});
    }
})
router.get("/Carnet",async(req,res)=>{
    try{
        const carnet=await pnController.getCarnet();
        res.status(200).json({message:"Carnet récupéré avec succès",carnet});
    }catch(err){
        console.log(err);
    }
})
router.post('/updateCarnet/:id',async(req,res)=>{
    try{
        const carnetUpdate=await pnController.modifCarnet(
            req.params.id,
            req.body
        );
        res.status(200).json({message:"Carnet modifié avec succès",carnetUpdate});
    }catch(err){
        res.status(500).json({message:"Erreur lors de la modification du carnet",err});
    }
})
module.exports=router;