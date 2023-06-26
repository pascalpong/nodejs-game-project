var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var gameController = require('./controllers/GameController');
var gameResultController = require('./controllers/GameResultController');
app.set('view engine', 'ejs');
// Serve static files from the "public" directory
app.use(express.static('public'));

// use gameController module -> padding app to the controller
gameController(app);
gameResultController(app);

app.get('/', function(req, res) {
    res.render('index');
});

app.listen(3000,()=>{
    console.log('port 3000');
});