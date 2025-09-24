const mongoose = require("mongoose")


module.exports = mongoose.model("agent", new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    mobile: { type: String, required: true },
    password: { type: String, required: true },
    isActive: { type: Boolean, default: true },
}, { timestamps: true }))