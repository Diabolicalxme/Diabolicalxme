const nodemailer = require('nodemailer');


const sendEmail = async (options) => {
    // Create a transporter object using SMTP transport
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: process.env.SMTP_PORT === '465', // secure true for port 465, false for other ports
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD,
        },
    });

    // Define the email options
    const mailOptions = {
        from: process.env.SMTP_FROM, // sender address
        to: options.email, // recipient address
        subject: options.subject, // subject of the email
        html: options.message, 
    };

    // Send mail with defined transport object
    try {
        await transporter.sendMail(mailOptions);
        console.log('Email Sent');
    } catch (error) {
        console.error('Error sending email:', error);
    }
};

module.exports = sendEmail;