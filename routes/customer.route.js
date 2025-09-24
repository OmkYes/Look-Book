const customerControllers = require("../controllers/customer.controller")

const route = require("express").Router()


route

    .post("/initiate-payment", customerControllers.initiatePayment)
    .post("/place-order", customerControllers.placeOrder)
    .get("/hotel-booking-user", customerControllers.hotelBookingUser)

module.exports = route