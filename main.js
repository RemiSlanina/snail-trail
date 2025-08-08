/** @type {HTMLCanvasElement} */
import { Sprite } from "./components/sprite.js";
import { Layer } from "./components/layer.js";
import { isOverlapping } from "./components/utils.js";
import { createSwarm } from "./components/utils.js";
import { config } from "./components/config.js";
import { spawnButterflySwarmFromShell } from "./components/utils.js";
import { slowDownscrollSpeed } from "./components/utils.js";
import { speedUpscrollSpeed } from "./components/utils.js";
import { stopscrollSpeed } from "./components/utils.js";
import { applyScrollSpeedEasing } from "./components/utils.js";
import { loadImages } from "./components/utils.js";
// TO-DO: remove unnecessary comments

// TO DO
// detect colliding sprites
/*  I got a white line over curled Animation after resizing
    now only left in firefox 
    Something's not right! */
/* 
    Flutter toward light
    Flee from thunder
    Fade after a while
    Change color near the moon...
    
    Optimize for mobile?
    Fix swarm overlapping logic?
    Animate butterfly swarm reacting to tap / touch?
*/

// ********************** CREATE CONSTANTS **********************
const canvas = document.getElementById("canvas1");
const ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = false;
canvas.style.imageRendering = "crisp-edges";
let canvasWidth;
let canvasHeight;

// ********************** CREATE SPRITES **********************
const snail = new Sprite({
  src: "./assets/sprites/Snail-Sprite-002.svg",
  spriteWidth: 215,
  spriteHeight: 130,
  x: Math.floor(canvasWidth / 2 - 215 / 2),
  y: canvasHeight - 130,
  scale: 1,
  frameStaggerRate: 6,
  maxFrames: 8, //actually 0-8
  stateFrames: [8, 8, 8, 0], // 0-8 or 0
  states: ["normal", "curled", "shaking", "standing"],
  startState: "normal",
});

const butterfly = new Sprite({
  src: "./assets/sprites/Butterfly-Sprite-01.svg",
  spriteWidth: 100,
  spriteHeight: 80,
  x: Math.floor(canvasWidth / 2 - 100 / 2),
  y: canvasHeight / 2,
  scale: 3,
  frameStaggerRate: 1,
  maxFrames: 6, //acutally 0-6
  stateFrames: [6, 6, 6], // 0-6
  states: ["white", "black", "color"],
  startState: "white",
  flutter: true,
  rising: true,
  riseSpeed: 0.3 + Math.random() * 0.3,
  maxRise: 1, //DEBUG MAXRISE
  riseDirection: (Math.random() - 0.5) * 1.2,
});

//const swarmCollide = createSwarm(10, "white", "black", "color");

const swarm = spawnButterflySwarmFromShell(
  snail.x,
  snail.y,
  20,
  0.6,
  "white",
  "black",
  "color"
);

// ********************** ADD EVENT LISTENER **********************
canvas.addEventListener("click", () => {
  const nextIndex =
    (snail.states.indexOf(snail.currentState) + 1) % snail.states.length;
  snail.setState(snail.states[nextIndex]);
  console.log("Changed state to:", snail.currentState);
});

// ********************** CREATE PARALLAX **********************
const parallaxLayer1 = new Image();
parallaxLayer1.src = "./assets/layers/BG-Hills-Big.svg";
const parallaxLayer2 = new Image();
parallaxLayer2.src = "./assets/layers/BG-Clouds.svg";
const parallaxLayer3 = new Image();
parallaxLayer3.src = "./assets/layers/BG-Hills-Small.svg";
const parallaxLayer4 = new Image();
parallaxLayer4.src = "./assets/layers/BG-Trees.svg";
const ParallaxLayer5 = new Image();
ParallaxLayer5.src = "./assets/layers/BG-Path.svg";

// ** PARALLAX **
const pLayer1 = new Layer(parallaxLayer1, 0.25, canvasHeight);
const pLayer2 = new Layer(parallaxLayer2, 0.3, canvasHeight);
const pLayer3 = new Layer(parallaxLayer3, 0.35, canvasHeight);
const pLayer4 = new Layer(parallaxLayer4, 0.4, canvasHeight);
const pLayer5 = new Layer(ParallaxLayer5, 0.5, canvasHeight);

const parallaxLayers = [pLayer1, pLayer2, pLayer3, pLayer4, pLayer5];

// ********************** RESIZE CANVAS **********************
// resize pixel and dimensions of the canvas
// call once at the beginning, too
// scale dynamically
function resizeCanvas() {
  const cssWidth = window.innerWidth;
  const cssHeight = window.innerHeight;

  const dpr = window.devicePixelRatio || 1;

  canvas.width = cssWidth * dpr;
  canvas.height = cssHeight * dpr;

  canvas.style.width = window.innerWidth + "px";
  canvas.style.height = window.innerHeight + "px";

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.scale(dpr, dpr);

  //helper vars for quick access
  canvasWidth = cssWidth;
  canvasHeight = cssHeight;

  if (typeof snail !== "undefined" && snail !== null) {
    snail.x = Math.floor(
      canvasWidth / 2 - (snail.spriteWidth * snail.scale) / 2
    );

    snail.y = canvasHeight - snail.spriteHeight * snail.scale;
  }

  if (typeof butterfly !== "undefined" && butterfly !== null) {
    butterfly.x = snail.x + (snail.spriteWidth * snail.scale) / 2 - 130;
    butterfly.y = snail.y + (Math.random() - 0.5) * 20;
  }

  // TO DO
  // insert swarm class maybe tomorrow ...? Let the swarm manage itself
  // insert rise logic here, too
  if (swarm && Array.isArray(swarm)) {
    swarm.forEach((b, i) => {
      //scatter butterflies randomly

      b.x =
        snail.x +
        (snail.spriteWidth * snail.scale) / 2 +
        (Math.random() - 0.5) * 120 -
        30; // -30 to position it slightly towards the shell
      b.y = snail.y + (Math.random() - 0.5) * 20;
    });
  }
}

// ********************** ANIMATE **********************

function animate(now = 0) {
  const dt = Math.min((now - config.lastTime) / 1000, 0.05); // seconds, clamp big jupms
  config.lastTime = now;

  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  //update scrollSpeed target per state, then apply easing
  applyScrollSpeedEasing(dt);

  //  adjusting tempo of the parallax background AROUND the snail
  //  in walking (creeping) mode
  // stop in curled mode
  if (snail.frameY === 0) {
    //moving state
    // speed up during push frames, slow otherwise
    if (snail.frameX >= 3 && snail.frameX <= 6) {
      config.targetScrollSpeed = 1.0;
    } else {
      config.targetScrollSpeed = 0.3;
    }
  } else if (snail.frameY === 1) {
    //curled
    config.targetScrollSpeed = 0.0;
  }
  // adjusting tempo of the snail animation itself:
  if (snail.currentState === "curled") {
    if (snail.frameX === 4) {
      snail.slowDown();
    }
    if (snail.frameX === 5) {
      //snail.slowDown();
      //snail.slowDown();
    }
    if (snail.frameX === 6) {
      snail.speedUp();
      //snail.speedUp();
      /* snail.speedUp();  */
    }
    if (snail.frameX === 7) {
      //snail.slowDown();
      snail.slowDown();
      snail.slowDown();
      snail.slowDown();
    }
    if (snail.frameX === 8) {
      //reset frameStaggerRate in the last frame to normal speed again
      snail.frameStaggerRate = 5;
    }
  }

  parallaxLayers.forEach((object) => {
    object.update(canvasHeight, dt);
    object.draw(canvasHeight, ctx);
  });

  snail.drawCrispImage(ctx);
  // snail only curles up once:
  // if not in the last frame of curl animation, it updates:
  //if (!(snail.frameY === 1 && snail.frameX === 8)) snail.update();
  if (!(snail.currentState === "curled" && snail.frameX === 8))
    snail.update(dt);

  // ** SPAWN BUTTERFLIES AFTER 2 SECONDS **
  if (snail.currentState == "shaking") {
    if (!config.shakingTimeStart) {
      config.shakingTimeStart = Date.now();
    }

    const elapsed = Date.now() - config.shakingTimeStart;

    if (elapsed > 2000 && !config.butterfliesSpawned) {
      //draw swarm
      //console.log("swarm");
      swarm.forEach((b) => {
        b.draw(ctx);
        b.update(dt);
      });
      config.butterfliesSpawned = true;
      snail.setState("standing");
    }
  } else {
    // Reset if snail enters another state
    config.shakingTimeStart = null;
    config.butterfliesSpawned = false;
  }

  if (snail.currentState == "standing") {
    swarm.forEach((b) => {
      b.draw(ctx);
      b.update(dt);
    });
  }

  // DEBUG
  /* swarmCollide.draw(ctx);
  swarmCollide.update(dt); */

  /* debug */
  /* still in Firefox */
  //ctx.fillStyle = "red";
  //ctx.fillRect(0, canvasHeight - 1, canvasWidth, 1); // bottom red line
  /* debug */
  requestAnimationFrame(animate);
}

// ********************** LOAD IMAGES AND EXECUTE **********************

const images = [
  parallaxLayer1,
  parallaxLayer2,
  parallaxLayer3,
  parallaxLayer4,
  ParallaxLayer5,
  snail.image,
];

// resize window only after getting the correct img size (after img is loaded)
(async () => {
  await loadImages(images);
  resizeCanvas();
  config.lastTime = performance.now();
  requestAnimationFrame(animate);
})();

console.log(`Snail at x=${snail.x}, canvasWidth=${canvasWidth}`);

// ********************** LISTEN FOR RESIZE EVENTS **********************
window.addEventListener("resize", () => {
  resizeCanvas();
  config.lastTime = performance.now();
});
