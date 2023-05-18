class Entity {
  constructor({
    position,
    imageSrc,
    scale = 1,
    framerate = 1,
    frameBuffer = 6,
  }) {
    this.position = position;
    this.image = new Image();
    this.image.src = imageSrc;
    this.image.onload = () => {
      this.width = (this.image.width / this.framerate) * scale;
      this.height = this.image.height * scale;
    };
    this.currentFrame = 0;
    this.frameBuffer = frameBuffer;
    this.elapsedFrames = 0;
    this.framerate = framerate;
  }

  draw() {
    if (!this.image) {
      return;
    }

    const cropBox = {
      position: {
        x: this.currentFrame * (this.image.width / this.framerate),
        y: 0,
      },
      width: this.image.width / this.framerate,
      height: this.image.height,
    };

    c.drawImage(
      this.image,
      cropBox.position.x,
      cropBox.position.y,
      cropBox.width,
      cropBox.height,
      this.position.x,
      this.position.y,
      this.width,
      this.height
    );
  }

  update() {
    this.draw();
  }

  planeCollision() {
    return (
      this.position.x <= plane.position.x + plane.width &&
      this.position.x + this.width >= plane.position.x &&
      this.position.y >= plane.position.y - this.height &&
      this.position.y - this.height <= plane.position.y
    );
  }

  updateFrames() {
    this.elapsedFrames++;
    if (this.elapsedFrames % this.frameBuffer === 0) {
      if (this.currentFrame < this.framerate - 1) {
        this.currentFrame++;
      } else {
        this.currentFrame = 0;
      }
    }
  }
}

class Plane extends Entity {
  constructor({ position, imageSrc, scale = 1 }) {
    position = {
      x: 0,
      y: canvas.height / 2,
    };

    super({ position, imageSrc, scale });
    this.velocity = {
      x: 0,
      y: 0,
    };

    this.blown = false;
  }

  checkBorders(
    leftBorder = 0,
    rightBorder = canvas.width,
    topBorder = 0,
    bottomBorder = canvas.height
  ) {
    if (this.position.x <= leftBorder) {
      this.velocity.x = 1;
    } else if (this.position.x + this.width >= rightBorder) {
      this.velocity.x = -1;
    } else if (this.position.y <= topBorder) {
      this.velocity.y = 1;
    } else if (this.position.y + this.height >= bottomBorder) {
      this.velocity.y = -1;
    }
  }

  update() {
    this.draw();
    if (KEYS.d.pressed && this.velocity.x <= 10) {
      this.velocity.x += 1;
    } else if (this.velocity.x > 0) {
      this.velocity.x -= 1;
    }
    if (KEYS.a.pressed && this.velocity.x >= -10) {
      this.velocity.x -= 1;
    } else if (this.velocity.x < 0) {
      this.velocity.x += 1;
    }
    if (KEYS.s.pressed && this.velocity.y <= 10) {
      this.velocity.y += 1;
    } else if (this.velocity.y > 0) {
      this.velocity.y -= 1;
    }
    if (KEYS.w.pressed && this.velocity.y >= -10) {
      this.velocity.y -= 1;
    } else if (this.velocity.y < 0) {
      this.velocity.y += 1;
    }

    this.checkBorders();

    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
  }
}

class Cloud extends Entity {
  constructor() {
    const cloudURL = CLOUDS_IMG_URLS[getRandomIndex(CLOUDS_IMG_URLS)];

    const x =
      (canvas.width / tilesMap.cols) * getRandomIndex(tilesMap.tiles[0]);
    const y = (canvas.height / tilesMap.rows) * getRandomIndex(tilesMap.tiles);

    super({
      position: {
        x,
        y,
      },
      imageSrc: cloudURL,
      scale: getRandomNumber(1, 6),
    });

    this.speed = getRandomNumber(-3, -1);
  }

  getRandomPosition() {
    this.position = {
      x:
        (canvas.width / tilesMap.cols) * getRandomIndex(tilesMap.tiles[0]) +
        canvas.width,
      y: (canvas.height / tilesMap.rows) * getRandomIndex(tilesMap.tiles),
    };
  }

  checkBorders(leftBorder = 0) {
    if (this.position.x <= leftBorder - this.width) {
      this.getRandomPosition();
      this.speed = getRandomNumber(-3, -1);
      this.scale = getRandomNumber(1, 6);
    }
  }

  update() {
    this.draw();
    this.checkBorders();

    this.position.x += this.speed;
  }
}

class TilesMap {
  constructor(width, height, rows, cols) {
    (this.height = height / rows),
      (this.width = width / cols),
      (this.rows = rows),
      (this.cols = cols),
      (this.tiles = []);

    for (let i = 0; i < rows; i++) {
      const temp = [];
      for (let j = 0; j < cols; j++) {
        temp.push(0);
      }
      this.tiles.push(temp);
    }
  }
}

class Bird extends Entity {
  constructor() {
    const birdsURL = BIRDS_IMG;

    const x =
      (canvas.width / tilesMap.cols) * getRandomIndex(tilesMap.tiles[0]);
    const y = 0;

    super({
      position: {
        x,
        y,
      },
      imageSrc: birdsURL,
      framerate: 4,
      scale: 2,
    });

    this.xSpeed = getRandomNumber(-4, -2);
    this.ySpeed = getRandomNumber(2, 4);
  }

  update() {
    this.draw();
    this.updateFrames();
    this.checkBorders();

    if (this.planeCollision()) {
      gameOver = true;
      hitSound.play();
    }

    this.position.x += this.xSpeed;
    this.position.y += this.ySpeed;
  }

  getRandomPosition() {
    this.position.x =
      (canvas.width / tilesMap.cols) * getRandomIndex(tilesMap.tiles[0]) +
      tilesMap.width;
    this.position.y = -this.height;
  }

  checkBorders(bottomBorder = canvas.height) {
    if (this.position.y >= bottomBorder + this.height) {
      this.getRandomPosition();
      this.xSpeed = getRandomNumber(-4, -2);
      this.ySpeed = getRandomNumber(2, 4);
    }
  }
}

class Star extends Entity {
  constructor() {
    const starURL = STAR_URL;

    const x =
      (canvas.width / tilesMap.cols) * getRandomIndex(tilesMap.tiles[0]);
    const y = 0;

    super({
      position: {
        x,
        y,
      },
      imageSrc: starURL,
      scale: 2,
      framerate: 8,
      frameBuffer: 0,
    });

    this.starsCounter = 0;
    this.ySpeed = getRandomNumber(2, 4);
  }

  update() {
    this.draw();
    this.updateFrames();
    this.checkBorders();

    if (this.planeCollision()) {
      this.getRandomPosition();
      this.ySpeed = getRandomNumber(2, 4);

      this.starsCounter++;

      starSound.play();
    }

    this.position.y += this.ySpeed;
  }

  getRandomPosition() {
    this.position.x =
      (canvas.width / tilesMap.cols) * getRandomIndex(tilesMap.tiles[0]) +
      tilesMap.width;
    this.position.y = -canvas.height;
  }

  checkBorders(bottomBorder = canvas.height) {
    if (this.position.y >= bottomBorder + this.height) {
      this.getRandomPosition();
      this.ySpeed = getRandomNumber(2, 4);
    }
  }
}

class DropOff extends Entity {
  constructor() {
    const dropOffURL = DROP_OFF_URL;

    const x =
      (canvas.width / tilesMap.cols) * getRandomIndex(tilesMap.tiles[0]);
    const y = -canvas.height;

    super({
      position: {
        x,
        y,
      },
      imageSrc: dropOffURL,
      scale: 2,
      framerate: 5,
      frameBuffer: 0,
    });

    this.ySpeed = getRandomNumber(2, 4);
    this.fuelCounter = DEFAULT_FUEL;

    setInterval(() => {
      if (!gamePause) {
        this.fuelCounter--;
      }
    }, 1000);
  }

  update() {
    this.draw();
    this.updateFrames();
    this.checkBorders();

    if (this.planeCollision()) {
      this.getRandomPosition();
      this.ySpeed = getRandomNumber(2, 4);
      this.fuelCounter += 10;
    }

    if (this.fuelCounter <= 0) {
      gameOver = true;
    }

    this.position.y += this.ySpeed;
  }

  getRandomPosition() {
    this.position.x =
      (canvas.width / tilesMap.cols) * getRandomIndex(tilesMap.tiles[0]) +
      tilesMap.width;
    this.position.y = -canvas.height;
  }

  checkBorders(bottomBorder = canvas.height) {
    if (this.position.y >= bottomBorder + this.height) {
      this.getRandomPosition();
      this.ySpeed = getRandomNumber(2, 4);
    }
  }
}
