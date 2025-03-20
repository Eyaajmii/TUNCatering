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
module.exports=router;