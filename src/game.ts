import { pieceImage } from "./piece-image";
import { startingPieces } from "./starting-pieces";

// STATE
////////////
const pieces = structuredClone(startingPieces);

export function updateAndDraw(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  dt: number,
) {
  const DRAWING_RECT = canvas.getBoundingClientRect();
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  /*
                          VERT_SPACE
    HORI_SPACE BOARD_SIZE HORI_SPACE BOARD_SIZE HORI_SPACE
                          VERT_SPACE
 */
  const MIN_MARGIN = DRAWING_RECT.width * 0.05;
  const BOARD_SIZE = Math.min(
    (DRAWING_RECT.width - 3 * MIN_MARGIN) / 2,
    DRAWING_RECT.height - 2 * MIN_MARGIN,
  );
  const HORI_SPACE = (DRAWING_RECT.width - BOARD_SIZE * 2) / 3;
  const VERT_SPACE = (DRAWING_RECT.height - BOARD_SIZE) / 2;

  const BOARD_1_RECT = {
    x: HORI_SPACE,
    y: VERT_SPACE,
    width: BOARD_SIZE,
    height: BOARD_SIZE,
  };
  const BOARD_2_RECT = {
    x: HORI_SPACE * 2 + BOARD_SIZE,
    y: VERT_SPACE,
    width: BOARD_SIZE,
    height: BOARD_SIZE,
  };

  drawBoardBackground("white", ctx, BOARD_1_RECT);
  drawBoardBackground("black", ctx, BOARD_2_RECT);
  drawPieces("white", ctx, BOARD_1_RECT);
  drawPieces("black", ctx, BOARD_2_RECT);
}

const GRID_DIM = 8;
const GRAY = "#999";
function drawBoardBackground(
  perspective: "white" | "black",
  ctx: CanvasRenderingContext2D,
  rect: { x: number; y: number; width: number; height: number },
) {
  Array.from({ length: GRID_DIM }).forEach((_, y) =>
    Array.from({ length: GRID_DIM }).forEach((_, x) => {
      const x0 = rect.x + x * (rect.width / GRID_DIM);
      const y0 = rect.y + y * (rect.height / GRID_DIM);
      const x1 = rect.x + (x + 1) * (rect.width / GRID_DIM);
      const y1 = rect.y + (y + 1) * (rect.height / GRID_DIM);
      ctx.fillStyle =
        ((x + y) % 2 === 0) === (perspective === "white") ? "white" : GRAY;
      ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
    }),
  );
}

function drawPieces(
  perspective: "white" | "black",
  ctx: CanvasRenderingContext2D,
  rect: { x: number; y: number; width: number; height: number },
) {
  pieces.forEach((piece) => {
    const x = piece.file.charCodeAt(0) - "a".charCodeAt(0);
    const y = perspective === "white" ? GRID_DIM - piece.rank : piece.rank - 1;
    ctx.drawImage(
      pieceImage(piece.type, piece.color),
      rect.x + x * (rect.width / GRID_DIM),
      rect.y + y * (rect.height / GRID_DIM),
      rect.width / GRID_DIM,
      rect.height / GRID_DIM,
    );
  });
}
