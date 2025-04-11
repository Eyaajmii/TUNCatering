const express = require("express");
const router = express.Router();
const facturecontroller=require("../controllers/FactureController");

router.post("/addFacture",async(req,res)=>{
    try{
        const{date}=req.body;
        const facture = await facturecontroller.creerFacture(date);
        res.status(200).json(facture);
    }catch(err){
        res.status(400).json({message:err.message});
    }
})

module.exports = router;