var bodyParser = require('body-parser');
const { Timestamp } = require('mongodb');
var mongoose = require('mongoose');

// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false });

mongoose.connect('mongodb+srv://root:root@pascalcluster.l1a9zat.mongodb.net/gameproject',{
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => {
    console.log('Connected to MongoDB');
})
.catch((error) => {
    console.error('Error connecting to MongoDB:', error);
});

// Game model
var Games = require('../models/game');

module.exports = function (app) {

    // Example route: GET /api/users
    app.get('/api/games', (req, res) => {

        Games.find({})
        .then((games) => {
            res.json(games);
        })
        .catch(error => {
            if(error) throw error;
        });

    });

    app.post('/api/games', urlencodedParser, (req, res) => {

        Games(req.query).save()
        .then((game) => {
            if (game) {
                res.status(200).json(game);
            } else {
                res.status(404).json({ error: 'Game not found' });
            }
        })
        .catch(error => {
            if(error) throw error;
        });

    });

    app.delete('/api/games/:name', (req, res) => {
        const gameName = req.params.name;

        Games.deleteOne({ name: gameName })
        .then((result) => {
        if (result.deletedCount > 0) {
            res.status(200).json({ message: 'Game deleted successfully' });
        } else {
            res.status(404).json({ error: 'Game not found' });
        }
        })
        .catch((error) => {
            console.error('Error deleting game:', error);
            res.status(500).json({ error: 'An error occurred' });
        });
    });

    app.put('/api/games/:id', urlencodedParser, (req, res) => {
        const gameId = req.params.id;
        const updatedGame = req.query;

        Games.findByIdAndUpdate(gameId, updatedGame, { new: true })
        .then((game) => {
        if (game) {
            res.status(200).json(game);
        } else {
            res.status(404).json({ error: 'Game not found' });
        }
        })
        .catch((error) => {
            console.error('Error updating game:', error);
            res.status(500).json({ error: 'An error occurred' });
        });
    });


}
