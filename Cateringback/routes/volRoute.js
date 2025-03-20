const express = require("express");
const router = express.Router();
const volController=require("../controllers/volController");

router.post("/addvol",async(req,res)=>{
    try {
        const{numVol, volName, Destination, DureeVol, dateVolDep, Escale, Commande}=req.body;
        const newVol=await volController.createfligth(numVol, volName, Destination, DureeVol, dateVolDep, Escale, Commande);
        res.status(201).json({message:"Vol created successfully",newVol});
    }catch(err){
        res.status(500).json({message:"Error creating vol",err});
    }
})
module.exports=router;