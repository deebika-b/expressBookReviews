const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

// Middleware for parsing JSON bodies
app.use(express.json());

// Session management for customer routes
app.use("/customer", session({
    secret: "fingerprint_customer",
    resave: true,
    saveUninitialized: true
}));

// Middleware to verify JWT for protected routes under "/customer"
app.use("/customer/auth/*", function auth(req, res, next) {
    if (!req.session.authorization) {
        return res.status(403).json({ message: "User not logged in" });
    }

    let token = req.session.authorization['accessToken'];

    jwt.verify(token, "fingerprint_customer", (err, user) => {
        if (err) {
            return res.status(403).json({ message: "Unauthorized access" });
        }
        req.user = user;  // Attach the user info to the request object
        next();
    });
});

// Port number
const PORT = process.env.PORT || 5000;

// Mount routes
app.use("/customer", customer_routes);  // Customer related routes
app.use("/", genl_routes);  // General public routes

// Start the server
app.listen(PORT, () => console.log("Server is running on port " + PORT));
