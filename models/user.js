var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var user = new Schema({
    name: {type:String,required:true},
    username: {type:String,unique: true,required:true},
    password: {type:String,required:true},
    admin: {type:Boolean,required:true},
    rooms: {type:Array,required:true}
});

module.exports = mongoose.model('User', user);
