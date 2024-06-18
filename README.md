# async-chess (super early WIP)

chess, but without turns!

[checkout a video](https://x.com/onsclom/status/1801763823915045197)

- each piece has a 10 second cooldown
- no en passant or castling (yet)
- no check or checkmate, just capture the king to win
- pawns automatically promote to queen

## how to play

[try it out here](https://async-chess.vercel.app/)

the current prototype supports 2-player local multiplayer

keyboard controls:

| action                  | player 1 (white) | player 2 (black) |
| ----------------------- | ---------------- | ---------------- |
| move                    | wasd             | arrow keys       |
| select/deselect/confirm | z                | .                |
| x2 speed                | x (hold)         | / (hold)         |

gamepad controls (only tested on dinput controllers):

| action                  | controller input |
| ----------------------- | ---------------- |
| move                    | dpad             |
| select/deselect/confirm | x                |
| x2 speed                | o (hold)         |

## why

i wanted to make a rad, free, open-source game. i thought this was a fun game idea.

## development

1. [install bun](https://bun.sh/docs/installation)
2. `bun dev` to start the dev server

there is HMR so you don't have to recreate game state on every change! it's really nice!
