const jwt = require("jsonwebtoken");
const User = require("../models/user");
const config = process.env;
const statusMessage = require("../libs/statusMessage")

const verifyToken = async (req, res, next) => {

    const token = req.body.token || req.query.token || req.headers.authorization;
    if (!token) {
        return res.status(401).json({message: "A token is required for authentication"});
    }

    const realToken = token.split(" ")[1];

    try {
        const decoded = jwt.verify(realToken, config.ACCESS_TOKEN_PRIVATE_KEY);
        const user = await User.findOne({ _id: decoded._id });
        if (!user) {
            return res.status(404);
        }
        else {
            req.user = decoded;
        }

        return next();
    }
    catch (err) {
        console.log(err);
        return res.status(401).json({message: err});
    }
};

module.exports = verifyToken;