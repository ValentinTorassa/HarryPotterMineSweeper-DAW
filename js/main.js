"use strict";

// ---- VARIABLES GLOBALES ----
var rows = 8, columns = 8, mines = 10, flags = 0, isPlaying = true, gameStarted = false;
var board = [];

// ---- SONIDOS ----
var soundWin = new Audio("assets/sounds/winSound.wav");
var soundGameover = new Audio("assets/sounds/AvadaKedavraVoldemort.mp3");
var soundReveal = new Audio("assets/sounds/revealSound.wav");
var soundFlag = new Audio("assets/sounds/flagSound.wav");
var soundGame = new Audio("assets/sounds/harryPotterSound.mp3");

// ---- FUNCIÓN PARA REPRODUCIR SONIDOS SOLO SI LA MÚSICA ESTÁ HABILITADA ----
function playSoundIfEnabled(sound) {
  const musicEnabled = localStorage.getItem('musicEnabled');
  if (musicEnabled === null || musicEnabled === "1") {
    sound.play();
  }
}

// ---- TIMER ----
var timerInterval = null;
var timeElapsed = 0;

// ---- FUNCIONES PRINCIPALES ----
function setDifficulty(level) {
  if (gameStarted) return;
  if (level === 'easy')      { rows = 8;  columns = 8;  mines = 10; }
  else if (level === 'medium'){ rows = 12; columns = 12; mines = 25; }
  else if (level === 'hard') { rows = 16; columns = 16; mines = 40; }
  newGame();
}

function resetVariables() {
  flags = 0;
  isPlaying = true;
  gameStarted = false;
  updateDifficultyButtons();
}


function generateBoardHTML() {
  const boardContainer = document.getElementById('board');
  if (!boardContainer) return;

  boardContainer.innerHTML = '';
  boardContainer.style.display = 'grid';
  boardContainer.style.gridTemplateColumns = `repeat(${columns}, 35px)`; // Acorde a CSS
  boardContainer.style.gap = '1px';
  boardContainer.style.backgroundColor = '#ccc';
  boardContainer.style.padding = '10px';

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < columns; c++) {
      const cell = document.createElement('div');
      cell.id = `cell-${c}-${r}`;
      cell.className = 'cell'; // Usamos la clase del CSS
      boardContainer.appendChild(cell);
    }
  }
}


function generateGameBoard() {
  board = [];
  for (let c = 0; c < columns; c++) {
    board[c] = [];
    for (let r = 0; r < rows; r++) {
      board[c][r] = { value: 0, state: "hidden", revealed: false };
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
  // Calcula los números para las celdas
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
  if (!isPlaying || board[col][row].state === "flagged") return;
  if (!gameStarted) { gameStarted = true; startTimer(); updateDifficultyButtons(); }
  if (board[col][row].value === -1) { loseGame(); stopTimer(); return; }
  revealCell(col, row);
  if (checkWin()) { winGame(); stopTimer(); }
}

function handleRightClick(col, row) {
  if (!isPlaying || board[col][row].state === "revealed") return;

  if (board[col][row].state === "flagged") {
    board[col][row].state = "hidden";
    flags--;
    playSoundIfEnabled(soundFlag);
  } else {
    // Contar banderas actuales
    var totalFlags = 0;
    for (let c = 0; c < columns; c++) {
      for (let r = 0; r < rows; r++) {
        if (board[c][r].state === "flagged") totalFlags++;
      }
    }
    // Solo permitir poner bandera si no se excede el límite de minas
    if (totalFlags < mines) {
      board[col][row].state = "flagged";
      flags++;
      playSoundIfEnabled(soundFlag);
    }
  }
  updateFlagCounter();
  refreshBoard();
}



function revealCell(col, row) {
  if (board[col][row].state === "revealed" || board[col][row].state === "flagged") return;
  board[col][row].state = "revealed";
  board[col][row].revealed = true;
  playSoundIfEnabled(soundReveal);
  if (board[col][row].value === 0) { revealAdjacentCells(col, row); }
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
          cell.classList.add("revealed"); // agrego para que lo que se revelo se vea gris
          cell.style.backgroundColor = "";
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
          cell.innerHTML = '<img src="assets/img/goldenSnitch2.png" alt="Snitch Dorada" class="icon-flag">';
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

// ---- TIMER Y CONTADOR ----
function startTimer() {
  if (timerInterval) clearInterval(timerInterval);
  timeElapsed = 0;
  updateTimerDisplay();
  timerInterval = setInterval(function() {
    if (timeElapsed < 999) {
      timeElapsed++;
      updateTimerDisplay();
    }
  }, 1000);
}
function stopTimer() {
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = null;
}
function updateTimerDisplay() {
  var timer = document.getElementById('timer');
  if (timer) timer.textContent = timeElapsed.toString().padStart(3, '0');
}
function updateFlagCounter() {
  var totalFlags = 0;
  for (let c = 0; c < columns; c++) {
    for (let r = 0; r < rows; r++) {
      if (board[c][r].state === "flagged") totalFlags++;
    }
  }
  document.getElementById('mineCount').textContent = (mines - totalFlags);
}

// ---- LÓGICA DE VICTORIA/DERROTA ----
function winGame() {
  const boardHTML = document.getElementById("board");
  if (boardHTML) boardHTML.style.background = "green";
  isPlaying = false;
  playSoundIfEnabled(soundWin);
  stopTimer();
  showResultGif(true);
  
  // Mostrar modal para registrar puntuación después de un breve delay
  setTimeout(() => {
    showPlayerNameModal();
  }, 2000);
}
function loseGame() {
  const boardHTML = document.getElementById("board");
  if (boardHTML) boardHTML.style.background = "red";
  isPlaying = false;
  playSoundIfEnabled(soundGameover);
  stopTimer();
  showAllMines();
  showResultGif(false);
}
function showAllMines() {
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < columns; c++) {
      if (board[c][r].value === -1) {
        const cell = document.getElementById(`cell-${c}-${r}`);
        if (cell) {
          cell.innerHTML = '<img src="assets/img/deathlyHallows.png" alt="Bomba" class="icon-bomb">';
          cell.style.color = "black";
        }
      }
    }
  }
}

function checkWin() {
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < columns; c++) {
      if (board[c][r].state !== "revealed" && board[c][r].value !== -1) {
        return false;
      }
    }
  }
  return true;
}

// ---- GIF DE RESULTADO ----
function showResultGif(win) {
  var modal = document.getElementById('resultGifModal');
  var img = document.getElementById('resultGifImage');
  var text = document.getElementById('resultGifText');
  if (win) {
    img.src = 'assets/img/snapeApproves.gif';
    text.textContent = '¡Felicidades, ganaste!';
  } else {
    img.src = 'assets/img/avadaKadavra.gif';
    text.textContent = '¡Game Over!';
  }
  modal.classList.add('active');
}

// ---- MUSICA DE FONDO ----

function stopBackgroundMusic() {
  soundGame.pause();
  soundGame.currentTime = 0;
}
function resumeBackgroundMusic() {
  soundGame.loop = true;
  soundGame.play();
}

// ---- NUEVO JUEGO ----
function newGame() {
  resetVariables();
  generateBoardHTML();
  generateGameBoard();
  placeMinesRandomly();
  addEvents();
  refreshBoard();
  updateFlagCounter();
  stopTimer();
  timeElapsed = 0;
  updateTimerDisplay();
  document.getElementById('timer').textContent = "0";
  const boardHTML = document.getElementById("board");
  if (boardHTML) boardHTML.style.background = ""; // Reset board bg color
}

// ---- LISTENERS Y EVENTOS ----
document.addEventListener('DOMContentLoaded', function() {
  newGame();
  updateFlagCounter();
  updateTimerDisplay();
  document.getElementById('closeGifModalBtn').onclick = function() {
    document.getElementById('resultGifModal').classList.remove('active');
  };
  document.getElementById('easyBtn').onclick = function() { setDifficulty('easy'); };
  document.getElementById('mediumBtn').onclick = function() { setDifficulty('medium'); };
  document.getElementById('hardBtn').onclick = function() { setDifficulty('hard'); };
  document.getElementById('resetBtn').onclick = function() { newGame(); };
  document.getElementById('rankingBtn').onclick = function() { showRanking(); };
  document.getElementById('closeRankingBtn').onclick = function() { closeRanking(); };
  document.getElementById('sortByScoreBtn').onclick = function() { sortByScore(); };
  document.getElementById('sortByDateBtn').onclick = function() { sortByDate(); };
  document.getElementById('clearRankingBtn').onclick = function() { clearRanking(); };
  document.getElementById('savePlayerScoreBtn').onclick = function() { savePlayerScore(); };
  document.getElementById('closePlayerNameBtn').onclick = function() { closePlayerNameModal(); };
});

// ---- FUNCIONES PARA EL MODAL DE JUGADOR ----
function showPlayerNameModal() {
  const score = calculateScore();
  const finalTime = formatDuration(timeElapsed);
  
  document.getElementById('finalScore').textContent = score;
  document.getElementById('finalTime').textContent = finalTime;
  document.getElementById('playerNameInput').value = '';
  document.getElementById('playerNameModal').style.display = 'block';
  document.getElementById('playerNameInput').focus();
}

function closePlayerNameModal() {
  document.getElementById('playerNameModal').style.display = 'none';
}

function savePlayerScore() {
  const playerName = document.getElementById('playerNameInput').value.trim();
  
  if (playerName === '') {
    alert('Por favor ingresa tu nombre.');
    return;
  }
  
  const score = calculateScore();
  saveGame(playerName, score, timeElapsed);
  closePlayerNameModal();
  alert('¡Puntuación guardada exitosamente!');
}

function calculateScore() {
  const baseScore = 1000;
  const timePenalty = timeElapsed * 2;
  const difficultyBonus = mines * 10;
  
  return Math.max(0, baseScore - timePenalty + difficultyBonus);
}

function formatDuration(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return minutes.toString().padStart(2, '0') + ':' + remainingSeconds.toString().padStart(2, '0');
}


function updateDifficultyButtons() {
  const easyBtn = document.getElementById('easyBtn');
  const mediumBtn = document.getElementById('mediumBtn');
  const hardBtn = document.getElementById('hardBtn');
  
  if (easyBtn && mediumBtn && hardBtn) {
    if (gameStarted) {
      easyBtn.disabled = true;
      mediumBtn.disabled = true;
      hardBtn.disabled = true;
      easyBtn.style.opacity = '0.5';
      mediumBtn.style.opacity = '0.5';
      hardBtn.style.opacity = '0.5';
    } else {
      easyBtn.disabled = false;
      mediumBtn.disabled = false;
      hardBtn.disabled = false;
      easyBtn.style.opacity = '1';
      mediumBtn.style.opacity = '1';
      hardBtn.style.opacity = '1';
    }
  }
}
