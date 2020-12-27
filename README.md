
<h1 align="center">
  Multiplayer Bombing Game 
</h1>

<h4 align="center">A two player online game with p5/node.js/express/socket.io </h4>

Kickstarted project with `git clone https://github.com/LukeGarrigan/p5-multiplayer-game-start.git`

## How to play
1. Use mouse to aim; click to shoot.
2. Change bomb type with keys "s": steal, "d": diffuse, "f": regular
3. Attack the opposite side with regular(red) bombs. 
4. Diffuse and steal enemy bombs by hitting them with diffuse(green) and steal(blue) bombs
5. Stock is limited!!!

## Try it out!
Game is hosted on Glitch: https://multiplayer-bomb.glitch.me/

## Details 
Every 16ms the server emits the current state of the game to the client. If a new client joins the server a new `Player` will be added to the game and displayed on all clients, it also automatically removes players when they leave the game. When the enemy shoots, it signals the server, and the server signals the opposing player to shoot an enemy bomb. When the server is not connected, or the gameroom is full, the screen will show text "gameroom full."
