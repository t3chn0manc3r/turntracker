var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = mongoose.Schema.Types.ObjectId;

var gameroom = new Schema({
    gm: {type:ObjectId,required:true},
    title: {type:String,required:true},
    gametype: {type: Boolean,required:true},
    gameid: {type:String,unique: true,required:true},
    teamvisibility: {type:Number,required:true},
    incombat: {type: Boolean,required:true},
    turn: {type:Number,required:true},
    ondeck: {type:Number,required:true},
    rotation: {type:Array, required:true},
    inactive: {type:Array, required:true},
    players: {type:Array, required:true}
});

module.exports = mongoose.model('GameRoom', gameroom);
