class AudioPlayer {
  constructor() {
    this._music = new Audio('bgMusic.82a1e5b8.mp3');
    this._music.loop = true;
    this._music.volume = 0.1;
    this._isMusicPlaying = false;
  }

  play() {
    this._music.play();
    this._isMusicPlaying = true;
  }

  pause() {
    this._music.pause();
    this._isMusicPlaying = false;
  }
}
export default AudioPlayer;
