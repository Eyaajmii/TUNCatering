const BonLivraison = require("../models/bonLivraison");
const Vol = require("../models/vol");
const Commande = require("../models/Commande");
const PersonnelNavigant = require("../models/personnelnavigant");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const QRCode = require("qrcode");

async function generateBonLivraisonPDF(bonLivraison) {
  return new Promise(async (resolve, reject) => {
    try {
      const pdfDir = path.join(__dirname, "..", "public", "pdfs");
      if (!fs.existsSync(pdfDir)) {
        fs.mkdirSync(pdfDir, { recursive: true });
      }

      const fileName = `bon_livraison_${bonLivraison.numeroBon}.pdf`;
      const filePath = path.join(pdfDir, fileName);
      const pdfPath = `/pdfs/${fileName}`;

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
      if (bonLivraison.qrCodeImage) {
        const qrImageBuffer = Buffer.from(
          bonLivraison.qrCodeImage.split(",")[1],
          "base64"
        );
        doc.addPage();
        doc.fontSize(16).text("QR Code associé :", { align: "center" });
        doc.image(qrImageBuffer, {
          fit: [200, 200],
          align: "center",
          valign: "center",
        });
      }

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

    const { numeroBon, volId, commandes, conformite } = req.body;

    if (!numeroBon || !volId || !commandes || commandes.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Données manquantes ou invalides" });
    }

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
      Statut: "En attente", // Valeur par défaut
      conformite: conformite || "Non vérifié", // Valeur par défaut
    });
    const qrData = `Bon de Livraison: ${numeroBon}`;
    const qrCodeImage = await QRCode.toDataURL(qrData);
    newBonLivraison.qrCodeImage = qrCodeImage;
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
exports.scanBonLivraison = async (req, res) => {
  try {
    const { id } = req.params;
    const { qrData } = req.body; 

    const bonLivraison = await BonLivraison.findById(id);

    if (!bonLivraison) {
      return res
        .status(404)
        .json({ success: false, message: "Bon non trouvé" });
    }

    // Vérification du QR code
    const expectedQR = `Bon de Livraison: ${bonLivraison.numeroBon}`;
    if (qrData !== expectedQR) {
      return res
        .status(400)
        .json({ success: false, message: "QR Code invalide" });
    }

    bonLivraison.Statut = "Livré";
    bonLivraison.dateLivraison = new Date();
    await bonLivraison.save();

    res.status(200).json({ success: true, data: bonLivraison });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
exports.updateConformite = async (req, res) => {// averifier par wajih snn on annule
  try {
    const { id } = req.params;
    const { conformite } = req.body;

    if (
      !["Confirmé", "Non confirmé", "Non vérifié", "En attente"].includes(
        conformite
      )
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Valeur de conformité invalide" });
    }

    const bonLivraison = await BonLivraison.findByIdAndUpdate(
      id,
      { conformite },
      { new: true }
    );

    if (!bonLivraison) {
      return res
        .status(404)
        .json({ success: false, message: "Bon de livraison introuvable." });
    }

    res.status(200).json({
      success: true,
      message: "Conformité mise à jour",
      data: bonLivraison,
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la conformité :", error);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};
exports.updateStatutBonLivraison = async (req, res) => {
  try {
    const { id } = req.params;
    const { statut } = req.body;
    const bn = await BonLivraison.findById(id);
     if (bn.Statut !== "En attente") {
      return res.status(400).json({ success: false, message: "Le bon de livraison ne peut être annulé que s'il est en attente" });
    }
    //conformité automatiquement
    let conformite = "En attente";
    if (statut === "Livré") {
      conformite = "Confirmé";
    } else if (statut === "Annulé" || statut === "En retard") {
      conformite = "Non confirmé";
    }

    const bonLivraison = await BonLivraison.findByIdAndUpdate(
      id,
      { Statut: statut, conformite }, 
      { new: true }
    );

    if (!bonLivraison) {
      return res
        .status(404)
        .json({ success: false, message: "Bon de livraison introuvable." });
    }

    res.status(200).json({
      success: true,
      message: "Statut (et conformité) mis à jour",
      data: bonLivraison,
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du statut :", error);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};
//par tunisie catering
exports.updateBonLivraison=async(req,res)=>{
  try{
    const{id}=req.params;
    const{data}=req.body;
    const bn=await BonLivraison.findById(id);
    if(!bn){
      return res.status(404).json({ success: false, message: "Bon de livraison non trouvé" })
    }
     if (bn.Statut !== "En attente") {
      return res.status(400).json({ success: false, message: "Le bon de livraison ne peut être annulé que s'il est en attente" });
    }
    await BonLivraison.findByIdAndUpdate(id,data,{new:true});
    res.status(200).json({ success: true, message: "Bon de livraison mis à jour avec succès" });
  }catch(err){
    res.status(500).json({ success: false, message: "Erreur" });
  }
};
exports.getAllBonsLivraisons = async (req, res) => {
  try {
    const bnlivs = await BonLivraison.find();
    res.status(200).json({
      success: true,
      message: "Statut mis à jour",
      data: bnlivs,
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du statut :", error);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};