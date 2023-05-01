const serverless = require("serverless-http");
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const app = express();

app.use(cors())
app.use(express.json())

app.post("/contact", async (req, res) => {
    console.log("incoming post request")
    const { name, email, message } = req.body;

    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  
    // send mail with defined transport object
    let info = await transporter.sendMail({
      from: email, // sender address
      to: process.env.EMAIL_RECIPIENT, //'buchner-bau@r-kom.net', // list of receivers
      subject: `Nachricht von ${name} über die Website`, // Subject line
      text: message, // plain text body
    });
  
    res.status(200).json({ message: 'E-Mail erfolgreich versendet' });
})

// wrap express app with serverless http to work with Vercel
module.exports = serverless(app);