const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

// Array to store users (this is for demo purposes, you can replace it with a real database)
let users = [];

// Validate if the username already exists
const isValid = (username) => {
    return users.some(user => user.username === username);
};

// Validate user credentials (username and password)
const authenticatedUser = (username, password) => {
    return users.some(user => user.username === username && user.password === password);
};

// Register a new user
regd_users.post("/register", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    if (isValid(username)) {
        return res.status(409).json({ message: "Username already exists" });
    }

    users.push({ username, password });
    return res.status(201).json({ message: "User registered successfully" });
});

// Login endpoint
regd_users.post("/login", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    if (!authenticatedUser(username, password)) {
        return res.status(401).json({ message: "Invalid credentials" });
    }

    let accessToken = jwt.sign({ username }, "fingerprint_customer", { expiresIn: '1h' });

    req.session.authorization = { accessToken, username };

    return res.status(200).json({ message: "Login successful", accessToken });
});

// Add or update a book review (only for authenticated users)
regd_users.put("/auth/review/:isbn", (req, res) => {
    let isbn = req.params.isbn;
    let review = req.body.review;
    let username = req.session.authorization?.username;

    if (!username) {
        return res.status(403).json({ message: "User not authenticated" });
    }

    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found" });
    }

    books[isbn].reviews[username] = review;

    return res.status(200).json({ message: "Review added/updated successfully", reviews: books[isbn].reviews });
});

// Delete a book review (only for authenticated users)
regd_users.delete("/auth/review/:isbn", (req, res) => {
    let username = req.session.authorization?.username;
    if (!username) {
        return res.status(403).json({ message: "User not logged in" });
    }

    let token = req.session.authorization.accessToken;
    jwt.verify(token, "fingerprint_customer", (err, user) => {
        if (err) {
            return res.status(403).json({ message: "Invalid token" });
        }

        const username = user.username;
        const isbn = req.params.isbn;

        if (!books[isbn]) {
            return res.status(404).json({ message: "Book not found" });
        }

        if (books[isbn].reviews[username]) {
            delete books[isbn].reviews[username]; // Delete the review
            return res.status(200).json({ message: "Review deleted successfully" });
        } else {
            return res.status(404).json({ message: "No review found for this user" });
        }
    });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
