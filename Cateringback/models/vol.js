const mongoose = require("mongoose");

const volSchema = new mongoose.Schema({
    numVol: { type: Number, required: true },
    volName: { type: String, required: true },
    volDesc: { type: String, required: false }
});

module.exports = mongoose.model("Vol", volSchema);
