import { pieceImage } from "./piece-image";
import { startingPieces } from "./starting-pieces";
import { events } from "./input";

// STATE
///////////////////
const pieces = structuredClone(startingPieces);
const leftCursor = { x: 4, y: 7 }; // left is white
const rightCursor = { x: 4, y: 0 }; // right is black

const dirs = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

export function updateAndDraw(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  dt: number,
) {
  // UPDATE
  ///////////////////
  while (events.length) {
    const event = events.shift()!;
    const dir = dirs[event.dir];
    if (event.player === "left") {
      leftCursor.x = (leftCursor.x + dir.x + 8) % 8;
      leftCursor.y = (leftCursor.y + dir.y + 8) % 8;
    } else {
      rightCursor.x = (rightCursor.x + dir.x + 8) % 8;
      rightCursor.y = (rightCursor.y - dir.y + 8) % 8;
    }
  }

  // DRAW
  ///////////////////
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

  drawBoardBackground(ctx, "white", BOARD_1_RECT);
  drawBoardBackground(ctx, "black", BOARD_2_RECT);
  drawPieces(ctx, "white", BOARD_1_RECT);
  drawPieces(ctx, "black", BOARD_2_RECT);

  // draw cursors
  drawCursors(ctx, leftCursor, rightCursor, "white", BOARD_1_RECT);
  drawCursors(ctx, leftCursor, rightCursor, "black", BOARD_2_RECT);
}

function drawCursor(
  ctx: CanvasRenderingContext2D,
  cursor: { x: number; y: number },
  color: "white" | "black",
  perspective: "white" | "black",
  rect: { x: number; y: number; width: number; height: number },
) {
  const pY = perspective === "white" ? cursor.y : GRID_DIM - 1 - cursor.y;
  ctx.strokeStyle = color === "white" ? GRAY : "white";
  const BORDER_WIDTH = rect.width * 0.015;
  ctx.lineWidth = BORDER_WIDTH;
  ctx.strokeRect(
    rect.x + cursor.x * (rect.width / GRID_DIM),
    rect.y + pY * (rect.height / GRID_DIM),
    rect.width / GRID_DIM,
    rect.height / GRID_DIM,
  );
  ctx.strokeStyle = color === "white" ? "white" : GRAY;
  ctx.lineWidth = BORDER_WIDTH * 0.5;
  ctx.strokeRect(
    rect.x + cursor.x * (rect.width / GRID_DIM),
    rect.y + pY * (rect.height / GRID_DIM),
    rect.width / GRID_DIM,
    rect.height / GRID_DIM,
  );
}

function drawCursors(
  ctx: CanvasRenderingContext2D,
  whiteCursor: { x: number; y: number },
  blackCursor: { x: number; y: number },
  perspective: "white" | "black",
  rect: { x: number; y: number; width: number; height: number },
) {
  // draw players cursor ontop
  if (perspective === "white") {
    drawCursor(ctx, blackCursor, "black", perspective, rect);
    drawCursor(ctx, whiteCursor, "white", perspective, rect);
  } else {
    drawCursor(ctx, whiteCursor, "white", perspective, rect);
    drawCursor(ctx, blackCursor, "black", perspective, rect);
  }
}

let GRID_DIM = 8;
const GRAY = "#999";
function drawBoardBackground(
  ctx: CanvasRenderingContext2D,
  perspective: "white" | "black",
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
  ctx: CanvasRenderingContext2D,
  perspective: "white" | "black",
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
