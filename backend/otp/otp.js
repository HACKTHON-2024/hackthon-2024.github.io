require('dotenv').config();
const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const twilio = require('twilio');

// Middleware
router.use(bodyParser.json());

// Twilio configuration from environment variables
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

// In-memory store for OTP (in production, use a database)
const otpStore = {};

// Generate OTP and send SMS using Twilio
router.post('/send-otp', (req, res) => {
    const { identifier } = req.body;
    console.log(identifier)

    // Generate a 4-digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000);

    // Store OTP with mobile number
    otpStore[identifier] = otp;

    // Send OTP via Twilio
    client.messages
        .create({
            body: `Your OTP is ${otp}`,
            from: process.env.TWILIO_PHONE_NUMBER, // Use the number from the .env file
            to: `+91${identifier}`, // Indian mobile number format
        })
        .then((message) => {
            console.log(`OTP sent to ${identifier}: ${message.sid}`);
            res.json({ success: true, message: 'OTP sent successfully' });
        })
        .catch((error) => {
            console.error('Error sending OTP:', error);
            res.status(500).json({ success: false, message: 'Error sending OTP' });
        });
});

// Verify OTP
router.post('/verify-otp', (req, res) => {
    const { identifier, otp } = req.body;

    // Check if OTP is correct
    if (otpStore[identifier] && otpStore[identifier] == otp) {
        delete otpStore[identifier]; // Remove OTP after successful verification
        res.json({ success: true, message: 'OTP verified successfully' });
    } else {
        res.status(400).json({ success: false, message: 'Invalid OTP' });
    }
});

module.exports = router;