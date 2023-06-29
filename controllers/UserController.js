const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const auth = require("../middleware/auth");
const statusMessage = require("../libs/statusMessage");

// importing user model
const User = require("../models/user");

module.exports = function (app) {

    app.post("/user", auth, (req, res) => {
        // Access the decoded payload from req.user
        const { user_id } = req.user;
        res.status(200).json({ message: statusMessage.authenticated , user_id });
    });

    // Register
    app.post("/register", async (req, res) => {
        try {

            // Get user input
            const { first_name, last_name, email, password, username } = req.body;

            // Validate user input
            if (!(email && password && first_name && last_name && username)) {
                return res.status(400).json({ message: statusMessage.allInputRequired });
            }

            // Check if user already exists
            const oldUser = await User.findOne({ email });

            if (oldUser) {
                return res.status(400).json({ message: statusMessage.userExistsPlsLogin });
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
            res.status(200).json({ user, message: statusMessage.registered });

        } catch (error) {
            console.error(error);
            res.status(500).json({ message: statusMessage.error });
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
                res.status(200).json({ user, message: statusMessage.loggedIn });
            } else {
                res.status(401).json({ message: statusMessage.invalid });
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: statusMessage.error });
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
                res.status(404).json({ message: statusMessage.notFound });
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: statusMessage.error });
        }
    });

}