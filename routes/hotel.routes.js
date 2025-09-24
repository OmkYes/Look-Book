const hotelControllers = require("../controllers/hotel.controller")

const routes = require("express").Router()

routes
    .post("/add-room", hotelControllers.addRoom)
    .get("/get-room", hotelControllers.getRoom)
    .get("/get-order-history", hotelControllers.getOrderHistory)
    .patch("/update-room/:rid", hotelControllers.updateRoom)
    .delete("/delete-room/:rid", hotelControllers.deleteRoom)

module.exports = routes