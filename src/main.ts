import { updateAndDraw } from "./game";

const canvas = document.createElement("canvas");
document.body.appendChild(canvas);
const ctx = canvas.getContext("2d")!;

// null for requestAnimationFrame, or a number for fixed FPS
const FIXED_FPS = null;

if (FIXED_FPS) {
  setInterval(gameLoop, 1000 / FIXED_FPS);
} else {
  requestAnimationFrame(function render() {
    gameLoop();
    requestAnimationFrame(render);
  });
}

let lastTime: number | null = null;
function gameLoop() {
  {
    const canvasRect = canvas.getBoundingClientRect();
    canvas.width = canvasRect.width * window.devicePixelRatio;
    canvas.height = canvasRect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
  }
  lastTime = lastTime || performance.now();
  const newTime = performance.now();
  const dt = newTime - lastTime;
  lastTime = newTime;
  updateAndDraw(canvas, ctx, dt);
}
