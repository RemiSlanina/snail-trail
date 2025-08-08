// ** SPRITES **
// Im Narvi hain echant: Celebrimbor o Eregion teithant i thiw hin.

/* 
This class creates a sprite. 
It provides several methods like draw(), setters, etc. ... 
 */

export class Sprite {
  constructor(options) {
    this.image = new Image();
    this.image.src = options.src;

    this.spriteWidth = options.spriteWidth;
    this.spriteHeight = options.spriteHeight;
    this.scale = options.scale || 1;
    this.x = options.x || 0;
    this.y = options.y || 0;
    this.initialY = this.y;

    this.states = options.states || ["default"];
    this.currentState = options.startState || this.states[0];
    this.frameY = this.states.indexOf(this.currentState);
    this.maxFrames = options.maxFrames || 8; //max index
    this.stateFrames = options.stateFrames || [8, 6, 6]; //means frames 0..8

    this.frameX = 0;

    /* for butterflies only */
    this.flutter = options.flutter || false;

    // New movement = FLUTTER UP <3
    this.rising = options.rising || false;
    this.riseSpeed = options.riseSpeed || 0.2 + Math.random() * 0.3;
    this.riseDirection = options.riseDirection || (Math.random() - 0.5) * 2; // horizontal drift
    this.maxRise = options.maxRise || 500;
    this.angle = Math.random() * Math.PI * 2;
    this.angleSpeed = 0.02 + Math.random() * 0.02;

    // fix speed: pps
    this.msPerFrame = options.msPerFrame ?? 150; // let's start with 150 ms per frame
    this.accum = 0;
  }
  slowDown() {
    this.msPerFrame = Math.min(this.msPerFrame + 20, 300);
  }
  speedUp() {
    this.msPerFrame = Math.max(this.msPerFrame - 20, 16);
  }
  setState(state) {
    if (this.states.includes(state)) {
      this.currentState = state;
      this.frameY = this.states.indexOf(state);
      this.frameX = 0;
      // reset timers
      this.accum = 0;
      this.maxFrames = this.stateFrames[this.states.indexOf(state)];
    }
  }
  update(dt) {
    this.accum += dt * 1000;
    while (this.accum >= this.msPerFrame) {
      this.accum -= this.msPerFrame;
      this.frameX = (this.frameX + 1) % (this.maxFrames + 1);
    }

    /* 
    // I don't need this anymore
    this.frameCounter++;
    if (this.frameCounter % this.frameStaggerRate === 0) {
      this.frameX = (this.frameX + 1) % (this.maxFrames + 1);
    } */

    /* if (this.flutter) {
      this.angle += this.angleSpeed;
      this.y += Math.sin(this.angle) * this.speed;
      this.x += Math.cos(this.angle + this.offset) * this.speed * 0.5;
    } */

    // using dt*60 to pretend FPS ("frame feel")
    if (this.flutter) {
      this.angle += this.angleSpeed * dt * 60;
      this.y += Math.sin(this.angle) * 0.3;
      this.x += Math.cos(this.angle + this.angleSpeed) * 0.2;
    }

    if (this.rising) {
      this.y -= this.riseSpeed * dt * 60; // upward
      this.x += this.riseDirection * 0.3 * dt * 60; // slight sideways drift
      //stop after maxRise
      if (this.initialY - this.y > this.maxRise) this.rising = false;
    }
  }
  draw(ctx) {
    ctx.drawImage(
      this.image,
      this.frameX * this.spriteWidth,
      this.frameY * this.spriteHeight,
      this.spriteWidth,
      this.spriteHeight,
      this.x,
      this.y,
      this.spriteWidth * this.scale,
      this.spriteHeight * this.scale
    );
  }
  // for debugging purposes
  drawCrispImage(ctx) {
    ctx.drawImage(
      this.image,
      Math.floor(this.frameX * this.spriteWidth),
      Math.floor(this.frameY * this.spriteHeight),
      this.spriteWidth,
      this.spriteHeight,
      Math.floor(this.x),
      Math.floor(this.y),
      Math.floor(this.spriteWidth * this.scale),
      Math.floor(this.spriteHeight * this.scale)
    );
  }
}
