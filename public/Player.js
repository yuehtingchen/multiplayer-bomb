class Player {
  constructor(player) {
    this.name = player.name;
    this.x = player.x;
    this.y = player.y;
    this.id = player.id;
    this.rgb = player.rgb;
  }

  draw() {
    noStroke();
    fill(this.rgb.r, this.rgb.g, this.rgb.b);
    circle(this.x, this.y, 20);
    fill(255);
    noStroke();
    textSize(12);
    textAlign(CENTER, CENTER);
    text(`${this.name}`, this.x, this.y);
  }

}