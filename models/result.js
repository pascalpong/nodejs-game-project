const mongoose = require("mongoose");

const resultSchema = new mongoose.Schema({
    user_id : {
        type:String,
    },
    game_id : {
        type:String,
    },
    result : {
        type:String,
    }, 
},{
    timestamps: true
});

module.exports = mongoose.model('Result', resultSchema);