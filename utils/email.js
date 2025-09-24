const nodemailer = require("nodemailer")

exports.sendEmail = ({ to, subject, message }) => new Promise((resolve, reject) => {
    const transport = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL,
            pass: process.env.PASS,
        }
    })

    transport.sendMail({ to, subject, text: message, html: message }, (err) => {
        if (err) {
            console.log(err)
            reject("Unable to send Email", err)
        }
        console.log("Email send")
        resolve("Email send")
    })
}) 