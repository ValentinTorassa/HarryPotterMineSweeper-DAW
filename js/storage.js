"use strict";

// Guarda los datos de una partida en el LocalStorage
function saveGame(playerName, score, duration) {
  var game = {
    playerName: playerName,
    score: score,
    duration: duration,
    date: getCurrentDate(),
    time: getCurrentTime(),
    timestamp: Date.now() // Para ordenamiento por fecha
  };

  var games = JSON.parse(localStorage.getItem("games"));

  if (!games) {
    games = [];
  }

  games.push(game);

  localStorage.setItem("games", JSON.stringify(games));
}

// Devuelve la lista de partidas guardadas
function getSavedGames() {
  var games = JSON.parse(localStorage.getItem("games"));
  if (!games) {
    return [];
  }
  return games;
}

// Ordena las partidas por puntaje (descendente)
function getGamesSortedByScore() {
  var games = getSavedGames();
  return games.sort((a, b) => b.score - a.score);
}

// Ordena las partidas por fecha (más reciente primero)
function getGamesSortedByDate() {
  var games = getSavedGames();
  return games.sort((a, b) => b.timestamp - a.timestamp);
}

// Limpia todos los datos guardados
function clearAllGames() {
  localStorage.removeItem("games");
}

// Obtiene las mejores puntuaciones (top 10)
function getTopScores(limit = 10) {
  var games = getGamesSortedByScore();
  return games.slice(0, limit);
}

// Formatea la duración en formato mm:ss
function formatDuration(seconds) {
  var minutes = Math.floor(seconds / 60);
  var remainingSeconds = seconds % 60;
  return minutes.toString().padStart(2, '0') + ':' + remainingSeconds.toString().padStart(2, '0');
}

// Devuelve la fecha actual en formato dd/mm/aaaa
function getCurrentDate() {
  var today = new Date();
  var day = today.getDate();
  var month = today.getMonth() + 1;
  var year = today.getFullYear();

  return day + '/' + month + '/' + year;
}

// Devuelve la hora actual en formato hh:mm:ss
function getCurrentTime() {
  var now = new Date();
  var hours = now.getHours();
  var minutes = now.getMinutes();
  var seconds = now.getSeconds();

  return hours + ':' + minutes + ':' + seconds;
}
