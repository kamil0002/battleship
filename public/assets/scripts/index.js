import { io } from 'socket.io-client';

// import '@babel/polyfill';

import AudioController from './AudioController';
import Board from './Board';
import {
  showAlert,
  showWhoseTurn,
  showInformationBox,
  checkWinner,
  markShipAsDestroyedOnBoard,
  placeBoards,
  controlEnemyConnectionIcon,
} from './utils';
import turnIndicator from '../images/turnIndicator.svg';

//* Game functionality

const MusicController = new AudioController();

MusicController.control();

const gameOptions = {
  isGameOver: false,
  playerReady: false,
  enemyReady: false,
};

//* Socket initiallization

const socket = io();

const runGameBtn = document.querySelector('.form__button');
const playerName = document.querySelector('.form__username input');

const runGameMode = function () {
  if (runGameBtn)
    runGameBtn.addEventListener('click', () => {
      const playerNameVal = playerName.value;
      if (playerNameVal.trim() === '' && mode === 'multiplayer') {
        showAlert('Player must have a name and mode must be selected 😀');
        return;
      }
      if (!mode) {
        showAlert('You must select a mode!😀');
        return;
      }
      location.assign(`${location.protocol}//${location.host}/${mode}.html`);
    });
};

runGameMode();

gameOptions.mode = mode || undefined;

if (gameOptions.mode) {
  gameOptions.boardSize = +document.querySelector('.board').getBoundingClientRect().width;
  gameOptions.cellSize = +document.querySelector('.board').getBoundingClientRect().width / 10;
  const playerBoardContainer = document.querySelector('.board');
  const enemyBoardContainer = document.querySelector('.board--enemy');
  const informationBox = document.querySelector('.information-box');

  //* Global settings

  const playerBoard = new Board(gameOptions, playerBoardContainer);
  const playerBoardSquares = playerBoard.createBoard();
  playerBoard.configureDraggableShips();

  let attackPlayerBoard;
  const enemyBoard = new Board(gameOptions, enemyBoardContainer, false);
  const enemyBoardSquares = enemyBoard.createBoard();

  const playerShips = playerBoard.getPlayerShips;

  let yourTurn = gameOptions.mode === 'singleplayer';
  let yourTurnMulti = false;

  //* Ship attacked fn

  const shipAttacked = (ships, shipNode, attacker) => {
    const attackedShip = ships.find((ship) => ship.name === shipNode.dataset.ship);
    attackedShip.health--;
    if (attackedShip.isSinked()) {
      const shipIndex = ships.findIndex((ship) => ship.isSinked());
      if (attacker === 'PLAYER') markShipAsDestroyedOnBoard(attackedShip, enemyBoardSquares);
      ships.splice(shipIndex, 1);
      showInformationBox(informationBox, attackedShip.name, attacker, { isWinner: false });
    }
  };

  //* Start game functionality

  const startGame = () => {
    if (gameOptions.mode === 'multiplayer') {
      console.log('PLAYER MODE ACT');
    } else {
      placeBoards(showWhoseTurn(true, turnIndicator));
    }
  };

  console.log(gameOptions.mode);
  if (gameOptions.mode === 'singleplayer') {
    enemyBoard.createAndPlaceComputerShips();
    computerShips = enemyBoard.getComputerShips;

    const computerAttacks = new Set();

    attackPlayerBoard = () => {
      if (gameOptions.isGameOver) return;
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

    document.querySelector('.board-btn--start').addEventListener('click', startGame);
  }

  const attackEnemyBoardSingle = (clickedCell) => {
    if (
      clickedCell.classList.contains('ship--attacked') ||
      clickedCell.classList.contains('ship--missed') ||
      !clickedCell.classList.contains('board--enemy__cell')
    )
      return;

    const attack = clickedCell.dataset.ship ? 'attacked' : 'missed';

    clickedCell.classList.add(`ship--${attack}`);
    return attack;
  };

  const attackEnemyBoard = function (e) {
    const condition =
      gameOptions.mode === 'singleplayer'
        ? yourTurn && !gameOptions.isGameOver
        : !gameOptions.isGameOver && yourTurnMulti;
    if (condition) {
      const clickedCell = e.target;
      const attack = attackEnemyBoardSingle(clickedCell);
      socket.emit('fire', clickedCell.dataset.id);
      yourTurnMulti = !yourTurnMulti;
      showWhoseTurn(false, turnIndicator);

      if (attack === 'attacked') shipAttacked(computerShips, clickedCell, 'PLAYER');

      yourTurn = false;

      if (gameOptions.mode === 'singleplayer') {
        const winnerObj = checkWinner(playerShips, computerShips);

        winnerObj.isWinner || showWhoseTurn(yourTurn, turnIndicator);

        if (winnerObj.isWinner) {
          showInformationBox(informationBox, null, null, winnerObj);
          gameOptions.isGameOver = true;
          return;
        }
      }
    }
    if (gameOptions.mode === 'singleplayer') {
      setTimeout(() => attackPlayerBoard(), 800);
    }
  };

  //* Multiplayer

  if (gameOptions.mode === 'multiplayer') {
    let playerNumber;

    //* Global

    const checkPlayersConnection = (playersStatus) => {
      for (const playerStatusIndex in playersStatus) {
        if (playerStatusIndex !== playerNumber && playersStatus[playerStatusIndex].connected) {
          controlEnemyConnectionIcon();
        }
        if (playersStatus[playerStatusIndex].ready) {
          gameOptions.enemyReady = true;
          document.querySelector('[data-enemy-ready] path').setAttribute('fill', '#4ECB71');
        }
      }
    };

    //* Inform enemy that game has started and place boards!

    socket.on('game started', () => {
      yourTurnMulti = true;
      placeBoards(showWhoseTurn(true, turnIndicator));
    });

    socket.on('fire replay', (cellId) => {
      console.log(cellId);
      yourTurnMulti = true;
      const attackedCell = document.querySelector(`[data-id="${cellId}"]`);
      console.log(attackedCell);
      const attackedShip = attackedCell.dataset.ship ? 'attacked' : 'missed';
      attackedCell.classList.add(`ship--${attackedShip}`);
      if (attackedShip === 'attacked') {
        shipAttacked(playerShips, attackedCell, 'PLAYER');
      }
      showWhoseTurn(yourTurnMulti, turnIndicator);
    });

    //* Mark player as ready, and start game if everyone is ready

    const playerReadyFn = () => {
      gameOptions.playerReady = true;
      socket.emit('player ready');

      if (gameOptions.enemyReady && gameOptions.playerReady) {
        placeBoards(showWhoseTurn(false, turnIndicator));
      }
    };

    //* Inform that enemy is ready

    socket.on('enemy ready', (enemyIndex) => {
      gameOptions.enemyReady = true;
      document.querySelector('[data-enemy-ready] path').setAttribute('fill', '#4ECB71');
    });

    //* Check if server is full and assign player number

    socket.on('player number', (playerIndex) => {
      if (playerIndex === -1) {
        console.log('Server is full!');
      } else {
        playerNumber = playerIndex;
      }

      socket.emit('check players');

      socket.on('check players', (playersStatus) => checkPlayersConnection(playersStatus));
    });

    //* Inform enemy that player connected

    socket.on('player connected', (playerIndex) => {
      controlEnemyConnectionIcon();
    });

    //* Inform enemy that player has disconnected

    socket.on('player disconnected', () => {
      console.log('Disconected');
      document.querySelector('.player-status__connected svg path').setAttribute('fill', '#CC1400');
    });

    document.querySelector('.board-btn--start').addEventListener('click', playerReadyFn);
  }

  enemyBoardSquares.forEach(({ node: squareNode }) => squareNode.addEventListener('click', attackEnemyBoard));
}
