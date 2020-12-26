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
    fill(255);
    stroke(255);
    textSize(24);
    textAlign(LEFT, CENTER)
    text(`Health: ${this.health}`, x, y);
    text(`Stock: ${this.stock}`, x, y + 30);
  }
}