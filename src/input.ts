const actions = ["left", "right", "up", "down", "a", "b"] as const;

const RIGHT_KEYBOARD_MAP = {
  ArrowLeft: "left",
  ArrowRight: "right",
  ArrowUp: "up",
  ArrowDown: "down",
  ".": "a",
  "/": "b",
} as const;

const LEFT_KEYBOARD_MAP = {
  a: "left",
  d: "right",
  w: "up",
  s: "down",
  z: "a",
  x: "b",
} as const;

export const leftInput = {
  actionsDown: new Set<(typeof actions)[number]>(),
  actionsJustPressed: new Set<(typeof actions)[number]>(),
  keyboardMap: LEFT_KEYBOARD_MAP,
  controllerNum: 0 as const,
};

export const rightInput = {
  actionsDown: new Set<(typeof actions)[number]>(),
  actionsJustPressed: new Set<(typeof actions)[number]>(),
  keyboardMap: RIGHT_KEYBOARD_MAP,
  controllerNum: 1 as const,
};

export let keysDown = new Set<string>();
document.onkeydown = (e) => keysDown.add(e.key);
document.onkeyup = (e) => keysDown.delete(e.key);

const CONTROLLER_MAP = [
  [12, "up"],
  [13, "down"],
  [14, "left"],
  [15, "right"],
  [0, "a"],
  [1, "b"],
] as const;

export function updateInput() {
  const gamepads = navigator.getGamepads();

  const playerInputs = [leftInput, rightInput];
  for (const {
    actionsDown,
    actionsJustPressed,
    keyboardMap,
    controllerNum,
  } of playerInputs) {
    actionsJustPressed.clear();

    const newActionsDown = new Set<(typeof actions)[number]>();
    for (const [key, button] of Object.entries(keyboardMap)) {
      if (keysDown.has(key)) {
        newActionsDown.add(button);
      }
    }
    const playerGamepad = gamepads[controllerNum];
    if (playerGamepad) {
      for (const [button, action] of CONTROLLER_MAP) {
        if (playerGamepad.buttons[button].pressed) {
          newActionsDown.add(action);
        }
      }
    }

    for (const action of actions) {
      if (!actionsDown.has(action) && newActionsDown.has(action)) {
        actionsJustPressed.add(action);
      }
    }

    actionsDown.clear();
    for (const action of newActionsDown) {
      actionsDown.add(action);
    }
  }
}
