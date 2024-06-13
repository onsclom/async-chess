export function legalMoves(
  piece: {
    rank: number;
    file: string;
    color: "white" | "black";
    type: "pawn" | "rook" | "knight" | "bishop" | "queen" | "king";
  },
  boardPieces: typeof import("./starting-pieces").startingPieces,
): {
  rank: number;
  file: string;
}[] {
  switch (piece.type) {
    case "pawn": {
      const direction = piece.color === "white" ? 1 : -1;
      const pieceOneAhead = boardPieces.find(
        (p) => p.rank === piece.rank + direction && p.file === piece.file,
      );
      const pieceTwoAhead = boardPieces.find(
        (p) => p.rank === piece.rank + 2 * direction && p.file === piece.file,
      );
      const pieceAheadLeft = boardPieces.find(
        (p) =>
          p.rank === piece.rank + direction &&
          p.file === String.fromCharCode(piece.file.charCodeAt(0) - 1),
      );
      const pieceAheadRight = boardPieces.find(
        (p) =>
          p.rank === piece.rank + direction &&
          p.file === String.fromCharCode(piece.file.charCodeAt(0) + 1),
      );

      const canMoveOneAhead = !pieceOneAhead;
      const canMoveTwoAhead =
        !pieceTwoAhead &&
        canMoveOneAhead &&
        (piece.color === "white" ? piece.rank === 2 : piece.rank === 7);
      const canTakeLeft =
        pieceAheadLeft && pieceAheadLeft.color !== piece.color;
      const canTakeRight =
        pieceAheadRight && pieceAheadRight.color !== piece.color;

      // @ts-ignore
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
      ].filter((move) => move && moveIsOnBoard(move));
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
          const pieceAtMove = boardPieces.find(
            (p) => p.rank === move.rank && p.file === move.file,
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
        const pieceAtMove = boardPieces.find(
          (p) => p.rank === move.rank && p.file === move.file,
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
          const pieceAtMove = boardPieces.find(
            (p) => p.rank === move.rank && p.file === move.file,
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
      const possibleMoves = [
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
        const pieceAtMove = boardPieces.find(
          (p) => p.rank === move.rank && p.file === move.file,
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
  piece: {
    rank: number;
    file: string;
    color: "white" | "black";
    type: "pawn" | "rook" | "knight" | "bishop" | "queen" | "king";
  },
  target: { rank: number; file: string },
  boardPieces: typeof import("./starting-pieces").startingPieces,
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
