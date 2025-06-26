"use strict";

var rows = 8;
var columns = 8;
var mines = 10;
var flags = 0;
var isPlaying = true;
var gameStarted = false;
var level;

var board = [];

// Sounds
var soundWin1 = new Audio("winner_sound.ogg");
var soundWin2 = new Audio("win_sound.ogg");
var soundLose1 = new Audio("loser_sound.ogg");
var soundGameover = new Audio("gameover_sound.ogg");
var soundReveal = new Audio("reveal_sound.ogg");
var soundNewgame = new Audio("newgame_sound.ogg");
var soundOpenarea = new Audio("openarea_sound.ogg");
var soundFlag = new Audio("flag_sound.ogg");

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
function newGame() {
  sound_newgame.play();
  resetVariables();

  generateBoardHTML(); //Gernera la estructura visual de la matriz
  generateGameBoard(); //Se encarga de generar las minas y los números para que sean descubiertos
  placeMinesRandomly();

  addEvents();  //se añaden los eventos de mouse para las celdas
  refreshBoard(); //Se encarga del comportamiento lógico para mostrar los elementos
}
























function checkWin() {
  /*
  We need to verify that all mines are still hidden
  and all other cells are discovered
  */
  for (var r = 0; r < rows; r++) {
    for (var c = 0; c < columns; c++) {
      if (board[c][r].state != "revealed") {
        if (board[c][r].value == -1) {
          // It's a mine, we're good
          continue;
        } else {
          // Found a covered cell that is not a mine, game not won yet
          return;
        }
      }
    }
  }

  // If all covered cells are mines, player has won
  var boardHTML = document.getElementById("board");
  boardHTML.style.background = "green";
  isPlaying = false;
  sound_win1.play();
  sound_win2.play();
  // localStorage can be called here
}

function checkLose() {
  for (var r = 0; r < rows; r++) {
    for (var c = 0; c < columns; c++) {
      // If a mine is revealed, the player has lost
      if (board[c][r].value == -1) {
        if (board[c][r].state == "revealed") {
          var boardHTML = document.getElementById("board");
          boardHTML.style.background = "red";
          isPlaying = false;
          sound_lose1.play();
          sound_gameover.play();
        }
      }
    }
  }

  if (isPlaying) {
    return;
  }

  // Show all hidden mines
  for (var r = 0; r < rows; r++) {
    for (var c = 0; c < columns; c++) {
      if (board[c][r].value == -1) {
        var cell = document.getElementById(`cell-${c}-${r}`);
        cell.innerHTML = `<i class="fas fa-bomb"></i>`;
        cell.style.color = "black";
      }
    }
  }
}

newGame();
