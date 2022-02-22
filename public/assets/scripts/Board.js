import interact from 'interactjs';
import Ship from './Ship';

class Board {
  constructor(gameOptions, boardContainer) {
    this.gameOptions = gameOptions;
    this.boardContainer = boardContainer;
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

  configureDraggableShips = (boardSquares) => {
    const shipPos = { top: 0, left: 0, right: 0, bottom: 0 };
    const shipsHtml = Array.from(document.querySelectorAll('.ship'));

    const ships = shipsHtml.map((ship) => new Ship(ship.dataset.name, ship.dataset.size));

    const setShipPosition = (e, ship) => {
      shipPos.top = e.target.getBoundingClientRect().top;
      shipPos.right = e.target.getBoundingClientRect().right;
      shipPos.left = e.target.getBoundingClientRect().left;
      shipPos.bottom = e.target.getBoundingClientRect().bottom + ship.offsetHeight;
    };

    const position = { x: 0, y: 0 };

    // const Carrier = new Ship('Carrier', 5);

    let shipStartNum;

    // console.log(this.boardSquares);
    // console.log(ships);

    shipsHtml.forEach((ship) => {
      const localShipObj = ships.find((shipEl) => shipEl.name === ship.dataset.name);
      interact(ship).draggable({
        listeners: {
          move(e) {
            position.x += e.dx;
            position.y += e.dy;
            e.target.style.transform = `translate(${position.x}px, ${position.y}px)`;
            setShipPosition(e, ship);

            // tempDot.style.bottom = `${shipPos.bottom}px`;
            // tempDot.style.left = `${shipPos.left}px`;
          },
        },
      });
      interact(this.boardContainer)
        .dropzone({
          ondrop(e) {
            // console.log(ships);

            // console.log(boardSquares);

            boardSquares.forEach((square, i, squaresBoard) => {
              if (
                shipPos.top + 20 >= square.top &&
                shipPos.top - 20 <= square.top &&
                shipPos.left + 20 > square.left &&
                shipPos.left - 20 < square.left &&
                shipPos.right + 20 > squaresBoard[i + localShipObj.size - 1].right &&
                shipPos.right - 20 < squaresBoard[i + localShipObj.size - 1].right
              ) {
                shipStartNum = i;
              }
            });

            // console.log(boardSquares[shipStartNum]);
            // console.log(boardSquares[shipStartNum]);

            for (let i = shipStartNum; i < shipStartNum + localShipObj.size; i++) {
              console.log(i, shipStartNum + localShipObj.size - 1);
              if (i === shipStartNum) boardSquares[i].node.classList.add('ship-start');
              if (i === shipStartNum + localShipObj.size - 1) {
                boardSquares[i].node.classList.add('ship-end');
              }
              boardSquares[i].node.classList.add('taken');
            }
            if (e.relatedTarget.dataset.name === localShipObj.name) ship.remove();
          },
        })
        .on('dropactivate', (e) => {
          e.target.classList.add('drop-activated');
        });
    });

    return ships;
  };
}
export default Board;