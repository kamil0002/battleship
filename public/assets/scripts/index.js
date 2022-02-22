import '@babel/polyfill';

import AudioController from './AudioController';
import Ship from './Ship';
import Board from './Board';
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

/*
const enableDragging = function (boardSquares) {
  setShipPosition = (event) => {
    shipPos.top = event.target.getBoundingClientRect().top;
    shipPos.right = event.target.getBoundingClientRect().right;
    shipPos.left = event.target.getBoundingClientRect().left;
    shipPos.bottom =
      event.target.getBoundingClientRect().bottom + draggableShip.offsetHeight;
  };

  console.log(boardSquares);
  const tempDot = document.querySelector('.dot');
  const draggableShip = document.querySelector('.ships__carrier');
  const position = { x: 0, y: 0 };
  const shipPos = { top: 0, left: 0, right: 0, bottom: 0 };
  const Carrier = new Ship('Carrier', 5);
  let shipStartNum;

  interact('.ships__carrier').draggable({
    listeners: {
      move(event) {
        position.x += event.dx;
        position.y += event.dy;
        event.target.style.transform = `translate(${position.x}px, ${position.y}px)`;
        setShipPosition(event);
        tempDot.style.bottom = `${shipPos.bottom}px`;
        tempDot.style.left = `${shipPos.left}px`;
      },
    },
  });

  interact('.board')
    .dropzone({
      ondrop(event) {
        boardSquares.forEach((square, i, squaresBoard) => {
          if (
            shipPos.top + 20 >= square.top &&
            shipPos.top - 20 <= square.top &&
            shipPos.left + 20 > square.left &&
            shipPos.left - 20 < square.left &&
            shipPos.right + 20 > squaresBoard[i + Carrier.size - 1].right &&
            shipPos.right - 20 < squaresBoard[i + Carrier.size - 1].right
          ) {
            shipStartNum = i;
          }
        });
        console.log(boardSquares[shipStartNum]);
        console.log(boardSquares[shipStartNum]);
        for (let i = shipStartNum; i < shipStartNum + Carrier.size; i++) {
          if (i === shipStartNum)
            boardSquares[i].node.classList.add('ship-start');
          if (i === shipStartNum + Carrier.size - 1)
            boardSquares[i].node.classList.add('ship-end');
          boardSquares[i].node.classList.add(`taken`);
        }
        draggableShip.remove();
      },
    })
    .on('dropactivate', (event) => {
      event.target.classList.add('drop-activated');
    });
};
*/

if (mode) {
  // const boardSquares = [];

  const boardContainer = document.querySelector('.board');

  // const boardRows = board.querySelectorAll('.board__row');

  gameOptions.mode = mode;

  const GameBoard = new Board(gameOptions, boardContainer);
  const boardSquares = GameBoard.createBoard();
  GameBoard.configureDraggableShips(boardSquares);

  // const createBoardCells = () => {
  //   let cellIndex = 1;
  //   boardRows.forEach((row, index) => {
  //     for (let i = 0; i < gameOptions.boardSize / gameOptions.cellSize; i++) {
  //       const cell = document.createElement('div');
  //       cell.dataset.id = cellIndex;
  //       cell.className = 'board__cell';
  //       row.insertAdjacentElement('beforeend', cell);
  //       boardSquares.push({
  //         squareIndex: cellIndex,
  //         left: cell.getBoundingClientRect().left,
  //         top: cell.getBoundingClientRect().top,
  //         right: cell.getBoundingClientRect().right,
  //         bottom: cell.getBoundingClientRect().bottom,
  //         node: cell,
  //       });
  //       cellIndex++;
  //     }
  //   });
  // };
  // createBoardCells();

  // enableDragging(boardSquares);
}
