export function pieceAtRankAndFile(
  rank: number,
  file: string,
  pieces: typeof import("./state").gameState.pieces,
) {
  return pieces.find(
    (piece) => piece.rank === rank && piece.file === file && piece.alive,
  );
}

const CASTLE_MOVES = [
  {
    to: "g",
    rook: "h",
    mustBeClear: ["f", "g"],
  },
  {
    to: "c",
    rook: "a",
    mustBeClear: ["b", "c", "d"],
  },
];

export function legalMoves(
  piece: (typeof import("./state").gameState.pieces)[number],
  boardPieces: typeof import("./state").gameState.pieces,
): {
  rank: number;
  file: string;
}[] {
  switch (piece.type) {
    case "pawn": {
      const direction = piece.color === "white" ? 1 : -1;
      const pieceOneAhead = pieceAtRankAndFile(
        piece.rank + direction,
        piece.file,
        boardPieces,
      );
      const pieceTwoAhead = pieceAtRankAndFile(
        piece.rank + 2 * direction,
        piece.file,
        boardPieces,
      );
      const pieceAheadLeft =
        pieceAtRankAndFile(
          piece.rank + direction,
          String.fromCharCode(piece.file.charCodeAt(0) - 1),
          boardPieces,
        ) || false;
      const pieceAheadRight =
        pieceAtRankAndFile(
          piece.rank + direction,
          String.fromCharCode(piece.file.charCodeAt(0) + 1),
          boardPieces,
        ) || false;

      const canMoveOneAhead = !pieceOneAhead;
      const canMoveTwoAhead =
        !pieceTwoAhead &&
        canMoveOneAhead &&
        (piece.color === "white" ? piece.rank === 2 : piece.rank === 7);
      const canTakeLeft =
        pieceAheadLeft && pieceAheadLeft.color !== piece.color;
      const canTakeRight =
        pieceAheadRight && pieceAheadRight.color !== piece.color;

      return [
        canMoveOneAhead && { rank: piece.rank + direction, file: piece.file },
        canMoveTwoAhead && {
          rank: piece.rank + 2 * direction,
          file: piece.file,
        },
        canTakeLeft && {
          rank: piece.rank + direction,
          file: String.fromCharCode(piece.file.charCodeAt(0) - 1),
        },
        canTakeRight && {
          rank: piece.rank + direction,
          file: String.fromCharCode(piece.file.charCodeAt(0) + 1),
        },
      ]
        .filter((move) => move !== false)
        .filter((move) => moveIsOnBoard(move));
    }
    case "rook": {
      const moves: {
        rank: number;
        file: string;
      }[] = [];
      const dirs = [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ];
      for (const dir of dirs) {
        // keep going in dir until we hit a piece or leave board
        for (let i = 1; i < 8; i++) {
          const move = {
            rank: piece.rank + i * dir[0],
            file: String.fromCharCode(piece.file.charCodeAt(0) + i * dir[1]),
          };
          if (!moveIsOnBoard(move)) break;
          const pieceAtMove = pieceAtRankAndFile(
            move.rank,
            move.file,
            boardPieces,
          );
          if (pieceAtMove) {
            if (pieceAtMove.color !== piece.color) {
              moves.push(move);
            }
            break;
          }
          moves.push(move);
        }
      }
      return moves;
    }
    case "knight": {
      const possibleMoves = [
        {
          rank: piece.rank + 2,
          file: String.fromCharCode(piece.file.charCodeAt(0) + 1),
        },
        {
          rank: piece.rank + 2,
          file: String.fromCharCode(piece.file.charCodeAt(0) - 1),
        },
        {
          rank: piece.rank - 2,
          file: String.fromCharCode(piece.file.charCodeAt(0) + 1),
        },
        {
          rank: piece.rank - 2,
          file: String.fromCharCode(piece.file.charCodeAt(0) - 1),
        },
        {
          rank: piece.rank + 1,
          file: String.fromCharCode(piece.file.charCodeAt(0) + 2),
        },
        {
          rank: piece.rank + 1,
          file: String.fromCharCode(piece.file.charCodeAt(0) - 2),
        },
        {
          rank: piece.rank - 1,
          file: String.fromCharCode(piece.file.charCodeAt(0) + 2),
        },
        {
          rank: piece.rank - 1,
          file: String.fromCharCode(piece.file.charCodeAt(0) - 2),
        },
      ];
      return possibleMoves.filter((move) => {
        const pieceAtMove = pieceAtRankAndFile(
          move.rank,
          move.file,
          boardPieces,
        );
        return (
          moveIsOnBoard(move) &&
          (!pieceAtMove || pieceAtMove.color !== piece.color)
        );
      });
    }
    case "bishop": {
      const moves: {
        rank: number;
        file: string;
      }[] = [];
      const dirs = [
        [1, 1],
        [-1, 1],
        [1, -1],
        [-1, -1],
      ];
      for (const dir of dirs) {
        // keep going in dir until we hit a piece or leave board
        for (let i = 1; i < 8; i++) {
          const move = {
            rank: piece.rank + i * dir[0],
            file: String.fromCharCode(piece.file.charCodeAt(0) + i * dir[1]),
          };
          if (!moveIsOnBoard(move)) break;
          const pieceAtMove = pieceAtRankAndFile(
            move.rank,
            move.file,
            boardPieces,
          );
          if (pieceAtMove) {
            if (pieceAtMove.color !== piece.color) {
              moves.push(move);
            }
            break;
          }
          moves.push(move);
        }
      }
      return moves;
    }
    case "queen": {
      const rookMoves = legalMoves({ ...piece, type: "rook" }, boardPieces);
      const bishopMoves = legalMoves({ ...piece, type: "bishop" }, boardPieces);
      return [...rookMoves, ...bishopMoves];
    }
    case "king": {
      const possibleCastleMoves = CASTLE_MOVES.filter((castleMove) => {
        if (piece.moved) return false;
        const rook = pieceAtRankAndFile(
          piece.rank,
          castleMove.rook,
          boardPieces,
        );
        if (!rook || rook.moved) return false;
        return !castleMove.mustBeClear.some((square) => {
          return pieceAtRankAndFile(piece.rank, square, boardPieces);
        });
      }).map((castleMove) => ({
        rank: piece.rank,
        file: castleMove.to,
      }));

      const possibleMoves = [
        ...possibleCastleMoves,
        {
          rank: piece.rank + 1,
          file: piece.file,
        },
        {
          rank: piece.rank - 1,
          file: piece.file,
        },
        {
          rank: piece.rank,
          file: String.fromCharCode(piece.file.charCodeAt(0) + 1),
        },
        {
          rank: piece.rank,
          file: String.fromCharCode(piece.file.charCodeAt(0) - 1),
        },
        {
          rank: piece.rank + 1,
          file: String.fromCharCode(piece.file.charCodeAt(0) + 1),
        },
        {
          rank: piece.rank + 1,
          file: String.fromCharCode(piece.file.charCodeAt(0) - 1),
        },
        {
          rank: piece.rank - 1,
          file: String.fromCharCode(piece.file.charCodeAt(0) + 1),
        },
        {
          rank: piece.rank - 1,
          file: String.fromCharCode(piece.file.charCodeAt(0) - 1),
        },
      ];
      return possibleMoves.filter((move) => {
        const pieceAtMove = pieceAtRankAndFile(
          move.rank,
          move.file,
          boardPieces,
        );
        return (
          moveIsOnBoard(move) &&
          (!pieceAtMove || pieceAtMove.color !== piece.color)
        );
      });
    }
    default: {
      return [];
    }
  }
}

export function moveIsLegal(
  piece: (typeof import("./state").gameState.pieces)[number],
  target: { rank: number; file: string },
  boardPieces: typeof import("./state").gameState.pieces,
) {
  return legalMoves(piece, boardPieces).some((move) => {
    if (!move) return false;
    return move.rank === target.rank && move.file === target.file;
  });
}

function moveIsOnBoard(move: { rank: number; file: string }) {
  return (
    move.rank >= 1 &&
    move.rank <= 8 &&
    move.file.charCodeAt(0) >= "a".charCodeAt(0) &&
    move.file.charCodeAt(0) <= "h".charCodeAt(0)
  );
}
