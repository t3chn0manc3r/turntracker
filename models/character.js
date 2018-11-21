var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var character = new Schema({
    playerId: ObjectId,
    name: String,
    hp: Number,
    ac: Number,
    touch: Number,
    flat: Number,
    init: Number,
    dex: Number
});

module.exports = mongoose.model('Character', character);
