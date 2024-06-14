export const events: (
  | {
      type: "move";
      player: "left" | "right";
      dir: "up" | "down" | "left" | "right";
    }
  | {
      type: "a"; // select piece, confirm move
      player: "left" | "right";
    }
  // TODO: maybe just remove this and make "a" the only action?
  | {
      type: "b"; // cancel move
      player: "left" | "right";
    }
)[] = [];

document.onkeydown = (e) => {
  switch (e.key) {
    // left is WASD
    case "w":
      events.push({ type: "move", player: "left", dir: "up" });
      break;
    case "a":
      events.push({ type: "move", player: "left", dir: "left" });
      break;
    case "s":
      events.push({ type: "move", player: "left", dir: "down" });
      break;
    case "d":
      events.push({ type: "move", player: "left", dir: "right" });
      break;
    case "q":
      events.push({ type: "a", player: "left" });
      break;
    case "e":
      events.push({ type: "b", player: "left" });
      break;
    // right is ARROW KEYS
    case "ArrowUp":
      events.push({ type: "move", player: "right", dir: "up" });
      break;
    case "ArrowLeft":
      events.push({ type: "move", player: "right", dir: "left" });
      break;
    case "ArrowDown":
      events.push({ type: "move", player: "right", dir: "down" });
      break;
    case "ArrowRight":
      events.push({ type: "move", player: "right", dir: "right" });
      break;
    case "/":
      events.push({ type: "a", player: "right" });
      break;
    case "Shift":
      events.push({ type: "b", player: "right" });
      break;
  }
};

let gamepads;
let gamepadHistory;
window.addEventListener("gamepadconnected", (e) => {
  gamepads = navigator.getGamepads();
  const gamepad1 = gamepads[0];
  const gamepad2 = gamepads[1];
});

let leftGamepadHistory;
let rightGamepadHistory;
export function detectGameControllerInputs() {
  const gamepads = navigator.getGamepads();
  // JUICE BUTTON: 0-3
  // DPAD: 12 - 15
  for (const gamepad of gamepads) {
    if (!gamepad) return;
    const player = gamepad.index === 0 ? "left" : "right";

    const importantButtons = [0, 1, 2, 3, 12, 13, 14, 15];
    const controllerSnapshot = Object.fromEntries(
      importantButtons.map((buttonIndex) => [
        buttonIndex,
        gamepad.buttons[buttonIndex].pressed,
      ]),
    );

    const directionMap = {
      12: "up",
      13: "down",
      14: "left",
      15: "right",
    };

    const history =
      player === "left" ? leftGamepadHistory : rightGamepadHistory;
    for (const button of importantButtons) {
      if (controllerSnapshot[button]) {
        if (!history || !history[button]) {
          // button 0-3 it's an a press
          if ([0, 1, 2, 3].includes(button)) {
            events.push({ type: "a", player });
          }

          // dpad
          if (directionMap[button]) {
            events.push({
              type: "move",
              player,
              dir: directionMap[button],
            });
          }
        }
      }
    }

    if (player === "left") leftGamepadHistory = controllerSnapshot;
    else rightGamepadHistory = controllerSnapshot;
  }

  // gamepadHistory = [...gamepads];
}
