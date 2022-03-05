import MusicResumedIcon from '../images/MusicResumed.svg';
import MusicPausedIcon from '../images/MusicPaused.svg';
import AudioPlayer from './AudioPlayer';

class AudioController {
  #musicController;

  #AudioPlayer = new AudioPlayer();

  constructor() {
    this.#musicController = document.querySelector('.app-actions__music');
  }

  control() {
    this.#musicController.addEventListener('click', this.#controlMusicHandler.bind(this));
  }

  #controlMusicHandler() {
    if (!this.#AudioPlayer._isMusicPlaying) {
      this.#AudioPlayer.play();
      this.#musicController.children[0].src = MusicResumedIcon;
      return;
    }
    if (this.#AudioPlayer._isMusicPlaying) {
      this.#AudioPlayer.pause();
      this.#musicController.children[0].src = MusicPausedIcon;
    }
  }
}

export default AudioController;
