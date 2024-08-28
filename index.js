const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;
const SECRET_KEY = 'your_secret_key';

// Middleware
app.use(bodyParser.json());

let users = []; // In-memory array to store users

// POST /signin
app.post('/signin', async (req, res) => {
    const { username, password } = req.body;

    // Check if the user exists
    const user = users.find(user => user.username === username);
    if (!user) {
        return res.status(400).json({ message: 'User not found' });
    }

    // Check if the password is correct
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        return res.status(400).json({ message: 'Invalid password' });
    }

    // Create JWT
    const token = jwt.sign({ username: user.username }, SECRET_KEY, { expiresIn: '1h' });

    res.json({ token });
});

// GET /users
app.get('/users', (req, res) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.sendStatus(403);
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        res.json(users.map(user => user.username));
    } catch (err) {
        res.sendStatus(403);
    }
});

// Simulate a user registration for testing purposes
app.post('/register', async (req, res) => {
    const { username, password } = req.body;

    // Check if the user already exists
    const userExists = users.some(user => user.username === username);
    if (userExists) {
        return res.status(400).json({ message: 'User already exists' });
    }

    // Hash the password and store the user
    const hashedPassword = await bcrypt.hash(password, 10);
    users.push({ username, password: hashedPassword });

    res.status(201).json({ message: 'User registered successfully' });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost: 3000}`);
});
