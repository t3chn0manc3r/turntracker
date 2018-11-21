//Module Import
const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');

//Config Loading
const config = require('./config.json');

//Express Setup
var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

//Mongoose Setup
mongoose.connect(config.db.url);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error: '));
db.once('open',()=>{
    console.log("DB Connected!");
});

//Mongoose Models
var User = require('./models/user');
var Character = require('./models/character');
var Enemy = require('./models/enemy');

//API Calls
app.post('/api/signup',(req,res)=>{
    console.log('/api/signup');

    User.findOne({username:req.body.user},(err,user) => {
        if (err) {
            res.status(500).end();
            return;
        }
        if (user) {
            res.status(400).json({err:"User already exists."});
        }
        else {
            //Track weird async bug
            var hash = bcrypt.hashSync(req.body.pass,config.encryption.rounds);
            var newUser = new User({
                name:req.body.name,
                username:req.body.user,
                password:hash
            });
            newUser.save((err,result)=>{
               if (err) {
                   res.status(500).end();
                   return;
               }
               res.status(200).json(result);
            });
        }
    });
});
app.post('/api/login',(req,res)=>{
    console.log('/api/login');

    User.findOne({username:req.body.user},(err,user)=>{
        if (err) {
            console.log(err);
            res.status(500).end();
            return;
        }
        if (bcrypt.compareSync(req.body.pass, user.password)) {
            res.status(202).send("Success");
        }
        else {
            res.status(401).send("Failed");
        }
    });
});

//Server Binding
app.listen(config.server.port, function() {
    console.log("TurnTracker running on port "+config.server.port);
});
