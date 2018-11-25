//Module Import
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo')(session);

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
var ObjectId = mongoose.Types.ObjectId;
var User = require('./models/user');
var GameRoom = require('./models/gameroom');
var Actor = require('./models/actor');
var Monster = require('./models/monster');

//Session Setup
app.use(session({
    secret: config.session.secret,
    store: new MongoStore({mongooseConnection: mongoose.connection})
}));

//User & Session
//=========================================================
//Lets Users create an account
app.post('/api/signup',(req,res)=>{
    console.log('POST /api/signup');

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
                password:hash,
                rooms:[]
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
//Creates a User Session
app.post('/api/login',(req,res)=>{
    console.log('POST /api/login');

    User.findOne({username:req.body.user},(err,user)=>{
        if (err) {
            console.log(err);
            res.status(500).end();
            return;
        }
        if (user && user.password && bcrypt.compareSync(req.body.pass, user.password)) {
            req.session.user = {
                id: user._id,
                name:user.name,
                username: user.username,
                admin: user.admin
            }
            res.status(202).json(req.session.user);
        }
        else {
            res.status(401).json({err:"Invalid Login Information"});
        }
    });
});
//Gets a logged in User's information
app.get('/api/login',(req,res)=>{
    console.log('GET /api/login');

    if (req.session.user) {
        res.json(req.session.user);
    }
    else {
        res.status(401).end();
    }
});
//Deletes the User's active session
app.delete('/api/login',(req,res)=>{
    console.log('DELETE /api/login');

    if (req.session.user) {
        req.session.destroy((err)=>{
            if (err) {
                console.log(err);
                res.status(500).end();
            }
            else {
                res.status(200).end();
            }
        });
    }
    else {
        res.status(401).end();
    }
});

//GameRoom
//=========================================================
//Create a new GameRoom
app.post('/api/gameroom',(req,res)=>{
    console.log('POST /api/gameroom');
    if (!req.session.user) {
        res.status(401).end();
        return;
    }
    var usr = req.session.user;
    var gid = Math.random().toString(16).slice(2,8);
    var newGameRoom = new GameRoom({
        gm: ObjectId(usr.id),
        title: req.body.title,
        gametype: req.body.gametype,
        gameid: gid,
        teamvisibility: req.body.teamvisibility,
        incombat: false,
        turn: 0,
        ondeck: 0,
        rotation: [],
        inactive: [],
        requesting: [],
        players: []
    });
    newGameRoom.save((err,result)=>{
        if (err) {
            console.log(err);
            res.status(500).end();
            return;
        }
        res.status(200).json({gameid:gid});
    });
});
//Gets information about the specified GameRoom
app.get('/api/gameroom/:gameid',(req,res)=>{
    console.log('GET /api/gameroom/'+req.params.gameid);
    if (!req.session.user) {
        res.status(401).end();
        return;
    }
    GameRoom.findOne({gameid:req.params.gameid},(err,result)=>{
        if (err) {
            console.log(err);
            res.status(500).end();
            return;
        }
        if (result) {
            if (result.gm == req.session.user.id) {
                res.status(200).json(result);
            }
            else {
                res.status(403).end();
            }
        }
        else {
            res.status(400).end();
        }
    });
});
//Deletes the GameRoom
app.delete('/api/gameroom/:gameid',(req,res)=>{
    console.log('DELETE /api/gameroom/'+req.params.gameid);
    if (!req.session.user) {
        res.status(401).end();
        return;
    }

    GameRoom.findOne({gameid:req.params.gameid},(err,result)=>{
        if (err) {
            console.log(err);
            res.status(500).end();
            return;
        }
        if (result) {
            if (result.gm == req.session.user.id) {
                GameRoom.deleteOne({ gameid: req.params.gameid }, function (err) {
                    if (err) {
                        console.log(err);
                        res.status(500).end();
                        return;
                    }
                    res.status(200).end();
                });
            }
            else {
                res.status(403).end();
            }
        }
        else {
            res.status(400).end();
        }
    });
});
//Starts combat in the GameRoom
app.put('/api/gameroom/:gameid/start',(req,res)=>{
    if (!req.session.user) {
        res.status(401).end();
        return;
    }
    GameRoom.findOne({gameid:req.params.gameid},(err,result)=>{
        if (result) {
            if (result.gm == req.session.user.id) {
                // ERROR checking for actors
                //Need to find a way to edit the rotation for initiative
                GameRoom.updateOne({gameid:req.params.gameid},{
                    incombat:true,
                    turn:1,
                    ondeck:0
                },(err,result)=>{
                    if (err) {
                        console.log(err);
                        res.status(500).end();
                        return;
                    }
                    if (result && n === 1) {
                        res.status(200).end();
                    }
                    else {
                        res.status(400).end();
                    }
                });
            }
            else {
                res.status(403).end();
            }
        }
        else {
            res.status(400).end();
        }
    });
});
//Cycles the turn to the next actor in the GameRoom
app.put('/api/gameroom/:gameid/next',(req,res)=>{
    if (!req.session.user) {
        res.status(401).end();
        return;
    }
    GameRoom.findOne({gameid:req.params.gameid},(err,result)=>{
        if (result) {
            if (result.gm == req.session.user.id) {
                if (result.incombat) {
                    var turn = result.turn, ondeck = result.ondeck + 1;
                    if (ondeck === result.rotation.length) {
                        turn++;
                        ondeck = 0;
                    }
                    GameRoom.updateOne({gameid:req.params.gameid},{
                        turn,ondeck
                    },(err,result)=>{
                        if (err) {
                            console.log(err);
                            res.status(500).end();
                            return;
                        }
                        if (result && n === 1) {
                            res.status(200).end();
                        }
                        else {
                            res.status(400).end();
                        }
                    });
                }
                else {
                    res.status(400).json({err:"Not in Combat"});
                }
            }
            else {
                res.status(403).end();
            }
        }
        else {
            res.status(400).end();
        }
    });
});
//Stops combat in the specified GameRoom
app.put('/api/gameroom/:gameid/end',(req,res)=>{
    if (!req.session.user) {
        res.status(401).end();
        return;
    }
    GameRoom.findOne({gameid:req.params.gameid},(err,result)=>{
        if (result) {
            if (result.gm == req.session.user.id) {
                GameRoom.updateOne({gameid:req.params.gameid},{
                    incombat:false,
                    turn:0,
                    ondeck:0
                },(err,result)=>{
                    if (err) {
                        console.log(err);
                        res.status(500).end();
                        return;
                    }
                    if (result && n === 1) {
                        res.status(200).end();
                    }
                    else {
                        res.status(400).end();
                    }
                });
            }
            else {
                res.status(403).end();
            }
        }
        else {
            res.status(400).end();
        }
    });
});
//Creates a custom Monster for the specified GameRoom
app.post('/api/gameroom/:gameid/monster',(req,res)=>{
    if (!req.session.user) {
        res.status(401).end();
        return;
    }
    GameRoom.findOne({gameid:req.params.gameid},(err,result)=>{
        if (err) {
            console.log(err);
            res.status(500).end;
            return;
        }
        if (result) {
            if (result.gm == req.session.user.id) {
                var newMonster = new Monster({
                    name: req.body.name,
                    cr: req.body.cr,
                    hp: req.body.hp,
                    ac: req.body.ac,
                    touch: req.body.touch,
                    flat: req.body.flat,
                    initmod: req.body.initmod,
                    dexmod: req.body.dexmod,
                    gameroomid: req.params.gameid,
                    description: req.body.description
                });
                newMonster.save((err,result)=>{
                    if (err) {
                        console.log(err);
                        res.status(500).end();
                        return;
                    }
                    res.status(200).json({monsterid:result._id});
                });
            }
            else {
                res.status(403).end();
            }
        }
        else {
            res.status(400).end();
        }
    });
});
//Gets all the custom and global Monsters for the specified room
app.get('/api/gameroom/:gameid/monster',(req,res)=>{
    if (!req.session.user) {
        res.status(401).end();
        return;
    }
    res.status(400).end(); //------------------------------------
});
//Adds an/multiple instance(s) of the specified Monster into the game
app.post('/api/gameroom/:gameid/monster/:monsterid',(req,res)=>{
    if (!req.session.user) {
        res.status(401).end();
        return;
    }
    res.status(400).end(); //------------------------------------
});
//Adds the specified Actor to the game if gm, adds as request otherwise
app.post('/api/gameroom/:gameid/actor/:actorid',(req,res)=>{
    if (!req.session.user) {
        res.status(401).end();
        return;
    }
    res.status(400).end(); //------------------------------------
});
//Allows GM of the GameRoom to edit a joined Actor
app.put('/api/gameroom/:gameid/actor/:actorid',(req,res)=>{
    if (!req.session.user) {
        res.status(401).end();
        return;
    }
    res.status(400).end(); //------------------------------------
});
//Hides the information of a joined Actor from the rest of the Players in the Game Room
app.put('/api/gameroom/:gameid/actor/:actorid/hide',(req,res)=>{
    if (!req.session.user) {
        res.status(401).end();
        return;
    }
    res.status(400).end(); //------------------------------------
});
//Reveals the information of a joined Actor to the rest of the Players in the Game Room
app.put('/api/gameroom/:gameid/actor/:actorid/reveal',(req,res)=>{
    if (!req.session.user) {
        res.status(401).end();
        return;
    }
    res.status(400).end(); //------------------------------------
});
//Puts the specified Actor back into the GameRoom Rotation
app.put('/api/gameroom/:gameid/actor/:actorid/activate',(req,res)=>{
    if (!req.session.user) {
        res.status(401).end();
        return;
    }
    res.status(400).end(); //------------------------------------
});
//Removes the specified Actor back into the GameRoom Rotation
app.put('/api/gameroom/:gameid/actor/:actorid/deactivate',(req,res)=>{
    if (!req.session.user) {
        res.status(401).end();
        return;
    }
    res.status(400).end(); //------------------------------------
});
//Removes the specified Actor from the GameRoom,
//If is an NPC, will delete from existence
app.delete('/api/gameroom/:gameid/actor/:actorid',(req,res)=>{
    if (!req.session.user) {
        res.status(401).end();
        return;
    }
    res.status(400).end(); //------------------------------------
});

//Actors
//=========================================================
//Creates a new Character
app.post('/api/actor',(req,res)=>{
    console.log('POST /api/actor');
    if (!req.session.user) {
        res.status(401).end();
        return;
    }
    var newActor = new Actor({
        playerId: ObjectId(req.session.user.id),
        pc: true,
        ingame: false,
        name: req.body.name,
        hp: req.body.hp,
        currhp: req.body.hp,
        ac: req.body.ac,
        currac: req.body.ac,
        touch: req.body.touch,
        currtouch: req.body.touch,
        flat: req.body.flat,
        currflat: req.body.flat,
        initmod: req.body.initmod,
        dexmod: req.body.dexmod
    });
    newActor.save((err,result)=>{
        if (err) {
            console.log(err);
            res.status(500).end();
            return;
        }
        res.status(200).json({actorid:result._id});
    });
});
//Gets information on the specified Actor
app.get('/api/actor/:actorid',(req,res)=>{
    console.log('GET /api/gameroom/'+req.params.actorid);
    if (!req.session.user) {
        res.status(401).end();
        return;
    }
    Actor.findOne({_id:req.params.actorid},(err,result)=>{
        if (err) {
            console.log(err);
            res.status(500).end();
            return;
        }
        if (result) {
            if (result.playerId == req.session.user.id || req.session.user.admin) {
                res.status(200).json(result);
            }
            else {
                res.status(403).end();
            }
        }
        else {
            res.status(400).end();
        }
    });
});
//Edits the information of the specifed Actor
app.put('/api/actor/:actorid',(req,res)=>{
    if (!req.session.user) {
        res.status(401).end();
        return;
    }
    res.status(400).end(); //-----------------------------------
});
//Deletes the specified Actor
app.delete('/api/actor/:actorid',(req,res)=>{
    console.log('/api/actor/'+req.params.actorid);
    if (!req.session.user) {
        res.status(401).end();
        return;
    }
    Actor.findOne({_id:req.params.actorid},(err,result)=>{
        if (err) {
            console.log(err);
            res.status(500).end();
            return;
        }
        if (result) {
            if (result.playerId == req.session.user.id || req.session.user.admin) {
                Actor.deleteOne({ _id: req.params.actorid }, function (err) {
                    if (err) {
                        console.log(err);
                        res.status(500).end();
                        return;
                    }
                    res.status(200).end();
                });
            }
            else {
                res.status(403).end();
            }
        }
        else {
            res.status(400).end();
        }
    });
});

//Monsters
//=========================================================
//Creates a new Monster for global usage
app.post('/api/monster',(req,res)=>{
    console.log('POST /api/monster');
    if (!req.session.user) {
        res.status(401).end();
        return;
    }
    else if (!req.session.user.admin) {
        res.status(403).end();
        return;
    }
    var newMonster = new Monster({
        name: req.body.name,
        cr: req.body.cr,
        hp: req.body.hp,
        ac: req.body.ac,
        touch: req.body.touch,
        flat: req.body.flat,
        initmod: req.body.initmod,
        dexmod: req.body.dexmod,
        description: req.body.description
    });
    newMonster.save((err,result)=>{
        if (err) {
            console.log(err);
            res.status(500).end();
            return;
        }
        res.status(200).json({monsterid:result._id});
    });
});
//Gets the global Monster list
app.get('/api/monster/:monsterid',(req,res)=>{
    console.log('GET /api/monster/'+req.params.monsterid);
    if (!req.session.user) {
        res.status(401).end();
        return;
    }
    Monster.findOne({_id:req.params.monsterid},(err,result)=>{
        if (err) {
            console.log(err);
            res.status(500).end();
            return;
        }
        if (result) {
            if (result.playerId == req.session.user.id) {
                res.status(200).json(result);
            }
            else {
                res.status(403).end();
            }
        }
        else {
            res.status(400).end();
        }
    });
});
//Edits the global Monster
app.put('/api/monster/:monsterid',(req,res)=>{
    if (!req.session.user) {
        res.status(401).end();
        return;
    }
    else if (!req.session.user.admin) {
        res.status(403).end();
        return;
    }
    res.status(400).end(); //------------------------------------
});
//Deletes the global Monster
app.delete('/api/monster/:monsterid',(req,res)=>{
    console.log('DELETE /api/monster/'+req.params.monsterid);
    if (!req.session.user) {
        res.status(401).end();
        return;
    }
    else if (!req.session.user.admin) {
        res.status(403).end();
        return;
    }
    Monster.findOne({_id:req.params.monsterid},(err,result)=>{
        if (err) {
            console.log(err);
            res.status(500).end();
            return;
        }
        if (result) {
            if (req.session.user.admin) {
                Monster.deleteOne({ _id: req.params.monsterid }, function (err) {
                    if (err) {
                        console.log(err);
                        res.status(500).end();
                        return;
                    }
                    res.status(200).end();
                });
            }
            else {
                res.status(403).end();
            }
        }
        else {
            res.status(400).end();
        }
    });
});

//Server Binding
//=========================================================
app.listen(config.server.port, function() {
    console.log("TurnTracker running on port "+config.server.port);
});
