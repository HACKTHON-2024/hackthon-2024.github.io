const express = require('express');
const SibApiV3Sdk = require('sib-api-v3-sdk');
const router = express.Router();
require('dotenv').config(); // Load environment variables from .env

// In-memory storage for OTPs (for demonstration)
let otpStore = {};

// Configure Brevo API
const defaultClient = SibApiV3Sdk.ApiClient.instance;
const apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = process.env.BREVO_API_KEY;  // Load API key from .env
console.log(process.env.BREVO_API_KEY)
const transactionalEmailsApi = new SibApiV3Sdk.TransactionalEmailsApi();

// Function to generate a 6-digit OTP

function generateOTP() {
    return Math.floor(1000 + Math.random() * 9000).toString();
}


// POST route to send OTP email
router.post('/send-otp', async (req, res) => {
    const { identifier } = req.body;
    console.log(identifier)
    // Ensure email is provided
    if (!identifier) {
        return res.status(400).json({ error: 'Email is required' });
    }

    // Generate OTP
    const otp = generateOTP();

    // Store the OTP in memory with expiration (e.g., 10 minutes)
    otpStore[identifier] = { otp, expiresAt: Date.now() + 10 * 60 * 1000 };

   // Create the email payload
const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
sendSmtpEmail.to = [{ email: identifier }];  // Updated this line
sendSmtpEmail.sender = { name: "Labour Field", email: "melvinjones502@gmail.com" };
sendSmtpEmail.subject = "Your OTP Code";
sendSmtpEmail.htmlContent = `<p>Your OTP code is <strong>${otp}</strong>. It is valid for 10 minutes.</p>`;

    // Send OTP email
    try {
        await transactionalEmailsApi.sendTransacEmail(sendSmtpEmail);
        return res.status(200).json({ message: 'OTP sent successfully' });
    } catch (error) {
        console.error('Error sending OTP:', error);
        return res.status(500).json({ error: 'Failed to send OTP' });
    }
});

// POST route to verify OTP
router.post('/verify-otp', (req, res) => {
    const { identifier, otp } = req.body;

    // Ensure email and OTP are provided
    if (!identifier || !otp) {
        return res.status(400).json({ error: 'Email and OTP are required' });
    }

    // Check if the OTP exists for the email
    const otpData = otpStore[identifier];
    if (!otpData) {
        return res.status(400).json({ error: 'OTP was wrong or expired' });
    }

    // Check if the OTP is still valid
    if (Date.now() > otpData.expiresAt) {
        delete otpStore[identifier]; // Remove expired OTP
        return res.status(400).json({ error: 'OTP expired' });
    }

    // Compare the provided OTP with the stored one
    if (otp === otpData.otp) {
        delete otpStore[identifier]; // Remove OTP after successful verification
        return res.status(200).json({ message: 'OTP verified successfully' });
    } else {
        return res.status(400).json({ error: 'Invalid OTP' });
    }
});

module.exports = router;
