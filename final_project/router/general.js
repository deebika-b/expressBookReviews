const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Register a new user (public route)
public_users.post('/register', (req, res) => {
    let { username, password } = req.body;

    // Check if username and password are provided
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    // Check if username already exists
    if (users.find(user => user.username === username)) {
        return res.status(409).json({ message: "Username already exists" });
    }

    // Add new user to the users array
    users.push({ username, password });
    return res.status(201).json({ message: "User registered successfully" });
});

// Get the list of all books available
public_users.get('/', (req, res) => {
    // Return books data
    return res.status(200).json(books);
});

// Get details of a book by ISBN
public_users.get('/isbn/:isbn', (req, res) => {
    let isbn = req.params.isbn;
    let book = books[isbn];

    // Check if book exists with the given ISBN
    if (book) {
        return res.status(200).json(book);
    } else {
        return res.status(404).json({ message: "Book not found" });
    }
});

// Get books by a specific author
public_users.get('/author/:author', (req, res) => {
    let author = req.params.author;
    let booksByAuthor = Object.values(books).filter(book => book.author === author);

    // Check if any books are found by this author
    if (booksByAuthor.length > 0) {
        return res.status(200).json(booksByAuthor);
    } else {
        return res.status(404).json({ message: "No books found by this author" });
    }
});

// Get books by a specific title
public_users.get('/title/:title', (req, res) => {
    let title = req.params.title;
    let booksByTitle = Object.values(books).filter(book => book.title === title);

    // Check if any books are found with this title
    if (booksByTitle.length > 0) {
        return res.status(200).json(booksByTitle);
    } else {
        return res.status(404).json({ message: "No books found with this title" });
    }
});

// Get reviews of a book by ISBN
public_users.get('/review/:isbn', (req, res) => {
    let isbn = req.params.isbn;
    let book = books[isbn];

    // Check if the book exists and has reviews
    if (book) {
        return res.status(200).json(book.reviews || {});  // Ensure reviews key exists, or return an empty object
    } else {
        return res.status(404).json({ message: "Book not found" });
    }
});

module.exports.general = public_users;
