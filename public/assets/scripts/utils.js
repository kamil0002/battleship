export const showAlert = (msg, time = 5) => {
  const modal = document.querySelector('.modal');
  modal.querySelector('.modal__description').textContent = msg;
  modal.classList.toggle('modal--hidden');
  window.setTimeout(() => modal.classList.add('modal--hidden'), time * 1000);
  modal.querySelector('.modal__close').addEventListener('click', () => modal.classList.add('modal--hidden'));
};

export const findShipPositionOnOnBoard = (shipsPosition, shipPos, shipObj, boardSquares) => {
  let position;
  const flexibleCondition = (i, flexTolerance) => {
    if (shipsPosition === 'horizontal' && i + shipObj.size - 1 < boardSquares.length) {
      return (
        shipPos.right + 20 > boardSquares[i + shipObj.size - 1].right &&
        shipPos.right - 20 < boardSquares[i + shipObj.size - 1].right
      );
    }
    if (shipsPosition === 'vertical' && i + (shipObj.size - 1) * 10 < boardSquares.length)
      return (
        shipPos.bottom + flexTolerance >= boardSquares[i + (shipObj.size - 1) * 10].bottom &&
        shipPos.bottom - flexTolerance <= boardSquares[i + (shipObj.size - 1) * 10].bottom
      );
    return false;
  };

  boardSquares.forEach((square, index) => {
    const squareTolerance = (square.node.getBoundingClientRect().width * 4) / 7;
    if (
      shipPos.top + squareTolerance >= square.top &&
      shipPos.top - squareTolerance <= square.top &&
      shipPos.left + squareTolerance >= square.left &&
      shipPos.left - squareTolerance <= square.left &&
      flexibleCondition(index, squareTolerance - 3)
    ) {
      position = index;
    }
  });
  return position === undefined ? 97 : position;
};

export const showWhoseTurn = (playerTurn, image) => {
  if (playerTurn) {
    document.querySelector('[data-computer-move]').style.opacity = 0;
    document.querySelector('[data-computer-move]').src = '';
    document.querySelector('[data-player-move]').src = image;
    document.querySelector('[data-player-move]').style.opacity = 1;
  } else if (!playerTurn) {
    document.querySelector('[data-player-move]').style.opacity = 0;
    document.querySelector('[data-player-move]').src = '';
    document.querySelector('[data-computer-move]').style.opacity = 1;
    document.querySelector('[data-computer-move]').src = image;
  }
};

