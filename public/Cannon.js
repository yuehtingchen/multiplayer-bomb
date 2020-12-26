class Cannon {
	constructor() {
		this.color = color(255, 0, 0);
	}
	draw(endLineX, endLineY) {
		fill(this.color);
		stroke(this.color);
		let w = 15,
			h = 50,
			c = w / 2;
		let a = windowWidth / 2,
    	b = windowHeight - 20;
		let dX = endLineX - a;
		let dY = endLineY - b;
		let cos = dX / Math.sqrt(dX * dX + dY * dY);
		let sin = dY / Math.sqrt(dX * dX + dY * dY);
		quad(
			a + c * sin,
			b - c * cos,
			a + c * sin + h * cos,
			b - c * cos + h * sin,
			a - c * sin + h * cos,
			b + c * cos + h * sin,
			a - c * sin,
			b + c * cos
		);
		strokeWeight(1);
		line(windowWidth / 2, windowHeight - 20, endLineX, endLineY);
	}

	setBomb() {
		this.color = color(255, 0, 0);
	}

	setDiffuse() {
		this.color = color(0, 255, 0);
	}

	setSteal() {
		this.color = color(0, 0, 255);
	}
}