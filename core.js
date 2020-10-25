'use strict';

(function () {
  Number.prototype.clamp = function (min, max) {
    return this < min ? min : this > max ? max : this;
  };
  Array.prototype.remove = function (element) {
    const index = this.indexOf(element);
    if (index >= 0) {
      this.splice(index, 1);
    }
  };
  Array.prototype.removeIf = function (evaluator) {
    let counter = this.length;
    while (counter--) {
      if (evaluator(this[counter])) {
        this.splice(counter, 1);
      }
    }
  };
  Array.prototype.clear = function () {
    this.splice(0, this.length);
  };
  CanvasRenderingContext2D.prototype.preserving = function (drawer) {
    this.save();
    drawer(this);
    this.restore();
  };
})();

const Input = {
  events: [],
  eventsBuffer: [],
  heldKeys: {},
  heldMouseButtons: {},
  mouseX: 0,
  mouseY: 0,
  scrollX: 0,
  scrollY: 0,
  touches: [],

  buffer: function (e) { if (!e.repeat) this.eventsBuffer.push(e); },
  update: function () {
    this.events = this.eventsBuffer;
    this.eventsBuffer = [];

    this.scrollX = 0;
    this.scrollY = 0;

    this.touches.forEach(t => t.isDown = false);
    this.touches.forEach(t => t.isUp = false);
    this.touches.removeIf(t => !t.isDown && !t.isHeld && !t.isUp);

    this.events.forEach(e => {
      if (e.type === 'wheel') {
        this.scrollX += e.deltaX;
        this.scrollY += e.deltaY;
      } else if (e.type.startsWith('key')) {
        this.heldKeys[e.keyCode] = e.type.endsWith('down');
      } else if (e.type.startsWith('mouse')) {
        if (e.type.endsWith('down')) {
          this.heldMouseButtons[e.button] = true;
        } else if (e.type.endsWith('up')) {
          this.heldMouseButtons[e.button] = false;
        }

        this.mouseX = e.clientX;
        this.mouseY = e.clientY;
      } else if (e.type.startsWith('touch')) {
        const changedTouches = [...e.changedTouches];

        if (e.type.endsWith('start')) {
          changedTouches.forEach(t => {
            this.touches.push({
              id: t.identifier, x: t.clientX, y: t.clientY,
              isDown: true, isHeld: true, isUp: false
            });
          });
        } else if (e.type.endsWith('move')) {
          changedTouches.forEach(t1 => {
            const touch = this.touches.find(t2 => t2.id === t1.identifier);
            touch.x = t1.clientX;
            touch.y = t1.clientY;
            touch.isDown = false;
            touch.isHeld = true;
            touch.isUp = false;
          });
        } else {
          // Touch ended or got canceled
          changedTouches.forEach(t1 => {
            const touch = this.touches.find(t2 => t2.id === t1.identifier);
            touch.x = t1.clientX;
            touch.y = t1.clientY;
            touch.isDown = false;
            touch.isHeld = false;
            touch.isUp = true;
          });
        }
      }
    });
  },

  keyDown: function (key) { return this.events.some(e => e.type === 'keydown' && e.keyCode === key); },
  keyUp: function (key) { return this.events.some(e => e.type === 'keyup' && e.keyCode === key); },
  keyHeld: function (key) { return this.heldKeys[key] || false; },

  mouseDown: function (button) { return this.events.some(e => e.type === 'mousedown' && e.button === button); },
  mouseUp: function (button) { return this.events.some(e => e.type === 'mouseup' && e.button === button); },
  mouseHeld: function (button) { return this.heldMouseButtons[button] || false; },

  getTouch: function (id) { return this.touches.find(t => t.id === id); },
  findTouch: function (evaluator) { return this.touches.find(t => evaluator(t)); },
};

document.oncontextmenu = () => false;
addEventListener('keydown', e => Input.buffer(e));
addEventListener('keyup', e => Input.buffer(e));
addEventListener('mousedown', e => Input.buffer(e));
addEventListener('mouseup', e => Input.buffer(e));
addEventListener('mousemove', e => Input.buffer(e));
addEventListener('wheel', e => Input.buffer(e));
addEventListener('touchstart', e => Input.buffer(e));
addEventListener('touchmove', e => Input.buffer(e));
addEventListener('touchend', e => Input.buffer(e));
addEventListener('touchcancel', e => Input.buffer(e));

const canvas = document.querySelector('canvas');
const context = canvas.getContext('2d', { alpha: false });
context.strokeStyle = context.fillStyle = '';

function packCanvas() {
  canvas.width = devicePixelRatio * innerWidth;
  canvas.height = devicePixelRatio * innerHeight;
  canvas.style.width = `${innerWidth}px`;
  canvas.style.height = `${innerHeight}px`;
  context.scale(devicePixelRatio, devicePixelRatio);
}

packCanvas();
addEventListener('resize', () => packCanvas());

let previousTime;
let deltaTime;
function draw() { }

function loop(time) {
  requestAnimationFrame(loop);

  if (!previousTime) {
    previousTime = time;
    return;
  }


  deltaTime = (time - previousTime) / 1000;
  previousTime = time;

  draw();

  Input.update();
}

requestAnimationFrame(loop);