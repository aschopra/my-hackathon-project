const express = require('express');
const bodyParser = require('body-parser')
const path = require('path');
const app = express();
const fs = require('fs');
const mongoose = require('mongoose');
const assert = require('assert')
const Player = require('./models').Player;
const Game = require("./models").Game;

app.use(express.static(path.join(__dirname, 'build')));

app.use(bodyParser.json())

if (! fs.existsSync('./env.sh')) {
  throw new Error('env.sh file is missing');
}
if (! process.env.MONGODB_URI) {
  throw new Error("MONGODB_URI is not in the environmental variables. Try running 'source env.sh'");
}
mongoose.connection.on('connected', function() {
  console.log('Success: connected to MongoDb!');
});
mongoose.connection.on('error', function() {
  console.log('Error connecting to MongoDb. Check MONGODB_URI in env.sh');
  process.exit(1);
});
mongoose.connect(process.env.MONGODB_URI);

app.get('/ping', function (req, res) {
 return res.send('pong');
});

app.post('/create/user', function(req, res) {
  console.log("reached post request", req.body)
  if (req.body.username && req.body.password && req.body.age) {
    let newPlayer = Player({
      username: req.body.username,
      password: req.body.password,
      name: req.body.name,
      age: req.body.age,
      position: req.body.position,
      skill: req.body.skill,
      imgUrl: req.body.imgUrl
    })
    newPlayer.save()
      .then((saved) => {
        console.log("Player saved in database", saved)
      })
      .catch((err) => {
        console.log("failed to save player")
      })
  } else {
    console.log('something went wrong with adding player')
  }
  res.json({"success": true})
});

app.post('/login', function(req, res) {
  console.log("reached login post", req.body)
  Player.findOne({username: req.body.username}, function(err, user) {
    if (err) {
      console.log("Error finding user")
    } else if (user) {
      res.json({success: true})
    } else {
      res.json({success: false})
    }
  })
});

app.post("/create/game", (req, res) => {
  console.log('reached create game', req.body)
  if (req.body.gameType && req.body.time && req.body.host) {
    let newGame = Game({
      players: [req.body.host],
      gameType: req.body.gameType,
      time: new Date(req.body.time),
      host: req.body.host,
      skillLevel: req.body.skillLevel,
      totalPlayers: req.body.totalPlayers
    })
    newGame.save()
      .then((saved) => {
        console.log("Game saved in database", saved)
      })
      .catch((err) => {
        console.log("failed to save game", err)
      })
  } else {
    console.log('something went wrong with adding player')
  }
  res.json({"success": true})
});

// DO NOT REMOVE THIS LINE :)
app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(process.env.PORT || 1337);
