

module.exports = function (app) {

    app.get('/api/gameResult/:token', (req, res) => {
        
        res.json({asdf:req.params.token});
    });

}