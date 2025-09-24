const Hotel = require("../models/Hotel")
const asyncHandler = require("express-async-handler")
const Room = require("../models/Room")

exports.getHotels = asyncHandler(async (req, res) => {
    const { search } = req.query
    const data = {}
    if (search) {
        // data.city = search
        data.name = { $regex: `^${search}`, $options: "i" }
    }
    const result = await Hotel.find({ isActive: true, ...data }).select("name photo _id city address")
    res.json({ message: "hotel fetch success", result })
})
exports.getHotelRoom = asyncHandler(async (req, res) => {
    // const result = await Room.find({ hotel: req.params.hid }).select("name photo _id city address")
    const hotelResult = await Hotel.findById(req.params.hid).select("name photo _id city address")
    const result = await Room.find({ hotel: req.params.hid }).select("-createdAt -updatedAt -__v")
    res.json({
        message: "room fetch success", result: {
            hotel: hotelResult,
            room: result
        }
    })
})