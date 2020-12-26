/* global 
createCanvas windowWidth windowHeight background mouseX mouseY
fill stroke textAlign CENTER text keyCode collideCircleCircle
color

Player Cannon Bomb EnemyBomb Enemy Score

io
*/
var socket = io.connect('https://multiplayer-bomb.glitch.me/');

//bombs
let enemyBombs = [];
let playerBombs = [];

//delete bombs
let deletePlayer = [];
let deleteEnemy = [];

//players
let myPlayer;
let enemyPlayers = [];
let myCannon;

//scores
let enemyScore;
let playerScore;

//other stuff
let currentBomb;
let mode;
let backgroundColor;

//joined into game
let connected;



socket.on("heartbeat", players => updatePlayers(players));
socket.on("disconnect", playerId => removePlayer(playerId));

function setup() {
  createCanvas(windowWidth, windowHeight);
  backgroundColor = color(0);
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
    playerScore = new Score();
    enemyScore = new Score();
    mode = "bomb";
    socket.emit("addPlayer", myPlayer);
    connected = true;
  });

}

function draw() {
  background(backgroundColor);
  
  //update myPlayer when is connected to server
  if(connected) {
    //draw scores
    playerScore.draw(20, windowHeight - 60);
    enemyScore.draw(20, 20);
    
    //update current bomb
    currentBomb = new Bomb(mouseX, mouseY, mode);

    //add enemy bombs
    socket.on("launchBomb", bomb => {
      while(enemyBombs.length < bomb.length) {
        enemyBombs.push(new EnemyBomb(bomb.bomb));
        enemyScore.shoot(bomb.bomb.mode);
      }
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
    
    //collided
    bombCollide();
    
  }
  else {
    fill(255);
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
    playerScore.shoot(mode);
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
    if(bomb.offScreen()) {
      deletePlayer.push(i);
      if(bomb.mode === "bomb") {
        enemyScore.hit();
        collided(bomb.color);
      }
    }
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
    if(bomb.offScreen()) {
      deleteEnemy.push(i);
      if(bomb.mode === "bomb") {
        playerScore.hit();
        collided(bomb.color);
      }
    }
  }

  //remove offscreen players 
  for(let i = 0; i < deleteEnemy.length; i ++) {
    let index = deleteEnemy[i];
    enemyBombs.splice(index, 1);
  }
}

//deals with colliding bombs
function bombCollide() {
  deletePlayer = [];
  deleteEnemy = [];
  
  for(let i = 0; i < playerBombs.length; i ++) {
    let player = playerBombs[i];
    
    for(let j = 0; j < enemyBombs.length; j ++) {
      let enemy = enemyBombs[j];
      
      if(collideCircleCircle(player.x, player.y, player.r,
                           enemy.x, enemy.y, enemy.r)) {
        console.log("hit!");
        collided(player.color);
        
        if(player.getMode() == "bomb") hitBomb(player, enemy);
        else if(player.getMode() == "steal") hitSteal(player, enemy);
        
        deletePlayer.push(i);
        deleteEnemy.push(j);
      }
    }
  }
  
  //remove hit players
  for(let i = 0; i < deletePlayer.length; i ++) {
    let index = deletePlayer[i];
    playerBombs.splice(index, 1);
  }
  
  //remove hit enemies
  for(let i = 0; i < deleteEnemy.length; i ++) {
    let index = deleteEnemy[i];
    enemyBombs.splice(index, 1);
  }
}

//collided effect
function collided(playerColor) {
  backgroundColor = playerColor;
  setTimeout(() => {
    backgroundColor = color(0);
  }, 250);
}

//player bomb is hit
function hitBomb(player, enemy) {
  if(enemy.getMode() == "bomb") {
    if(player.y < windowHeight / 2) enemyScore.hit();
    else playerScore.hit();
  }
  else if(enemy.getMode() == "steal") {
    player.beSteal();
    enemy.steal();
  }
}

//player steal bomb is hit
function hitSteal(player, enemy) {
  if(enemy.getMode() == "bomb") {
    player.steal();
    enemy.beSteal();
  }
}
