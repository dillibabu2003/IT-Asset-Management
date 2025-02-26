const express = require("express");
const nodeMailer = require("nodemailer");
const cors = require("cors");
const {config} = require("dotenv");
config();

const {forgotPasswordTemplate,expirationTemplate,verifyEmailTemplate} = require("./html-templates");
const { encryptData } = require("./encrypt");
const sendEmail = require("./email");

const app = express();
const PORT = 8885;
const FRONTEND_BASE_URI=process.env.FRONTEND_BASE_URI;

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({
    extended: true
}))


//TODO: Create a API key and share with the backend and cron for secure access of end point.
//TODO: Use a message queue to avoid data loss during server crash

// API for sending email
app.post('/api/v1/send-email', async (req, res) => {
    try {
        console.log(req.body);
        
        const { email, type, data } = req.body;

        let subject, html, link;
        if(!email){
            return res.status(422).json({ message: "Email is required." });
        }
       
        switch (type) {
            case 'forgot-password':
                subject = "Reset Your Password";
                link = FRONTEND_BASE_URI+"/forgot-password?id="+encryptData(email);
                html = forgotPasswordTemplate(link);
                break;
            case 'verify-email':
                if(!data?.password){
                    return res.status(422).json({ message: "Password is missing." });
                }
                subject = "Verify Your Email";
                link = FRONTEND_BASE_URI+"/verify-email?id="+encryptData(email);
                html = verifyEmailTemplate(link,data.password);
                break;
            case 'expiry-alert':
                if(!data.expiry_item_name || !data.expiry_date){
                    return res.status(422).json({ message: "Expiry Date or Expiry Item name is missing." });
                }
                subject = `${data.expiry_item_name} Expiry Notice`;
                html = expirationTemplate(data.expiry_item_name,data.expiry_date);
                break;
            default:
                return res.status(400).json({ success: false,message: "Invalid email type" });
        }

        sendEmail(email, subject, html).then((res)=>{
            //add to logs or send an email to admin
            console.log(res);
            
        }).catch((err)=>{
            console.error(err);
        })

        res.status(202).json({success: true, message: `Mail request received and a email will be sent to ${email}`});
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Failed to send email", error: err });
    }
});

app.listen(PORT, () => {
    console.log(`Email server running on port ${PORT}`);
});