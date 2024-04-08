const express = require("express");
const path = require("path");
const bcrypt = require("bcryptjs");
const bodyParser = require("body-parser");
const db = require("./db");
const User = require("./user");
const app = express();
const port = 3000;

// Connect to MongoDB
db.connect();

// Use body-parser middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
// serve static files
app.use(express.static("public"));
// Set 'views' directory for EJS templates
app.set("views", path.join(__dirname, "views"));

// Set EJS as the view engine
app.set("view engine", "ejs");
app.get("/", (req, res) => {
  res.render("register");
});
app.get("/login", (req, res) => {
  res.render("login");
});
app.get("/", (req, res) => {
  res.render("home");
});
// Register route
app.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).send("Email already exists");
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const user = new User({
      username,
      email,
      password: hashedPassword,
    });

    // Save user to database
    await user.save();

    res.status(201).send("User registered successfully!");
  } catch (error) {
    console.error(error); // Log the error to the console
    res.status(500).send("Failed to register user");
  }
});

// Login route
app.post("/login", async (req, res) => {
  try {
    // Extract email and password from request body
    const { email, password } = req.body;

    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).send("User not found");
    }

    // Debugging: Log hashed passwords for comparison
    console.log("Hashed Password (DB):", user.password);
    console.log("Hashed Password (Login):", password);

    // Compare passwords
    const passwordMatch = bcrypt.compare(password, user.password);
    if (passwordMatch) {
      res.render("home");
    } else {
      res.status(401).send("Incorrect password");
    }
  } catch (error) {
    console.error(error); // Log the error to the console
    res.status(500).send("Failed to authenticate user");
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
