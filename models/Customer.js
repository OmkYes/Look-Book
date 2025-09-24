const mongoose = require("mongoose")

module.exports = mongoose.model("customer", new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    hero: { type: String, required: true },

    otp: { type: String, required: false },
    otpSendOn: { type: Date, required: false },

}, { timestamps: true }))