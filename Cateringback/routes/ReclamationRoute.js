const express = require("express");
const router = express.Router();
const reclamationController=require("../controllers/ReclamationController");
module.exports=function(broadcastNewReclamation,broadcastReclamationStatusUpdate){
router.post("/creerReclamation",async(req,res)=>{
    try {
        const { Objet, MessageEnvoye, MatriculePn } = req.body;
        const reclamation = await reclamationController.creerReclamation(Objet, MessageEnvoye, MatriculePn);
        broadcastNewReclamation({
          ...reclamation._doc,
          type: "Reclamation",
          items: [{ reclamation ,quantite:1}],
        });
        res.status(201).json({ message: "Reclamation created successfully", reclamation });
    }catch(err){
        res.status(500).json({message:err.message});
    }
});
router.get("/reclamation/:MatriculePn",async(req,res)=>{
    try{
        const reclamations = await reclamationController.MesReclamations(req.params.MatriculePn);
        res.status(200).json({ reclamations });
    }catch(err){
        res.status(500).json({message:err.message});
    }
});
router.get("/detail/:id",async (req,res)=>{
    try{
        const reclamation = await reclamationController.detailReclamation(req.params.id);
        res.status(200).json({ reclamation });
    }catch(err){
        res.status(500).json({message:err.message});
    }
});

router.put("/repondre/:id",async(req,res)=>{
    try{
        const {newStatut,MessageReponse,MatriculeDirTunCater}=req.body;
        const reponse=await reclamationController.reponseReclamation(req.params.id,newStatut,MessageReponse,MatriculeDirTunCater);
        broadcastReclamationStatusUpdate({
          _id: req.params.id,
          statut: newStatut,
          MessageReponse,
          MatriculeDirTunCater,
          updatedAt: new Date(),
        });
        res.status(200).json({message:"Reponse envoyee avec succes",reponse});
    }catch(err){
        res.status(500).json({message:err.message});
    }
});
router.get('/reclamations',async(req,res)=>{
    try{
        const reclamations = await reclamationController.TousReclamations();
        res.status(200).json({ reclamations });
    }catch(err){
        res.status(500).json({message:err.message});
    }
})
return router;
}

