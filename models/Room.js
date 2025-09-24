const mongoose = require("mongoose")

module.exports = mongoose.model("room", new mongoose.Schema({
    hotel: { type: mongoose.Types.ObjectId, ref: "hotel", required: true },
    name: { type: String, required: true },
    roomNumber: { type: String, required: true },
    price: { type: String, required: true },
    photo: { type: [String], required: true },
    amenities: { type: [String], required: true },
    isAvailable: { type: Boolean, default: true },
}, { timestamps: true }))