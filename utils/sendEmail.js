const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendEmail = async ({ to, subject, message }) => {
    try {
        await sgMail.send({
            to,
            from: process.env.SENDGRID_SENDER_EMAIL,
            subject,
            html: message,
        });
        console.log(`Email sent to ${to}`);
        return true;
    } catch (error) {
        console.error(`Unable to send email to ${to}:`, error.response?.body || error);
        return false;
    }
};

module.exports = sendEmail;
