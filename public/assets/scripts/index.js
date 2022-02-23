import '@babel/polyfill';

import AudioController from './AudioController';
import Board from './Board';
import { showAlert } from './utils';

//* Game functionality

const MusicController = new AudioController();

MusicController.control();

const gameOptions = {
  boardSize: 340,
  cellSize: 34,
};

const runGameBtn = document.querySelector('.form__button');
const playerName = document.querySelector('.form__username input');

const runGameMode = function () {
  if (runGameBtn)
    runGameBtn.addEventListener('click', () => {
      const playerNameVal = playerName.value;
      if (playerNameVal.trim() === '' || !mode) {
        showAlert('Player must have a name and mode must be selected 😀');
        return;
      }
      location.assign(`${location.protocol}//${location.host}/${mode}.html`);
    });
};

runGameMode();

if (mode) {
  const boardContainer = document.querySelector('.board');
  const computerBoardContainer = document.querySelector('.board--enemy');

  gameOptions.mode = mode;

  const PlayerBoard = new Board(gameOptions, boardContainer);
  const boardSquares = PlayerBoard.createBoard();
  PlayerBoard.configureDraggableShips(boardSquares);

  const ComputerBoard = new Board(gameOptions, computerBoardContainer, false);
  ComputerBoard.createBoard();
}
