class AudioPlayer {
  constructor() {
    this._music = new Audio('./../assets/audio/bgMusic.mp3');
    this._music.loop = true;
    this._music.volume = 0.035;
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

class AudioController {
  _AudioPlayer = new AudioPlayer();

  constructor() {
    this._musicController = document.querySelector('.app-actions__music');
  }

  control() {
    this._musicController.addEventListener(
      'click',
      this.musicController.bind(this)
    );
  }

  musicController() {
    if (!this._AudioPlayer._isMusicPlaying) {
      this._AudioPlayer.play();
      this._musicController.children[0].src = 'assets/images/MusicResumed.svg';
      return;
    }
    if (this._AudioPlayer._isMusicPlaying) {
      this._AudioPlayer.pause();
      this._musicController.children[0].src = 'assets/images/MusicPaused.svg';
    }
  }
}

const gameOptions = {};

const runGameBtn = document.querySelector('.form__button');
const playerName = document.querySelector('.form__username input');

const handleModalDisplay = () => {
  const modal = document.querySelector('.modal');
  modal.classList.toggle('modal--hidden');
  modal
    .querySelector('.modal__close')
    .addEventListener('click', () => modal.classList.add('modal--hidden'));
};

const runGameMode = function () {
  if (runGameBtn)
    runGameBtn.addEventListener('click', () => {
      const playerNameVal = playerName.value;
      if (playerNameVal.trim() === '') {
        handleModalDisplay();
        return;
      }
      location.href = `${mode}.html`;
    });
};

const MusicController = new AudioController();

MusicController.control();

runGameMode();

gameOptions.mode = mode;
