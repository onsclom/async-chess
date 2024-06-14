const audioContext = new AudioContext();
const masterGain = audioContext.createGain();
masterGain.connect(audioContext.destination);

// sounds from chess.com
// TODO: replace with custom sounds
const soundNames = ["capture", "move", "promote"] as const;

export function playSound(soundName: (typeof soundNames)[number]) {
  const sound = new Audio(`./sounds/${soundName}.mp3`);
  const source = audioContext.createMediaElementSource(sound);
  source.connect(masterGain);
  sound.play();
}
