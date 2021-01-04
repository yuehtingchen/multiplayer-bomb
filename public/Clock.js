class Clock {
  constructor(limit) {
    this.time = limit;
    this.limit = limit;
    this.wait = false;
    this.start = false;
  }

  begin() {
    this.time = 0;
    this.start = true;
    this.wait = true;
    setTimeout(() => {
      this.wait = false;
    }, 1000);
  }

  countUp() {
    if (this.start) {
      if (this.wait == false) {
        this.time++;
      }

      if (this.wait == false && this.time < this.limit) {
        setTimeout(() => {
          this.wait = false;
        }, 1000);

        this.wait = true;
      }

      this.checkTime();
    }
  }

  checkTime() {
    if (this.time >= this.limit) {
      this.start = false;
      return true;
    }
  }

  draw(x, y, name) {
    textAlign(LEFT, CENTER);
    textSize(24);
    fill(255);
    stroke(255);
    text(name, x, y);
    noStroke();
    if (this.time == this.limit) fill(0, 255, 255);
    else fill(255, 0, 255);
    rect(x + 80, y - 8, 60 * (this.time / this.limit), 15);
    stroke(255);
    noFill();
    rect(x + 80, y - 8, 60, 15);
  }
}