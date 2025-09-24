const mongoose = require("mongoose")


module.exports = mongoose.model("order", new mongoose.Schema({
    hotel: { type: mongoose.Types.ObjectId, ref: "hotel", required: true },
    room: { type: mongoose.Types.ObjectId, ref: "room", required: true },
    customer: { type: mongoose.Types.ObjectId, ref: "customer", required: true },
    date: { type: Date, required: true },
    razorpay_order_id: { type: String, required: true },
    razorpay_payment_id: { type: String, required: true },
}, { timestamps: true }))