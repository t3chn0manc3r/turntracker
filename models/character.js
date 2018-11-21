var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = mongoose.Schema.Types.ObjectId;

var character = new Schema({
    playerId: ObjectId,
    name: String,
    hp: Number,
    ac: Number,
    touch: Number,
    flat: Number,
    initmod: Number,
    dexmod: Number
});

module.exports = mongoose.model('Character', character);
