var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var enemy = new Schema({
    name: String,
    hp: Number,
    ac: Number,
    touch: Number,
    flat: Number,
    init: Number,
    dex: Number
});

module.exports = mongoose.model('Enemy', enemy);
