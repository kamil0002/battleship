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
    if (attacker === 'ENEMY') msg = `Enemy sunk your ${shipName}!`;
    informationBox.textContent = msg;
    informationBox.style.display = 'block';
  }

  const timeoutId = setTimeout(() => {
    informationBox.style.display = 'none';
  }, 3500);

  if (winnerObj.isWinner) {
    setTimeout(() => {
      clearTimeout(timeoutId);
      informationBox.textContent = `${winnerObj.winner} won the game!`;
      informationBox.style.display = 'block';
    }, 3550);
  }
};

export const checkWinnerOffline = (playerShips, computerShips) => {
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

export const markShipAsDestroyedOnBoard = (ship, boardSquares, shipSquaresIndexes = undefined) => {
  const tl = gsap.timeline({ defaults: { ease: 'ease' } });
  const shipSquares = shipSquaresIndexes || boardSquares.filter((square) => square.node.dataset.ship === ship.name);

  const shipDestoryedLine = document.createElement('span');
  shipDestoryedLine.className = 'ship--destroyed';

  document
    .querySelector(`.board--enemy [data-id="${shipSquares[0].squareIndex}"]`)
    .insertAdjacentElement('beforeend', shipDestoryedLine);

  if (shipSquares[0].top === shipSquares[shipSquares.length - 1].top) {
    shipDestoryedLine.style.height = '0.45vmin';
    shipDestoryedLine.style.transform = 'translateY(-50%)';
    tl.to(shipDestoryedLine, {
      // width: `${shipSquares[shipSquares.length - 1].right - shipSquares[0].right}px`,

      width: `calc(${4.6 * ship.size - 1}vmin - 3vmin)`,
      duration: shipSquares.length * 0.7,
    });
  } else {
    shipDestoryedLine.style.width = '0.45vmin';
    shipDestoryedLine.style.transform = `translateX(-50%)`;
    tl.to(shipDestoryedLine, {
      height: `calc(${4.6 * ship.size - 1}vmin - 3vmin)`,
      duration: shipSquares.length * 0.7,
    });
  }
};

export const placeBoards = (cond, icon) => {
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
    .to('.player-status__connected', { width: '100px', duration: 0 })
    .to('.board-wrapper', {
      width: 'min-content',
      position: 'relative',
      display: 'block',
      left: 'auto',
      transform: 'translate(0,0)',
      duration: 0,
    })
    .to('.player-accepted', { display: 'none' })
    .to('.board-wrapper--enemy', {
      visibility: 'visible',
      opacity: 1,
      duration: 0.6,
    })
    .to(
      '.board-wrapper',
      {
        opacity: 1,
        duration: 0.6,
      },
      '-=0.6'
    )
    .to(
      '[data-player-status]',
      {
        display: 'block',
      },
      '-=0.6'
    )
    .then(() => showWhoseTurn(cond, icon));
};

export const controlEnemyConnectionIcon = (color, startSelector = '.player-status__connected') => {
  document.querySelector(`${startSelector} svg path`).setAttribute('fill', color);
};
