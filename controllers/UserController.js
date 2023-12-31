const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const auth = require("../middleware/auth");
const statusMessage = require("../libs/statusMessage");
const generateTokens = require("../utils/generateTokens")
const verifyRefreshToken = require("../middleware/verifyRefreshToken")

// importing user model
const User = require("../models/user");

//token expiration
const hours = 48;
const tokenHour = `${hours}h`;

module.exports = function (app) {

    app.get("/users", async (req, res) => {

        try {
            const users = await User.find({}).sort({ updatedAt: -1 });
            const formatUsers = JSON.parse(JSON.stringify(users));

            // new variable without the passwords
            const theRest =  formatUsers.map(item => {
                const { password, password_shown, ...theRest } = item
                return theRest;
            })
            res.status(200).json(theRest)

        } catch (error) {
            console.log(error);
            res.status(500).json({message: error})
        }
    });

    app.get("/user/:id", auth, async (req, res) => {
        const userId = req.params.id
        try {

            const response = await User.findOne({_id: userId})
            if(response)
                res.status(200).json(response)
            else
                res.status(401).json({message: error})

        } catch (error) {
            res.status(500).json({message: error})
            console.log(error)
        }
    })

    app.put("/user/:id", auth, async (req, res) => {

        const userId = req.params.id;

        try {
            const user = await User.findOne({ _id:userId })
            const { first_name, last_name } = req.body;
            const updateUser = { first_name, last_name };

            console.log(req.body);

        } catch (error) {
            console.log(error)
            res.status(500).json({message:error})
        }
    })

    app.delete("/user/:id", auth, async (req, res) => {

        const userId = req.params.id;

        try {
            const response = await User.deleteOne({_id: userId})
            if (response)
              res.status(201).json({ message: statusMessage.deleted });
            else
              res.status(404).json({ message: statusMessage.notFound });

        } catch (error) {
            res.status(500).json({message: error})
        }
    })

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
            let user = await User.create({
                first_name,
                last_name,
                username,
                email: email.toLowerCase(),
                password: encryptedPassword,
                password_shown: password,
            });

            if(user) {

                // Create token
                const tokens = await generateTokens(user);
                const formatUser = JSON.parse(JSON.stringify(user));

                const loggedin_at = new Date;
                const expire_at = new Date(Date.now() + hours * (60 * 60 * 1000) );

                const { password, password_shown, ...rest } = formatUser;

                // Return new user
                res.status(200).json({ user: { ...rest, tokens, loggedin_at, expire_at }, message: statusMessage.registered });

            }

        } catch (error) {
            console.error(error);
            res.status(500).json({message: error});
        }
    });

    // Login
    app.post("/login", async (req, res) => {
        try {
            // Get user input
            const { username, password } = req.body;

            // Validate user input
            if (!(username && password)) {
                return res.status(401).json({ message: statusMessage.allInputRequired });
            }

            // Validate if user exists in our database
            const user = await User.findOne({ username });

            if (user && (await bcrypt.compare(password, user.password))) {

                // Create token
                const tokens = await generateTokens(user);

                const userFormat = JSON.parse(JSON.stringify(user));
                const { password, password_shown, ...rest } = userFormat

                const loggedin_at = new Date;
                const expire_at = new Date(Date.now() + hours * (60 * 60 * 1000) );

                // Return user
                res.status(200).json({ user:{ ...rest, tokens, expired_in: tokenHour, loggedin_at, expire_at }, message: statusMessage.loggedIn });
            } else {
                res.status(401).json({ message: statusMessage.invalid });
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({message: error});
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
            res.status(500).json({message: error});
        }
    });

    app.post("/regen-access", verifyRefreshToken, async (req, res) => {

        const tokens = await generateTokens(req.user);
        res.json(tokens)

    });

}