//Module Import
const express = require('express');
const cors = require('cors');
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
    store: new MongoStore({mongooseConnection: mongoose.connection}),
    saveUninitialized: false
}));

//Validation Helper Functions
//=========================================================
function validateBody(allowed,required,body) {
    var status = true;
    var errors = [];
    var values = Object.keys(body);
    for(var i in required) {
        if (!values.includes(required[i])) {
            status = false;
            errors.push("Missing Field: "+required[i]);
        }
    }
    for(var i in values) {
        if (!allowed.includes(values[i])) {
            status = false;
            errors.push("Invalid Field: "+values[i]);
        }
    }
    return {status,errors};
}

app.use(cors({credentials: true, origin: 'http://localhost:3000'}));

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
                admin: false,
                rooms:[]
            });
            newUser.save((err,result)=>{
               if (err) {
                   console.log(err);
                   res.status(500).end();
                   return;
               }
               res.status(200).end();
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
                admin: user.admin,
                rooms: user.rooms
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

//Actors
//=========================================================
const actorAllowed = ['name','hp','currhp','ac','currac','touch','currtouch',
                      'flat','currflat','initiative','initmod','dexmod','gametype'];
const actorPostRequired = ['name','hp','ac','touch','flat','initmod','dexmod',
                           'gametype'];
//Creates a new Character
app.post('/api/actor',(req,res)=>{
    console.log('POST /api/actor');
    if (!req.session.user) {
        res.status(401).end();
        return;
    }
    var check = validateBody(actorPostRequired,actorPostRequired,req.body);
    if (!check.status) {
        res.status(400).json({err:check.errors});
        return;
    }
    var newActor = new Actor({
        playerid: ObjectId(req.session.user.id),
        pc: true,
        gametype: req.body.gametype,
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
        initiative: 0,
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
app.get('/api/actor',(req,res)=>{
    console.log('GET /api/actor');
    if (!req.session.user) {
        res.status(401).end();
        return;
    }
    Actor.find({playerid:req.session.user.id},(err,actors)=>{
        if (err) {
            console.log(err);
            res.status(500).end();
            return;
        }
        res.send(actors);
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
            if (result.playerid == req.session.user.id || req.session.user.admin) {
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
    var check = validateBody(actorAllowed,[],req.body);
    if (!check.status) {
        res.status(400).json({err:check.errors});
        return;
    }
    Actor.findOne({_id:req.params.actorid},(err,result)=>{
        if (err) {
            console.log(err);
            res.status(500).end();
            return;
        }
        if (result) {
            if (result.playerid == req.session.user.id || req.session.user.admin) {
                Actor.updateOne({ _id: req.params.actorid }, req.body, function (err) {
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
            if (result.playerid == req.session.user.id || req.session.user.admin) {
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
const monsterAllowed = ['name','cr','hp','ac','touch','flat','initmod','dexmod',
                        'description','gametype'];
const monsterPostRequired = ['name','cr','hp','ac','touch','flat','initmod',
                             'dexmod','gametype'];
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
    var check = validateBody(monsterPostRequired,monsterPostRequired,req.body);
    if (!check.status) {
        res.status(400).json({err:check.errors});
        return;
    }
    var newMonster = new Monster({
        name: req.body.name,
        gametype: req.body.gametype,
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
app.get('/api/monster',(req,res)=>{
    console.log('GET /api/monster/');
    if (!req.session.user) {
        res.status(401).end();
        return;
    }
    Monster.find({gameroomid:{$exists:false}},(err,result)=>{
        if (err) {
            console.log(err);
            res.status(500).end();
            return;
        }
        if (result) {
            res.status(200).json(result);
        }
        else {
            res.status(400).end();
        }
    });
});
//Gets a global Monster
app.get('/api/monster/:monsterid',(req,res)=>{
    console.log('GET /api/monster/'+req.params.monsterid);
    if (!req.session.user) {
        res.status(401).end();
        return;
    }
    Monster.findOne({_id:req.params.monsterid, gameroomid:{$exists:false}},(err,result)=>{
        if (err) {
            console.log(err);
            res.status(500).end();
            return;
        }
        if (result) {
            if (result.playerid == req.session.user.id) {
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
    var check = validateBody(monsterAllowed,[],req.body);
    if (!check.status) {
        res.status(400).json({err:check.errors});
        return;
    }
    Monster.findOne({_id:req.params.monsterid, gameroomid:{$exists:false}},(err,result)=>{
        if (err) {
            console.log(err);
            res.status(500).end();
            return;
        }
        if (result) {
            Monster.updateOne({ _id: req.params.monsterid, gameroomid:{$exists:false}}, req.body, (err) => {
                if (err) {
                    console.log(err);
                    res.status(500).end();
                    return;
                }
                res.status(200).end();
            });
        }
        else {
            res.status(400).end();
        }
    });
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
    Monster.findOne({_id:req.params.monsterid, gameroomid:{$exists:false}},(err,result)=>{
        if (err) {
            console.log(err);
            res.status(500).end();
            return;
        }
        if (result) {
            if (req.session.user.admin) {
                Monster.deleteOne({ _id: req.params.monsterid, gameroomid:{$exists:false} }, (err) => {
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

//GameRoom
//=========================================================
const gameroomPostRequired = ['title','gametype','teamvisibility'];
//Create a new GameRoom
app.post('/api/gameroom',(req,res)=>{
    console.log('POST /api/gameroom');
    if (!req.session.user) {
        res.status(401).end();
        return;
    }
    var check = validateBody(gameroomPostRequired,gameroomPostRequired,req.body);
    if (!check.status) {
        res.status(400).json({err:check.errors});
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
    GameRoom.findOne({gameid:req.params.gameid}).populate('rotation.actor').populate('inactive').populate('requesting').exec((err,result)=>{
        if (err) {
            console.log(err);
            res.status(500).end();
            return;
        }
        if (result) {
            if (result.gm == req.session.user.id) {
                res.json(result);
            }
            else {
                var playerinfo = {
                    gm: "Name Here",
                    title: result.title,
                    incombat: result.incombat,
                    turn: result.turn,
                    ondeck: result.ondeck,
                    rotation: result.rotation,
                    players: result.players
                };

                res.json(playerinfo);
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
    console.log('PUT /api/gameroom/'+req.params.gameid+'/start');
    if (!req.session.user) {
        res.status(401).end();
        return;
    }
    GameRoom.findOne({gameid:req.params.gameid},(err,result)=>{
        if (result) {
            if (result.gm == req.session.user.id) {
                if (!result.rotation.length || result.rotation.length < 1) {
                    res.status(400).json({err:"No Actors in Rotation"});
                    return;
                }

                GameRoom.updateOne({gameid:req.params.gameid},{
                    incombat:true,
                    turn:1,
                    ondeck:0,
                    $push:{rotation:{$each:[],$sort:{initiative:-1,dexmod:-1,pc:-1}}}
                },(err,result)=>{
                    if (err) {
                        console.log(err);
                        res.status(500).end();
                        return;
                    }
                    if (result) {
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
    console.log('PUT /api/gameroom/'+req.params.gameid+'/next');
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
                        if (result) {
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
    console.log('PUT /api/gameroom/'+req.params.gameid+'/end');
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
                    if (result) {
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
    console.log("POST /api/gameroom/"+req.params.gameid+"/monster");
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
                var check = validateBody(monsterPostRequired,monsterPostRequired,req.body);
                if (!check.status) {
                    res.status(400).json({err:check.errors});
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
            res.status(400).json({err:"Invalid GameRoom"});
        }
    });
});
//Gets all the custom and global Monsters for the specified room
app.get('/api/gameroom/:gameid/monster',(req,res)=>{
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
                Monster.find({gameroomid:req.params.gameid},(err,result)=>{
                    if (err) {
                        console.log(err);
                        res.status(500).end();
                        return;
                    }
                    res.json(result);
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
//Adds an/multiple instance(s) of the specified Monster into the game
app.post('/api/gameroom/:gameid/monster/:monsterid',(req,res)=>{
    console.log('POST /api/gameroom/'+req.params.gameid+'/monster/'+req.params.monsterid);
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
                Monster.findOne({_id:req.params.monsterid},(err,monster)=>{
                    if (err) {
                        console.log(err);
                        res.status(500).end();
                        return;
                    }
                    if (monster) {
                        if (monster.gameroomid && (monster.gameroomid != req.params.gameid)) {
                            res.status(403).end();
                            return;
                        }
                        var qty = 1;
                        if (req.body.qty && Number.isInteger(req.body.qty,{min:1})) {
                            qty = req.body.qty;
                        }
                        else if (req.body.qty) {
                            res.status(400).json({err:"Invalid Quantity"});
                            return;
                        }
                        var actors = [];
                        for (let i = 1; i <= qty; i++) {
                            actors.push({
                                playerid: ObjectId(req.session.user.id),
                                pc: false,
                                gametype: monster.gametype,
                                ingame: true,
                                name: monster.name + " " + i,
                                hp: monster.hp,
                                currhp: monster.hp,
                                ac: monster.ac,
                                currac: monster.ac,
                                touch: monster.touch,
                                currtouch: monster.touch,
                                flat: monster.flat,
                                currflat: monster.flat,
                                initiative: 0,
                                initmod: monster.initmod,
                                dexmod: monster.dexmod
                            });
                        }
                        Actor.insertMany(actors,(err,monsterinfo)=>{
                            if (err) {
                                console.log(err);
                                res.status(500).end();
                                return;
                            }
                            res.status(200).end();
                            var add = monsterinfo.map((dat)=>dat._id);
                            GameRoom.updateOne({gameid:req.params.gameid},{$push:{inactive:{$each:add}}},(err)=>{
                                if (err) {
                                    console.log(err);
                                    res.status(500).end();
                                    return;
                                }
                                res.status(200).end();
                            });
                        });
                    }
                    else {
                        res.status(400).json({err:"Invalid Monster"});
                    }
                });
            }
            else {
                res.status(403).end();
            }
        }
        else {
            res.status(400).json({err:"Invalid GameRoom"});
        }
    });
});
//Request Character to be added to the GameRoom
app.post('/api/gameroom/:gameid/actor/:actorid',(req,res)=>{
    console.log('POST /api/gameroom/'+req.params.gameid+'/actor/'+req.paramms.actorid);
    if (!req.session.user) {
        res.status(401).end();
        return;
    }
    Actor.findOne({_id:req.params.actorid},(err,actor)=>{
        if (err) {
            console.log(err);
            res.status(500).end();
            return;
        }
        if (actor) {
            if (actor.playerid == req.session.user.id) {
                GameRoom.findOne({gameid:req.params.gameid},(err,room)=>{
                    if (err) {
                        console.log(err);
                        res.status(500).end();
                        return;
                    }
                    if (room) {
                        var actorids = room.rotation.map((obj)=>ObjectId(obj.actor));
                        if (room.requesting.indexOf(actor._id) > -1) {
                            res.status(400).json({err:"Request Already Sent"});
                            return;
                        }
                        else if (actorids.indexOf(actor._id) > -1) {
                            res.status(400).json({err:"Actor Already in Game"});
                            return;
                        }
                        GameRoom.updateOne({gameid:req.params.gameid},{$push:{requesting:ObjectId(actor._id)}},(err)=>{
                            if (err) {
                                console.log(err);
                                res.status(500).end();
                                return;
                            }
                            res.status(200).end();
                        });
                    }
                    else {
                        res.status(400).json({err:"Invalid GameRoom"});
                    }
                });
            }
            else {
                res.status(403).end();
            }
        }
        else {
            res.status(400).json({err:"Invalid Actor"});
        }
    });
});
//Approves a request for an Actor to join
app.put('/api/gameroom/:gameid/actor/:actorid/approve',(req,res)=>{
    console.log('PUT /api/gameroom/'+req.params.gameid+'/actor/'+req.params.actorid+'/approve');
    if (!req.session.user) {
        res.status(401).end();
        return;
    }
    GameRoom.findOne({gameid:req.params.gameid},(err,room)=>{
        if (err) {
            console.log(err);
            res.status(500).end();
            return;
        }
        if (room) {
            if (req.session.user.id == room.gm) {
                if (room.requesting.indexOf(req.params.actorid) > -1) {
                    GameRoom.updateOne({gameid:req.params.gameid},
                     {$pull:{requesting:ObjectId(req.params.actorid)},
                     $push:{inactive:ObjectId(req.params.actorid)}},(err)=>{
                         if (err) {
                             console.log(err);
                             res.status(500).end();
                             return;
                         }
                         res.status(200).end();
                    });
                }
                else {
                    res.status(400).json({err:"Request for Actor not found"});
                }
            }
            else {
                res.status(403).end();
            }
        }
        else {
            res.status(400).json({err:"Invalid GameId"});
        }
    });
});
//Denies a request for an Actor to join
app.put('/api/gameroom/:gameid/actor/:actorid/deny',(req,res)=>{
    consle.log('PUT /api/gameroom/'+req.params.gameid+'/actor/'+req.params.actorid+'/deny');
    if (!req.session.user) {
        res.status(401).end();
        return;
    }
    GameRoom.findOne({gameid:req.params.gameid},(err,room)=>{
        if (err) {
            console.log(err);
            res.status(500).end();
            return;
        }
        if (room) {
            if (req.session.user.id == room.gm) {
                if (room.requesting.indexOf(req.params.actorid) > -1) {
                    GameRoom.updateOne({gameid:req.params.gameid},
                     {$pull:{requesting:ObjectId(req.params.actorid)}},(err)=>{
                         if (err) {
                             console.log(err);
                             res.status(500).end();
                             return;
                         }
                         res.status(200).end();
                    });
                }
                else {
                    res.status(400).json({err:"Request for Actor not found"});
                }
            }
            else {
                res.status(403).end();
            }
        }
        else {
            res.status(400).json({err:"Invalid GameRoom"});
        }
    });
});
//Allows GM of the GameRoom to edit a joined Actor
app.put('/api/gameroom/:gameid/actor/:actorid',(req,res)=>{
    console.log('PUT /api/gameroom/'+req.params.gameid+'/actor/'+req.params.actorid);
    console.log(req.body);
    if (!req.session.user) {
        res.status(401).end();
        return;
    }
    GameRoom.findOne({gameid:req.params.gameid}).populate('rotation').populate('inactive').exec((err,room)=>{
        if (err) {
            console.log(err);
            res.status(500).end();
            return;
        }
        if (room) {
            var rotactorids = room.rotation.map(act=>act.actor._id.toString());
            var inactids = room.inactive.map(inact=>inact._id.toString());
            if ((rotactorids.indexOf(req.params.actorid) > -1 ||
             inactids.indexOf(req.params.actorid) > -1)) {
                Actor.findOne({_id:req.params.actorid},(err,actor)=>{
                    if (err) {
                        console.log(err);
                        res.status(500).end();
                        return;
                    }
                    if (actor) {
                        if (req.session.user.id == room.gm ||
                         req.session.user.id == actor.playerid) {
                             var check = validateBody(actorAllowed,[],req.body);
                             if (!check.status) {
                                 res.status(400).json({err:check.errors});
                                 return;
                             }
                             Actor.updateOne({ _id: req.params.actorid }, req.body, function (err) {
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
                        res.status(400).json({err:"Invalid Actor"});
                    }
                });
            }
            else {
                res.status(403).end();
            }
        }
        else {
            res.status(400).json({err:"Invalid GameRoom"});
        }
    });
});
//Hides the information of a joined Actor from the rest of the Players in the Game Room
app.put('/api/gameroom/:gameid/actor/:actorid/hide',(req,res)=>{
    console.log('PUT /api/gameroom/'+req.params.gameid+'/actor/'+req.params.actorid+'/hide');
    if (!req.session.user) {
        res.status(401).end();
        return;
    }
    GameRoom.findOne({gameid:req.params.gameid},(err,room)=>{
        if (err) {
            console.log(err);
            res.status(500).end();
            return;
        }
        if (room) {
            if (req.session.user.id == room.gm) {
                var actorids = room.rotation.map((obj)=>obj.actor._id.toString());
                if (actorids.indexOf(req.params.actorid) > -1) {
                    GameRoom.updateOne({gameid:req.params.gameid, "rotation.actor":ObjectId(req.params.actorid)},
                     {$set:{"rotation.$.visible":false}},(err)=>{
                         if (err) {
                             console.log(err);
                             res.status(500).end();
                             return;
                         }
                         res.status(200).end();
                    });
                }
                else {
                    res.status(400).json({err:"Actor is not Active"});
                }
            }
            else {
                res.status(403).end();
            }
        }
        else {
            res.status(400).json({err:"Invalid GameId"});
        }
    });
});
//Reveals the information of a joined Actor to the rest of the Players in the Game Room
app.put('/api/gameroom/:gameid/actor/:actorid/reveal',(req,res)=>{
    console.log('PUT /api/gameroom/'+req.params.gameid+'/actor/'+req.params.actorid+'/reveal');
    if (!req.session.user) {
        res.status(401).end();
        return;
    }
    GameRoom.findOne({gameid:req.params.gameid},(err,room)=>{
        if (err) {
            console.log(err);
            res.status(500).end();
            return;
        }
        if (room) {
            if (req.session.user.id == room.gm) {
                var actorids = room.rotation.map((obj)=>obj.actor._id.toString());
                if (actorids.indexOf(req.params.actorid) > -1) {
                    GameRoom.updateOne({gameid:req.params.gameid, "rotation.actor":ObjectId(req.params.actorid)},
                     {$set:{"rotation.$.visible":true}},(err)=>{
                         if (err) {
                             console.log(err);
                             res.status(500).end();
                             return;
                         }
                         res.status(200).end();
                    });
                }
                else {
                    res.status(400).json({err:"Actor is not Active"});
                }
            }
            else {
                res.status(403).end();
            }
        }
        else {
            res.status(400).json({err:"Invalid GameId"});
        }
    });
});
//Puts the specified Actor back into the GameRoom Rotation
app.put('/api/gameroom/:gameid/actor/:actorid/activate',(req,res)=>{
    console.log('PUT /api/gameroom/'+req.params.gameid+'/actor/'+req.params.actorid+'/activate')
    if (!req.session.user) {
        res.status(401).end();
        return;
    }
    GameRoom.findOne({gameid:req.params.gameid}).populate('inactive').exec((err,room)=>{
        if (err) {
            console.log(err);
            res.status(500).end();
            return;
        }
        if (room) {
            if (req.session.user.id == room.gm) {
                var found = false;
                room.inactive.forEach((act)=>{
                    if(act._id == req.params.actorid) {
                        found = true;
                    }
                });
                if (found) {
                    Actor.findOne((err,actor)=>{
                        if (err) {
                            console.log(err);
                            res.status(500).end();
                            return;
                        }
                        if (actor) {
                            var visibility = room.teamvisibility && actor.pc;
                            GameRoom.updateOne({gameid:req.params.gameid},
                             {$pull:{inactive:ObjectId(req.params.actorid)},
                             $push:{rotation:{
                                 actor: ObjectId(req.params.actorid),
                                 visible: visibility
                             }}},(err)=>{
                                 if (err) {
                                     console.log(err);
                                     res.status(500).end();
                                     return;
                                 }
                                 res.status(200).end();
                            });
                        }
                        else {
                            res.status(400).json({err:"Actor Not Found"});
                        }
                    });
                }
                else {
                    res.status(400).json({err:"Actor is not Inactive"});
                }
            }
            else {
                res.status(403).end();
            }
        }
        else {
            res.status(400).json({err:"Invalid GameId"});
        }
    });
});
//Removes the specified Actor back into the GameRoom Rotation
app.put('/api/gameroom/:gameid/actor/:actorid/deactivate',(req,res)=>{
    console.log('PUT /api/gameroom/'+req.params.gameid+'/actor/'+req.params.actorid+'/deactivate')
    if (!req.session.user) {
        res.status(401).end();
        return;
    }
    GameRoom.findOne({gameid:req.params.gameid}).populate('rotation').exec((err,room)=>{
        if (err) {
            console.log(err);
            res.status(500).end();
            return;
        }
        if (room) {
            if (req.session.user.id == room.gm) {
                var actorids = room.rotation.map((obj)=>obj.actor._id.toString());
                if (actorids.indexOf(req.params.actorid) > -1) {
                    GameRoom.updateOne({gameid:req.params.gameid},
                     {$push:{inactive:ObjectId(req.params.actorid)},
                     $pull:{rotation:{actor: ObjectId(req.params.actorid)}}},(err)=>{
                         if (err) {
                             console.log(err);
                             res.status(500).end();
                             return;
                         }
                         res.status(200).end();
                    });
                }
                else {
                    res.status(400).json({err:"Actor is not Active"});
                }
            }
            else {
                res.status(403).end();
            }
        }
        else {
            res.status(400).json({err:"Invalid GameId"});
        }
    });
});
//Removes the specified Actor from the GameRoom,
//If is an NPC, will delete from existence
app.delete('/api/gameroom/:gameid/actor/:actorid',(req,res)=>{
    if (!req.session.user) {
        res.status(401).end();
        return;
    }
    GameRoom.findOne({gameid:req.params.gameid},(err,room)=>{
        if (err) {
            console.log(err);
            res.status(500).end();
            return;
        }
        if (room) {
            if ((room.rotation.indexOf(req.params.actorid)  > -1 ||
             room.inactive.indexOf(req.params.actorid) > -1)) {
                Actor.findOne({_id:req.params.actorid},(err,actor)=>{
                    if (err) {
                        console.log(err);
                        res.status(500).end();
                        return;
                    }
                    if (actor) {
                        if (req.session.user.id == room.gm &&
                         req.session.user.id == actor.playerid &&
                         !actor.pc) {
                             Actor.deleteOne({_id: req.params.actorid}, (err) => {
                                 if (err) {
                                     console.log(err);
                                     res.status(500).end();
                                     return;
                                 }
                                 res.status(200).end();
                             });
                        }
                        else if (req.session.user.id == room.gm ||
                         req.session.user.id == actor.playerid) {
                            Actor.updateOne({_id: req.params.actorid},{$unset:{gameid:""}},(err)=>{
                                if (err) {
                                    console.log(err);
                                    res.status(500).end();
                                    return;
                                }
                                GameRoom.updateOne({gameid:req.params.gameid},
                                 {$pull:{inactive:ObjectId(req.params.actorid),
                                 rotation:{id:ObjectId(req.params.actorid)}}},
                                 (err)=>{
                                    if (err) {
                                        console.log(err);
                                        res.status(500).end();
                                        return;
                                    }
                                    res.status(200).end();
                                });
                            });
                        }
                        else {
                            res.status(403).end();
                        }
                    }
                    else {
                        res.status(400).json({err:"Invalid Actor"});
                    }
                });
            }
            else {
                res.status(403).end();
            }
        }
        else {
            res.status(400).json({err:"Invalid GameRoom"});
        }
    });
});

//Server Binding
//=========================================================
app.listen(config.server.port, () => {
    console.log("TurnTracker running on port "+config.server.port);
});
