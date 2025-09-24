const asyncHandler = require("express-async-handler")
const { hotelRoomPhotoUpload } = require("../utils/upload")
const cloud = require("../utils/cloud")
const Room = require("../models/Room")
const path = require("path")
const Order = require("../models/Order")

exports.addRoom = asyncHandler(async (req, res) => {
    hotelRoomPhotoUpload(req, res, async err => {
        if (err) {
            return res.status(400).json({ message: err.message || "unable to upload" })
        }
        // console.log(req.body);
        // console.log(req.files);
        const allphoto = []
        if (req.files) {
            for (const item of req.files) {
                const { secure_url } = await cloud.uploader.upload(item.path)
                allphoto.push(secure_url)
            }
        }
        await Room.create({ ...req.body, photo: allphoto, hotel: req.user })

        res.json({ message: "room create Success" })
    })
})
exports.getRoom = asyncHandler(async (req, res) => {
    const result = await Room.find({ hotel: req.user })
    res.json({ message: "room get Success", result })
})
exports.getOrderHistory = asyncHandler(async (req, res) => {
    const { date } = req.query
    const filter = {}
    if (date) {
        filter.date = date
    }
    const result = await Order.find({ hotel: req.user, ...filter })
        .populate("customer", "name email hero")
        .populate("room")
    res.json({ message: "orders get Success", result })
})
exports.updateRoom = asyncHandler(async (req, res) => {
    const { rid } = req.params

    await Room.findByIdAndUpdate(rid)
    res.json({ message: "room get Success", result })
})
exports.deleteRoom = asyncHandler(async (req, res) => {
    // const { rid } = req.params
    // const result = await Room.findById(rid)
    // for (const item of result.photo) {
    //     await cloud.uploader.destroy(path.basename(item).split(".")[0])
    // }
    // await Room.findByIdAndDelete(rid)

    const result = await Room.findById(req.params.rid)
    const x = []
    for (const item of result.photo) {
        x.push(cloud.uploader.destroy(path.basename(item).split(".")[0]))
    }
    await Promise.all(x)
    await Room.findByIdAndDelete(req.params.rid)
    res.json({ message: "room delete Success" })
})