const verifyToken = require("../middleware/auth");


module.exports = function (app) {

    app.post('/api/gameResult', verifyToken, (req, res) => {
        
        console.log(req.user.user_id);
    });

}