const PIECE_LETTERS = ["b", "k", "n", "p", "q", "r"];
const BLACK_SVGS = PIECE_LETTERS.map(
  (letter) => `/pieces/Chess_${letter}dt45.svg`,
);
const WHITE_SVGS = PIECE_LETTERS.map(
  (letter) => `/pieces/Chess_${letter}lt45.svg`,
);
// load all svgs
const SVGS = [...WHITE_SVGS, ...BLACK_SVGS].map((src) => {
  const img = new Image();
  img.src = src;
  return img;
});

const PIECE_TO_CHAR = {
  pawn: "p",
  knight: "n",
  bishop: "b",
  rook: "r",
  queen: "q",
  king: "k",
};

export function pieceImage(
  type: "pawn" | "knight" | "bishop" | "rook" | "queen" | "king",
  color: "white" | "black",
) {
  const index = PIECE_LETTERS.indexOf(PIECE_TO_CHAR[type]);
  return SVGS[index + (color === "black" ? PIECE_LETTERS.length : 0)];
}
