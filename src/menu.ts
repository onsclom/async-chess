import { gameState, COOLDOWN_OPTIONS } from "./state";
import { spud, Button } from "@spud.gg/api";

export function menuUpdateAndDraw(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  dt: number,
) {
  if (spud.anyPlayer.buttonJustPressed(Button.South)) {
    gameState.scene = "versus";
  }

  if (spud.anyPlayer.buttonJustPressed(Button.DpadLeft)) {
    // @ts-ignore
    const currentIndex = COOLDOWN_OPTIONS.indexOf(gameState.cooldown);
    gameState.cooldown =
      COOLDOWN_OPTIONS[
        (currentIndex - 1 + COOLDOWN_OPTIONS.length) % COOLDOWN_OPTIONS.length
      ];
  }

  if (spud.anyPlayer.buttonJustPressed(Button.DpadRight)) {
    {
      // @ts-ignore
      const currentIndex = COOLDOWN_OPTIONS.indexOf(gameState.cooldown);
      gameState.cooldown =
        COOLDOWN_OPTIONS[(currentIndex + 1) % COOLDOWN_OPTIONS.length];
    }
  }

  const drawRect = canvas.getBoundingClientRect();
  {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    {
      // draw fun chess background
      ctx.save();
      const gridSize = 100;
      ctx.translate(
        (performance.now() * 0.05) % gridSize,
        (performance.now() * 0.05) % gridSize,
      );
      for (let x = -gridSize; x <= drawRect.width; x += gridSize) {
        for (let y = -gridSize; y <= drawRect.height; y += gridSize) {
          ctx.fillStyle = (x + y) % (gridSize * 2) === 0 ? "black" : "#333";
          ctx.fillRect(x, y, gridSize, gridSize);
        }
      }
      ctx.restore();
    }

    const titleRect = {
      x: 0,
      y: 0,
      width: drawRect.width,
      height: drawRect.height / 3,
    };

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
