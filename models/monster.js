var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var monster = new Schema({
    name: {type:String,unique:true,required:true},
    cr: {type:Number,required:true},
    hp: {type:Number,required:true},
    ac: {type:Number,required:true},
    touch: {type:Number,required:true},
    flat: {type:Number,required:true},
    initmod: {type:Number,required:true},
    dexmod: {type:Number,required:true},
    description: String
});

module.exports = mongoose.model('Monster', monster);
