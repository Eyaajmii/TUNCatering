// routes/meal.js
const express = require('express');
const mealservice=require("../services/mealService");
const router = express.Router();
router.get("/",async(req,res)=>{
    try{
        const meals = await mealservice.getAllMeals();
        res.status(200).json(meals);
    }catch(err){
        res.status(500).json({message:err.message});
    }
});
router.post("/add",async(req,res)=>{
    try{
        const { nom, description, typePlat, prix, disponibilite,adminTn,image} = req.body;
        const nouveaumeal = await mealservice.createMeal(
          nom,
          description,
          typePlat,
          prix,
          disponibilite,
          adminTn,
          image
        );
        res.status(201).json(nouveaumeal);
    }catch(error){
        res.status(500).json({message:error.message});
    }
});
router.get("/:id",async(req,res)=>{
    try{
        const meal=await mealservice.getMealById(req.params.id);
        res.status(200).json(meal);
    }catch(err){
        res.status(500).json({message:err.message});
    }
});
router.put("/updateMeal/:id",async(req,res)=>{
    try{
        const mealdata={...req.body}
        const updatedMeal = await mealservice.updateMeal(req.params.id,mealdata);
        res.status(200).json(updatedMeal);
    }catch(err){
        res.status(500).json({message:err.message});
    }
});
router.delete("/:id",async(req,res)=>{
    try{
        await mealservice.cancelMeal(req.params.id);
        res.status(200).json({message:"meal deleted"});
    }catch(err){
        res.status(500).json({message:err.message});
    }
})
module.exports = router;