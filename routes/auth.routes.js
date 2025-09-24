const authController = require("../controllers/auth.controller")

const routes = require("express").Router()

routes

    .post("/register-admin", authController.adminRegister)
    .post("/send-otp", authController.sendOTP)
    .post("/login-admin", authController.loginAdmin)
    .post("/logout-admin", authController.logoutAdmin)


    .post("/register-agent", authController.registerAgent)
    .post("/login-agent", authController.loginAgent)
    .post("/logout-agent", authController.logoutAgent)


    .post("/register-hotel", authController.registerHotel)
    .post("/login-hotel", authController.loginHotel)
    .post("/logout-hotel", authController.logoutHotel)


    .post("/continue-with-google", authController.continueWithGoogle)
    .post("/mobile-login", authController.loginMobileCustomer)
    .post("/mobile-send-otp", authController.sendMobileOTP)
    .post("/logout-customer", authController.logoutCustomer)


module.exports = routes