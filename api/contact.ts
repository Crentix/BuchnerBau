import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Transporter } from 'nodemailer';
const nodemailer = require('nodemailer');

// Define a Map to keep track of the requests made by each IP address
const requestsMap: Map<string, number[]> = new Map();
// Define a constant to limit the number of requests per IP address
const REQUEST_LIMIT = parseInt(process.env.REQUEST_LIMIT || "10", 10);
// Define a constant to specify the time period for the rate limiting
const TIME_PERIOD = parseInt(process.env.TIME_PERIOD || "0", 10); // in milliseconds

// Function to check if the IP address has exceeded the request limit
function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const requests = requestsMap.get(ip) ?? [];

  // Remove any requests that are older than the time period
  while (requests.length > 0 && requests[0] <= now - TIME_PERIOD) {
    requests.shift();
  }

  // Add the current request to the list
  requests.push(now);
  // Update the requestsMap
  requestsMap.set(ip, requests);

  // Check if the number of requests has exceeded the limit
  return requests.length > REQUEST_LIMIT;
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {

  if (req.method == "POST") {
    //const body = await bodyParser.json()(req, res)
    const clientIP = req.headers['x-forwarded-for'] as string;
    if (isRateLimited(clientIP)) {
      return res.status(429).json({ message: 'Zu viele Anfragen. Bitte versuchen Sie es später erneut.' });
    }
    const { name, email, message } = req.body;
    
    // create reusable transporter object using the default SMTP transport
    let transporter: Transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
      tls: {
        ciphers:'SSLv3'
      }
    });
    
    // send mail with defined transport object
    transporter.sendMail({
      from: process.env.EMAIL_USER, // sender address
      to: process.env.EMAIL_RECIPIENT, // list of receivers
      subject: `Kontaktanfrage über die Website | ${name}`, // Subject line
      text: `Neue Kontaktanfrage von ${name} (${email}):\n${message}`, // plain text body
      html: `<p>Neue Kontaktanfrage von ${name} (${email}):</p><br/><p>${message}</p>` // html text body
    }).then(info => {
      res.status(200).json({ message: 'E-Mail erfolgreich versendet' });
    }).catch(err => {
      res.status(500).json({ message: 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es später noch einmal.' });
    })
    
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