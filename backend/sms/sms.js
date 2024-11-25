const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const mongoose = require('mongoose'); // Ensure you have mongoose imported
const {Landowner,Labour,Job}= require('../db/db')
const twilio = require('twilio');

require('dotenv').config(); // Load environment variables from .env

// Middleware
router.use(bodyParser.json());

// Twilio credentials
const accountSid = process.env.TWILIO_ACCOUNT_SID; // Your Account SID from www.twilio.com/console
const authToken = process.env.TWILIO_AUTH_TOKEN; // Your Auth Token from www.twilio.com/console
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER; // Your Twilio phone number

// Create a Twilio client
const client = new twilio(accountSid, authToken);

// Function to format date
const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0]; // Returns the date in YYYY-MM-DD format
};

// Example route to send SMS
router.post('/send-sms', async (req, res) => {
    const { laborId, jobId } = req.body; // Include phoneNumber in the request body

    try {
        console.log(laborId)
        // Fetch only the mobile_number field from Labour
        const labour = await Labour.findById(laborId).select('mobile_number'); // Fetch only the mobile_number field
        if (!labour) {
            return res.status(404).json({
                success: false,
                message: 'Labor not found'
            });
        }

        // Fetch job details and populate only the mobile_number of the created_By (landowner)
        const job = await Job.findById(jobId).populate({
            path: 'created_by', // Ensure this matches the field name in your Job schema
            select: 'mobile_number' // Only retrieve the mobile_number field
        });
        if (!job) {
            return res.status(404).json({
                success: false,
                message: 'Job not found'
            });
        }
       

      
        // Prepare the phone number with country code
        const phoneNumber = `+91${labour.mobile_number}`; // Add +91 to the beginning of the mobile number

        // Create the message with improved structure
        const message = `Your registration was successful!\n
Job Details:\n
- **Job Title**: ${job.title}\n
- **Description**: ${job.description}\n
- **Location**: ${job.location}\n
- **Start Date**: ${formatDate(job.start_date)}\n
- **End Date**: ${formatDate(job.end_date)}\n
- **Contact**: ${job.created_by.mobile_number}`; // Use the landowner's mobile number

        // Send SMS
        await client.messages.create({
            body: message,
            from: twilioPhoneNumber, // Twilio phone number
            to: phoneNumber // Recipient's phone number
        });

        // Log success message
        console.log('SMS sent successfully to:', phoneNumber); // Log the phone number to which the SMS was sent

        // Respond with success
        return res.status(200).json({
            success: true,
            message: 'SMS sent successfully',
            data: message // Include any relevant data
        });
    } catch (error) {
        console.error('Error sending SMS:', error);
        // Respond with an error in JSON format
        return res.status(500).json({
            success: false,
            message: 'Failed to send SMS',
            error: error.message // Include error details if necessary
        });
    }
});

module.exports = router; // Ensure you are exporting the router

