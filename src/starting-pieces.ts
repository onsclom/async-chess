export const startingPieces: {
  type: "rook" | "knight" | "bishop" | "queen" | "king" | "pawn";
  color: "white" | "black";
  rank: number;
  file: string;
}[] = [
  // white pieces
  { type: "rook", color: "white", rank: 1, file: "a" },
  { type: "knight", color: "white", rank: 1, file: "b" },
  { type: "bishop", color: "white", rank: 1, file: "c" },
  { type: "queen", color: "white", rank: 1, file: "d" },
  { type: "king", color: "white", rank: 1, file: "e" },
  { type: "bishop", color: "white", rank: 1, file: "f" },
  { type: "knight", color: "white", rank: 1, file: "g" },
  { type: "rook", color: "white", rank: 1, file: "h" },
  { type: "pawn", color: "white", rank: 2, file: "a" },
  { type: "pawn", color: "white", rank: 2, file: "b" },
  { type: "pawn", color: "white", rank: 2, file: "c" },
  { type: "pawn", color: "white", rank: 2, file: "d" },
  { type: "pawn", color: "white", rank: 2, file: "e" },
  { type: "pawn", color: "white", rank: 2, file: "f" },
  { type: "pawn", color: "white", rank: 2, file: "g" },
  { type: "pawn", color: "white", rank: 2, file: "h" },
  // black pieces
  { type: "rook", color: "black", rank: 8, file: "a" },
  { type: "knight", color: "black", rank: 8, file: "b" },
  { type: "bishop", color: "black", rank: 8, file: "c" },
  { type: "queen", color: "black", rank: 8, file: "d" },
  { type: "king", color: "black", rank: 8, file: "e" },
  { type: "bishop", color: "black", rank: 8, file: "f" },
  { type: "knight", color: "black", rank: 8, file: "g" },
  { type: "rook", color: "black", rank: 8, file: "h" },
  { type: "pawn", color: "black", rank: 7, file: "a" },
  { type: "pawn", color: "black", rank: 7, file: "b" },
  { type: "pawn", color: "black", rank: 7, file: "c" },
  { type: "pawn", color: "black", rank: 7, file: "d" },
  { type: "pawn", color: "black", rank: 7, file: "e" },
  { type: "pawn", color: "black", rank: 7, file: "f" },
  { type: "pawn", color: "black", rank: 7, file: "g" },
  { type: "pawn", color: "black", rank: 7, file: "h" },
];
