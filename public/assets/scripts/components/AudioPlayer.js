class AudioPlayer {
  constructor() {
    this._music = new Audio('./../assets/audio/bgMusic.mp3');
    this._music.loop = true;
    this._music.volume = 0.05;
  }

  play() {
    this._music.play();
  }

  pause() {
    this._music.pause();
  }
}

export default AudioPlayer;