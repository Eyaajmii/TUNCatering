const express = require("express");
const router = express.Router();
const Commande = require("../models/Commande");
const Menu = require("../models/Menu");
const Plat = require("../models/Plat");
router.get('/statistiqueDash',async(req,res)=>{
    try{
      const allOrders = await Commande.countDocuments();
      const numberOfMenus = await Menu.countDocuments();
      const numberOfPlats = await Plat.countDocuments();
      //Top 2 menus commandés
      const topMenus = await Commande.aggregate([
        { $match: { menu: { $ne: null } } },
        { $group: { _id: "$menu", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 2 },
        {
          $lookup: {
            from: "menus",
            localField: "_id",
            foreignField: "_id",
            as: "menu",
          },
        },
        { $unwind: "$menu" },
        { $project: { name: "$menu.name", count: 1 } },
      ]);
      // Top 4 plats les plus commandés
      const topPlats = await Commande.aggregate([
        { $unwind: "$plats" },
        { $group: { _id: "$plats", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 4 },
        {
          $lookup: {
            from: "plats",
            localField: "_id",
            foreignField: "_id",
            as: "plat",
          },
        },
        { $unwind: "$plat" },
        { $project: { name: "$plat.name", count: 1 } },
      ]);
      res.status(200).json({
        allOrders,
        numberOfMenus,
        numberOfPlats,
        topMenus,
        topPlats,
      });
    }catch(err){
        res.status(500).json({ message: "Erreur lors de la récupération des statistiques", error: err.message });   
    }
})
module.exports = router;