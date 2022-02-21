//* Imports
import '@babel/polyfill';
import AudioController from './AudioController';
import { showModal } from './utils';

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
        showModal();
        return;
      }
      location.assign(`${location.protocol}//${location.host}/${mode}.html`);
    });
};

runGameMode();

const enableDragging = function (board) {
  const tempDot = document.querySelector('.dot');
  const boardSquares = document.querySelectorAll('.board__cell');
  const draggableShip = document.querySelector('.ships__carrier');

  let draggedShip;
  let startPosX;
  let startPosY;

  const enableDraggingHandler = function (e) {
    e.dataTransfer.setData('text/plain', this.dataset.id);
    e.dataTransfer.effectAllowed = 'move';
    draggedShip = e.target;
  };

  const dragOver = function (e) {
    if (e.dataTransfer.types[0] === 'text/plain') {
      e.preventDefault();
    }
  };
  function dragEnter(e) {
    e.preventDefault();
  }

  const dropEl = function (e) {
    console.log(draggedShip.getBoundingClientRect());
    const shipId = e.dataTransfer.getData('text/plain');
    const draggedElement = document.querySelector(`[data-id='${shipId}']`);
    console.log(event);
    const pos = {
      x: event.clientX,
      y: event.clientY,
    };
    tempDot.style.top = `${pos.y}px`;
    tempDot.style.left = `${pos.x}px`;
  };

  draggableShip.addEventListener('dragstart', enableDraggingHandler);
  boardSquares.forEach((square) => square.addEventListener('drop', dropEl));
  boardSquares.forEach((square) =>
    square.addEventListener('dragover', dragOver)
  );
  boardSquares.forEach((square) =>
    square.addEventListener('dragenter', dragEnter)
  );
};

if (mode) {
  const board = document.querySelector('.board');
  const boardRows = board.querySelectorAll('.board__row');
  gameOptions.mode = mode;

  const createBoardCells = () => {
    boardRows.forEach((row, index) => {
      for (let i = 0; i < gameOptions.boardSize / gameOptions.cellSize; i++) {
        const cell = document.createElement('div');
        cell.dataset.id = parseInt(index + i);
        cell.className = `board__cell`;
        row.insertAdjacentElement('afterbegin', cell);
      }
    });
  };
  createBoardCells();

  enableDragging(board);
}
