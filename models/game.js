const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
    name: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: false,
    },
    link: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    category_id: {
      type: Number,
      required: true,
    }
},{
  timestamps: true
});


module.exports = mongoose.model('Game', gameSchema);