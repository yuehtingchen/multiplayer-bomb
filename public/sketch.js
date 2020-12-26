var socket = io.connect('https://yuehtingchen.github.io/multiplayer-bomb/public/');

let enemyBombs = [];
let playerBombs = [];
let deletePlayer = [];
let deleteEnemy = [];
let myPlayer;
let enemyPlayers = [];
let connected;
let myCannon;
let currentBomb;
let mode;

socket.on("heartbeat", players => updatePlayers(players));
socket.on("disconnect", playerId => removePlayer(playerId));

function setup() {
  createCanvas(windowWidth, windowHeight);
  connected = false;

  socket.on("sendId", Id => {
    let player = {
      "name": prompt("What is your name?"),
      "id": Id,
      "x": windowWidth / 2,
      "y": windowHeight - 20,
      "rgb": {
        r: Math.random() * 255,
        g: Math.random() * 255,
        b: Math.random() * 255,
      },
    };

    myPlayer = new Player(player); 
    myCannon = new Cannon();
    mode = "bomb";
    socket.emit("addPlayer", myPlayer);
    connected = true;
  });

}

function draw() {
  background(255);
  
  //update myPlayer when is connected to server
  if(connected) {
    currentBomb = new Bomb(mouseX, mouseY, mode);

    //add enemy bombs
    socket.on("launchBomb", bomb => {
      while(enemyBombs.length < bomb.length)
        enemyBombs.push(new EnemyBomb(bomb.bomb));
    });

    //draw bombs
    myCannon.draw(mouseX, mouseY);
    myPlayer.draw();
    drawPlayerBombs();
    drawEnemyBombs();

    //draw enemy player
    enemyPlayers.forEach(function(player) {
      player.draw();
    });
  }
  else {
    fill(0);
    textAlign(CENTER, CENTER);
    text("Game full! Rejoin later", windowWidth / 2, 20);
  }

}

function keyPressed() {
  // keyCode is d for diffuse
  if (keyCode == 68) {
    myCannon.setDiffuse();
    mode = "diffuse";
  }

  // keyCode is b for bomb
  if (keyCode == 70) {
    myCannon.setBomb();
    mode = "bomb";
  }

  // keyCode is s for steal
  if (keyCode == 83) {
    myCannon.setSteal();
    mode = "steal";
  }
}

function mousePressed() {
  if(connected) {
    playerBombs.push(currentBomb);
    socket.emit("launchBomb", 
      {"length": playerBombs.length, "bomb": currentBomb});
  }
}


function updatePlayers(serverPlayers) {
  enemyPlayers = [];
  serverPlayers.forEach(function(player) {
    if(connected) {
      if(myPlayer.id != player.id)
        enemyPlayers.push(new Enemy(player));
    }
  });
}

function removePlayer(playerId) {
  enemyPlayers = enemyPlayers.filter(player => player.id !== playerId);
}

function drawPlayerBombs() {
  deletePlayer = [];

  //draw player bombs
  for(let i = 0; i < playerBombs.length; i ++) {
    let bomb = playerBombs[i];
    bomb.draw();
    bomb.move();
    if(bomb.offScreen())deletePlayer.push(i);
  }

  //remove offscreen players 
  for(let i = 0; i < deletePlayer.length; i ++) {
    let index = deletePlayer[i];
    playerBombs.splice(index, 1);
  }
}

function drawEnemyBombs() {
  deleteEnemy = [];

  //draw enemy bombs
  for(let i = 0; i < enemyBombs.length; i ++) {
    let bomb = enemyBombs[i];
    bomb.draw();
    bomb.move();
    if(bomb.offScreen())deleteEnemy.push(i);
  }

  //remove offscreen players 
  for(let i = 0; i < deleteEnemy.length; i ++) {
    let index = deleteEnemy[i];
    enemyBombs.splice(index, 1);
  }
}

