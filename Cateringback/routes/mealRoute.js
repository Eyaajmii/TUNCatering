const express = require('express');
const mealController=require("../controllers/mealController");
const upload=require("../middlware/upload");
const router = express.Router();

router.get("/",async(req,res)=>{
    try{
        const meals = await mealController.getAllMeals();
        res.status(200).json(meals);
    }catch(err){
        res.status(500).json({message:err.message});
    }
});
//add meal
/*router.post("/add",async(req,res)=>{
    try{
        const { nom, description, typePlat, prix, disponibilite,image} = req.body;
        const nouveaumeal = await mealController.createMeal(
          nom,
          description,
          typePlat,
          prix,
          disponibilite,
          //adminTn,
          image
        );
        res.status(201).json(nouveaumeal);
    }catch(error){
        res.status(500).json({message:error.message});
    }
});*/

router.post("/add", upload.single("image"), mealController.createMeal);
//detail d'un plat
router.get("/:id",async(req,res)=>{
    try{
        const meal = await mealController.getMealById(req.params.id);
        res.status(200).json(meal);
    }catch(err){
        res.status(500).json({message:err.message});
    }
});
//prendre un plat par son type
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