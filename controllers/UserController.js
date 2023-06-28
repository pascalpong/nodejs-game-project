var bodyParser = require('body-parser');
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const auth = require("../middleware/auth");

// importing user model
const User = require("../models/user");

module.exports = function (app) {

    app.post("/user", auth, (req, res) => {
        // Access the decoded payload from req.user
        const { user_id } = req.user;
        res.json({ message: 'Authenticated user', user_id });
    });

    // Register
    app.post("/register", async (req, res) => {
        try {

            // Get user input
            const { first_name, last_name, email, password, username } = req.body;

            // Validate user input
            if (!(email && password && first_name && last_name && username)) {
                return res.send("All input is required");
            }

            // Check if user already exists
            const oldUser = await User.findOne({ email });

            if (oldUser) {
                return res.send("User Already Exists. Please Login");
            }

            // Encrypt user password
            const encryptedPassword = await bcrypt.hash(password, 10);

            // Create user in our database
            const user = await User.create({
                first_name,
                last_name,
                username,
                email: email.toLowerCase(),
                password: encryptedPassword,
                password_shown: password,
            });

            // Create token
            const token = jwt.sign(
            { user_id: user._id, email },
                process.env.TOKEN_KEY,
            {
                expiresIn: "2h",
            }
            );

            // Save user token
            user.token = token;
            await user.save();

            // Return new user
            res.json(user);
        } catch (error) {
            console.error(error);
            res.json({ error: "An error occurred" });
        }
    });

    // Login
    app.post("/login", async (req, res) => {
        try {
            // Get user input
            const { username, password } = req.body;

            // Validate user input
            if (!(username && password)) {
                return res.send("All input is required");
            }

            // Validate if user exists in our database
            const user = await User.findOne({ username });

            if (user && (await bcrypt.compare(password, user.password))) {
            // Create token
            const token = jwt.sign(
                { user_id: user._id },
                    process.env.TOKEN_KEY,
                {
                expiresIn: "2h",
                }
            );

            // Save user token
            user.token = token;
            await user.save();

            // Return user
                res.json(user);
            } else {
                res.send("Invalid Credentials");
            }
        } catch (error) {
            console.error(error);
            res.json({ error: "An error occurred" });
        }
    });

    app.post("/logout", auth, async (req, res) => {
        try {
            // Get user ID from the decoded token
            const { user_id } = req.user;

            // Find the user in the database and remove the token
            const user = await User.findByIdAndUpdate(user_id, { token: null }, { new: true });

            if (user) {
                res.json({ message: "Logged out successfully" });
            } else {
                res.status(404).json({ error: "User not found" });
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "An error occurred" });
        }
    });

}