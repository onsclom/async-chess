import { updateAndDraw } from "./game";

const FIXED_FPS = null; // null for requestAnimationFrame, or a number for fixed FPS
const SHOW_FRAME_TIME = true;
const BUDGET = 1000 / 120;

const canvas = document.createElement("canvas");
document.body.appendChild(canvas);
const ctx = canvas.getContext("2d")!;

if (FIXED_FPS) {
  setInterval(gameStep, 1000 / FIXED_FPS);
} else {
  requestAnimationFrame(function render() {
    gameStep();
    requestAnimationFrame(render);
  });
}

let lastTime: number | null = null;
function gameStep() {
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

  if (SHOW_FRAME_TIME) {
    const endTime = performance.now();
    const frameTime = `${(endTime - newTime).toFixed(1)}ms / ${BUDGET.toFixed(1)}ms (${((100 * (endTime - newTime)) / BUDGET).toFixed(1)}%)`;
    ctx.fillStyle = "red";
    ctx.font = "20px sans-serif";
    ctx.fillText(frameTime, 10, 20);
  }
}
