const fs = require("fs");
const path = require("path");

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
    app.get('/api/games', async (req, res) => {

        try {
            const response = await Games.find({})
            res.json(response);
        }
        catch (error) {
            if(error) throw error;
        }

    });

    app.post('/api/games', upload.single('image'), async (req, res) => {
        // Check if a file was uploaded
        if (!req.file)
            return res.status(400).json({ error: "No file uploaded" });

        // Get the file path
        const imagePath = req.file.path;

        // Get other form data
        const { name, link, type } = req.body;

        // Create a new game object with the uploaded image path
        const newGame = {
            name,
            link,
            image: imagePath,
            type,
            category_id: 1,
        };

        try {
            const response = await Games(newGame).save()
            if (response)
                res.json(response);
            else
                res.json({ error: "Game not found" });
        }
        catch {
            console.error(error);
            res.json({ error: "An error occurred" });
        }
    });

    app.delete("/api/games/:id", async (req, res) => {

        const gameId = req.params.id;
        try {
            const response = await Games.deleteOne({ __id: gameId })
            if (response)
              res.json({ message: "Game deleted successfully" });
            else
              res.json({ error: "Game not found" });

        } catch (error) {
            console.error("Error deleting game:", error);
            res.json({ error: "An error occurred while deleting the game" });
        }
    });

    app.put('/api/games/:id', upload.single('image'), async (req, res) => {

        const gameId = req.params.id;
        // Get the file path
        const file = req.file;
        // Get other form data
        const { name, link, type, category_id } = req.body;

        try {
            const game = await Games.findById(gameId);
            if (!game) {
                return res.json({ error: 'Game not found' });
            }
            const updatedGame = {
                name,
                link,
                type,
                category_id,
            };

            // If a new file is uploaded, update the image path and remove the old file
            if (file) {
                const imagePath = file.path;
                updatedGame.image = imagePath;

                // Remove the old file from storage
                const oldImagePath = game.image;
                if (oldImagePath) {
                    const oldImageFilePath = path.join(__dirname, '..', oldImagePath);
                    // remove old file
                    fs.unlink(oldImageFilePath);
                }
            }

            const response = await Games.findByIdAndUpdate(gameId, updatedGame, { new: true })
            if (response)
                res.json(response);
            else
                res.json({ error: 'Game not found' });

        } catch (error) {
            console.error('Error updating game:', error);
            res.json({ error: 'An error occurred' });
        }
    });

}
