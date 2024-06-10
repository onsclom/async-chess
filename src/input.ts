export const events: {
  type: "move";
  player: "left" | "right";
  dir: "up" | "down" | "left" | "right";
}[] = [];

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
  }
};
