const nodeMailer = require("nodemailer");


const transport = nodeMailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: true,
    auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD
    }
});

const sendEmail = (to, subject, html) => {
    return transport.sendMail({
        from: process.env.SMTP_EMAIL,
        to,
        subject,
        html
    });
};

module.exports=sendEmail;