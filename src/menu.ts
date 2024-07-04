import { rightInput, leftInput } from "./input";
import { gameState, COOLDOWN_OPTIONS } from "./state";

export function menuUpdateAndDraw(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  dt: number,
) {
  if (
    leftInput.actionsJustPressed.has("a") ||
    rightInput.actionsJustPressed.has("a")
  ) {
    gameState.scene = "versus";
  }

  if (
    leftInput.actionsJustPressed.has("left") ||
    rightInput.actionsJustPressed.has("left")
  ) {
    const currentIndex = COOLDOWN_OPTIONS.indexOf(gameState.cooldown);
    gameState.cooldown =
      COOLDOWN_OPTIONS[
        (currentIndex - 1 + COOLDOWN_OPTIONS.length) % COOLDOWN_OPTIONS.length
      ];
  }

  if (
    leftInput.actionsJustPressed.has("right") ||
    rightInput.actionsJustPressed.has("right")
  ) {
    {
      // @ts-ignore
      const currentIndex = COOLDOWN_OPTIONS.indexOf(gameState.cooldown);
      gameState.cooldown =
        // @ts-ignore
        COOLDOWN_OPTIONS[(currentIndex + 1) % COOLDOWN_OPTIONS.length];
    }
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
    `${gameState.cooldown}s cooldown (⬅️ & ➡️ to change)`,
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

  const remainingRect = {
    x: 0,
    y: (drawRect.height / 3) * 2,
    width: drawRect.width,
    height: drawRect.height / 3,
  };
  ctx.save();
  ctx.fillStyle = "white";
  ctx.font = `${fontSize}px sans-serif`;
  ctx.textBaseline = "middle";
  ctx.textAlign = "center";
  ctx.fillText(
    "press a to start",
    remainingRect.x + remainingRect.width / 2,
    remainingRect.y + remainingRect.height / 2,
  );
  ctx.restore();
}
