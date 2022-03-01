import interact from 'interactjs';
import { gsap } from 'gsap';
import Ship from './Ship';
import { showAlert, findShipPositionOnOnBoard } from './utils';
import turnIndicator from '../images/turnIndicator.svg';

class Board {
  gameOptions = {};

  static shipsMoved = [];

  #computerShips = [];

  #playerShips = [];

  constructor(gameOptions, boardContainer, playerMode = true) {
    this.gameOptions = gameOptions;
    this.boardContainer = boardContainer;
    this.startGameBtn = document.querySelector('.board-btn--start');
    this.shipsHtml = Array.from(document.querySelectorAll('.ship'));
    this.playerMode = playerMode;

    if (playerMode) {
      document.querySelector('.board-btn--rotate').addEventListener('click', this._rotateShipsHandler.bind(this));
      document.querySelector('.board-btn--undo-move').addEventListener('click', this._undoMoveHandler.bind(this));
      document.querySelector('.board-btn--start').addEventListener('click', this._placeBoards.bind(this));
    }
  }

  createBoard() {
    const boardRows = this.boardContainer.querySelectorAll('.board__row');
    this.boardSquares = [];
    let cellIndex = 1;
    boardRows.forEach((row, index) => {
      for (let i = 0; i < this.gameOptions.boardSize / this.gameOptions.cellSize; i++) {
        const cell = document.createElement('div');
        cell.dataset.id = cellIndex;
        cell.className = `${this.playerMode ? 'board__cell' : 'board--enemy__cell'}`;
        if (index === 9) cell.classList.add('last-row');
        row.insertAdjacentElement('beforeend', cell);
        this.boardSquares.push({
          squareIndex: cellIndex,
          left: cell.getBoundingClientRect().left,
          top: cell.getBoundingClientRect().top,
          right: cell.getBoundingClientRect().right,
          bottom: cell.getBoundingClientRect().bottom,
          node: cell,
        });
        cellIndex++;
      }
    });
    return this.boardSquares;
  }

  configureDraggableShips() {
    const { mode } = this.gameOptions;
    const { boardSquares } = this;

    const placedShipPos = { top: 0, left: 0, right: 0, bottom: 0 };

    this.#playerShips = this.shipsHtml.map((ship) => new Ship(ship.dataset.name, ship.dataset.size));

    const setplacedShipPosition = (e) => {
      placedShipPos.top = e.target.getBoundingClientRect().top;
      placedShipPos.right = e.target.getBoundingClientRect().right;
      placedShipPos.left = e.target.getBoundingClientRect().left;
      placedShipPos.bottom = e.target.getBoundingClientRect().bottom;
    };

    const checkPositionAvailability = (boardCells, ship) =>
      boardCells.some((cell) => cell.node.classList.contains('taken')) || boardCells.length < ship.size;

    let shipStartNum = 0;
    this.shipsHtml.forEach((ship) => {
      let position = { x: 0, y: 0 };
      const localShipObj = this.#playerShips.find((shipEl) => shipEl.name === ship.dataset.name);
      interact(ship).draggable({
        listeners: {
          move(e) {
            position.x += e.dx;
            position.y += e.dy;
            setplacedShipPosition(e);
            e.target.style.transform = `translate(${position.x}px, ${position.y}px)`;
          },
        },
      });

      interact(this.boardContainer).dropzone({
        ondrop(e) {
          let squares = [];
          if (!ship.classList.contains(`ship--${ship.dataset.name.toLowerCase()}--rotated`)) {
            shipStartNum = findShipPositionOnOnBoard('horizontal', placedShipPos, localShipObj, boardSquares);
          } else if (ship.classList.contains(`ship--${ship.dataset.name.toLowerCase()}--rotated`)) {
            shipStartNum = findShipPositionOnOnBoard('vertical', placedShipPos, localShipObj, boardSquares);
          }

          if (e.relatedTarget.dataset.name === localShipObj.name) {
            if (!ship.classList.contains(`ship--${ship.dataset.name.toLowerCase()}--rotated`)) {
              if (
                checkPositionAvailability(
                  boardSquares.slice(shipStartNum, shipStartNum + localShipObj.size),
                  localShipObj
                )
              ) {
                ship.style.transform = `translate(0,0)`;
                showAlert('Position not allowed!', 1);
                position = { x: 0, y: 0 };
                return;
              }
              for (let i = shipStartNum; i < shipStartNum + localShipObj.size; i++) {
                if (i === shipStartNum) boardSquares[i].node.classList.add('ship-horizontal-start');

                if (i === shipStartNum + localShipObj.size - 1) {
                  boardSquares[i].node.classList.add('ship-horizontal-end');
                }

                boardSquares[i].node.classList.add('taken');
                boardSquares[i].node.dataset.ship = localShipObj.name;
              }
            }

            if (ship.classList.contains(`ship--${ship.dataset.name.toLowerCase()}--rotated`)) {
              squares = [boardSquares[shipStartNum]];
              for (let i = 1; i < +ship.dataset.size; i++) {
                squares.push(boardSquares[shipStartNum + i * 10]);
              }

              if (checkPositionAvailability(squares, localShipObj)) {
                ship.style.transform = 'translate(0,0)';
                showAlert('Position not allowed!', 3);
                position = { x: 0, y: 0 };
                return;
              }
              squares.forEach((square) => {
                square.node.classList.add('taken');
                square.node.dataset.ship = localShipObj.name;
              });

              squares[0].node.classList.add('ship-vertical-start');
              squares[squares.length - 1].node.classList.add('ship-vertical-end');
              squares = [];
            }

            ship.classList.add('ship--hidden');
            ship.style.transform = 'translate(0,0)';
            position = { x: 0, y: 0 };
            Board.shipsMoved.unshift(ship);
            if (Board.shipsMoved.length === 5) Board._showHideStartGameBtn('remove', mode);
          }
        },
      });
    });
  }

  _undoMoveHandler() {
    if (Board.shipsMoved.length === 0) return;
    const lastMove = Board.shipsMoved[Board.shipsMoved.length - 1];
    const shipName = lastMove.dataset.name;
    const boardShipCells = document.querySelectorAll(`[data-ship="${shipName}"]`);
    boardShipCells.forEach((cell) => {
      cell.className = '';
      cell.classList.add('board__cell');
    });
    document.querySelector(`[data-name="${shipName}"]`).classList.remove('ship--hidden');
    Board.shipsMoved.splice(Board.shipsMoved.length - 1, 1);

    if (Board.shipsMoved.length < 5) Board._showHideStartGameBtn('add', this.gameOptions);
  }

  _rotateShipsHandler() {
    const shipsContainer = document.querySelector('.ships');
    this.shipsHtml.forEach((ship) => ship.classList.toggle(`ship--${ship.dataset.name.toLowerCase()}--rotated`));
    shipsContainer.classList.toggle('ships--rotated');
  }

  static _showHideStartGameBtn(classOperation, mode) {
    const startGameBtn = document.querySelector('.board-btn--start');
    console.log(mode);
    if (mode === 'singleplayer') {
      startGameBtn.textContent = 'Start Game!';
    } else {
      startGameBtn.textContent = 'Ready!';
    }

    if (classOperation === 'add') startGameBtn.classList.add('board-btn--start--hidden');
    if (classOperation === 'remove') startGameBtn.classList.remove('board-btn--start--hidden');
  }

  _placeBoards() {
    console.log(this.gameOptions.mode);
    const tl = gsap.timeline({ defaults: { ease: 'power4.inOut', duration: 1 } });
    tl.to('.board-btn', {
      opacity: 0,
      duration: 0.4,
      display: 'none',
    })
      .to(
        '[data-enemy-start]',
        {
          opacity: 0,
          display: 'none',
        },
        '-=0.4'
      )
      .to(
        '.board-wrapper',
        {
          opacity: 0,
        },
        '-=0.4'
      )
      .to('.player-status__connected', { width: '100px' })
      .to('.board-wrapper', {
        width: 'min-content',
        position: 'relative',
        display: 'block',
        left: 'auto',
        transform: 'translate(0,0)',
        duration: 0,
      })
      .to('.board-wrapper--enemy', {
        visibility: 'visible',
        opacity: 1,
        duration: 0.8,
      })
      .to(
        '.board-wrapper',
        {
          opacity: 1,
          duration: 0.8,
        },
        '-=0.8'
      )
      .to(
        '[data-player-status]',
        {
          display: 'block',
        },
        '-=0.8'
      )
      .then(() => import('./utils').then((module) => module.showWhoseTurn(true, turnIndicator)));
  }

  createAndPlaceComputerShips() {
    const addShipToBoard = (localSquares, shipOrientation, localShip) => {
      for (const square of localSquares) {
        square.node.classList.add('taken', 'ship--computer');
        square.node.dataset.ship = localShip.name;
      }
      return true;
    };

    this.#computerShips = this.shipsHtml.map((ship) => new Ship(ship.dataset.name, ship.dataset.size));
    this.#computerShips.forEach((ship) => {
      let isShipPlaced = false;
      while (!isShipPlaced) {
        const localSquares = [];
        const shipOrientation = Math.random() < 0.5 ? 'horizontal' : 'vertical';
        const shipStartPos = Math.trunc(Math.random() * 99);
        const shipEndPos =
          shipOrientation === 'horizontal' ? shipStartPos + ship.size : shipStartPos + (ship.size - 1) * 10;

        if (shipOrientation === 'horizontal') {
          localSquares.push(...this.boardSquares.slice(shipStartPos, shipEndPos));

          if (
            localSquares.every((square) => square.top === localSquares[0].top) &&
            localSquares.every((square) => !square.node.classList.contains('taken')) &&
            localSquares.length === ship.size
          ) {
            isShipPlaced = addShipToBoard(localSquares, shipOrientation, ship);
          }
        }

        if (shipOrientation === 'vertical' && shipEndPos < 100) {
          for (let i = 0; i < ship.size; i++) {
            localSquares.push(this.boardSquares[shipStartPos + i * 10]);
          }
          if (localSquares.every((square) => !square.node.classList.contains('taken'))) {
            isShipPlaced = addShipToBoard(localSquares, shipOrientation, ship);
          }
        }
      }
    });
  }

  get getComputerShips() {
    return this.#computerShips;
  }

  get getPlayerShips() {
    return this.#playerShips;
  }
}
export default Board;
