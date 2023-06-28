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
    created_at : {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Result', resultSchema);