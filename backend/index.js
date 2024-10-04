const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors'); // Correct module

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

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

module.exports = app; // Ensure to export the app if needed elsewhere
