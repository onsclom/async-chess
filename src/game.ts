import { menuUpdateAndDraw } from "./menu";
import { versusUpdateAndDraw } from "./versus";

let state = "menu";

export function gameUpdateAndDraw(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  dt: number,
) {
  if (state === "menu") {
    menuUpdateAndDraw(canvas, ctx, dt);
  } else if (state === "versus") {
    versusUpdateAndDraw(canvas, ctx, dt);
  }
}
