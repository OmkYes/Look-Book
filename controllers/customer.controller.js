const asyncHandler = require("express-async-handler");
const razorpay = require("razorpay");
const crypto = require("crypto");
const Order = require("../models/Order");
const Customer = require("../models/Customer");
const Hotel = require("../models/Hotel");
const Room = require("../models/Room");
const sendEmail = require("../utils/sendEmail"); // SendGrid version

// Initiate Razorpay Payment
exports.initiatePayment = asyncHandler(async (req, res) => {
    const rz = new razorpay({
        key_id: process.env.RAZORPAY_API_KEY,
        key_secret: process.env.RAZORPAY_SECRET_KEY,
    });

    rz.orders.create(
        {
            amount: req.body.amount * 100,
            currency: "INR",
            receipt: Date.now().toString(),
        },
        (err, order) => {
            if (err) {
                console.log(err);
                return res
                    .status(400)
                    .json({ message: err.message || "Unable to process payment" });
            }
            res.json({ message: "Payment initiated successfully", result: order });
        }
    );
});

// Place Order
// exports.placeOrder = asyncHandler(async (req, res) => {
//     const { razorpay_order_id, razorpay_payment_id, razorpay_signature, hotel, room, date } = req.body;

//     // Verify Razorpay Payment
//     const expectedSignature = crypto
//         .createHmac("sha256", process.env.RAZORPAY_SECRET_KEY)
//         .update(`${razorpay_order_id}|${razorpay_payment_id}`)
//         .digest("hex");

//     if (razorpay_signature !== expectedSignature) {
//         return res.status(400).json({ message: "Invalid payment" });
//     }

//     // Fetch Data
//     const user = await Customer.findById(req.customer);
//     const hotelInfo = await Hotel.findById(hotel);
//     const roomInfo = await Room.findById(room);

//     if (!user || !hotelInfo || !roomInfo) {
//         return res.status(404).json({ message: "User, hotel, or room not found" });
//     }

//     // Customer Email
//     const customerEmail = sendEmail({
//         to: user.email,
//         subject: "Your Hotel Booking Confirmation",
//         message: `
//       <!DOCTYPE html>
//       <html>
//       <head>
//         <meta charset="UTF-8">
//         <title>Booking Confirmation</title>
//         <style>
//           body { font-family: Arial; background: #f4f4f4; margin:0; padding:0; color:#333; }
//           .container { max-width:600px; margin:auto; background:#fff; border-radius:8px; overflow:hidden; }
//           .header { background:#007bff; color:#fff; text-align:center; padding:20px; }
//           .body { padding:20px; }
//           .footer { background:#f1f1f1; color:#777; padding:10px; text-align:center; font-size:12px; }
//           .button { display:inline-block; padding:10px 20px; margin-top:20px; background:#007bff; color:#fff; text-decoration:none; border-radius:4px; }
//         </style>
//       </head>
//       <body>
//         <div class="container">
//           <div class="header">
//             <h2>Booking Confirmed</h2>
//             <p>Thank you for choosing ${hotelInfo.name}</p>
//           </div>
//           <div class="body">
//             <p>Dear ${user.name},</p>
//             <p>Your hotel booking is confirmed. Booking details:</p>
//             <table style="width:100%; border-collapse:collapse;">
//               <tr><th>Check-in Date</th><td>${date}</td></tr>
//               <tr><th>Room Name</th><td>${roomInfo.name}</td></tr>
//               <tr><th>Total Amount</th><td>${roomInfo.price}</td></tr>
//             </table>
//             <p><a href="http://localhost:5173/" class="button">Visit Our Website</a></p>
//           </div>
//           <div class="footer">
//             <p>Hotel Address: ${hotelInfo.address}</p>
//             <p>Contact: ${hotelInfo.mobile}</p>
//           </div>
//         </div>
//       </body>
//       </html>
//     `,
//     });

//     // Hotel Email
//     const hotelEmail = sendEmail({
//         to: hotelInfo.email,
//         subject: "New Booking Notification",
//         message: `
//       <!DOCTYPE html>
//       <html>
//       <head>
//         <meta charset="UTF-8">
//         <title>New Booking Notification</title>
//         <style>
//           body { font-family: Arial; background:#f4f4f4; margin:0; padding:0; color:#333; }
//           .container { max-width:600px; margin:auto; background:#fff; border-radius:8px; overflow:hidden; }
//           .header { background:#28a745; color:#fff; text-align:center; padding:20px; }
//           .body { padding:20px; }
//           .footer { background:#f1f1f1; color:#777; padding:10px; text-align:center; font-size:12px; }
//         </style>
//       </head>
//       <body>
//         <div class="container">
//           <div class="header"><h2>New Hotel Booking</h2></div>
//           <div class="body">
//             <p>Dear Hotel Team,</p>
//             <p>You have a new booking from:</p>
//             <table style="width:100%; border-collapse:collapse;">
//               <tr><th>Customer Name</th><td>${user.name}</td></tr>
//               <tr><th>Email</th><td>${user.email}</td></tr>
//               <tr><th>Check-in Date</th><td>${date}</td></tr>
//               <tr><th>Room Type</th><td>${roomInfo.name}</td></tr>
//               <tr><th>Total Amount</th><td>${roomInfo.price}</td></tr>
//             </table>
//           </div>
//           <div class="footer">
//             <p>Thank you for choosing ${hotelInfo.name}</p>
//           </div>
//         </div>
//       </body>
//       </html>
//     `,
//     });

//     await Promise.all([customerEmail, hotelEmail]);

//     // Save Order
//     await Order.create({ ...req.body, customer: req.customer });

//     res.json({ message: "Order placed successfully" });
// });
exports.placeOrder = asyncHandler(async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, hotel, room, date } = req.body;

    // Verify Razorpay Payment
    const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_SECRET_KEY)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest("hex");

    if (razorpay_signature !== expectedSignature) {
        return res.status(400).json({ message: "Invalid payment" });
    }

    const user = await Customer.findById(req.customer);
    const hotelInfo = await Hotel.findById(hotel);
    const roomInfo = await Room.findById(room);

    if (!user || !hotelInfo || !roomInfo) {
        return res.status(404).json({ message: "User, hotel, or room not found" });
    }

    // Common Styles
    const baseStyles = `
    body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 0; color: #333; }
    .container { max-width: 600px; margin: auto; background: #fff; border-radius: 8px; overflow: hidden; }
    .header { padding: 20px; text-align: center; color: #fff; }
    .body { padding: 20px; }
    .footer { padding: 10px; text-align: center; font-size: 12px; background: #f1f1f1; color: #777; }
    table { width: 100%; border-collapse: collapse; margin-top: 15px; }
    th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
    .button { display: inline-block; padding: 10px 20px; margin-top: 20px; background: #007bff; color: #fff; text-decoration: none; border-radius: 4px; }
  `;

    // Customer Email
    const customerEmail = sendEmail({
        to: user.email,
        subject: "Your Hotel Booking Confirmation",
        message: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Booking Confirmation</title>
        <style>${baseStyles}
          .header { background: #007bff; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header"><h2>Booking Confirmed</h2></div>
          <div class="body">
            <p>Dear ${user.name},</p>
            <p>Your hotel booking at <strong>${hotelInfo.name}</strong> is confirmed. Here are the details:</p>
            <table>
              <tr><th>Check-in Date</th><td>${date}</td></tr>
              <tr><th>Room Name</th><td>${roomInfo.name}</td></tr>
              <tr><th>Total Amount</th><td>${roomInfo.price}</td></tr>
            </table>
            <p><a href="http://localhost:5173/" class="button">Visit Website</a></p>
          </div>
          <div class="footer">
            <p>Hotel Address: ${hotelInfo.address}</p>
            <p>Contact: ${hotelInfo.mobile}</p>
          </div>
        </div>
      </body>
      </html>
    `,
    });

    // Hotel Email
    const hotelEmail = sendEmail({
        to: hotelInfo.email,
        subject: "New Booking Notification",
        message: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Booking Notification</title>
        <style>${baseStyles}
          .header { background: #28a745; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header"><h2>New Hotel Booking</h2></div>
          <div class="body">
            <p>Dear Hotel Team,</p>
            <p>You have a new booking from:</p>
            <table>
              <tr><th>Customer Name</th><td>${user.name}</td></tr>
              <tr><th>Email</th><td>${user.email}</td></tr>
              <tr><th>Check-in Date</th><td>${date}</td></tr>
              <tr><th>Room Type</th><td>${roomInfo.name}</td></tr>
              <tr><th>Total Amount</th><td>${roomInfo.price}</td></tr>
            </table>
          </div>
          <div class="footer">
            <p>Thank you for choosing ${hotelInfo.name}</p>
          </div>
        </div>
      </body>
      </html>
    `,
    });

    // Send Emails & Save Order
    await Promise.all([customerEmail, hotelEmail]);
    await Order.create({ ...req.body, customer: req.customer });

    res.json({ message: "Order placed successfully" });
});


// Get bookings for a user
exports.hotelBookingUser = asyncHandler(async (req, res) => {
    const result = await Order.find({ customer: req.customer })
        .populate("hotel", "name city photo")
        .populate("room");
    res.json({ message: "Hotel booking retrieved successfully", result });
});
