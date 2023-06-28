require("dotenv").config();
require("./config/database").connect();

const express = require("express");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

//controllers
const gameController = require("./controllers/GameController");
const gameResultController = require("./controllers/GameResultController");
const UserController = require("./controllers/UserController");
//use controllers
gameController(app);
gameResultController(app);
UserController(app);

app.set("view engine", "ejs");

app.get("/register", (req, res) => {
    res.render('register');
});

module.exports = app;