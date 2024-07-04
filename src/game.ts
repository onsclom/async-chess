import { menuUpdateAndDraw } from "./menu";
import { versusUpdateAndDraw } from "./versus";
import { gameState } from "./state";

export function gameUpdateAndDraw(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  dt: number,
) {
  if (gameState.scene === "menu") {
    menuUpdateAndDraw(canvas, ctx, dt);
  } else if (gameState.scene === "versus") {
    versusUpdateAndDraw(canvas, ctx, dt);
  }
}
