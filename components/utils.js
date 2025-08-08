import { Sprite } from "./sprite.js";
import { config } from "./config.js";

export function isOverlapping(x, y, width, height, others) {
  return others.some((other) => {
    const dx = other.x - x;
    const dy = other.y - y;
    return Math.abs(dx) < width && Math.abs(dy) < height;
  });
}
// BUTTERFLY SWARMS
export function createSwarm(num, ...colors) {
  console.log(colors);
  const availableColors = colors.length > 0 ? colors : ["white"];
  const bswarm = [];
  for (let i = 0; i < num; i++) {
    let xb = Math.floor(Math.random() * (canvasWidth - canvasWidth / 10));
    let yb = Math.floor(Math.random() * (canvasHeight - canvasHeight / 10));

    //randomize color:
    const color =
      availableColors[Math.floor(Math.random() * availableColors.length)];

    bswarm.push(
      new Sprite({
        src: "./assets/sprites/Butterfly-Sprite-01.svg",
        spriteWidth: 100,
        spriteHeight: 80,
        x: xb,
        y: yb,
        scale: 0.7,
        frameStaggerRate: 11,
        maxFrames: 6, //acutally 0-6
        stateFrames: [6, 6, 6],
        states: ["white", "black", "color"],
        startState: color,
        flutter: true,
      })
    );
  }
  return bswarm;
}
export function spawnButterflySwarmFromShell(
  shellX,
  shellY,
  count = 10,
  size = 0.6,
  ...colors
) {
  const bswarm = [];
  const availableColors = colors.length > 0 ? colors : ["white"];

  for (let i = 0; i < count; i++) {
    const offsetX = (Math.random() - 0.5) * 30;
    const offsetY = (Math.random() - 0.5) * 20;

    const color =
      availableColors[Math.floor(Math.random() * availableColors.length)];

    bswarm.push(
      new Sprite({
        src: "./assets/sprites/Butterfly-Sprite-01.svg",
        spriteWidth: 100,
        spriteHeight: 80,
        x: shellX + offsetX - 30,
        y: shellY + offsetY,
        scale: size,
        frameStaggerRate: 15,
        maxFrames: 6,
        stateFrames: [6, 6, 6],
        states: ["white", "black", "color"],
        startState: color,
        flutter: true,
        rising: true,
        riseSpeed: 0.3 + Math.random() * 0.3,
        maxRise: 150 + Math.random() * 50,
      })
    );
  }
  return bswarm;
}
// reused for target scroll speed:
export function slowDownscrollSpeed() {
  if (config.targetScrollSpeed > 0) config.scrollSpeed--;
}
export function speedUpscrollSpeed() {
  if (config.targetScrollSpeed < 7) config.scrollSpeed++;
}
export function stopscrollSpeed() {
  config.targetScrollSpeed = 0;
}

export function applyScrollSpeedEasing(dt) {
  // diff: how far we still have to go
  const diff = config.targetScrollSpeed - config.scrollSpeed;
  const step = Math.sign(diff) * config.accelPerSec * dt;
  // avoid overshooting this frame : keep step smaller or equal
  // to diff
  if (Math.abs(step) >= Math.abs(diff)) {
    config.scrollSpeed = config.targetScrollSpeed;
  } else {
    // now move towards it without overshooting..
    config.scrollSpeed += step;
  }
}

export async function loadImages(imgs) {
  await Promise.all(
    imgs.map((img) => {
      // avoid accidental wrong types (non-images)
      if (!(img instanceof HTMLImageElement)) return Promise.resolve();
      // then decode
      if (img.decode) return img.decode().catch(() => {});
      return new Promise((res) => {
        if (img.complete) return res();
        img.onload = () => res();
        img.onerror = () => res();
      });
    })
  );
}
