const { model } = require("mongoose")
const Public = require("../controllers/Public.controller")

const route = require("express").Router()


route
    .get("/get-hotel", Public.getHotels)
    .get("/get-room/:hid", Public.getHotelRoom)

module.exports = route