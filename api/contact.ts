import type { VercelRequest, VercelResponse } from '@vercel/node';
const nodemailer = require('nodemailer');

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {

  if (req.method == "POST") {
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
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }

  /*
  response.status(200).json({
    body: request.body,
    query: request.query,
    cookies: request.cookies,
  });
  */
}