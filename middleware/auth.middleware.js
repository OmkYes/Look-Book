const asyncHandler = require("express-async-handler")
const jwt = require("jsonwebtoken")

exports.adminProtected = asyncHandler(async (req, res, next) => {
    const token = req.cookies.ADMIN

    if (!token) {
        return res.status(401).json({ message: "no cookie found" })
    }

    jwt.verify(token, process.env.JWT_KEY, (err, data) => {
        if (err) {
            console.log(err)
            return res.status(401).json({ message: "invalid token", error: err.message })
        }

        req.user = data._id
        next()
    })
})

exports.agentProtected = asyncHandler(async (req, res, next) => {
    const token = req.cookies.AGENT

    if (!token) {
        res.status(401).json({ message: "no cookie found" })
    }

    jwt.verify(token, process.env.JWT_KEY, (err, data) => {
        if (err) {
            console.log(err)
            res.status(401).json({ message: "invalid token", error: err.message })
        }
        req.user = data._id
        next()
    })

})

exports.hotelProtected = asyncHandler(async (req, res, next) => {
    const token = req.cookies.HOTEL

    if (!token) {
        res.status(401).json({ mesage: "no cookie found" })
    }

    jwt.verify(token, process.env.JWT_KEY, (err, data) => {
        if (err) {
            console.log(err)
            res.status(401).json({ message: "invalid token", error: err.message })
        }
        req.user = data._id
        next()
    })
})

exports.customerProtected = asyncHandler(async (req, res, next) => {
    const token = req.cookies.CUSTOMER

    if (!token) {
        res.status(401).json({ mesage: "no cookie found" })
    }

    jwt.verify(token, process.env.JWT_KEY, (err, data) => {
        if (err) {
            console.log(err)
            res.status(401).json({ message: "invalid token", error: err.message })
        }
        req.customer = data._id
        next()
    })
})