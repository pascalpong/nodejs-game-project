var bodyParser = require('body-parser');

// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false });


// Game model
var Games = require('../models/game');



const multer = require("multer");
// Create multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      // Set the destination folder where the uploaded image will be saved
      cb(null, "public/uploads");
    },
    filename: (req, file, cb) => {
      // Set the filename of the uploaded image
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const fileExtension = file.originalname.split(".").pop();
      const fileName = `${uniqueSuffix}.${fileExtension}`;
      cb(null, fileName);
    },
  });

const upload = multer({ storage });



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

    app.post('/api/games', upload.single('image'), (req, res) => {
        const { file } = req;

        // Check if a file was uploaded
        if (!file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        // Get the file path
        const imagePath = file.path;

        // Get other form data
        const { name, link, type } = req.body;

        // Create a new game object with the uploaded image path
        const newGame = {
          name,
          link,
        //   image: imagePath ?? null,
          image,
          type,
          category_id:1,
        };

        // Save the new game to the database
        Games(newGame).save()
            .then((game) => {
                if (game) {
                    res.status(200).json(game);
                } else {
                    res.status(404).json({ error: "Game not found" });
                }
            })
            .catch((error) => {
                console.error(error);
                res.status(500).json({ error: "An error occurred" });
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
