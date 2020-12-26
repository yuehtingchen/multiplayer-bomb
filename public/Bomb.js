class Bomb {
  constructor(endX, endY, mode) {
    this.x = windowWidth / 2;
    this.y = windowHeight - 20;
    this.r = 20;

    this.vel = 20;
    this.dirR = 0;
    this.endX = endX;
    this.endY = endY;

    if(mode === "bomb") {
      this.color = color(255, 0, 0);
    }
    else if(mode === "diffuse") {
      this.color = color(0, 255, 0);
    }
    else {
      this.color = color(0, 0, 255);
    }

    this.mode = mode;
  }

  move() {
    let dX = this.endX - windowWidth / 2;
    let dY = this.endY - (windowHeight - 20);
    let cos = dX / Math.sqrt(dX * dX + dY * dY);
    let sin = dY / Math.sqrt(dX * dX + dY * dY);

    this.dirR += this.vel;

    this.x = windowWidth / 2 + this.dirR * cos;
    this.y = windowHeight - 20 + this.dirR * sin;
  }

  draw() {
    fill(this.color);
    stroke(this.color);
    ellipse(this.x, this.y, this.r, this.r);
  }

  collided() {
    backgroundColor = this.color;
    setTimeout(() => {
      backgroundColor = color(0);
    }, 250);
  }

  offScreen() {
    return this.y < 0 || this.x < 0 || this.x > windowWidth;
  }

  getMode() {
    return this.mode;
  }

  changeColor() {
    if(this.mode === "bomb") {
      this.color = color(255, 0, 0);
    }
    else if(this.mode === "diffuse") {
      this.color = color(0, 255, 0);
    }
    else {
      this.color = color(0, 0, 255);
    }
  }
  
}