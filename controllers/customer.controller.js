const asyncHandler = require("express-async-handler")
const razorpay = require("razorpay")
const crypto = require("crypto")
const Order = require("../models/Order")
const { sendEmail } = require("../utils/email")
const Customer = require("../models/Customer")
const Hotel = require("../models/Hotel")
const Room = require("../models/Room")
const { userInfo } = require("os")

exports.initiatePayment = asyncHandler(async (req, res) => {
    const rz = new razorpay({
        key_id: process.env.RAZORPAY_API_KEY,
        key_secret: process.env.RAZORPAY_SCERET_KEY,
    })
    rz.orders.create({
        amount: req.body.amount * 100,
        currency: "INR",
        receipt: Date.now().toString()

    }, (err, order) => {
        if (err) {
            console.log(err);

            return res.status(400).json({ message: err.message || "unable to process payment" })
        }
        res.json({ message: "Payment initiate Success", result: order })
    })
})

exports.placeOrder = asyncHandler(async (req, res) => {
    const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        hotel, room, date
    } = req.body

    const x = crypto.
        createHmac("sha256", process.env.RAZORPAY_SCERET_KEY)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest("hex")

    if (razorpay_signature !== x) {
        return res.status(400).json({ message: "invalid payment" })
    }
    const user = await Customer.findById(req.customer)
    const hotelInfo = await Hotel.findById(hotel)
    const roomInfo = await Room.findById(room)

    // send email
    const customerEmail = sendEmail({
        to: user.email,
        subject: "your hotel booking confirmation",
        message: `
                <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Hotel Booking Confirmation</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            color: #333;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #fff;
            border-radius: 8px;
            overflow: hidden;
        }
        .email-header {
            background-color: #007bff;
            color: #fff;
            padding: 20px;
            text-align: center;
        }
        .email-body {
            padding: 20px;
        }
        .email-footer {
            background-color: #f1f1f1;
            color: #777;
            padding: 10px;
            text-align: center;
            font-size: 12px;
        }
        .booking-details {
            margin-top: 20px;
            padding: 15px;
            background-color: #f9f9f9;
            border: 1px solid #ddd;
            border-radius: 4px;
        }
        .booking-details th {
            text-align: left;
            padding: 5px;
            background-color: #f2f2f2;
        }
        .booking-details td {
            padding: 5px;
        }
        .button {
            display: inline-block;
            padding: 10px 20px;
            margin-top: 20px;
            background-color: #007bff;
            color: #fff;
            text-decoration: none;
            border-radius: 4px;
            text-align: center;
        }
        .button:hover {
            background-color: #0056b3;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="email-header">
            <h2>Booking Confirmed</h2>
            <p>Thank you for choosing ${hotelInfo.name}</p>
        </div>
        <div class="email-body">
            <p>Dear ${user.name},</p>
            <p>We are pleased to inform you that your hotel booking has been successfully confirmed. Below are your booking details:</p>

            <div class="booking-details">
                <table style="width: 100%; border-collapse: collapse;">
                   <tr>
                        <th>Check-in Date</th>
                        <td>${date}</td>
                    </tr>
                   <tr>
                        <th>Room Name</th>
                        <td>${roomInfo.name}</td>
                    </tr>
                    <tr>
                        <th>Total Amount</th>
                        <td>${roomInfo.price}</td>
                    </tr>
                </table>
            </div>

            <p>We look forward to welcoming you to ${hotelInfo.name}. If you have any questions or require assistance, don't hesitate to contact us.</p>
            <p><a href='http://localhost:5173/' class="button">Visit Our Website</a></p>
        </div>
        <div class="email-footer">
            <p>Hotel Address: ${hotelInfo.address}</p>
            <p>Contact Us: ${hotelInfo.mobile}</p>
        </div>
    </div>
</body>
</html>
        `
    })
    const hotelEmail = sendEmail({
        to: hotelInfo.email,
        subject: "New booking Notification",
        message: `
                <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Booking Notification</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            color: #333;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #fff;
            border-radius: 8px;
            overflow: hidden;
        }
        .email-header {
            background-color: #28a745;
            color: #fff;
            padding: 20px;
            text-align: center;
        }
        .email-body {
            padding: 20px;
        }
        .email-footer {
            background-color: #f1f1f1;
            color: #777;
            padding: 10px;
            text-align: center;
            font-size: 12px;
        }
        .booking-details {
            margin-top: 20px;
            padding: 15px;
            background-color: #f9f9f9;
            border: 1px solid #ddd;
            border-radius: 4px;
        }
        .booking-details th {
            text-align: left;
            padding: 5px;
            background-color: #f2f2f2;
        }
        .booking-details td {
            padding: 5px;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="email-header">
            <h2>New Hotel Booking</h2>
            <p>Booking Details</p>
        </div>
        <div class="email-body">
            <p><strong>Dear Hotel Team,</strong></p>
            <p>You have a new booking request from a customer. Below are the booking details:</p>

            <div class="booking-details">
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <th>Customer Name</th>
                        <td>${userInfo.name}</td>
                    </tr>
                    <tr>
                        <th>Email</th>
                        <td>${userInfo.email}</td>
                    </tr>
                    <tr>
                        <th>Phone Number</th>
                        <td>(555) 123-4567</td>
                    </tr>
                    <tr>
                        <th>Booking Reference</th>
                        <td>#1234567890</td>
                    </tr>
                    <tr>
                        <th>Check-in Date</th>
                        <td>${date}</td>
                    </tr>
                    <tr>
                        <th>Check-out Date</th>
                        <td>June 7, 2025</td>
                    </tr>
                    <tr>
                        <th>Room Type</th>
                        <td>${roomInfo.name}</td>
                    </tr>
                    <tr>
                        <th>Number of Guests</th>
                        <td>2</td>
                    </tr>
                    <tr>
                        <th>Total Amount</th>
                        <td>${roomInfo.price}</td>
                    </tr>
                </table>
            </div>

            <p>If you need any additional information or have questions, please contact the customer directly at the provided email or phone number.</p>
        </div>
        <div class="email-footer">
            <p>Thank you for choosing ${hotelInfo.name}</p>
        </div>
    </div>
</body>
</html>
        `
    })

    await Promise.all([customerEmail, hotelEmail])
    await Order.create({ ...req.body, customer: req.customer })
    res.json({ message: "place order Success" })
})


exports.hotelBookingUser = asyncHandler(async (req, res) => {
    const result = await Order.find({ customer: req.customer }).populate("hotel", "name city photo").populate("room")
    res.json({ message: "hotel booking Success", result })
})