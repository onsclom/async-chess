import { pieceImage } from "./piece-image";
import { startingPieces } from "./starting-pieces";
import { detectGameControllerInputs, events } from "./input";
import { legalMoves, moveIsLegal } from "./move-rules";

const DIRS = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};
const DARK_COLOR = "#999";
const PIECE_COOLDOWN = 10000;

// STATE
///////////////////
const pieces = structuredClone(startingPieces).map((piece) => ({
  ...piece,
  cooldownRemaining: 0,
  premove: null as null | { rank: number; file: string },
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
  detectGameControllerInputs();

  const kings = pieces.filter((piece) => piece.type === "king");
  const winner = kings.length === 1 ? kings[0].color : null;

  // UPDATE
  ///////////////////
  if (!winner) {
    handleGameInput(events);
    updatePieces(dt);
    updateSelections(dt);
  }

  // DRAW
  ///////////////////
  const DRAWING_RECT = canvas.getBoundingClientRect();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const { BOARD_1_RECT, BOARD_2_RECT } = calculateBoardRects(DRAWING_RECT);
  drawBoardBackground(ctx, BOARD_1_RECT);
  drawBoardBackground(ctx, BOARD_2_RECT);
  drawSelected(ctx, playerLeft.selected, "white", BOARD_1_RECT);
  drawSelected(ctx, playerRight.selected, "black", BOARD_2_RECT);
  drawCooldowns(ctx, "white", BOARD_1_RECT);
  drawCooldowns(ctx, "black", BOARD_2_RECT);
  drawPieces(ctx, "white", BOARD_1_RECT);
  drawPieces(ctx, "black", BOARD_2_RECT);
  drawPremoves(ctx, "white", BOARD_1_RECT);
  drawPremoves(ctx, "black", BOARD_2_RECT);
  drawMoveIndicators(ctx, playerLeft.selected, "white", BOARD_1_RECT);
  drawMoveIndicators(ctx, playerRight.selected, "black", BOARD_2_RECT);
  drawCursor(ctx, playerLeft.cursor, "white", BOARD_1_RECT);
  drawCursor(ctx, playerRight.cursor, "black", BOARD_2_RECT);

  if (winner) {
    // draw winner text
    ctx.save();
    ctx.fillStyle = "red";
    ctx.textAlign = "center";
    ctx.font = "bold 48px sans-serif";
    ctx.fillText(
      `${winner.toUpperCase()} WINS!`,
      DRAWING_RECT.width / 2,
      DRAWING_RECT.height / 2,
    );
    ctx.restore();
  }
}

function updateSelections(dt: number) {
  if (playerLeft.selected) {
    const selectedPiece = pieces.find(
      (piece) =>
        piece.rank === coordsToRankAndFile(playerLeft.selected!).rank &&
        piece.file === coordsToRankAndFile(playerLeft.selected!).file,
    );
    if (!selectedPiece || selectedPiece.color !== "white") {
      playerLeft.selected = null;
    }
  }
  if (playerRight.selected) {
    const selectedPiece = pieces.find(
      (piece) =>
        piece.rank === coordsToRankAndFile(playerRight.selected!).rank &&
        piece.file === coordsToRankAndFile(playerRight.selected!).file,
    );
    if (!selectedPiece || selectedPiece.color !== "black") {
      playerRight.selected = null;
    }
  }

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
}

function updatePieces(dt: number) {
  pieces.forEach((piece) => {
    if (piece.cooldownRemaining) {
      piece.cooldownRemaining = Math.max(piece.cooldownRemaining - dt, 0);
      if (piece.cooldownRemaining === 0 && piece.premove) {
        attemptMove(piece, piece.premove);
        piece.premove = null;
      }
    }
    if (piece.premove) {
      const legal = moveIsLegal(piece, piece.premove, pieces);
      if (!legal) {
        piece.premove = null;
      }
    }
  });
}

function calculateBoardRects(DRAWING_RECT: DOMRect) {
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
  return { BOARD_1_RECT, BOARD_2_RECT };
}

function handleGameInput(eventQueue: typeof events) {
  while (eventQueue.length) {
    const event = eventQueue.shift()!;
    const player = event.player === "left" ? playerLeft : playerRight;
    const playerColor = event.player === "left" ? "white" : "black";
    switch (event.type) {
      case "move": {
        const dir = DIRS[event.dir];
        const dy = event.player === "left" ? 1 : -1;
        const dx = event.player === "left" ? 1 : -1;
        player.cursor.x = (player.cursor.x + dx * dir.x + 8) % 8;
        player.cursor.y = (player.cursor.y + dy * dir.y + 8) % 8;
        break;
      }
      case "a": {
        if (!player.selected) {
          // handle "a" with no selection
          const rankAndFile = coordsToRankAndFile(player.cursor);
          const piece = pieces.find(
            (piece) =>
              piece.rank === rankAndFile.rank &&
              piece.file === rankAndFile.file,
          );
          if (!piece || piece.color !== playerColor) continue;
          player.selected = { x: player.cursor.x, y: player.cursor.y };
          piece.premove = null;
        } else {
          if (
            player.selected.x === player.cursor.x &&
            player.selected.y === player.cursor.y
          ) {
            player.selected = null;
            continue;
          }

          const selectedRankAndFile = coordsToRankAndFile(player.selected);
          const selectedPiece = pieces.find(
            (piece) =>
              piece.rank === selectedRankAndFile.rank &&
              piece.file === selectedRankAndFile.file,
          );
          if (!selectedPiece) continue;
          if (selectedPiece.color !== playerColor) continue;
          const pieceUnderCursor = pieces.find(
            (piece) =>
              piece.rank === coordsToRankAndFile(player.cursor).rank &&
              piece.file === coordsToRankAndFile(player.cursor).file,
          );
          if (pieceUnderCursor && pieceUnderCursor.color === playerColor) {
            player.selected = { x: player.cursor.x, y: player.cursor.y };
            continue;
          }
          if (selectedPiece.cooldownRemaining) {
            const legal = moveIsLegal(
              selectedPiece,
              coordsToRankAndFile(player.cursor),
              pieces,
            );
            if (legal) {
              const rankAndFile = coordsToRankAndFile(player.cursor);
              selectedPiece.premove = rankAndFile;
            }
            player.selected = null;
            continue;
          }
          attemptMove(selectedPiece, coordsToRankAndFile(player.cursor));
          player.selected = null;
        }
        break;
      }
      default: {
        throw new Error("Unknown event type");
      }
    }
  }
}

function attemptMove(
  piece: {
    rank: number;
    file: string;
    color: "white" | "black";
    type: "pawn" | "rook" | "knight" | "bishop" | "queen" | "king";
    cooldownRemaining: number;
    premove: { rank: number; file: string } | null;
  },
  target: {
    rank: number;
    file: string;
  },
) {
  // if here, time to attempt moving the piece
  const legal = moveIsLegal(piece, target, pieces);
  if (!legal) return;
  // capture
  const pieceUnderTarget = pieces.find(
    (p) => p.rank === target.rank && p.file === target.file,
  );
  if (pieceUnderTarget) {
    pieces.splice(pieces.indexOf(pieceUnderTarget), 1);
  }
  piece.rank = target.rank;
  piece.file = target.file;
  piece.cooldownRemaining = PIECE_COOLDOWN;
  piece.premove = null;
  // if the piece is a pawn, check for promotion
  if (piece.type === "pawn") {
    const playerColor = piece.color;
    const goal = playerColor === "white" ? 8 : 1;
    if (piece.rank === goal) {
      piece.type = "queen";
    }
  }
}

function drawPremoves(
  ctx: CanvasRenderingContext2D,
  perspective: "white" | "black",
  rect: { x: number; y: number; width: number; height: number },
) {
  pieces.forEach((piece) => {
    if (!piece.premove || piece.color !== perspective) return;
    const fromX = piece.file.charCodeAt(0) - "a".charCodeAt(0);
    const fromY = 8 - piece.rank;
    const toX = piece.premove.file.charCodeAt(0) - "a".charCodeAt(0);
    const toY = 8 - piece.premove.rank;
    const perspectiveFromX = perspective === "white" ? fromX : 7 - fromX;
    const perspectiveFromY = perspective === "white" ? fromY : 7 - fromY;
    const perspectiveToX = perspective === "white" ? toX : 7 - toX;
    const perspectiveToY = perspective === "white" ? toY : 7 - toY;
    const fromXCoord = rect.x + (perspectiveFromX + 0.5) * (rect.width / 8);
    const fromYCoord = rect.y + (perspectiveFromY + 0.5) * (rect.height / 8);
    const toXCoord = rect.x + (perspectiveToX + 0.5) * (rect.width / 8);
    const toYCoord = rect.y + (perspectiveToY + 0.5) * (rect.height / 8);
    ctx.save();
    ctx.globalAlpha = 0.5;
    ctx.strokeStyle = "#8f8";
    ctx.lineWidth = (0.1 * rect.width) / 8;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    drawArrow(
      ctx,
      fromXCoord,
      fromYCoord,
      toXCoord,
      toYCoord,
      0.025 * rect.width,
    );
    ctx.restore();
  });
}

function drawArrow(
  ctx: CanvasRenderingContext2D,
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
  headLength: number,
) {
  // draw the line
  ctx.beginPath();
  ctx.moveTo(fromX, fromY);
  ctx.lineTo(toX, toY);
  // draw the triangle at the end
  const angle = Math.atan2(toY - fromY, toX - fromX);
  ctx.lineTo(
    toX - headLength * Math.cos(angle - Math.PI / 6),
    toY - headLength * Math.sin(angle - Math.PI / 6),
  );
  ctx.moveTo(toX, toY);
  ctx.lineTo(
    toX - headLength * Math.cos(angle + Math.PI / 6),
    toY - headLength * Math.sin(angle + Math.PI / 6),
  );
  ctx.stroke();
}

function drawMoveIndicators(
  ctx: CanvasRenderingContext2D,
  selected: { x: number; y: number } | null,
  perspective: "white" | "black",
  rect: { x: number; y: number; width: number; height: number },
) {
  if (!selected) return;
  const selectedRankAndFile = coordsToRankAndFile(selected);
  const selectedPiece = pieces.find(
    (piece) =>
      piece.rank === selectedRankAndFile.rank &&
      piece.file === selectedRankAndFile.file,
  );
  if (!selectedPiece) return;
  const moves = legalMoves(selectedPiece, pieces);
  moves.forEach((move) => {
    if (!move) return; // TODO: update typescript
    const rank = move.rank;
    const file = move.file;
    const pX =
      perspective === "white"
        ? file.charCodeAt(0) - "a".charCodeAt(0)
        : "h".charCodeAt(0) - file.charCodeAt(0);
    const pY = perspective === "white" ? 7 - (rank - 1) : rank - 1;

    ctx.globalAlpha = 0.75;
    ctx.fillStyle = "gray";
    const circleRadius = rect.width / GRID_DIM / 8;
    const gridSquareSize = rect.width / GRID_DIM;
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(
      rect.x + pX * gridSquareSize + gridSquareSize / 2 - circleRadius,
      rect.y + pY * gridSquareSize + gridSquareSize / 2 - circleRadius,
      circleRadius * 2,
      circleRadius * 2,
      circleRadius,
    );
    ctx.fill();
    ctx.globalAlpha = 1;
  });
}

function drawCooldowns(
  ctx: CanvasRenderingContext2D,
  perspective: "white" | "black",
  rect: { x: number; y: number; width: number; height: number },
) {
  pieces.forEach((piece) => {
    if (piece.cooldownRemaining === 0) return;
    const cooldownPercent = piece.cooldownRemaining / PIECE_COOLDOWN;
    const x =
      perspective === "white"
        ? piece.file.charCodeAt(0) - "a".charCodeAt(0)
        : "h".charCodeAt(0) - piece.file.charCodeAt(0);
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

function coordsToRankAndFile(coords: { x: number; y: number }) {
  return {
    rank: 8 - coords.y,
    file: String.fromCharCode("a".charCodeAt(0) + coords.x),
  };
}

function drawSelected(
  ctx: CanvasRenderingContext2D,
  selected: { x: number; y: number } | null,
  perspective: "white" | "black",
  rect: { x: number; y: number; width: number; height: number },
) {
  if (!selected) return;
  const pY = perspective === "white" ? selected.y : GRID_DIM - 1 - selected.y;
  const pX = perspective === "white" ? selected.x : GRID_DIM - 1 - selected.x;
  ctx.globalAlpha = 0.75;
  ctx.fillStyle = "#8f8";
  ctx.fillRect(
    rect.x + pX * (rect.width / GRID_DIM),
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
  const pX =
    perspective === "white"
      ? cursor.animated.x
      : GRID_DIM - 1 - cursor.animated.x;
  ctx.strokeStyle = "#afa";
  const BORDER_WIDTH = rect.width * 0.01;
  ctx.lineWidth = BORDER_WIDTH;
  ctx.strokeRect(
    rect.x + pX * (rect.width / GRID_DIM),
    rect.y + pY * (rect.height / GRID_DIM),
    rect.width / GRID_DIM,
    rect.height / GRID_DIM,
  );
}

let GRID_DIM = 8;
function drawBoardBackground(
  ctx: CanvasRenderingContext2D,
  rect: { x: number; y: number; width: number; height: number },
) {
  Array.from({ length: GRID_DIM }).forEach((_, y) =>
    Array.from({ length: GRID_DIM }).forEach((_, x) => {
      const x0 = rect.x + x * (rect.width / GRID_DIM);
      const y0 = rect.y + y * (rect.height / GRID_DIM);
      const x1 = rect.x + (x + 1) * (rect.width / GRID_DIM);
      const y1 = rect.y + (y + 1) * (rect.height / GRID_DIM);
      ctx.fillStyle = (x + y) % 2 === 0 ? "white" : DARK_COLOR;
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
    const x =
      perspective === "white"
        ? piece.file.charCodeAt(0) - "a".charCodeAt(0)
        : "h".charCodeAt(0) - piece.file.charCodeAt(0);
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
