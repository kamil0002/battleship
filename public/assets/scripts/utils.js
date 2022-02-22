export const showAlert = (msg, time = 5) => {
  const modal = document.querySelector('.modal');
  modal.querySelector('.modal__description').textContent = msg;
  modal.classList.toggle('modal--hidden');
  window.setTimeout(() => modal.classList.add('modal--hidden'), time * 1000);
  modal
    .querySelector('.modal__close')
    .addEventListener('click', () => modal.classList.add('modal--hidden'));
};

export const findShipPositionOnOnBoard = (shipsPosition, shipPos, shipObj, boardSquares) => {
  let position;
  const flexibleCondition = (i) => {
    if (shipsPosition === 'horizontal' && i + shipObj.size - 1 < boardSquares.length) {
      return (
        shipPos.right + 20 > boardSquares[i + shipObj.size - 1].right &&
        shipPos.right - 20 < boardSquares[i + shipObj.size - 1].right &&
        i + shipObj.size - 1 < 100
      );
    }
    if (shipsPosition === 'vertical' && i + (shipObj.size - 1) * 10 < boardSquares.length)
      return (
        shipPos.bottom + 20 >= boardSquares[i + (shipObj.size - 1) * 10].bottom &&
        shipPos.bottom - 20 <= boardSquares[i + (shipObj.size - 1) * 10].bottom
      );
    return false;
  };

  boardSquares.forEach((square, index) => {
    if (
      shipPos.top + 20 >= square.top &&
      shipPos.top - 20 <= square.top &&
      shipPos.left + 20 >= square.left &&
      shipPos.left - 20 <= square.left &&
      flexibleCondition(index)
    ) {
      position = index;
    }
  });
  console.log(position);
  return position === undefined ? 97 : position;
};
