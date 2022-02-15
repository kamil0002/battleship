//* Classes

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
  #musicController;
  #AudioPlayer = new AudioPlayer();

  constructor() {
    this.#musicController = document.querySelector('.app-actions__music');
  }

  control() {
    this.#musicController.addEventListener(
      'click',
      this.#controlMusicHandler.bind(this)
    );
  }

  #controlMusicHandler() {
    if (!this.#AudioPlayer._isMusicPlaying) {
      this.#AudioPlayer.play();
      this.#musicController.children[0].src = 'assets/images/MusicResumed.svg';
      return;
    }
    if (this.#AudioPlayer._isMusicPlaying) {
      this.#AudioPlayer.pause();
      this.#musicController.children[0].src = 'assets/images/MusicPaused.svg';
    }
  }
}

//* Helpers

const handleModalDisplay = () => {
  const modal = document.querySelector('.modal');
  modal.classList.toggle('modal--hidden');
  modal
    .querySelector('.modal__close')
    .addEventListener('click', () => modal.classList.add('modal--hidden'));
};

//* Game functionality

const MusicController = new AudioController();

MusicController.control();

const gameOptions = {
  boardSize: 340,
  cellSize: 34,
};

const runGameBtn = document.querySelector('.form__button');
const playerName = document.querySelector('.form__username input');
const board = document.querySelector('.board');
const boardRows = board.querySelectorAll('.board__row');

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

runGameMode();

gameOptions.mode = mode;

const createBoardCells = () => {
  boardRows.forEach((row) => {
    for (let i = 0; i < gameOptions.boardSize / gameOptions.cellSize; i++) {
      const cell = document.createElement('div');
      cell.className = 'board__cell';
      row.insertAdjacentElement('afterbegin', cell);
    }
  });
};

createBoardCells();
