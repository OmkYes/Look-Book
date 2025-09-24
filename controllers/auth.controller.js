const asyncHandler = require("express-async-handler")
const Hotel = require("../models/Hotel")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const Agent = require("../models/Agent")
const { genrateOTP } = require("../utils/genrateOTP")
const Admin = require("../models/Admin")
const Customer = require("../models/Customer")
const { differenceInSeconds } = require("date-fns")
const { sendEmail } = require("../utils/email")
const { OAuth2Client } = require("google-auth-library")
const { hotelPhotoUpload } = require("../utils/upload")
const cloud = require("./../utils/cloud")

//Hotel Authentication Start
exports.registerHotel = asyncHandler(async (req, res) => {
    hotelPhotoUpload(req, res, async err => {
        if (err) {
            return res.status(400).json({ message: err.message || "unable to upload image" })
        }
        if (!req.file) {
            return res.status(400).json({ message: "hotel image is required" })
        }
        const { email, mobile, password } = req.body
        const result = await Hotel.findOne({ $or: [{ email }, { mobile }] })
        if (result) {
            return res.status(401).json({ message: "Email Or Mobile Already Exist !" })
        }
        const hash = await bcrypt.hash(password, 10)
        const { secure_url } = await cloud.uploader.upload(req.file.path)
        await Hotel.create({ ...req.body, password: hash, photo: secure_url })
        res.json({ message: "Hotel Register Success" })
    })
})


exports.loginHotel = asyncHandler(async (req, res) => {
    // const { username, password } = req.body
    const { email, password } = req.body
    // const result = await Hotel.findOne({ $or: [{ email: username }, { mobile: username }] })
    const result = await Hotel.findOne({ email })
    if (!result) {
        return res.status(401).json({ message: "Email Or Mobile Already Exist !" })
    }
    const verify = await bcrypt.compare(password, result.password)
    if (!verify) {
        res.status(401).json({ message: "Invalid Password !" })
    }
    const token = jwt.sign({ _id: result._id, name: result.name }, process.env.JWT_KEY)
    res.cookie("HOTEL", token, { maxAge: 1000 * 60 * 60 * 24, httpOnly: true, secure: false })
    res.json({
        message: "Hotel Login Success", result: {
            _id: result._id,
            name: result.name,
            email: result.email
        }
    })
})


exports.logoutHotel = asyncHandler(async (req, res) => {
    res.clearCookie("HOTEL")
    res.json({ message: "Hotel Logout Success" })
})
//Hotel Authentication End



//Agent Authentication Start
exports.registerAgent = asyncHandler(async (req, res) => {
    const { email, mobile, password } = req.body
    const result = await Agent.findOne({ $or: [{ email }, { mobile }] })
    if (result) {
        return res.status(401).json({ message: "Email Or Mobile Already Exist !" })
    }
    const hash = await bcrypt.hash(password, 10)
    await Agent.create({ ...req.body, password: hash })
    res.json({ message: "Agent Register Success" })
})



exports.loginAgent = asyncHandler(async (req, res) => {
    const { username, password } = req.body
    const result = await Agent.findOne({ $or: [{ email: username }, { mobile: username }] })
    if (!result) {
        return res.status(401).json({ message: "Email Or Mobile Already Exist !" })
    }
    const verify = await bcrypt.compare(password, result.password)
    if (!verify) {
        res.status(401).json({ message: "Invalid Password !" })
    }
    const token = jwt.sign({ _id: result._id, name: result.name }, process.env.JWT_KEY)
    res.cookie("AGENT", token, { maxAge: 1000 * 60 * 60 * 24, httpOnly: true, secure: false })
    res.json({
        message: "Agent Login Success", result: {
            _id: result._id,
            name: result.name,
            email: result.email
        }
    })
})



exports.logoutAgent = asyncHandler(async (req, res) => {
    res.clearCookie("AGENT")
    res.json({ message: "Agent Logout Success" })
})

//Agent Authentication End



//Admin Authentication Start
exports.adminRegister = asyncHandler(async (req, res) => {
    await Admin.create(req.body)
    res.json({ message: "Admin Register Success" })
})

exports.sendOTP = asyncHandler(async (req, res) => {
    const { username } = req.body
    const result = await Admin.findOne({ $or: [{ email: username }, { mobile: username }] })
    if (!result) {
        return res.status(401).json({ message: "Invalid Email or Mobile" })
    }

    const otp = genrateOTP()
    // console.log(otp);

    await Admin.findByIdAndUpdate(result._id, { otp, otpSendOn: new Date() })
    sendEmail({ to: result.email, subject: "Verify your login OTP", message: `Your OTP is ${otp}` })
    res.json({ message: "Admin otp send Success" })
})


exports.loginAdmin = asyncHandler(async (req, res) => {
    const { username, otp } = req.body
    console.log(req.body);

    const result = await Admin.findOne({ $or: [{ email: username }, { mobile: username }] })
    if (!result) {
        return res.status(401).json({ message: "Invalid Email or Mobile" })
    }

    if (result.otp != otp) {
        return res.status(401).json({ message: "Invalid OTP" })
    }

    if (differenceInSeconds(new Date(), result.otpSendOn) > 60) {
        return res.status(401).json({ message: "OTP expire" })
    }

    await Admin.findByIdAndUpdate(result._id, { otp: null })
    const token = jwt.sign({ _id: result._id, name: result.name }, process.env.JWT_KEY)
    res.cookie("ADMIN", token, { maxAge: 1000 * 60 * 60 * 24, httpOnly: true, secure: false })
    res.json({
        message: "Admin Login Success", result: {
            _id: result._id,
            name: result.name,
            email: result.email,
            mobile: result.mobile,
        }
    })
})


exports.logoutAdmin = asyncHandler(async (req, res) => {
    res.clearCookie("ADMIN")
    res.json({ message: "Admin Logout Success" })
})

//Admin Authentication End

//Coustomer Authentication Start

exports.continueWithGoogle = asyncHandler(async (req, res) => {
    const { credential } = req.body
    const googleData = new OAuth2Client({ clientId: process.env.GOOGLE_CLIENT_ID })
    const data = await googleData.verifyIdToken({ idToken: credential })

    if (!data) {
        return res.status(401).json({ message: "Unable To Process !" })
    }
    const { payload } = data

    let result = await Customer.findOne({ email: payload.email })
    if (!result) {
        //register
        result = await Customer.create({
            name: payload.name,
            email: payload.email,
            hero: payload.picture,
        })
    }

    //login
    const token = jwt.sign({ _id: result._id }, process.env.JWT_KEY)
    res.cookie("CUSTOMER", token, { maxAge: 1000 * 60 * 60 * 24, secure: false, httpOnly: true })
    res.json({
        message: "Customer Login Success", result: {
            name: result.name,
            email: result.email,
            hero: result.hero,
        }

    })

})


exports.logoutCustomer = asyncHandler(async (req, res) => {
    res.clearCookie("CUSTOMER")
    res.json({ message: "Customer Logout Success" })
})

//Coustomer Authentication End

exports.sendMobileOTP = asyncHandler(async (req, res) => {
    const { email } = req.body
    const result = await Customer.findOne({ email })
    if (!result) {
        return res.status(401).json({ message: "Invalid Email or Mobile" })
    }

    const otp = genrateOTP()
    // console.log(otp);

    await Customer.findByIdAndUpdate(result._id, { otp, otpSendOn: new Date() })
    await sendEmail({ to: result.email, subject: "Verify your login OTP", message: `Your OTP is ${otp}` })
    res.json({ message: "mobile otp send Success" })
})

exports.loginMobileCustomer = asyncHandler(async (req, res) => {
    const { email, otp } = req.body

    const result = await Customer.findOne({ email })
    if (!result) {
        return res.status(401).json({ message: "Invalid Email" })
    }


    if (result.otp != otp) {
        return res.status(401).json({ message: "Invalid OTP" })
    }

    if (differenceInSeconds(new Date(), result.otpSendOn) > 60) {
        return res.status(401).json({ message: "OTP expire" })
    }

    await Customer.findByIdAndUpdate(result._id, { otp: null })
    const token = jwt.sign({ _id: result._id, name: result.name }, process.env.JWT_KEY)
    res.cookie("CUSTOMER", token, { maxAge: 1000 * 60 * 60 * 24, httpOnly: true, secure: false })
    res.json({
        message: "Customer Login Success", result: {
            _id: result._id,
            name: result.name,
            email: result.email,
            hero: result.hero
        }
    })
})