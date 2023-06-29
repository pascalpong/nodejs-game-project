const fs = require("fs");
const path = require("path");
const statusMessage = require("../libs/statusMessage")

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

    app.get('/api/games', async (req, res) => {

        try {
            const protocol = req.connection.encrypted ? 'https' : 'http';

            const response = await Games.find({})
            const jsonResponse  = JSON.parse(JSON.stringify(response))
            const formatResponse =  jsonResponse.map((item) => ({...item, image: `${protocol}://${req.hostname}:${process.env.API_PORT}/${item.image}`}))
            res.status(200).json(formatResponse);
        }
        catch (error) {
            console.error(error);
            res.status(400)
        }

    });

    app.get('/api/games/:id', async (req, res) => {

        const gameId = req.params.id;

        try {
            const protocol = req.connection.encrypted ? 'https' : 'http';
            const response = await Games.findOne({ _id:gameId })
                response.image = `${protocol}://${req.hostname}:${process.env.API_PORT}/${response.image}`;
            res.status(200).json(response);
        }
        catch (error) {
            console.error(error);
            res.status(400)
        }

    });

    app.post('/api/games', upload.single('image'), async (req, res) => {

        // Check if a file was uploaded
        if (!req.file)
            return res.status(404).json({ message: statusMessage.fileNotFound });

        // Get the file path
        const imagePath = req.file.path;

        // Get other form data
        const { name, link, type, category_id } = req.body;
            // Validate form data
        if (!name) {
            return res.status(400).json({ message: statusMessage.requireName });
        }
        else if(!link) {
            return res.status(400).json({ message: statusMessage.requireLink });
        }
        else if(!type) {
            return res.status(400).json({ message: statusMessage.requireType });
        }
        else if(!category_id) {
            return res.status(400).json({ message: statusMessage.requireCategory });
        }

        // Create a new game object with the uploaded image path
        const newGame = {
            name,
            link,
            image: imagePath,
            type,
            category_id,
        };

        try {
            const response = await Games(newGame).save()
            if (response)
                res.status(201).json({response, message: statusMessage.created});
            else
                res.status(404).json({ message: statusMessage.notFound });
        }
        catch {
            console.error(error);
            res.status(400)
        }
    });

    app.delete("/api/games/:id", async (req, res) => {

        const gameId = req.params.id;

        try {
            const response = await Games.deleteOne({ _id: gameId });
            if (response)
              res.status(201).json({ message: statusMessage.deleted });
            else
              res.status(404).json({ message: statusMessage.notFound });

        } catch (error) {
            console.error(error);
            res.status(400)
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
                return res.status(404).json({ message: statusMessage.notFound });
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
                    try {
                        await fs.promises.unlink(oldImageFilePath);
                    } catch (error) {
                        console.error('Error removing old file:', error);
                        return res.status(500).json({ message: statusMessage.error });
                    }
                }
            }

            const response = await Games.findByIdAndUpdate(gameId, updatedGame, { new: true })
            if (response)
                res.status(200).json({ response, message: statusMessage.updated });
            else
                res.status(404).json({ message: statusMessage.notFound });

        } catch (error) {
            console.error(error);
            res.status(400)
        }
    });

}
