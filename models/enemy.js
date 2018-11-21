var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var enemy = new Schema({
    name: String,
    hp: Number,
    ac: Number,
    touch: Number,
    flat: Number,
    initmod: Number,
    dexmod: Number
});

module.exports = mongoose.model('Enemy', enemy);
