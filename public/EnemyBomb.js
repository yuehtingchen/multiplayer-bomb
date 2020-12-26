class EnemyBomb {
  constructor(bomb) {
    this.a = windowWidth / 2;
    this.b = 20;
    
    this.x = this.a;
    this.y = this.b;
    this.r = 20;

    this.vel = bomb.vel;
    this.dirR = 0;
    this.endX = bomb.endX;
    this.endY = bomb.endY;

    if(bomb.mode === "bomb") {
      this.color = color(255, 0, 0);
    }
    else if(bomb.mode === "diffuse") {
      this.color = color(0, 255, 0);
    }
    else {
      this.color = color(0, 0, 255);
    }
    this.mode = bomb.mode;
  }

  move() {
    let dX = this.endX - this.a;
    let dY = -1 * (this.endY - windowHeight + this.b);
    let cos = dX / Math.sqrt(dX * dX + dY * dY);
    let sin = dY / Math.sqrt(dX * dX + dY * dY);

    this.dirR += this.vel;

    this.x = this.a + this.dirR * cos;
    this.y = this.b + this.dirR * sin;
  }

  draw() {
    fill(this.color);
    stroke(this.color);
    ellipse(this.x, this.y, this.r, this.r);
  }

  offScreen() {
    return this.y > windowHeight || this.x < 0 || this.x > windowWidth;
  }

  getMode() {
    return this.mode;
  }
}