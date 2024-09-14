const { Landowner, Labour } = require("../db/db"); // Assuming Labour is your model
const { jwt_screat } = require('../config');


async function labourMiddleware(req, res, next) {
    try {
        const authorization = req.headers.authorization;

        if (!authorization) {
            return res.status(403).json({
                message: 'Authorization header is missing'
            });
        }

        // Extract token from the Authorization header
        const token = authorization.split(" ")[1]; // Format: "Bearer <token>"

        // Verify token and extract user data
        const decoded = jwt.verify(token, jwt_secret);
        const username = decoded.username;

        if (!username) {
            return res.status(403).json({
                message: 'Token is invalid'
            });
        }

        // Verify if the user exists in the database
        const user = await Labour.findOne({ username });

        if (!user) {
            return res.status(403).json({
                message: 'User not found or unauthorized'
            });
        }

        // Attach user info to the request
        req.user = user; // You can also attach req.username if needed
        next();
    } catch (error) {
        return res.status(403).json({
            message: 'Invalid token or authentication failed',
            error: error.message
        });
    }
}
module.exports = labourMiddleware;
