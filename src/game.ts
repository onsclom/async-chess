import { pieceImage } from "./piece-image";
import { startingPieces } from "./starting-pieces";
import { events } from "./input";

const DIRS = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};
const DARK_COLOR = "#999";
const PIECE_COOLDOWN = 5000;

// STATE
///////////////////
const pieces = structuredClone(startingPieces).map((piece) => ({
  ...piece,
  cooldownRemaining: 0,
}));
const playerLeft = {
  cursor: { x: 4, y: 7, animated: { x: 4, y: 7 } },
  selected: null as null | { x: number; y: number },
};
const playerRight = {
  cursor: { x: 4, y: 0, animated: { x: 4, y: 0 } },
  selected: null as null | { x: number; y: number },
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
    const player = event.player === "left" ? playerLeft : playerRight;
    const playerColor = event.player === "left" ? "white" : "black";

    switch (event.type) {
      case "move": {
        const dir = DIRS[event.dir];
        const dy = event.player === "left" ? 1 : -1;
        player.cursor.x = (player.cursor.x + dir.x + 8) % 8;
        player.cursor.y = (player.cursor.y + dy * dir.y + 8) % 8;
        break;
      }
      case "a": {
        if (!player.selected) {
          // handle "a" with no selection
          const rankAndFile = cursorToRankAndFile(player.cursor);
          const piece = pieces.find(
            (piece) =>
              piece.rank === rankAndFile.rank &&
              piece.file === rankAndFile.file,
          );
          if (!piece || piece.color !== playerColor) continue;
          player.selected = { x: player.cursor.x, y: player.cursor.y };
        } else {
          // handle "a" with selection
          const selectedRankAndFile = cursorToRankAndFile(player.selected);
          const selectedPiece = pieces.find(
            (piece) =>
              piece.rank === selectedRankAndFile.rank &&
              piece.file === selectedRankAndFile.file,
          );
          if (!selectedPiece) continue;
          const pieceUnderCursor = pieces.find(
            (piece) =>
              piece.rank === cursorToRankAndFile(player.cursor).rank &&
              piece.file === cursorToRankAndFile(player.cursor).file,
          );
          if (pieceUnderCursor) {
            if (pieceUnderCursor.color === playerColor) {
              player.selected = { x: player.cursor.x, y: player.cursor.y };
              continue;
            } else {
              // capture
              pieces.splice(pieces.indexOf(pieceUnderCursor), 1);
            }
          }
          // if still here, move the piece
          selectedPiece.rank = cursorToRankAndFile(player.cursor).rank;
          selectedPiece.file = cursorToRankAndFile(player.cursor).file;
          selectedPiece.cooldownRemaining = PIECE_COOLDOWN;
          player.selected = null;
        }
        break;
      }
      case "b": {
        if (player.selected) {
          player.selected = null;
        }
        break;
      }
      default: {
        throw new Error("Unknown event type");
      }
    }
  }
  // go through all pieces and decrement cooldown
  pieces.forEach((piece) => {
    piece.cooldownRemaining = Math.max(piece.cooldownRemaining - dt, 0);
  });

  // animated cursors
  const speed = dt * 0.02;
  [playerLeft.cursor, playerRight.cursor].forEach((cursor) => {
    cursor.animated.x = (1 - speed) * cursor.animated.x + speed * cursor.x;
    cursor.animated.y = (1 - speed) * cursor.animated.y + speed * cursor.y;

    const distanceToTarget = Math.hypot(
      cursor.x - cursor.animated.x,
      cursor.y - cursor.animated.y,
    );
    const minDistance = 3.5; // squares away
    if (distanceToTarget > minDistance) {
      const percentToTravel = (distanceToTarget - minDistance) / minDistance;
      cursor.animated.x =
        cursor.x * percentToTravel + cursor.animated.x * (1 - percentToTravel);
      cursor.animated.y =
        cursor.y * percentToTravel + cursor.animated.y * (1 - percentToTravel);
    }
  });

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

  if (playerLeft.selected) {
    drawSelected(ctx, playerLeft.selected, "white", BOARD_1_RECT);
  }
  if (playerRight.selected) {
    drawSelected(ctx, playerRight.selected, "black", BOARD_2_RECT);
  }
  //drawCooldowns
  drawCooldowns(ctx, "white", BOARD_1_RECT);
  drawCooldowns(ctx, "black", BOARD_2_RECT);
  drawPieces(ctx, "white", BOARD_1_RECT);
  drawPieces(ctx, "black", BOARD_2_RECT);
  drawCursor(ctx, playerLeft.cursor, "white", BOARD_1_RECT);
  drawCursor(ctx, playerRight.cursor, "black", BOARD_2_RECT);
}

function drawCooldowns(
  ctx: CanvasRenderingContext2D,
  perspective: "white" | "black",
  rect: { x: number; y: number; width: number; height: number },
) {
  pieces.forEach((piece) => {
    if (piece.cooldownRemaining === 0) return;
    const cooldownPercent = piece.cooldownRemaining / PIECE_COOLDOWN;
    const x = piece.file.charCodeAt(0) - "a".charCodeAt(0);
    const y = perspective === "white" ? GRID_DIM - piece.rank : piece.rank - 1;
    ctx.fillStyle = "rgba(255, 255, 0, 0.5)";
    ctx.fillRect(
      rect.x + x * (rect.width / GRID_DIM),
      rect.y + (y + 1) * (rect.height / GRID_DIM),
      rect.width / GRID_DIM,
      -(rect.height / GRID_DIM) * cooldownPercent,
    );
  });
}

function cursorToRankAndFile(cursor: { x: number; y: number }) {
  return {
    rank: 8 - cursor.y,
    file: String.fromCharCode("a".charCodeAt(0) + cursor.x),
  };
}

function drawSelected(
  ctx: CanvasRenderingContext2D,
  selected: { x: number; y: number },
  perspective: "white" | "black",
  rect: { x: number; y: number; width: number; height: number },
) {
  const pY = perspective === "white" ? selected.y : GRID_DIM - 1 - selected.y;
  ctx.fillStyle = "#aaf";
  ctx.fillRect(
    rect.x + selected.x * (rect.width / GRID_DIM),
    rect.y + pY * (rect.height / GRID_DIM),
    rect.width / GRID_DIM,
    rect.height / GRID_DIM,
  );
  ctx.globalAlpha = 1;
}

function drawCursor(
  ctx: CanvasRenderingContext2D,
  cursor: { x: number; y: number; animated: { x: number; y: number } },
  perspective: "white" | "black",
  rect: { x: number; y: number; width: number; height: number },
) {
  const pY =
    perspective === "white"
      ? cursor.animated.y
      : GRID_DIM - 1 - cursor.animated.y;
  ctx.strokeStyle = "#aaf";
  const BORDER_WIDTH = rect.width * 0.01;
  ctx.lineWidth = BORDER_WIDTH;
  ctx.strokeRect(
    rect.x + cursor.animated.x * (rect.width / GRID_DIM),
    rect.y + pY * (rect.height / GRID_DIM),
    rect.width / GRID_DIM,
    rect.height / GRID_DIM,
  );
}

let GRID_DIM = 8;
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
        ((x + y) % 2 === 0) === (perspective === "white")
          ? "white"
          : DARK_COLOR;
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
