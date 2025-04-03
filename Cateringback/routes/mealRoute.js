const express = require('express');
const mealController=require("../controllers/mealController");
const upload=require("../middlware/upload");
const router = express.Router();
const Meal = require('../models/Meal');
router.get("/",async(req,res)=>{
    try{
        const meals = await mealController.getAllMeals();
        res.status(200).json(meals);
    }catch(err){
        res.status(500).json({message:err.message});
    }
});
router.post("/add", upload.single("image"), mealController.createMeal);

router.get("/:id",async(req,res)=>{
    try{
        const meal = await mealController.getMealById(req.params.id);
        res.status(200).json(meal);
    }catch(err){
        res.status(500).json({message:err.message});
    }
});

router.post('/details', async (req, res) => {  
    try {  
        const { ids } = req.body;  
        
        if (!ids || !Array.isArray(ids)) {  
            return res.status(400).json({ message: 'Un tableau d\'IDs est requis' });  
        }  

        const plats = await Meal.find({ _id: { $in: ids } })  
            .select('_id nom typePlat prix description');  

        res.status(200).json(plats);  
    } catch (err) {  
        console.error('Error:', err);  
        res.status(500).json({ message: 'Erreur serveur' });  
    }  
});
router.get("/type/:typePlat",async(req,res)=>{
    try{
        const mealType=await mealController.getMealByType(req.params.typePlat);
        res.status(200).json(mealType);
    }catch(err){
        res.status(500).json({message:err.message});
    }
});
router.put("/updateMeal/:id",async(req,res)=>{
    try{
        const updatedMeal = await mealController.updateMeal(
          req.params.id,
          req.body
        );
        res.status(200).json(updatedMeal);
    }catch(err){
        res.status(500).json({message:err.message});
    }
});
router.delete("/:id",async(req,res)=>{
    try{
        await mealController.cancelMeal(req.params.id);
        res.status(200).json({message:"meal deleted"});
    }catch(err){
        res.status(500).json({message:err.message});
    }
})

module.exports = router;