const plat=require("../models/Meal");

class mealService{
    static async createMeal(nom,description,typePlat){
        try{
            return await plat.create({nom,description,typePlat});
        }catch(error){
            console.log(error);
        }
    }
    static async getAllMeals(){
        try{
            return await plat.find();
        }catch(error){
            console.log(error);
        }
    }
    static async getMealByType(typePlat){
        try{
            return await plat.find({typePlat,Desponibilite:true});
        }catch(error){
            console.log(error);
        }
    }
    static async getMealById(id){
        try{
            return await plat.findById(id);
        }catch(error){
            console.log(error);
        }
    }
    static async cancelMeal(id){
        try{
            return await plat.findByIdAndDelete(id);
        }catch(error){
            console.log(error);
        }
    }
    static async updateMeal(id,data){
        try{
            return await plat.findByIdAndUpdate(id,data);
        }catch(err){
            console.log(err);
        }
    }
}
module.exports=mealService;