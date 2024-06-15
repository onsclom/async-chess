const audioContext = new AudioContext();
const masterGain = audioContext.createGain();
masterGain.connect(audioContext.destination);

// sounds from chess.com
// TODO: replace with custom sounds
// TODO: need sounds for select, deselect
const soundNames = ["capture", "move", "promote"] as const;

export function playSound(soundName: (typeof soundNames)[number]) {
  const sound = new Audio(`./sounds/${soundName}.mp3`);
  const source = audioContext.createMediaElementSource(sound);
  source.connect(masterGain);
  sound.play();
}

// fixes:
// The AudioContext was not allowed to start. It must be resumed (or created) after a user gesture on the page. https://goo.gl/7K7WLu
document.body.onclick = () => {
  audioContext.resume();
};
