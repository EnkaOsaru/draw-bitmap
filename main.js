const CANVAS_SIZE = 28;
const TILE_SIZE = 16;

class Tile {
  constructor(x, y) {
    this.x = x * TILE_SIZE;
    this.y = y * TILE_SIZE;
    this.state = 0;
  }

  update(mx, my) {
    if (Input.mouseHeld(0) &&
      this.x <= mx && mx <= this.x + TILE_SIZE &&
      this.y <= my && my <= this.y + TILE_SIZE) {
      this.state = 1;
    }
  }

  draw() {
    context.strokeStyle = '#000000';
    context.fillStyle = this.state === 0 ? '#ffffff' : '#000000';
    context.strokeRect(this.x, this.y, TILE_SIZE, TILE_SIZE);
    context.fillRect(this.x, this.y, TILE_SIZE, TILE_SIZE);
  }
}

const Canvas = new class {
  constructor() {
    // Create tiles
    this.tiles = [];
    for (let y = 0; y < CANVAS_SIZE; y++) {
      for (let x = 0; x < CANVAS_SIZE; x++) {
        this.tiles.push(new Tile(x, y));
      }
    }

    this.dx = (innerWidth - TILE_SIZE * CANVAS_SIZE) / 2;
    this.dy = TILE_SIZE;

    this.previousMouseX = 0;
    this.previousMouseY = 0;
  }

  update() {
    const accuracy = 8;
    for (let i = 0; i < accuracy; i++) {
      const mx = (Input.mouseX - this.previousMouseX) * i / accuracy + this.previousMouseX - this.dx;
      const my = (Input.mouseY - this.previousMouseY) * i / accuracy + this.previousMouseY - this.dy;
      this.tiles.forEach(e => e.update(mx, my));
    }

    this.previousMouseX = Input.mouseX;
    this.previousMouseY = Input.mouseY;
  }

  draw() {
    context.save();
    context.translate(this.dx, this.dy);
    this.tiles.forEach(e => e.draw());
    context.restore();
  }

  clear() {
    this.tiles.forEach(e => e.state = 0);
  }

  toString() {
    return this.tiles.reduce((a, e) => a + e.state, '');
  }
};

const display = document.querySelector('#display');
const bitmapsList = new Array(10).fill().map(() => []);

function draw() {
  Canvas.update();

  for (let i = 0; i < 10; i++) {
    if (Input.keyDown(i + 48)) {
      bitmapsList[i].push(Canvas.toString());
      Canvas.clear();
      display.innerHTML = bitmapsList.reduce((a, e, i) => a + `${i}: ${e.length}<br>`, '');
      break;
    }
  }

  if (Input.keyDown(13)) {
    let result = '';
    for (let i = 0; i < 10; i++) {
      const bitmaps = bitmapsList[i];
      for (const bitmap of bitmaps) {
        result += `${i}<br>${bitmap}<br>`;
      }
    }
    document.body.innerHTML = result;
  }

  Canvas.draw();
}