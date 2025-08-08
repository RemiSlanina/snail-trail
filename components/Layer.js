import { config } from "./config.js";

// background layer class for parallax effects:

/* this class creates layer files that can be used for parallax effects, 
   or as static layers (just set speedModifier to 0).
   Original width: 2400px | original height: 700px
   */

export class Layer {
  constructor(image, speedModifier, canvasHeight) {
    this.x = 0;
    this.y = 0;
    //this.width = 2400;
    //this.height = 700;
    this.image = image;
    this.speedModifier = speedModifier;

    // pixesl per second at scrollSpeed = 1;
    this.basePPS = 60;

    this.getTargetWidth = (currentCanvasHeight) => {
      // naturalWidth/H.: intrinsic pixel dimensions of the image are reliable once decoded
      const h = this.image.naturalHeight || this.image.height || 1;
      const w = this.image.naturalWidth || this.image.width || 1;
      const heightRatio = currentCanvasHeight / h;
      return w * heightRatio;
    };
  }
  update(currentCanvasHeight, dt) {
    // dt = seconds since last frame (duration)

    // time base movement now, instead of relying on FPS
    // because there are low-FPS and high-FPS browsers
    // compute the speed in pixels per second
    const pps = config.scrollSpeed * this.basePPS * this.speedModifier; // px/sec
    // distanceMoved = pps * dt
    this.x -= pps * dt; // time since last frame * speed (pps)

    const targetWidth = this.getTargetWidth(currentCanvasHeight);

    if (this.x <= -targetWidth) {
      this.x += targetWidth;
    }
  }
  draw(currentCanvasHeight, ctx) {
    const h = this.image.naturalHeight || this.image.height || 1;
    const w = this.image.naturalWidth || this.image.width || 1;
    const heightRatio = currentCanvasHeight / h;
    const targetWidth = w * heightRatio;
    const targetHeight = currentCanvasHeight;

    // Draw 3 tiles; overlap by 1px to hide seams (Firefox)
    for (let i = -1; i <= 1; i++) {
      ctx.drawImage(
        this.image,
        Math.floor(this.x + i * targetWidth),
        this.y,
        Math.ceil(targetWidth) + 1, //seam in Firefox needs + 1px
        targetHeight
      );
    }
  }
}
