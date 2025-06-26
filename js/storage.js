"use strict";
// Guarda los datos de una partida en el LocalStorage
function saveGame(playerName, score, duration) {
  var game = {
    playerName: playerName,
    score: score,
    duration: duration,
    date: getCurrentDate(),
    time: getCurrentTime()
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
