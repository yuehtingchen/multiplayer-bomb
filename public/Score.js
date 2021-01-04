class Score {
  constructor() {
    this.health = 100;
    this.stock = 50;
  }
  
  hit() {
    this.health -= 5;
  }
  
  shoot(mode) {
    if(mode !== "steal")this.stock --;
  }
  
  steal() {
    this.stock ++;
  }
  
  beSteal() {
    this.stock --;
  }
  
  draw(x, y) {
    textAlign(LEFT, CENTER);
    textSize(24);
    fill(255);
    stroke(255);
    text('Health', x , y);
    text(`Stock: ${this.stock}`, x, y + 30);
    
    noStroke();
    fill(255, 0, 0);
    rect(x + 80, y - 8, 120 * (this.health / 100), 15);
    stroke(255);
    noFill();
    rect(x + 80, y - 8, 120, 15);
  }
}