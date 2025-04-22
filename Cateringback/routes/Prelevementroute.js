const express = require("express");
const router = express.Router();
const prelevementcontroller=require("../controllers/PrelevementController");

router.post("/creer",async(req,res)=>{
    try{
        const {dateDebut,dateFin}=req.body;
        if (!dateDebut || !dateFin) {
            return res.status(400).json({ message: "dateDebut et dateFin sont requis." });
        }
        const prelevement = await prelevementcontroller.creerPrelvement(dateDebut,dateFin);
        return res.status(201).json(prelevement);
    }catch(err){
        res.status(500).json({message:err.message});
    }
})
module.exports=router;