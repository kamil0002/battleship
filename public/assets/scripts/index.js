// import '@babel/polyfill';

import AudioController from './AudioController';
import Board from './Board';
import {
  showAlert,
  showWhoseTurn,
  showInformationBox,
  checkWinnerOffline,
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
const runGameBtn = document.querySelector('.form__button');

const runGameMode = function () {
  if (runGameBtn)
    runGameBtn.addEventListener('click', () => {
      const formOptions = document.querySelectorAll('input');
      if (formOptions[0].checked) mode = 'singleplayer';
      if (formOptions[1].checked) mode = 'multiplayer';

      if (!mode) {
        showAlert('You must select a mode!😀');
        return;
      }
      location.assign(`${location.protocol}//${location.host}/${mode}.html`);
    });
};

runGameMode();

gameOptions.mode = mode || undefined;

if (gameOptions?.mode) {
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
  let computerShips;

  //* Enemy board

  const enemyBoard = new Board(gameOptions, enemyBoardContainer, false);
  const enemyBoardSquares = enemyBoard.createBoard();

  const playerShips = playerBoard.getPlayerShips;

  let yourTurn = gameOptions.mode === 'singleplayer';

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

  const attackEnemyBoardSingle = function (e) {
    if (yourTurn && !gameOptions.isGameOver) {
      const clickedCell = e.target;
      if (
        clickedCell.classList.contains('ship--attacked') ||
        clickedCell.classList.contains('ship--missed') ||
        !clickedCell.classList.contains('board--enemy__cell')
      )
        return;

      yourTurn = !yourTurn;

      const attack = clickedCell.dataset.ship ? 'attacked' : 'missed';

      clickedCell.classList.add(`ship--${attack}`);

      if (attack === 'attacked') shipAttacked(computerShips, clickedCell, 'PLAYER');

      const winnerObj = checkWinnerOffline(playerShips, computerShips);

      winnerObj.isWinner || showWhoseTurn(yourTurn, turnIndicator);

      if (winnerObj.isWinner) {
        showInformationBox(informationBox, null, null, winnerObj);
        gameOptions.isGameOver = true;
        return;
      }
    }

    gameOptions.mode === 'singleplayer' && setTimeout(() => attackPlayerBoard(), 800);
  };

  const attackEnemyBoardMulti = function (e, socket) {
    if (yourTurn && !gameOptions.isGameOver) {
      const clickedCell = e.target;
      if (
        clickedCell.classList.contains('ship--attacked') ||
        clickedCell.classList.contains('ship--missed') ||
        !clickedCell.classList.contains('board--enemy__cell')
      )
        return;

      yourTurn = !yourTurn;

      socket.emit('fire', +clickedCell.dataset.id);
      showWhoseTurn(false, turnIndicator);
    }
  };

  //* Start game functionality

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
        shipAttacked(playerShips, playerBoardSquares[attackedCell].node, 'ENEMY');
      }

      yourTurn = true;

      const winnerObj = checkWinnerOffline(playerShips, computerShips);

      winnerObj.isWinner || showWhoseTurn(yourTurn, turnIndicator);

      if (winnerObj.isWinner) {
        showInformationBox(informationBox, null, null, winnerObj);
        gameOptions.isGameOver = true;
        return;
      }
    };

    document.querySelector('.board-btn--start').addEventListener('click', () => {
      placeBoards(true, turnIndicator);
    });

    enemyBoardSquares.forEach(({ node: squareNode }) => squareNode.addEventListener('click', attackEnemyBoardSingle));
  }

  //* Multiplayer

  if (gameOptions.mode === 'multiplayer') {
    const socket = io();

    socket.on('server status', (serverFull) => {
      if (serverFull) {
        showAlert('Online server is full! You can play only offline game 😔');
        setTimeout(() => location.assign(`${location.protocol}//${location.host}`), 3000);
      }
    });

    let playerNumber;

    //* Verify players connection

    const checkPlayersConnection = (playersStatus) => {
      for (const playerStatusIndex in playersStatus) {
        if (playerStatusIndex !== playerNumber && playersStatus[playerStatusIndex].connected) {
          controlEnemyConnectionIcon('#4ECB71');
        }
        if (playersStatus[playerStatusIndex].ready) {
          gameOptions.enemyReady = true;
          document.querySelector('.enemy-ready-icon path').setAttribute('fill', '#4ECB71');
        }
      }
    };

    //* Mark player as ready, and start game if everyone is ready

    const playerReadyFn = (e) => {
      gameOptions.playerReady = true;
      socket.emit('player ready');

      const startBtnNode = e.target;
      const { parentNode } = startBtnNode;
      parentNode.removeChild(document.querySelector('[data-board-action-btns]'));
      parentNode.removeChild(startBtnNode);
      const playerReadyInformation = document.createElement('h4');
      playerReadyInformation.className = 'player-accepted';
      playerReadyInformation.textContent = 'You are ready, wait for your opponent.';
      gameOptions.enemyReady || parentNode.insertAdjacentElement('beforeend', playerReadyInformation);
      if (gameOptions.enemyReady && gameOptions.playerReady) {
        playerReadyInformation.textContent = 'Game is starting...';
        if (gameOptions.enemyName === undefined) {
          gameOptions.enemyName = playerNumber === '2' ? 'Player 1' : 'Player 2';
          document.querySelector('.board-wrapper--enemy .player-status__nick').textContent = gameOptions.enemyName;
        }
        parentNode.insertAdjacentElement('beforeend', playerReadyInformation);
        placeBoards(false, turnIndicator);
      }
    };

    //* Inform enemy that game has started and place boards!

    socket.on('game started', (enemyPlayer) => {
      if (enemyPlayer.connected) controlEnemyConnectionIcon('#4ECB71', '[data-enemy-game-view]');
      gameOptions.enemyName = enemyPlayer.name;
      document.querySelector('.board-wrapper--enemy .player-status__nick').textContent = gameOptions.enemyName;
      document.querySelector('.player-accepted').textContent = 'Game is starting...';
      yourTurn = true;
      placeBoards(true, turnIndicator);
    });

    socket.on('fire received', (cellId) => {
      yourTurn = true;
      let shipObj;
      let shipIndex;
      let shipSquares;
      const attackedCell = document.querySelector(`[data-id="${cellId}"]`);
      const attackedShip = attackedCell.dataset.ship ? 'attacked' : 'missed';
      attackedCell.classList.add(`ship--${attackedShip}`);
      if (attackedShip === 'attacked') {
        shipObj = playerShips.find((playerShip) => playerShip.name === attackedCell.dataset.ship);
        shipObj.health--;
        if (shipObj.isSinked()) {
          shipIndex = playerShips.findIndex((ship) => ship.isSinked());
        }
      }

      if (shipObj && shipObj.isSinked()) {
        shipSquares = playerBoardSquares.filter((square) => square.node.dataset.ship === shipObj.name);
        showInformationBox(informationBox, shipObj.name, 'ENEMY', { isWinner: false });
        playerShips.splice(shipIndex, 1);
      }

      if (playerShips.length === 0) {
        showInformationBox(informationBox, null, null, { winner: gameOptions.enemyName, isWinner: true });
        gameOptions.isGameOver = true;
      }

      socket.emit('fire replay', { ship: shipObj, cellId, gameOver: gameOptions.isGameOver, shipSquares });

      showWhoseTurn(yourTurn, turnIndicator);
    });

    //* Mark if player hit enemy ship

    socket.on('fire replay', ({ ship, cellId, gameOver, shipSquares }) => {
      const cell = document.querySelector(`.board--enemy [data-id="${cellId}"]`);
      if (ship) cell.classList.add('ship--attacked');
      if (!ship) cell.classList.add('ship--missed');
      if (ship && ship.health === 0) {
        markShipAsDestroyedOnBoard(ship, enemyBoardSquares, shipSquares);
        showInformationBox(informationBox, ship.name, 'PLAYER', { isWinner: false });
      }

      if (gameOver) {
        showInformationBox(informationBox, null, null, { winner: gameOptions.playerName, isWinner: true });
        gameOptions.isGameOver = true;
        return;
      }
    });

    //* Inform that enemy is ready

    socket.on('enemy ready', (enemyName) => {
      gameOptions.enemyName = enemyName;
      document.querySelector('.board-wrapper--enemy .player-status__nick').textContent = gameOptions.enemyName;
      gameOptions.enemyReady = true;
      document.querySelector('.enemy-ready-icon path').setAttribute('fill', '#4ECB71');
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

    //* Inform player about his name

    socket.on('player name', (playerNick) => {
      document.querySelector('.board-wrapper .player-status__nick').textContent = playerNick;
      gameOptions.playerName = playerNick;
    });

    //* Inform enemy that player connected

    socket.on('player connected', () => {
      controlEnemyConnectionIcon('#4ECB71');
    });

    //* Inform enemy that player has disconnected

    socket.on('player disconnected', () => {
      controlEnemyConnectionIcon('#CC1400');
      controlEnemyConnectionIcon('#CC1400', '[data-enemy-game-view] div');
    });

    document.querySelector('.board-btn--start').addEventListener('click', playerReadyFn);

    enemyBoardSquares.forEach(({ node: squareNode }) =>
      squareNode.addEventListener('click', (e) => attackEnemyBoardMulti(e, socket))
    );
  }
}
