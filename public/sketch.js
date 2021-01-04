/* global 
createCanvas windowWidth windowHeight background mouseX mouseY
fill stroke textAlign CENTER text keyCode collideCircleCircle
color createButton second textSize

Player Cannon Bomb EnemyBomb Enemy Score Clock

io
*/
var socket = io.connect("https://multiplayer-bomb.glitch.me/");

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

//clocks;
let bombClock;
let stealClock;
let diffuseClock;

//other stuff
let currentBomb;
let mode;
let backgroundColor;
let gameState;
let startButtonPressed;

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
      name: prompt("What is your name?"),
      id: Id,
      x: windowWidth / 2,
      y: windowHeight - 20,
      rgb: {
        r: Math.random() * 255,
        g: Math.random() * 255,
        b: Math.random() * 255
      }
    };

    myPlayer = new Player(player);
    myCannon = new Cannon();

    playerScore = new Score();
    enemyScore = new Score();

    bombClock = new Clock(3);
    stealClock = new Clock(5);
    diffuseClock = new Clock(1);

    gameState = 3;
    mode = "bomb";
    connected = true;
    startButtonPressed = false;

    socket.emit("addPlayer", myPlayer);
  });
}

function draw() {
  background(backgroundColor);

  //update myPlayer when is connected to server
  if (connected) {
    switch (gameState) {
      case 0: //game not yet started
        gameNotStart();
        break;
      case 1:
        waitOpponent();
        break;
      case 2: //countdown
        countdown();
        break;
      case 3: //game started
        gameRunning();
        break;
      case 4: //game ended
        gameEnded();
        break;
    }
  } else {
    fill(255);
    textAlign(CENTER, CENTER);
    text("Game full! Rejoin later", windowWidth / 2, 20);
  }
}

//game not started
function gameNotStart() {
  let startButton = createButton("START");
  
  if (!startButtonPressed) {
    startButton.size(100, 50);
    startButton.style("font-size", "24px");
    if (second() % 2 == 0)
      startButton.style("background-color", color(255, 0, 0));
    else startButton.style("background-color", color(255, 255, 0));
    startButton.position(windowWidth / 2 - 40, windowHeight / 2 + 45);

    textSize(30);
    fill(255, 255, 255);
    stroke(255, 255, 255);
    textAlign(CENTER, CENTER);
    text(`Hi ${myPlayer.name}! Ready to start game?`, windowWidth / 2, windowHeight / 2);

    startButton.mousePressed(() => {
      startButtonPressed = true;
      socket.emit("pressStart");
      console.log("emit start");
    });
  }
  else {
    startButton.hide();
    gameState ++;
  }
}

//waiting for opponent to start
function waitOpponent () {
  textSize(30);
  fill(255, 255, 255);
  stroke(255, 255, 255);
  textAlign(CENTER, CENTER);
  text("Waiting for opponent", windowWidth / 2, windowHeight / 2);
  socket.on("gameStart", () => gameState = 2);
}

//game start countdown
function countdown() {
  let startClock = new Clock(3);
  startClock.countDown();

  if (startClock.time == 3) {
    gameState++;
  } else {
    textSize(60);
    fill(255, 255, 255);
    stroke(255, 255, 255);
    textAlign(CENTER, CENTER);
    text(`${3 - startClock.time}`, windowWidth / 2, windowHeight / 2);
  }
}

// game being played
function gameRunning() {
  //draw scores
  diffuseClock.draw(20, windowHeight - 150, "Diffuse");
  stealClock.draw(20, windowHeight - 90, "Steal");
  bombClock.draw(20, windowHeight - 120, "Bomb");
  playerScore.draw(20, windowHeight - 60);
  enemyScore.draw(20, 20);

  //update current bomb
  currentBomb = new Bomb(mouseX, mouseY, mode);

  //countup
  stealClock.countUp();
  bombClock.countUp();
  diffuseClock.countUp();

  //add enemy bombs
  socket.on("launchBomb", bomb => {
    while (enemyBombs.length < bomb.length) {
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

  //check game state
  checkScore();
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
  if (connected) {
    if (playerScore.stock == 0) return;
    if (mode == "steal" && stealClock.checkTime()) {
      playerBombs.push(currentBomb);
      stealClock.begin();
      socket.emit("launchBomb", {
        length: playerBombs.length,
        bomb: currentBomb
      });
      playerScore.shoot(mode);
    } else if (mode == "bomb" && bombClock.checkTime()) {
      playerBombs.push(currentBomb);
      bombClock.begin();
      socket.emit("launchBomb", {
        length: playerBombs.length,
        bomb: currentBomb
      });
      playerScore.shoot(mode);
    } else if (mode == "diffuse" && diffuseClock.checkTime()) {
      playerBombs.push(currentBomb);
      diffuseClock.begin();
      socket.emit("launchBomb", {
        length: playerBombs.length,
        bomb: currentBomb
      });
      playerScore.shoot(mode);
    }
  }
}

function updatePlayers(serverPlayers) {
  enemyPlayers = [];
  serverPlayers.forEach(function(player) {
    if (connected) {
      if (myPlayer.id != player.id) enemyPlayers.push(new Enemy(player));
    }
  });
}

function removePlayer(playerId) {
  enemyPlayers = enemyPlayers.filter(player => player.id !== playerId);
}

function drawPlayerBombs() {
  deletePlayer = [];

  //draw player bombs
  for (let i = 0; i < playerBombs.length; i++) {
    let bomb = playerBombs[i];
    bomb.draw();
    bomb.move();
    if (bomb.offScreen()) {
      deletePlayer.push(i);
      if (bomb.mode === "bomb") {
        enemyScore.hit();
        collided(bomb.color);
      }
    }
  }

  //remove offscreen players
  for (let i = 0; i < deletePlayer.length; i++) {
    let index = deletePlayer[i];
    playerBombs.splice(index, 1);
  }
}

function drawEnemyBombs() {
  deleteEnemy = [];

  //draw enemy bombs
  for (let i = 0; i < enemyBombs.length; i++) {
    let bomb = enemyBombs[i];
    bomb.draw();
    bomb.move();
    if (bomb.offScreen()) {
      deleteEnemy.push(i);
      if (bomb.mode === "bomb") {
        playerScore.hit();
        collided(bomb.color);
      }
    }
  }

  //remove offscreen players
  for (let i = 0; i < deleteEnemy.length; i++) {
    let index = deleteEnemy[i];
    enemyBombs.splice(index, 1);
  }
}

//deals with colliding bombs
function bombCollide() {
  deletePlayer = [];
  deleteEnemy = [];

  for (let i = 0; i < playerBombs.length; i++) {
    let player = playerBombs[i];

    for (let j = 0; j < enemyBombs.length; j++) {
      let enemy = enemyBombs[j];

      if (
        collideCircleCircle(
          player.x,
          player.y,
          player.r,
          enemy.x,
          enemy.y,
          enemy.r
        )
      ) {
        console.log("hit!");
        collided(player.color);

        if (player.getMode() == "bomb") hitBomb(player, enemy);
        else if (player.getMode() == "steal") hitSteal(player, enemy);

        deletePlayer.push(i);
        deleteEnemy.push(j);
      }
    }
  }

  //remove hit players
  for (let i = 0; i < deletePlayer.length; i++) {
    let index = deletePlayer[i];
    playerBombs.splice(index, 1);
  }

  //remove hit enemies
  for (let i = 0; i < deleteEnemy.length; i++) {
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
  if (enemy.getMode() == "bomb") {
    if (player.y < windowHeight / 2) enemyScore.hit();
    else playerScore.hit();
  } else if (enemy.getMode() == "steal") {
    player.beSteal();
    enemy.steal();
  }
}

//player steal bomb is hit
function hitSteal(player, enemy) {
  if (enemy.getMode() == "bomb") {
    player.steal();
    enemy.beSteal();
  }
}

//check game state
function checkScore() {
  if (playerScore.health <= 0 || enemyScore.health <= 0) {
    gameState++;
  }
  if (playerScore.stock <= 0 && enemyScore.stock <= 0) {
    gameState++;
  }
}

//game ended
function gameEnded() {
  textSize(24);
  fill(255);
  stroke(255);
  textAlign(CENTER, CENTER);
  text(
    `Enemy health: ${enemyScore.health}`,
    windowWidth / 2,
    windowHeight / 2 - 40
  );
  text(
    `Player health: ${playerScore.health}`,
    windowWidth / 2,
    windowHeight / 2
  );

  if (second() % 2) {
    fill(255);
    stroke(255);
  } else {
    fill(255, 255, 0);
    stroke(255, 255, 0);
  }

  if (enemyScore.health > playerScore.health) {
    text(`${enemyPlayers[0].name} wins`, windowWidth / 2, windowHeight / 2 + 40);
  } else {
    text(`${myPlayer.name} wins`, windowWidth / 2, windowHeight / 2 + 40);
  }
}
