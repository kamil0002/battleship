import '@babel/polyfill';

import AudioController from './AudioController';
import Board from './Board';
import { showAlert, showWhoseTurn, delayClickExecution } from './utils';
import turnIndicator from '../images/turnIndicator.svg';

//* Game functionality

const MusicController = new AudioController();

MusicController.control();

const gameOptions = {};

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
  gameOptions.boardSize = +document.querySelector('.board').getBoundingClientRect().width;
  gameOptions.cellSize = +document.querySelector('.board').getBoundingClientRect().width / 10;
  const playerBoardContainer = document.querySelector('.board');
  const computerBoardContainer = document.querySelector('.board--enemy');

  gameOptions.mode = mode;

  const playerBoard = new Board(gameOptions, playerBoardContainer);
  playerBoard.createBoard();
  playerBoard.configureDraggableShips();

  const computerBoard = new Board(gameOptions, computerBoardContainer, false);
  const computerBoardSquares = computerBoard.createBoard();
  computerBoard.createAndPlaceComputerShips();

  const playerShips = playerBoard.getPlayerShips;
  const computerShips = computerBoard.getComputerShips;

  let yourTurn = true;

  const attackPlayerBoard = () => {
    yourTurn = true;
    showWhoseTurn(yourTurn, turnIndicator);
  };

  const attackComputerBoard = function (e) {
    if (yourTurn) {
      const clickedCell = e.target;
      if (!clickedCell.classList.contains('board--enemy__cell')) return;
      yourTurn = false;
      showWhoseTurn(yourTurn, turnIndicator);
    }
    setTimeout(() => attackPlayerBoard(), 1000);
  };

  computerBoardSquares.forEach(({ node: squareNode }) =>
    squareNode.addEventListener('click', attackComputerBoard, { once: true })
  );
}
