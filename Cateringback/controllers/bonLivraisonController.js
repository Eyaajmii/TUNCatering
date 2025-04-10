const mongoose = require("mongoose");
const BonLivraison = require("../models/bonLivraison");
const Vol = require("../models/vol");
const Commande = require("../models/Commande");
const PersonnelNavigant = require("../models/personnelnavigant");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

async function generateBonLivraisonPDF(bonLivraison) {
  return new Promise(async (resolve, reject) => {
    try {
      const pdfDir = path.join(__dirname, "..", "public", "pdfs");
      if (!fs.existsSync(pdfDir)) {
        fs.mkdirSync(pdfDir, { recursive: true });
      }

      const fileName = `bon_livraison_${bonLivraison.numeroBon}.pdf`;
      const filePath = path.join(pdfDir, fileName);
      const pdfPath = `/pdfs/${fileName}`; // Relative path for DB storage

      const doc = new PDFDocument();
      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      // PDF Content
      doc.fontSize(20).text("Bon de Livraison", { align: "center" });
      doc.moveDown();
      doc.fontSize(14).text(`Numéro: ${bonLivraison.numeroBon}`);
      doc.text(`Vol: ${bonLivraison.vol}`);
      doc.moveDown();

      // Add more content as needed
      doc.fontSize(12).text("Détails des commandes:", { underline: true });
      doc.moveDown(0.5);
      const bonWithCommandes = await BonLivraison.findById(
        bonLivraison._id
      ).populate("commandes");

      bonWithCommandes.commandes.forEach((commande, index) => {
        doc.text(`${index + 1}. Commande ${commande._id}`);
      });

      doc.end();

      stream.on("finish", () => resolve(pdfPath));
      stream.on("error", reject);
    } catch (error) {
      reject(error);
    }
  });
}

exports.createBonLivraison = async (req, res) => {
  try {
    console.log("Requête reçue :", req.body);

    const { numeroBon, volId, commandes } = req.body;

    if (!numeroBon || !volId || !commandes || commandes.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Données manquantes ou invalides" });
    }

    // Recherche du vol par numVol
    const vol = await Vol.findOne({ numVol: volId });
    if (!vol) {
      return res.status(404).json({
        success: false,
        message: `Aucun vol trouvé avec le numéro ${volId}`,
      });
    }
    const commandesValides = await Promise.all(
      commandes.map((commandeId) => Commande.findById(commandeId))
    );

    if (commandesValides.some((c) => !c)) {
      return res.status(404).json({
        success: false,
        message: "Une ou plusieurs commandes sont introuvables",
      });
    }

    const newBonLivraison = new BonLivraison({
      numeroBon,
      vol: volId.toString(),
      commandes,
    });

    await newBonLivraison.save();

    // Generate PDF after saving
    const pdfPath = await generateBonLivraisonPDF(newBonLivraison);
    newBonLivraison.pdfPath = pdfPath;
    await newBonLivraison.save();

    res.status(201).json({
      success: true,
      message: "Bon de livraison créé avec succès",
      data: newBonLivraison,
    });
  } catch (error) {
    console.error("Erreur lors de la création du bon de livraison :", error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur",
      error: error.message,
    });
  }
};

exports.getBonByVolId = async (req, res) => {
  try {
    const { volId } = req.params;
    const bonLivraison = await BonLivraison.findOne({ vol: volId }).populate(
      "commandes personnelLivraison"
    );

    if (!bonLivraison) {
      return res.status(404).json({
        success: false,
        message: "Aucun bon de livraison trouvé pour ce vol",
      });
    }
    const vol = await Vol.findOne({ numVol: volId });

    res.status(200).json({
      success: true,
      data: {
        ...bonLivraison.toObject(),
        volInfo: vol,
      },
    });
  } catch (error) {
    console.error("Erreur:", error);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};

exports.getBonLivraisonById = async (req, res) => {
  try {
    const { id } = req.params;
    const bonLivraison = await BonLivraison.findById(id).populate(
      "vol commandes personnelLivraison"
    );

    if (!bonLivraison) {
      return res
        .status(404)
        .json({ success: false, message: "Bon de livraison introuvable." });
    }

    res.status(200).json({ success: true, data: bonLivraison });
  } catch (error) {
    console.error(
      "Erreur lors de la récupération du bon de livraison :",
      error
    );
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};

exports.updateStatutBonLivraison = async (req, res) => {
  try {
    const { id } = req.params;
    const { statut } = req.body;

    if (!["en préparation", "prêt", "livré", "annulé"].includes(statut)) {
      return res
        .status(400)
        .json({ success: false, message: "Statut invalide" });
    }

    const bonLivraison = await BonLivraison.findByIdAndUpdate(
      id,
      { statut },
      { new: true }
    );

    if (!bonLivraison) {
      return res
        .status(404)
        .json({ success: false, message: "Bon de livraison introuvable." });
    }

    res
      .status(200)
      .json({
        success: true,
        message: "Statut mis à jour",
        data: bonLivraison,
      });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du statut :", error);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};
