const express = require("express")
const mongoose = require("mongoose")
const cookieParser = require("cookie-parser")
const cors = require("cors")
const path = require("path");
const { hotelProtected, customerProtected } = require("./middleware/auth.middleware")
require("dotenv").config()

const app = express()

app.use(express.json())
app.use(express.static("dist"));
app.use(cookieParser())
app.use(cors({ origin: "https://look-book-1skg.onrender.com", credentials: true }))

app.use("/api/auth", require("./routes/auth.routes"))
app.use("/api/hotel", hotelProtected, require("./routes/hotel.routes"))
app.use("/api/public", require("./routes/public.route"))
app.use("/api/customer", customerProtected, require("./routes/customer.route"))

app.use("*", (req, res) => {
    res.sendFile(path.join(__dirname, "dist", "index.html"));
});


app.use((err, req, res, next) => {
    console.log(err)
    res.status(500).json({ message: "server error", error: err.message })
})

mongoose.connect(process.env.MONGO_URL)
mongoose.connection.once("open", () => {
    console.log("mongo connected")
    app.listen(process.env.PORT, console.log("server running..."))
})