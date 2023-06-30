const User = require("../models/user");
const jwt = require("jsonwebtoken");
const tokenDurations = require("./tokenDurations");

const verifyRefreshToken = async (refreshToken) => {

    try {
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_PRIVATE_KEY);

        const user = await User.findOne({ _id: decoded.user_id });
        const payload = { _id: user._id };
        const accessToken = jwt.sign(
            payload,
            process.env.ACCESS_TOKEN_PRIVATE_KEY,
            { expiresIn: tokenDurations.accessTokenDuration }
        );

        const tokens = {
            refreshToken,
            accessToken
        }

        return tokens;

    } catch (error) {
        console.log(error)
    }
}

module.exports = verifyRefreshToken;