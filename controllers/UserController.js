var bodyParser = require('body-parser');
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const auth = require("../middleware/auth");

// importing user model
const User = require("../models/user");

module.exports = function (app) {

    app.post("/welcome", auth, (req, res) => {
        res.status(200).send("Welcome 🙌 ");
    });

    app.post("/user", auth, (req, res) => {
        // Access the decoded payload from req.user
        const { user_id } = req.user;
        res.json({ message: 'Authenticated user', user_id });
    });

    // Register
    app.post("/register", async (req, res) => {
        try {
            // Get user input
            const { first_name, last_name, email, password } = req.query;

            // Validate user input
            if (!(email && password && first_name && last_name)) {
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
        const { email, password } = req.query;

        // Validate user input
        if (!(email && password)) {
            return res.send("All input is required");
        }

        // Validate if user exists in our database
        const user = await User.findOne({ email });

        if (user && (await bcrypt.compare(password, user.password))) {
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

}