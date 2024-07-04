import { rightInput, leftInput } from "./input";

const COOLDOWN_OPTIONS = [5, 10, 15] as const;
let cooldown = 5;

export function menuUpdateAndDraw(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  dt: number,
) {
  if (
    leftInput.actionsJustPressed.has("left") ||
    rightInput.actionsJustPressed.has("left")
  ) {
    const currentIndex = COOLDOWN_OPTIONS.indexOf(
      cooldown as (typeof COOLDOWN_OPTIONS)[number],
    );
    cooldown =
      COOLDOWN_OPTIONS[
        (currentIndex - 1 + COOLDOWN_OPTIONS.length) % COOLDOWN_OPTIONS.length
      ];
  }
  if (
    leftInput.actionsJustPressed.has("right") ||
    rightInput.actionsJustPressed.has("right")
  ) {
    const currentIndex = COOLDOWN_OPTIONS.indexOf(
      cooldown as (typeof COOLDOWN_OPTIONS)[number],
    );
    cooldown = COOLDOWN_OPTIONS[(currentIndex + 1) % COOLDOWN_OPTIONS.length];
  }

  const drawRect = canvas.getBoundingClientRect();
  {
    const titleRect = {
      x: 0,
      y: 0,
      width: drawRect.width,
      height: drawRect.height / 3,
    };

    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.fillStyle = "white";
    ctx.font = "40px sans-serif";
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    ctx.fillText(
      "async chess",
      titleRect.x + titleRect.width / 2,
      titleRect.y + titleRect.height / 2,
    );
    ctx.restore();
  }

  const coolDownRect = {
    x: 0,
    y: drawRect.height / 3,
    width: drawRect.width,
    height: drawRect.height / 3,
  };

  const fontSize = 30;
  const spacing = 30;
  ctx.save();
  ctx.fillStyle = "white";
  ctx.font = `${fontSize}px sans-serif`;
  ctx.textBaseline = "middle";
  ctx.textAlign = "center";
  ctx.fillText(
    `${cooldown}s cooldown (⬅️ & ➡️ to change)`,
    coolDownRect.x + coolDownRect.width / 2,
    coolDownRect.y + coolDownRect.height / 2 - spacing,
  );
  const gamepads = navigator.getGamepads();
  ctx.fillText(
    `${gamepads.filter((gp) => gp !== null).length} 🎮 detected`,
    coolDownRect.x + coolDownRect.width / 2,
    coolDownRect.y + coolDownRect.height / 2 + spacing,
  );
  ctx.restore();
}
