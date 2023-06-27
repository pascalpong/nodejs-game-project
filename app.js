require("dotenv").config();
require("./config/database").connect();
const express = require("express");

const app = express();
app.use(express.json());

//controllers
const gameController = require("./controllers/GameController");
const gameResultController = require("./controllers/GameResultController");
const UserController = require("./controllers/UserController");
//use controllers
gameController(app);
gameResultController(app);
UserController(app);


const bodyParser = require("body-parser");

app.set("view engine", "ejs");

app.get("/register", (req, res) => {
    res.render('register');
});

module.exports = app;