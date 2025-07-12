const audioContext = new AudioContext();
const masterGain = audioContext.createGain();
masterGain.connect(audioContext.destination);

// prettier-ignore
const soundNames = [
  // chess.com sounds
  "capture", "move", "promote",
  // other sounds
  "cursor-move"
] as const;

const customVolumes = {
  "cursor-move": 0.15,
};

export function playSound(soundName: (typeof soundNames)[number]) {
  const sound = new Audio(`./sounds/${soundName}.mp3`);
  const source = audioContext.createMediaElementSource(sound);

  // @ts-expect-error
  const volume = customVolumes[soundName] ?? 1.0;

  masterGain.gain.value = volume;

  source.connect(masterGain);
  sound.play();
}

// fixes:
// The AudioContext was not allowed to start.
// It must be resumed (or created) after a user gesture on the page.
// https://goo.gl/7K7WLu
document.body.onclick = () => audioContext.resume();
document.body.onkeydown = () => audioContext.resume();
