const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();
const landownerRouter = require("./routes/landowner");
const labourRouter = require("./routes/labour");
const otprouter = require("./otp/otp");
const mail_otp_router = require("./otp/mail_otp");
const sms_router=require("./sms/sms")

// Updated CORS configuration to allow both localhost and 127.0.0.1
app.use(cors({
    origin: ['http://localhost:5500', 'http://127.0.0.1:5500'],  // Allow both URLs
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(bodyParser.json());
app.use("/landowner", landownerRouter);
app.use("/labour", labourRouter);
app.use("/otp", otprouter);
app.use("/mail_otp", mail_otp_router);
app.use("/sms",sms_router);

// Serve static files from the 'frontend/static' folder
app.use('/frontend/static', express.static(path.join(__dirname, '../frontend/')));

// Define routes
app.get('/', (req, res) => {
    res.send('Home Page');
  });
const PORT = 3000||process.env.PORT;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

module.exports = app; // Ensure to export the app if needed elsewhere
