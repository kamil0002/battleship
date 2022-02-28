import gsap from 'gsap';

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
    document.querySelector('[data-enemy-move]').style.opacity = 0;
    document.querySelector('[data-enemy-move]').src = '';
    document.querySelector('[data-player-move]').src = image;
    document.querySelector('[data-player-move]').style.opacity = 1;
  } else if (!playerTurn) {
    document.querySelector('[data-player-move]').style.opacity = 0;
    document.querySelector('[data-player-move]').src = '';
    document.querySelector('[data-enemy-move]').style.opacity = 1;
    document.querySelector('[data-enemy-move]').src = image;
  }
};

export const showInformationBox = (informationBox, shipName, attacker, winnerObj) => {
  if (!winnerObj.isWinner) {
    let msg;
    if (attacker === 'PLAYER') msg = `You sunk enemies ${shipName}!`;
    if (attacker === 'COMPUTER') msg = `Enemy sunk your ${shipName}!`;
    informationBox.textContent = msg;
    informationBox.style.display = 'block';
  }

  const timeoutId = setTimeout(() => {
    informationBox.style.display = 'none';
  }, 6000);

  if (winnerObj.isWinner) {
    setTimeout(() => {
      clearTimeout(timeoutId);
      informationBox.textContent = `${winnerObj.winner} won the game!`;
      informationBox.style.display = 'block';
    }, 2150);
  }
};

export const checkWinner = (playerShips, computerShips) => {
  let isWinner = false;
  let winner;
  if (computerShips.length === 0) {
    isWinner = true;
    winner = 'You';
  }
  if (playerShips.length === 0) {
    isWinner = true;
    winner = 'Computer';
  }

  if (isWinner)
    return {
      isWinner,
      winner,
    };
  return { isWinner };
};

export const markShipAsDestroyedOnBoard = (ship, boardSquares) => {
  const tl = gsap.timeline({ defaults: { ease: 'ease' } });
  const shipSquares = boardSquares.filter((square) => square.node.dataset.ship === ship.name);
  const shipDestoryedLine = document.createElement('span');
  shipDestoryedLine.className = 'ship--destroyed';
  shipSquares[0].node.insertAdjacentElement('beforeend', shipDestoryedLine);

  if (shipSquares[0].top === shipSquares[shipSquares.length - 1].top) {
    shipDestoryedLine.style.height = '0.45vmin';
    shipDestoryedLine.style.transform = 'translateY(-50%)';
    tl.to(shipDestoryedLine, {
      width: `${shipSquares[shipSquares.length - 1].right - shipSquares[0].right}px`,
      duration: shipSquares.length * 0.7,
    });
  } else {
    shipDestoryedLine.style.width = '0.45vmin';
    shipDestoryedLine.style.transform = 'translateX(-50%)';
    tl.to(shipDestoryedLine, {
      height: `${shipSquares[shipSquares.length - 1].top - shipSquares[0].top}px`,
      duration: shipSquares.length * 0.7,
    });
  }
};
