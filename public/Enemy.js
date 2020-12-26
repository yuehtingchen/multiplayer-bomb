class Enemy {
  constructor(player) {
    this.name = player.name;
    this.x = windowWidth / 2;
    this.y = 20;
    this.id = player.id;
    this.rgb = player.rgb;
  }

  draw() {
    noStroke();
    fill(this.rgb.r, this.rgb.g, this.rgb.b);
    circle(this.x, this.y, 20);
    noStroke();
    fill(255);
    textAlign(CENTER, CENTER);
    text(`${this.name}`, this.x, this.y);
  }

}