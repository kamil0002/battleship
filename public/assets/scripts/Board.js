import interact from 'interactjs';
import Ship from './Ship';
import { showAlert } from './utils';

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
    const setplacedShipPosition = (e, ship) => {
      placedShipPos.top = e.target.getBoundingClientRect().top;
      placedShipPos.right = e.target.getBoundingClientRect().right;
      placedShipPos.left = e.target.getBoundingClientRect().left;
      placedShipPos.bottom = e.target.getBoundingClientRect().bottom;
    };

    const isPositonTaken = (boardCells) =>
      boardCells.some((cell) => cell.node.classList.contains('taken'));

    let shipStartNum = 0;
    console.log(' squares: ', boardSquares);
    this.shipsHtml.forEach((ship) => {
      const localShip = ship;
      let position = { x: 0, y: 0 };
      const localShipObj = ships.find((shipEl) => shipEl.name === ship.dataset.name);
      interact(ship).draggable({
        listeners: {
          move(e) {
            position.x += e.dx;
            position.y += e.dy;
            setplacedShipPosition(e, ship);
            e.target.style.transform = `translate(${position.x}px, ${position.y}px)`;
          },
        },
      });

      interact(this.boardContainer).dropzone({
        ondrop(e) {
          boardSquares.forEach((square, i, squaresBoard) => {
            // console.log(placedShipPos)

            if (!ship.classList.contains(`ship--${ship.dataset.name.toLowerCase()}--rotated`)) {
              if (
                i + localShipObj.size - 1 < 100 &&
                placedShipPos.top + 20 >= square.top &&
                placedShipPos.top - 20 <= square.top &&
                placedShipPos.left + 20 > square.left &&
                placedShipPos.left - 20 < square.left &&
                placedShipPos.right + 20 > squaresBoard[i + localShipObj.size - 1].right &&
                placedShipPos.right - 20 < squaresBoard[i + localShipObj.size - 1].right
              ) {
                shipStartNum = i;
              }
            }
            if (ship.classList.contains(`ship--${ship.dataset.name.toLowerCase()}--rotated`)) {
              console.log('Local ship: ', placedShipPos);
              console.log('HERE: ', squaresBoard[i + localShipObj.size * 10]);
              if (
                i + (localShipObj.size - 1) * 10 < 100 &&
                placedShipPos.top + 20 >= square.top &&
                placedShipPos.top - 20 <= square.top &&
                placedShipPos.left + 20 >= square.left &&
                placedShipPos.left - 20 <= square.left &&
                placedShipPos.bottom + 20 >= squaresBoard[i + (localShipObj.size - 1) * 10].bottom &&
                placedShipPos.bottom - 20 <= squaresBoard[i + (localShipObj.size - 1) * 10].bottom
              ) {
                console.log('WORK');
                shipStartNum = i;
              }
            }
          });

          if (e.relatedTarget.dataset.name === localShipObj.name) {
            if (
              isPositonTaken(boardSquares.slice(shipStartNum, shipStartNum + localShipObj.size))
            ) {
              localShip.style.transform = `translate(0,0)`;
              position = { x: 0, y: 0 };
              showAlert(
                'You already placed some ship on this position, try a different position!',
                3
              );
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
              console.log('Jajca');
              console.log(shipStartNum);
              console.log(squares);

              squares.forEach((square) => {
                square.node.classList.add('taken', 'taken--vertical');
              });
              squares[0].node.classList.add('ship-v-start');
              squares[squares.length - 1].node.classList.add('ship-v-end');
            }

            ship.remove();
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
