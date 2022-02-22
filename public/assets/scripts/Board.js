import interact from 'interactjs';
import Ship from './Ship';
import { showAlert, findShipPositionOnOnBoard } from './utils';

class Board {
  constructor(gameOptions, boardContainer) {
    this.gameOptions = gameOptions;
    this.boardContainer = boardContainer;

    this._rotateShipsHandler();
  }

  createBoard() {
    const boardRows = this.boardContainer.querySelectorAll('.board__row');
    const boardSquares = [];
    let cellIndex = 1;
    boardRows.forEach((row) => {
      for (let i = 0; i < this.gameOptions.boardSize / this.gameOptions.cellSize; i++) {
        const cell = document.createElement('div');
        cell.dataset.id = cellIndex;
        cell.className = 'board__cell';
        row.insertAdjacentElement('beforeend', cell);
        boardSquares.push({
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
    return boardSquares;
  }

  configureDraggableShips(boardSquares) {
    const placedShipPos = { top: 0, left: 0, right: 0, bottom: 0 };
    this.shipsHtml = Array.from(document.querySelectorAll('.ship'));

    const ships = this.shipsHtml.map((ship) => new Ship(ship.dataset.name, ship.dataset.size));

    const setplacedShipPosition = (e) => {
      placedShipPos.top = e.target.getBoundingClientRect().top;
      placedShipPos.right = e.target.getBoundingClientRect().right;
      placedShipPos.left = e.target.getBoundingClientRect().left;
      placedShipPos.bottom = e.target.getBoundingClientRect().bottom;
    };

    const checkPositionAvailability = (boardCells, ship) => {
      if (boardCells.some((cell) => cell.node.classList.contains('taken'))) {
        const localShip = ship;
        localShip.style.transform = `translate(0,0)`;
        showAlert('Position not allowed!', 3);
        return true;
      }
      return false;
    };

    let shipStartNum = 0;
    this.shipsHtml.forEach((ship) => {
      let position = { x: 0, y: 0 };
      const localShipObj = ships.find((shipEl) => shipEl.name === ship.dataset.name);
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
          if (!ship.classList.contains(`ship--${ship.dataset.name.toLowerCase()}--rotated`)) {
            shipStartNum = findShipPositionOnOnBoard(
              'horizontal',
              placedShipPos,
              localShipObj,
              boardSquares
            );
          } else if (ship.classList.contains(`ship--${ship.dataset.name.toLowerCase()}--rotated`)) {
            shipStartNum = findShipPositionOnOnBoard(
              'vertical',
              placedShipPos,
              localShipObj,
              boardSquares
            );
          }

          if (e.relatedTarget.dataset.name === localShipObj.name) {
            if (
              checkPositionAvailability(
                boardSquares.slice(shipStartNum, shipStartNum + localShipObj.size),
                ship
              )
            ) {
              position = { x: 0, y: 0 };
              return;
            }
            if (!ship.classList.contains(`ship--${ship.dataset.name.toLowerCase()}--rotated`)) {
              for (let i = shipStartNum; i < shipStartNum + localShipObj.size; i++) {
                if (i === shipStartNum) boardSquares[i].node.classList.add('ship-h-start');
                if (i === shipStartNum + localShipObj.size - 1) {
                  boardSquares[i].node.classList.add('ship-h-end');
                }
                boardSquares[i].node.classList.add('taken', 'taken--horizontal');
              }
            }

            if (ship.classList.contains(`ship--${ship.dataset.name.toLowerCase()}--rotated`)) {
              const squares = [boardSquares[shipStartNum]];
              for (let i = 1; i < +ship.dataset.size; i++) {
                squares.push(boardSquares[shipStartNum + i * 10]);
              }
              if (checkPositionAvailability(squares, ship)) {
                position = { x: 0, y: 0 };
                return;
              }
              squares.forEach((square) => {
                square.node.classList.add('taken', 'taken--vertical');
              });

              squares[0].node.classList.add('ship-v-start');
              squares[squares.length - 1].node.classList.add('ship-v-end');
            }

            // ship.remove();

            // eslint-disable-next-line no-param-reassign
            ship.style.display = 'none';
            // eslint-disable-next-line no-param-reassign
            // ship.style.transform = `translate(0,0)`;
            // position = { x: 0, y: 0 };
          }
        },
      });
    });
    return ships;
  }

  _rotateShipsHandler() {
    const shipsContainer = document.querySelector('.ships');
    document.querySelector('.board-btn--rotate').addEventListener('click', () => {
      this.shipsHtml.forEach((ship) =>
        ship.classList.toggle(`ship--${ship.dataset.name.toLowerCase()}--rotated`)
      );
      shipsContainer.classList.toggle('ships--rotated');
    });
  }
}
export default Board;
