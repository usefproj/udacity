const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const { log } = require('console');

const app = express();
const port = 3000;
const dataFilePath = path.join(__dirname, 'data', 'users.json');

// Ensure data directory and file exist
if (!fs.existsSync(path.dirname(dataFilePath))) {
    fs.mkdirSync(path.dirname(dataFilePath));
}

if (!fs.existsSync(dataFilePath)) {
    fs.writeFileSync(dataFilePath, JSON.stringify([]));
}

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Route to handle form submission
app.post('/submit', (req, res) => {
    const { name, password, age, height, weight } = req.body;
    const bmr = Math.floor(10*weight + 6.25*height - 5*age + 5);

    // Read existing users from file
    let users = JSON.parse(fs.readFileSync(dataFilePath));

    // Add new user to the array
    users.push({ name, password, age, height, weight, bmr });

    // Write updated users to file
    fs.writeFileSync(dataFilePath, JSON.stringify(users, null, 2));

    res.send(`
        <h1>Form Submitted</h1>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Password:</strong> ${password}</p>
        <p><strong>Age:</strong> ${age}</p>
        <p><strong>Height:</strong> ${height} cm</p>
        <p><strong>Weight:</strong> ${weight} kg</p>
        <p><strong>Daily calories:</strong> ${bmr}</p>
    `);
});

// Route to get all users
app.get('/users', (req, res) => {
    const users = JSON.parse(fs.readFileSync(dataFilePath));
    res.json(users);
});

app.post('/login', (req, res) => {
    const { name, password } = req.body;
    let users = JSON.parse(fs.readFileSync(dataFilePath));

    // Find user
    const user = users.find(user => user.name === name && user.password === password);

    if (user) {
        res.send(`<h1>Welcome back, ${name}!</h1>`);
    } else {
        res.send(`<h1>Invalid credentials</h1>`);
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);    
});
