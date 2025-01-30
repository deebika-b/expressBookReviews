async/wait updated code
const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Helper function for handling errors
const handleError = (res, error, message) => {
    console.error(error);
    res.status(500).json({ message: message, error: error.message });
};

// Register a new user (public route)
public_users.post('/register', async (req, res) => {
    const { username, password } = req.body;

    // Check if username and password are provided
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    // Check if username already exists
    if (users.find(user => user.username === username)) {
        return res.status(409).json({ message: "Username already exists" });
    }

    // Add new user to the users array (Simulating DB storage, would be async in real-world scenarios)
    try {
        users.push({ username, password });
        return res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        handleError(res, error, "Error registering user");
    }
});

// Get the list of all books available
public_users.get('/', async (req, res) => {
    try {
        // Return all books as a JSON response
        return res.status(200).json(Object.values(books));
    } catch (error) {
        handleError(res, error, "Error fetching books");
    }
});

// Get details of a book by ISBN
public_users.get('/isbn/:isbn', async (req, res) => {
    const { isbn } = req.params;
    try {
        const book = books[isbn];
        if (book) {
            return res.status(200).json(book);
        } else {
            return res.status(404).json({ message: "Book not found" });
        }
    } catch (error) {
        handleError(res, error, "Error fetching book by ISBN");
    }
});

// Get books by a specific author
public_users.get('/author/:author', async (req, res) => {
    const { author } = req.params;
    try {
        const booksByAuthor = Object.values(books).filter(book => book.author.toLowerCase().includes(author.toLowerCase()));

        if (booksByAuthor.length > 0) {
            return res.status(200).json(booksByAuthor);
        } else {
            return res.status(404).json({ message: "No books found by this author" });
        }
    } catch (error) {
        handleError(res, error, "Error fetching books by author");
    }
});

// Get books by a specific title
public_users.get('/title/:title', async (req, res) => {
    const { title } = req.params;
    try {
        const booksByTitle = Object.values(books).filter(book => book.title.toLowerCase().includes(title.toLowerCase()));

        if (booksByTitle.length > 0) {
            return res.status(200).json(booksByTitle);
        } else {
            return res.status(404).json({ message: "No books found with this title" });
        }
    } catch (error) {
        handleError(res, error, "Error fetching books by title");
    }
});


// Get details of a book by ISBN (using Promise)
public_users.get('/isbn/:isbn', (req, res) => {
    const { isbn } = req.params;

    // Create a promise that resolves or rejects based on the presence of the book
    new Promise((resolve, reject) => {
        const book = books[isbn];
        if (book) {
            resolve(book);  // If the book is found, resolve the promise
        } else {
            reject("Book not found");  // If the book isn't found, reject the promise
        }
    })
    .then(book => {
        return res.status(200).json(book);  // Send the book details if resolved
    })
    .catch(error => {
        return res.status(404).json({ message: error });  // Handle error if rejected
    });
});


module.exports.general = public_users;
