const express = require("express");
const socket = require('socket.io');
const app = express();
let Player = require("./Player");

let server = app.listen(3000);
console.log('The server is now running at https://yuehtingchen.github.io/multiplayer-bomb/public/');
app.use(express.static("public"));


let io = socket(server);

const MAX_PLAYERS = 2;
let players = [];
let totalPlayers = 0;

setInterval(updateGame, 16);

io.sockets.on("connection", socket => {

  console.log(`New connection ${socket.id}`);
  totalPlayers ++;

  if(totalPlayers <= MAX_PLAYERS) {
    console.log(`Players: ${totalPlayers}`);
    io.sockets.to(`${socket.id}`).emit("sendId", socket.id);
    socket.on("addPlayer", clientPlayer => addPlayer(clientPlayer));
  }

  socket.on("update", clientPlayer => {
    players = players.filter(player => player.id !== clientPlayer.id);
    players.push(new Player(clientPlayer));
  });

  socket.on("launchBomb", bomb => {
    socket.broadcast.emit("launchBomb", bomb);
  });

  socket.on("disconnect", () => {
    io.sockets.emit("disconnect", socket.id);
    console.log(`disconnected to ${socket.id}`);
    players = players.filter(player => player.id !== socket.id);
    totalPlayers --;
  });
});


io.sockets.on("disconnect", socket => {
  io.sockets.emit("disconnect", socket.id);
  console.log(`disconnected to ${socket.id}`);
  players = players.filter(player => player.id !== socket.id);
  totalPlayers --;
});


function updateGame() {
  io.sockets.emit("heartbeat", players);
}

function addPlayer(clientPlayer) {
  console.log("added new player");
  players.push(new Player(clientPlayer));
}



