const jwt = require("jsonwebtoken");
const User = require("../models/user");
const config = process.env;

const verifyToken = async (req, res, next) => {

    const token = req.body.token || req.query.token || req.headers.authorization;
    const realToken = token.split(" ")[1];

    if (!token) {
        return res.send("A token is required for authentication");
    }
    try {
        const decoded = jwt.verify(realToken, config.TOKEN_KEY);
        const user = await User.findOne({ _id: decoded.user_id });
        if (!user) {
            return res.status(403).send("Invalid User");
        }

        req.user = decoded;
        return next();
    }
    catch (err) {
        return res.send("Invalid Token");
    }
};

module.exports = verifyToken;