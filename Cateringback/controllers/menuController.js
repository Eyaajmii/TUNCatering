const menu=require("../models/Menu");
class menuController{
    static async createMenu(nom,Rotation,typeMenu,PlatsPrincipaux,PlatsEntree,PlatsDessert){
        try{
            const nouveauMEnu = new menu.create({
              nom,
              Rotation,
              typeMenu,
              PlatsPrincipaux,
              PlatsEntree,
              PlatsDessert,
            });
            return nouveauMEnu;
        }catch(err){
            console.error(err);
        }
    }
    static async getMenuDetail(id){
        try{
            return menu.findById(id).populate("PlatsEntree","nom description").populate("PlatsPrincipaux","nom description").populate("PlatsDessert","nom description")
        }catch(err){
            console.error(err);
        }
    }
    static async updateMenu(id,data){
        try{
            return menu.findByIdAndUpdate(id, data, {new: true});
        }catch(err){
            console.error(err);
        }
    }
    static async getAllMenu(){
        try{
            return menu.find().populate("PlatsEntree","nom description").populate("PlatsPrincipaux","nom description").populate("PlatsDessert","nom description");
        }catch(err){
            console.error(err);
        }
    }
    static async getMenuBytype(typeMenu){
        try{
            return menu.find({typeMenu}).populate("PlatsEntree","nom description").populate("PlatsPrincipaux","nom description").populate("PlatsDessert","nom description");
        }catch(err){
            console.error(err);
        }
    }
    static async cancelMenu(id){
        try{
            return menu.findByIdAndDelete(id);
        }catch(error){
            console.error(error);
        }
    }

}
module.exports = menuController;