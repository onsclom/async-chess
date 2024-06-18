import { pieceImage } from "./piece-image";
import { rightInput, leftInput } from "./input";
import { legalMoves, moveIsLegal } from "./move-rules";
import { playSound } from "./sound";
import { gameState, resetGameState } from "./state";

const PIECE_COOLDOWN = 10000;
const DARK_COLOR = "#999";

export function updateAndDraw(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  dt: number,
) {
  if (gameState.state === "readyUp") {
    readyUpUpdateAndDraw(ctx, canvas);
    return;
  }

  const { pieces, playerLeft, playerRight } = gameState;

  // UPDATE
  ///////////////////
  const kings = pieces.filter((piece) => piece.type === "king");
  const winner = kings.length === 1 ? kings[0].color : null;
  gameState.countdown = Math.max(gameState.countdown - dt, 0);

  if (!winner && gameState.countdown === 0) {
    handleInputs(playerLeft, playerRight, pieces);
  }
  updateSelections(dt, playerLeft, playerRight, pieces);
  updatePieces(dt, pieces);
  if (winner && !gameState.gameWasOver) {
    gameState.gameWasOver = true;
    pieces.forEach((piece) => (piece.premove = null));
    setTimeout(() => resetGameState(), 5000);
  }

  // DRAW
  ///////////////////
  const DRAWING_RECT = canvas.getBoundingClientRect();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const { BOARD_1_RECT, BOARD_2_RECT } = calculateBoardRects(DRAWING_RECT);
  drawBoardBackground(ctx, BOARD_1_RECT);
  drawBoardBackground(ctx, BOARD_2_RECT);

  drawOpponentSelected(ctx, playerRight.selected, "white", BOARD_1_RECT);
  drawOpponentSelected(ctx, playerLeft.selected, "black", BOARD_2_RECT);
  drawSelected(ctx, playerLeft.selected, "white", BOARD_1_RECT);
  drawSelected(ctx, playerRight.selected, "black", BOARD_2_RECT);

  drawCooldowns(ctx, "white", BOARD_1_RECT, pieces);
  drawCooldowns(ctx, "black", BOARD_2_RECT, pieces);
  drawPieces(ctx, "white", BOARD_1_RECT, pieces);
  drawPieces(ctx, "black", BOARD_2_RECT, pieces);
  drawPremoves(ctx, "white", BOARD_1_RECT, pieces);
  drawPremoves(ctx, "black", BOARD_2_RECT, pieces);
  drawMoveIndicators(ctx, playerLeft.selected, "white", BOARD_1_RECT, pieces);
  drawMoveIndicators(ctx, playerRight.selected, "black", BOARD_2_RECT, pieces);

  drawOpponentCursor(ctx, playerRight.cursor, "white", BOARD_1_RECT);
  drawOpponentCursor(ctx, playerLeft.cursor, "black", BOARD_2_RECT);
  drawCursor(ctx, playerLeft.cursor, "white", BOARD_1_RECT);
  drawCursor(ctx, playerRight.cursor, "black", BOARD_2_RECT);

  drawCountdown(ctx, gameState.countdown, DRAWING_RECT);
  drawWinnerText(ctx, winner, DRAWING_RECT);
}

function drawWinnerText(
  ctx: CanvasRenderingContext2D,
  winner: string | null,
  drawingRect: DOMRect,
) {
  if (!winner) return;
  redCenteredText(ctx, `${winner.toUpperCase()} WINS!`, drawingRect);
}

function drawCountdown(
  ctx: CanvasRenderingContext2D,
  countdown: number,
  drawingRect: DOMRect,
) {
  if (countdown === 0) return;
  const num = Math.ceil(gameState.countdown / 1000);
  ctx.globalAlpha = 0.5;
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, drawingRect.width, drawingRect.height);
  ctx.globalAlpha = 1;
  redCenteredText(ctx, `${num}`, drawingRect);
}

function readyUpUpdateAndDraw(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
) {
  redCenteredLines(
    ctx,
    [
      `hold (a) to start`,
      ``,
      `player 1 ${leftInput.actionsDown.has("a") ? "✔️" : "❌"}`,
      `player 2 ${rightInput.actionsDown.has("a") ? "✔️" : "❌"}`,
    ],
    canvas.getBoundingClientRect(),
    48,
  );

  if (leftInput.actionsDown.has("a") && rightInput.actionsDown.has("a")) {
    gameState.state = "playing";
  }
  return;
}

function redCenteredText(
  ctx: CanvasRenderingContext2D,
  text: string,
  drawingRect: DOMRect,
) {
  redCenteredLines(ctx, text.split("\n"), drawingRect, 64);
}

function redCenteredLines(
  ctx: CanvasRenderingContext2D,
  lines: string[],
  drawingRect: DOMRect,
  fontSize: number,
) {
  ctx.save();
  ctx.fillStyle = "red";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `bold ${fontSize}px sans-serif`;
  lines.forEach((line, i) => {
    const yCenter = drawingRect.height / 2;
    const offset = i - (lines.length - 1) / 2;
    ctx.fillText(line, drawingRect.width / 2, yCenter + offset * fontSize);
  });
  ctx.restore();
}

function updateSelections(
  dt: number,
  playerLeft: typeof gameState.playerLeft,
  playerRight: typeof gameState.playerRight,
  pieces: typeof gameState.pieces,
) {
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

  [playerLeft.cursor, playerRight.cursor].forEach((cursor) => {
    const { x, y } = animatedBoardCoords(
      cursor.animated.x,
      cursor.animated.y,
      cursor.x,
      cursor.y,
      dt,
    );
    cursor.animated.x = x;
    cursor.animated.y = y;
  });
}

function animatedBoardCoords(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  dt: number,
) {
  const speed = 0.02;
  x1 += (x2 - x1) * dt * speed;
  y1 += (y2 - y1) * dt * speed;
  const distanceToTarget = Math.hypot(x2 - x1, y2 - y1);
  const minDistance = 3.5; // squares away
  if (distanceToTarget > minDistance) {
    const percentToTravel = (distanceToTarget - minDistance) / minDistance;
    x1 = x2 * percentToTravel + x1 * (1 - percentToTravel);
    y1 = y2 * percentToTravel + y1 * (1 - percentToTravel);
  }
  return { x: x1, y: y1 };
}

function updatePieces(dt: number, pieces: typeof gameState.pieces) {
  // shuffle pieces to make evaluation of premoves more fair
  const shuffledPieces = shuffled(pieces);
  shuffledPieces.forEach((piece) => {
    if (piece.cooldownRemaining) {
      piece.cooldownRemaining = Math.max(piece.cooldownRemaining - dt, 0);
      if (piece.cooldownRemaining === 0 && piece.premove) {
        attemptMove(piece, piece.premove, pieces);
        piece.premove = null;
      }
    }
    if (piece.premove) {
      const legal = moveIsLegal(piece, piece.premove, pieces);
      if (!legal) {
        piece.premove = null;
      }
    }

    {
      const y = piece.rank - 1;
      const x = piece.file.charCodeAt(0) - "a".charCodeAt(0);
      const animated = animatedBoardCoords(
        piece.animated.x,
        piece.animated.y,
        x,
        y,
        dt,
      );
      piece.animated.x = animated.x;
      piece.animated.y = animated.y;
      piece.animated.scale += (1 - piece.animated.scale) * dt * 0.02;
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

const DIRS = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

function handleInputs(
  playerLeft: typeof gameState.playerLeft,
  playerRight: typeof gameState.playerRight,
  pieces: typeof gameState.pieces,
) {
  // shuffle so we don't always prio 1st player
  const playersInfo = shuffled([
    {
      player: playerLeft,
      playerInput: leftInput,
      playerColor: "white",
    },
    {
      player: playerRight,
      playerInput: rightInput,
      playerColor: "black",
    },
  ] as const);
  for (const { player, playerInput, playerColor } of playersInfo) {
    const dirActions = ["left", "up", "right", "down"] as const;
    const mirror = player === playerLeft ? 1 : -1;
    const multiplier = playerInput.actionsDown.has("b") ? 2 : 1;
    for (const action of dirActions) {
      const dir = DIRS[action];
      if (playerInput.actionsJustPressed.has(action)) {
        player.cursor.x =
          (player.cursor.x + dir.x * mirror * multiplier + 8) % 8;
        player.cursor.y =
          (player.cursor.y + dir.y * mirror * multiplier + 8) % 8;
        // turns out this is pretty obnoxious lol
        // playSound("step");
      }
    }
    if (playerInput.actionsJustPressed.has("a")) {
      handleA(player, playerColor, pieces);
    }
  }
}

function shuffled<T>(items: T[]) {
  const shuffled = [...items];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function handleA(
  player: typeof gameState.playerLeft | typeof gameState.playerRight,
  playerColor: "white" | "black",
  pieces: typeof gameState.pieces,
) {
  if (!player.selected) {
    // handle "a" with no selection
    const rankAndFile = coordsToRankAndFile(player.cursor);
    const piece = pieces.find(
      (piece) =>
        piece.rank === rankAndFile.rank && piece.file === rankAndFile.file,
    );
    if (!piece || piece.color !== playerColor) return;
    player.selected = { x: player.cursor.x, y: player.cursor.y };
    piece.premove = null;
  } else {
    if (
      player.selected.x === player.cursor.x &&
      player.selected.y === player.cursor.y
    ) {
      player.selected = null;
      return;
    }

    const selectedRankAndFile = coordsToRankAndFile(player.selected);
    const selectedPiece = pieces.find(
      (piece) =>
        piece.rank === selectedRankAndFile.rank &&
        piece.file === selectedRankAndFile.file,
    );
    if (!selectedPiece) return;
    if (selectedPiece.color !== playerColor) return;
    const pieceUnderCursor = pieces.find(
      (piece) =>
        piece.rank === coordsToRankAndFile(player.cursor).rank &&
        piece.file === coordsToRankAndFile(player.cursor).file,
    );
    if (pieceUnderCursor && pieceUnderCursor.color === playerColor) {
      player.selected = { x: player.cursor.x, y: player.cursor.y };
      return;
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
      return;
    }
    attemptMove(selectedPiece, coordsToRankAndFile(player.cursor), pieces);
    player.selected = null;
  }
}

function attemptMove(
  piece: (typeof gameState.pieces)[number],
  target: {
    rank: number;
    file: string;
  },
  pieces: typeof gameState.pieces,
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
    playSound("capture");
  } else {
    playSound("move");
  }
  piece.rank = target.rank;
  piece.file = target.file;
  piece.cooldownRemaining = PIECE_COOLDOWN;
  piece.animated.scale = 1.5;
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
  pieces: typeof gameState.pieces,
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
    ctx.globalAlpha = 0.75;
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
  pieces: typeof gameState.pieces,
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
    const pieceUnderTarget = pieces.find(
      (p) => p.rank === move.rank && p.file === move.file,
    );
    const enemyPiece =
      pieceUnderTarget && pieceUnderTarget.color !== selectedPiece.color;

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

    if (enemyPiece) {
      // draw X
      const circleRadius = rect.width / GRID_DIM / 3;
      ctx.save();
      ctx.strokeStyle = "gray";
      ctx.lineWidth = (0.1 * rect.width) / GRID_DIM;
      ctx.beginPath();
      ctx.moveTo(
        rect.x + pX * gridSquareSize + gridSquareSize / 2 - circleRadius,
        rect.y + pY * gridSquareSize + gridSquareSize / 2 - circleRadius,
      );
      ctx.lineTo(
        rect.x + pX * gridSquareSize + gridSquareSize / 2 + circleRadius,
        rect.y + pY * gridSquareSize + gridSquareSize / 2 + circleRadius,
      );
      ctx.moveTo(
        rect.x + pX * gridSquareSize + gridSquareSize / 2 + circleRadius,
        rect.y + pY * gridSquareSize + gridSquareSize / 2 - circleRadius,
      );
      ctx.lineTo(
        rect.x + pX * gridSquareSize + gridSquareSize / 2 - circleRadius,
        rect.y + pY * gridSquareSize + gridSquareSize / 2 + circleRadius,
      );
      ctx.stroke();
    } else {
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
    }
    ctx.globalAlpha = 1;
  });
}

function drawCooldowns(
  ctx: CanvasRenderingContext2D,
  perspective: "white" | "black",
  rect: { x: number; y: number; width: number; height: number },
  pieces: typeof gameState.pieces,
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
  color: string = "#8f8",
) {
  if (!selected) return;
  const pY = perspective === "white" ? selected.y : GRID_DIM - 1 - selected.y;
  const pX = perspective === "white" ? selected.x : GRID_DIM - 1 - selected.x;
  ctx.globalAlpha = 0.75;
  ctx.fillStyle = color;
  ctx.fillRect(
    rect.x + pX * (rect.width / GRID_DIM),
    rect.y + pY * (rect.height / GRID_DIM),
    rect.width / GRID_DIM,
    rect.height / GRID_DIM,
  );
  ctx.globalAlpha = 1;
}

function drawOpponentSelected(
  ctx: CanvasRenderingContext2D,
  selected: { x: number; y: number } | null,
  perspective: "white" | "black",
  rect: { x: number; y: number; width: number; height: number },
) {
  drawSelected(ctx, selected, perspective, rect, "#f88");
}

function drawOpponentCursor(
  ctx: CanvasRenderingContext2D,
  cursor: { x: number; y: number; animated: { x: number; y: number } },
  perspective: "white" | "black",
  rect: { x: number; y: number; width: number; height: number },
) {
  drawCursor(ctx, cursor, perspective, rect, "#f88");
}

function drawCursor(
  ctx: CanvasRenderingContext2D,
  cursor: { x: number; y: number; animated: { x: number; y: number } },
  perspective: "white" | "black",
  rect: { x: number; y: number; width: number; height: number },
  color: string = "#8f8",
) {
  const pY =
    perspective === "white"
      ? cursor.animated.y
      : GRID_DIM - 1 - cursor.animated.y;
  const pX =
    perspective === "white"
      ? cursor.animated.x
      : GRID_DIM - 1 - cursor.animated.x;
  ctx.strokeStyle = color;
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
  pieces: typeof gameState.pieces,
) {
  pieces.forEach((piece) => {
    const x =
      perspective === "white"
        ? piece.animated.x
        : GRID_DIM - 1 - piece.animated.x;
    const y =
      perspective === "white"
        ? GRID_DIM - 1 - piece.animated.y
        : piece.animated.y;
    const scale = piece.animated.scale;
    const x0 = rect.x + x * (rect.width / GRID_DIM);
    const y0 = rect.y + y * (rect.height / GRID_DIM);
    const x1 = rect.x + (x + 1) * (rect.width / GRID_DIM);
    const y1 = rect.y + (y + 1) * (rect.height / GRID_DIM);
    ctx.drawImage(
      pieceImage(piece.type, piece.color),
      x0 + (x1 - x0) / 2 - ((x1 - x0) / 2) * scale,
      y0 + (y1 - y0) / 2 - ((y1 - y0) / 2) * scale,
      (x1 - x0) * scale,
      (y1 - y0) * scale,
    );
  });
}
