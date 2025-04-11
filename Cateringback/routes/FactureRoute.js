const express = require("express");
const router = express.Router();
const facturecontroller=require("../controllers/FactureController");

router.post("/addFacture",async(req,res)=>{
    try{
        const{date}=req.body;
        const facture = await facturecontroller.creerFacture(date);
        broadcastNewFacture({
            ...facture._doc,
            type:"Facture",
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

module.exports = router;