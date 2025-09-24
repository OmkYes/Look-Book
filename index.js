const express = require("express")
const mongoose = require("mongoose")
const cookieParser = require("cookie-parser")
const cors = require("cors")
const { hotelProtected, customerProtected } = require("./middleware/auth.middleware")
require("dotenv").config()

const app = express()

app.use(express.json())
app.use(cors({ origin: "http://localhost:5173", credentials: true }))
app.use(cookieParser())

app.use("/api/auth", require("./routes/auth.routes"))
app.use("/api/hotel", hotelProtected, require("./routes/hotel.routes"))
app.use("/api/public", require("./routes/public.route"))
app.use("/api/customer", customerProtected, require("./routes/customer.route"))

app.use("*", (req, res) => {
    res.status(404).json({ message: "resource not found" })
})


app.use((err, req, res, next) => {
    console.log(err)
    res.status(500).json({ message: "server error", error: err.message })
})

mongoose.connect(process.env.MONGO_URL)
mongoose.connection.once("open", () => {
    console.log("mongo connected")
    app.listen(process.env.PORT, console.log("server running..."))
})