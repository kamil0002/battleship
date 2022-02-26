import '@babel/polyfill';

import AudioController from './AudioController';
import Board from './Board';
import { showAlert, showWhoseTurn, showInformationBox, checkWinner, markShipAsDestroyedOnBoard } from './utils';
import turnIndicator from '../images/turnIndicator.svg';

//* Game functionality

const MusicController = new AudioController();

MusicController.control();

const gameOptions = {
  isGameOver: false,
};

const runGameBtn = document.querySelector('.form__button');
const playerName = document.querySelector('.form__username input');

const runGameMode = function () {
  if (runGameBtn)
    runGameBtn.addEventListener('click', () => {
      const playerNameVal = playerName.value;
      if (playerNameVal.trim() === '' || !mode) {
        showAlert('Player must have a name and mode must be selected 😀');
        return;
      }
      location.assign(`${location.protocol}//${location.host}/${mode}.html`);
    });
};

runGameMode();

if (mode) {
  gameOptions.boardSize = +document.querySelector('.board').getBoundingClientRect().width;
  gameOptions.cellSize = +document.querySelector('.board').getBoundingClientRect().width / 10;
  const playerBoardContainer = document.querySelector('.board');
  const computerBoardContainer = document.querySelector('.board--enemy');
  const informationBox = document.querySelector('.information-box');

  gameOptions.mode = mode;

  const playerBoard = new Board(gameOptions, playerBoardContainer);
  const playerBoardSquares = playerBoard.createBoard();
  playerBoard.configureDraggableShips();

  const computerBoard = new Board(gameOptions, computerBoardContainer, false);
  const computerBoardSquares = computerBoard.createBoard();
  computerBoard.createAndPlaceComputerShips();

  const playerShips = playerBoard.getPlayerShips;
  const computerShips = computerBoard.getComputerShips;

  const computerAttacks = new Set();

  let yourTurn = true;

  const shipAttacked = (ships, shipNode, attacker) => {
    const attackedShip = ships.find((ship) => ship.name === shipNode.dataset.ship);
    attackedShip.health--;
    if (attackedShip.health === 0) {
      const shipIndex = ships.findIndex((ship) => ship.health === 0);
      if (attacker === 'PLAYER') markShipAsDestroyedOnBoard(attackedShip, computerBoardSquares);
      ships.splice(shipIndex, 1);
      showInformationBox(informationBox, attackedShip.name, attacker, { isWinner: false });
    }
  };

  const attackPlayerBoard = () => {
    let attackedCell;
    do {
      attackedCell = Math.trunc(Math.random() * 100);
    } while (computerAttacks.has(attackedCell));

    const attack = playerBoardSquares[attackedCell].node.dataset.ship ? 'attacked' : 'missed';
    playerBoardSquares[attackedCell].node.classList.add(`ship--${attack}`);
    computerAttacks.add(attackedCell);

    if (attack === 'attacked') {
      shipAttacked(playerShips, playerBoardSquares[attackedCell].node, 'COMPUTER');
    }

    yourTurn = true;

    const winnerObj = checkWinner(playerShips, computerShips);

    winnerObj.isWinner || showWhoseTurn(yourTurn, turnIndicator);

    if (winnerObj.isWinner) {
      showInformationBox(informationBox, null, null, winnerObj);
      gameOptions.isGameOver = true;
      return;
    }
  };

  const attackComputerBoard = function (e) {
    if (yourTurn && !gameOptions.isGameOver) {
      const clickedCell = e.target;
      if (
        clickedCell.classList.contains('ship--attacked') ||
        clickedCell.classList.contains('ship--missed') ||
        !clickedCell.classList.contains('board--enemy__cell')
      )
        return;

      const attack = clickedCell.dataset.ship ? 'attacked' : 'missed';

      clickedCell.classList.add(`ship--${attack}`);

      if (attack === 'attacked') shipAttacked(computerShips, clickedCell, 'PLAYER');

      yourTurn = false;

      const winnerObj = checkWinner(playerShips, computerShips);

      winnerObj.isWinner || showWhoseTurn(yourTurn, turnIndicator);

      if (winnerObj.isWinner) {
        showInformationBox(informationBox, null, null, winnerObj);
        computerBoardSquares.forEach((square) => square.removeEventListener('click', attackComputerBoard));
        return;
      }
    }

    setTimeout(() => attackPlayerBoard(), 1000);
  };

  computerBoardSquares.forEach(({ node: squareNode }) => squareNode.addEventListener('click', attackComputerBoard));
}