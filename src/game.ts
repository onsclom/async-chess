const pieceLetters = ["b", "k", "n", "p", "q", "r"];
const blackSvgs = pieceLetters.map(
  (letter) => `/pieces/Chess_${letter}dt45.svg`,
);
const whiteSvgs = pieceLetters.map(
  (letter) => `/pieces/Chess_${letter}lt45.svg`,
);
// load all svgs
const svgs = [...whiteSvgs, ...blackSvgs].map((src) => {
  const img = new Image();
  img.src = src;
  return img;
});

const pieces = [
  // white pieces
  {
    type: "pawn",
    color: "white",
    rank: 2,
    file: "a",
  },
  {
    type: "pawn",
    color: "white",
    rank: 2,
    file: "b",
  },

  // black pieces
  {
    type: "pawn",
    color: "black",
    rank: 7,
    file: "a",
  },
  {
    type: "pawn",
    color: "black",
    rank: 7,
    file: "b",
  },
];

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

  ctx.drawImage(
    svgs[0],
    BOARD_1_RECT.x,
    BOARD_1_RECT.y,
    BOARD_1_RECT.width / GRID_DIM,
    BOARD_1_RECT.height / GRID_DIM,
  );
}

const GRID_DIM = 8;
const DARK_GRAY = "#444";
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
        ((x + y) % 2 === 0) === (perspective === "white") ? "white" : DARK_GRAY;
      ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
    }),
  );
}
