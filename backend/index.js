const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const landownerRouter = require("./routes/landowner")
const labourRouter = require("./routes/labour");



// Middleware for parsing request bodies
app.use(bodyParser.json());
app.use("/landowner", landownerRouter)
// app.use("/labour", labourRouter)
const PORT = 3000;


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});


module.exports 