const verifyToken = require("../middleware/auth");
const Game = require("../models/game");
const GameResult = require("../models/result");
const statusMessage = require('../libs/statusMessage');

module.exports = function (app) {

    app.post('/wheel-roll', verifyToken, async (req, res) => {

        const { game_id, index } = req.body;
        const { user_id } = req.user;

        try {
            const data = await gameInfo(game_id);
            const { name } = data;

            // Game method
            const colours = ['red', 'green'];
            const number = Math.floor((Math.random() * colours.length) + 1);
            const status = index == number ? 'win' : 'lose';

            const result = {
                game_name: name,
                response: number,
                result: status,
            };

            try {
                // save result
                await GameResult.create({
                    user_id: user_id,
                    game_id,
                    result: status,
                });
            }
            catch (error) {
                console.error(error);
                throw new Error('Failed to save game result');
            }

            res.json(result);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({message: statusMessage.error});
        }
    });
};

gameInfo = async function (gameId) {
    try {
        return await Game.findOne({ _id: gameId });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({message: statusMessage.error});
    }
}
