const express=require("express");
const router=express.Router();
const CommandeController=require("../controllers/commandeController");

router.get("/",async(req,res)=>{
    try{
        const commandes = await CommandeController.getAllCommands();
        res.status(200).json(commandes);
    }catch(err){
        res.status(500).send(err.message);
    }
});
router.post("/add",async(req,res)=>{
    try{
        const {menuID,pnID}=req.body;
        const newcommande = await CommandeController.createCommandRequest(
          menuID,
          pnID
        );
        res.status(200).json(newcommande);
    }catch(error){
        res.status(500).send(error.message);
    }
});
router.get("/total",async(req,res)=>{
    try{
        const total = await CommandeController.getTotalCommandes();
        res.status(200).json(total);
    }catch(err){
        res.status(500).send(err.message);
    }
});
router.get("/:id",async(req,res)=>{
    try{
        const commande = await CommandeController.getCommandByID(req.params.id);
        res.status(200).json(commande);
    }catch(error){
        if(error.message="commande not found"){
            res.status(404).send(error.message);
        }else{
            res.status(500).send(error.message);
        }
    }
});
router.put('/updateStatut/:id',async(req,res)=>{
    try{
        const{status}=req.body;
        const updateCommande = await CommandeController.updateCommandeStatus(
          req.params.id,
          status
        );
        res.status(200).json(updateCommande);
    }catch(err){
        res.status(500).send(err.message);
    }
});
router.delete("/:id",async(req,res)=>{
    try{
        await CommandeController.deleteCommande(req.params.id);
        res.status(200);
    }catch(err){
        res.status(500).send(err.message);
    }
});
module.exports=router;

