var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = mongoose.Schema.Types.ObjectId;

var actor = new Schema({
    playerid: {type:ObjectId,required:true},
    pc: {type:Boolean,required:true},
    gametype: {type: Boolean,required:true},
    ingame: {type:Boolean,required:true},
    gameid: String,
    name: {type:String,required:true},
    hp: {type:Number,required:true},
    currhp: {type:Number,required:true},
    ac: {type:Number,required:true},
    currac: {type:Number,required:true},
    touch: {type:Number,required:true},
    currtouch: {type:Number,required:true},
    flat: {type:Number,required:true},
    currflat: {type:Number,required:true},
    initiative: {type:Number,required:true},
    initmod: {type:Number,required:true},
    dexmod: {type:Number,required:true}
});

module.exports = mongoose.model('Actor', actor);
