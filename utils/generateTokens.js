
const jwt = require("jsonwebtoken");
const tokenDurations = require("./tokenDurations")

const generateTokens = async (user) => {
    try {

        const payload = { _id: user._id };
        const accessToken = jwt.sign(
            payload,
            process.env.ACCESS_TOKEN_PRIVATE_KEY,
            { expiresIn: tokenDurations.accessTokenDuration }
        );
        const refreshToken = jwt.sign(
            payload,
            process.env.REFRESH_TOKEN_PRIVATE_KEY,
            { expiresIn: tokenDurations.refreshTokenDuration }
        );

        const tokens = {
            accessToken,
            refreshToken,
        }

        return tokens;

    } catch (err) {
        return Promise.reject(err);
    }
};

module.exports = generateTokens;