var bodyParser = require('body-parser');

// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false });


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

        // Get other form data
        const { name, link, type, image } = req.query;

        // Create a new game object with the uploaded image path
        const newGame = {
          name,
          link,
          image,
          type,
          category_id:1,
        };

        // Save the new game to the database
        Games(newGame).save()
            .then((game) => {
                if (game) {
                    res.json(game);
                } else {
                    res.json({ error: "Game not found" });
                }
            })
            .catch((error) => {
                console.error(error);
                res.json({ error: "An error occurred" });
            });
    });

    app.delete("/api/games/:id", (req, res) => {
        const gameId = req.params.id;

        Games.deleteOne({ __id: gameId })
          .then((result) => {
            if (result) {
              res.json({ message: "Game deleted successfully" });
            } else {
              res.json({ error: "Game not found" });
            }
          })
          .catch((error) => {
            console.error("Error deleting game:", error);
            res.json({ error: "An error occurred while deleting the game" });
          });
      });

    app.put('/api/games/:id', urlencodedParser, (req, res) => {
        const gameId = req.params.id;
        const updatedGame = req.query;

        Games.findByIdAndUpdate(gameId, updatedGame, { new: true })
        .then((game) => {
        if (game) {
            res.json(game);
        } else {
            res.json({ error: 'Game not found' });
        }
        })
        .catch((error) => {
            console.error('Error updating game:', error);
            res.json({ error: 'An error occurred' });
        });
    });


}
