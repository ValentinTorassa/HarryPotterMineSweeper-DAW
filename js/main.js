"use strict";

var rows = 8;
var columns = 8;
var mines = 10;
var flags = 0;
var isPlaying = true;
var gameStarted = false;
var level;

var board = [];
var game; // Instance of Buscaminas class

// Sounds
var soundWin = new Audio("assets/sounds/winSound.wav");
var soundGameover = new Audio("assets/sounds/gameOverSound.wav");
var soundReveal = new Audio("assets/sounds/revealSound.wav"); // sonido para revelar una celda
var soundBomb = new Audio("assets/sounds/bombSound.wav"); // sonido para cuando ponemos bomba
var soundFlag = new Audio("assets/sounds/flagSound.wav"); // sonido para cuando ponemos bandera
var soundGame = new Audio("assets/sounds/harryPotterSound.mp3"); //sonido de harry potter para poner mientras jugamos

function setDifficulty(level) {
  if (level === 'easy') {
    rows = 8;
    columns = 8;
    mines = 10;
  } else if (level === 'medium') {
    rows = 12;
    columns = 12;
    mines = 25;
  } else if (level === 'hard') {
    rows = 16;
    columns = 16;
    mines = 40;
  }
  newGame();
}

function resetVariables() {
  flags = 0;
  isPlaying = true;
  gameStarted = false;
}

function generateBoardHTML() {
  // Create board container
  const boardContainer = document.getElementById('board');
  if (!boardContainer) return;
  
  boardContainer.innerHTML = '';
  boardContainer.style.display = 'grid';
  boardContainer.style.gridTemplateColumns = `repeat(${columns}, 30px)`;
  boardContainer.style.gap = '1px';
  boardContainer.style.backgroundColor = '#ccc';
  boardContainer.style.padding = '10px';
  
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < columns; c++) {
      const cell = document.createElement('div');
      cell.id = `cell-${c}-${r}`;
      cell.className = 'cell';
      cell.style.width = '30px';
      cell.style.height = '30px';
      cell.style.backgroundColor = '#eee';
      cell.style.border = '1px solid #999';
      cell.style.display = 'flex';
      cell.style.alignItems = 'center';
      cell.style.justifyContent = 'center';
      cell.style.cursor = 'pointer';
      cell.style.fontWeight = 'bold';
      boardContainer.appendChild(cell);
    }
  }
}

function generateGameBoard() {
  // Initialize the board array
  board = [];
  for (let c = 0; c < columns; c++) {
    board[c] = [];
    for (let r = 0; r < rows; r++) {
      board[c][r] = {
        value: 0,
        state: "hidden",
        revealed: false
      };
    }
  }
}

function placeMinesRandomly() {
  let minesPlaced = 0;
  while (minesPlaced < mines) {
    const col = Math.floor(Math.random() * columns);
    const row = Math.floor(Math.random() * rows);
    
    if (board[col][row].value !== -1) {
      board[col][row].value = -1;
      minesPlaced++;
    }
  }
  
  // Calculate numbers for adjacent cells
  for (let col = 0; col < columns; col++) {
    for (let row = 0; row < rows; row++) {
      if (board[col][row].value !== -1) {
        board[col][row].value = countAdjacentMines(col, row);
      }
    }
  }
}

function countAdjacentMines(col, row) {
  let count = 0;
  for (let dCol = -1; dCol <= 1; dCol++) {
    for (let dRow = -1; dRow <= 1; dRow++) {
      const newCol = col + dCol;
      const newRow = row + dRow;
      
      if (newCol >= 0 && newCol < columns && newRow >= 0 && newRow < rows) {
        if (board[newCol][newRow].value === -1) {
          count++;
        }
      }
    }
  }
  return count;
}

function addEvents() {
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < columns; c++) {
      const cell = document.getElementById(`cell-${c}-${r}`);
      if (cell) {
        cell.addEventListener('click', () => handleCellClick(c, r));
        cell.addEventListener('contextmenu', (e) => {
          e.preventDefault();
          handleRightClick(c, r);
        });
      }
    }
  }
}

function handleCellClick(col, row) {
  if (!isPlaying || board[col][row].state === "flagged") {
    return;
  }

  if (!gameStarted) {
    gameStarted = true;
  }

  if (board[col][row].value === -1) {
    loseGame();
    return;
  }

  revealCell(col, row);
  
  if (checkWin()) {
    winGame();
  }
}

function handleRightClick(col, row) {
  if (!isPlaying || board[col][row].state === "revealed") {
    return;
  }

  if (board[col][row].state === "flagged") {
    board[col][row].state = "hidden";
    flags--;
    soundFlag.play();
  } else {
    board[col][row].state = "flagged";
    flags++;
    soundFlag.play();
  }

  refreshBoard();
}

function revealCell(col, row) {
  if (board[col][row].state === "revealed" || board[col][row].state === "flagged") {
    return;
  }

  board[col][row].state = "revealed";
  board[col][row].revealed = true;
  soundReveal.play();

  if (board[col][row].value === 0) {
    revealAdjacentCells(col, row);
  }

  refreshBoard();
}

function revealAdjacentCells(col, row) {
  for (let dCol = -1; dCol <= 1; dCol++) {
    for (let dRow = -1; dRow <= 1; dRow++) {
      const newCol = col + dCol;
      const newRow = row + dRow;
      
      if (newCol >= 0 && newCol < columns && newRow >= 0 && newRow < rows) {
        revealCell(newCol, newRow);
      }
    }
  }
}

function refreshBoard() {
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < columns; c++) {
      const cell = document.getElementById(`cell-${c}-${r}`);
      if (cell) {
        if (board[c][r].state === "revealed") {
          cell.style.backgroundColor = "#ddd";
          if (board[c][r].value === -1) {
            cell.innerHTML = "💣";
            cell.style.color = "red";
          } else if (board[c][r].value > 0) {
            cell.innerHTML = board[c][r].value;
            cell.style.color = getNumberColor(board[c][r].value);
          } else {
            cell.innerHTML = "";
          }
        } else if (board[c][r].state === "flagged") {
          cell.innerHTML = "🚩";
          cell.style.backgroundColor = "#eee";
        } else {
          cell.innerHTML = "";
          cell.style.backgroundColor = "#eee";
        }
      }
    }
  }
}

function getNumberColor(num) {
  const colors = ['', 'blue', 'green', 'red', 'purple', 'maroon', 'turquoise', 'black', 'gray'];
  return colors[num] || 'black';
}

function winGame() {
  const boardHTML = document.getElementById("board");
  if (boardHTML) {
    boardHTML.style.background = "green";
  }
  isPlaying = false;
  soundWin.play();
}

function loseGame() {
  const boardHTML = document.getElementById("board");
  if (boardHTML) {
    boardHTML.style.background = "red";
  }
  isPlaying = false;
  soundGameover.play();
  showAllMines();
}

function showAllMines() {
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < columns; c++) {
      if (board[c][r].value === -1) {
        const cell = document.getElementById(`cell-${c}-${r}`);
        if (cell) {
          cell.innerHTML = "💣";
          cell.style.color = "black";
        }
      }
    }
  }
}

function newGame() {
  resetVariables();
  generateBoardHTML();
  generateGameBoard();
  placeMinesRandomly();
  addEvents();
  refreshBoard();
}

document.addEventListener("click", () => {
  soundGame.loop = true;
  soundGame.play();
}, { once: true });

function stopBackgroundMusic() {
  soundGame.pause();
  soundGame.currentTime = 0;
}

function resumeBackgroundMusic() {
  soundGame.loop = true;
  soundGame.play();
}

function checkWin() {
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < columns; c++) {
      if (board[c][r].state !== "revealed") {
        if (board[c][r].value !== -1) {
          return false;
        }
      }
    }
  }
  return true;
}

function checkLose() {
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < columns; c++) {
      if (board[c][r].value === -1 && board[c][r].state === "revealed") {
        return true;
      }
    }
  }
  return false;
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
  newGame();
});
