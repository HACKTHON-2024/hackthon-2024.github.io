const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors'); // Correct module
const path = require('path');

const app = express();
const landownerRouter = require("./routes/landowner");
const labourRouter = require("./routes/labour");
const otprouter=require("./otp/otp")
const mail_otp_router=require(".//otp/mail_otp")

app.use(cors()); // Use the correct module
app.use(bodyParser.json());
app.use("/landowner", landownerRouter);
app.use("/labour", labourRouter);
app.use("/otp",otprouter)
app.use("/mail_otp",mail_otp_router)

// Serve static files from the 'frontend/static' folder
app.use('/frontend/static', express.static(path.join(__dirname, '../frontend/static')));

// Define routes
app.get('/', (req, res) => {
    res.send('Home Page');
  });
const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

module.exports = app; // Ensure to export the app if needed elsewhere
