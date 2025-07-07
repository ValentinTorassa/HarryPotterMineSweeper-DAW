"use strict";
// Variables globales para el ranking
var currentSortOrder = 'score'; // 'score' o 'date'
var pendingScore = null;
var pendingDuration = null;

// Guarda los datos de una partida en el LocalStorage
function saveGame(playerName, score, duration) {
  var game = {
    playerName: playerName || "Player",
    score: score,
    duration: duration,
    date: getCurrentDate(),
    time: getCurrentTime(),
    timestamp: Date.now()
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

// Devuelve la hora actual en formato hh:mm
function getCurrentTime() {
  var now = new Date();
  var hours = now.getHours();
  var minutes = now.getMinutes();

  return hours.toString().padStart(2, '0') + ':' + minutes.toString().padStart(2, '0');
}
//MANEJO DEL RANKING CON MODAL

// Muestra el modal del ranking
function showRanking() {
    document.getElementById('rankingModal').style.display = 'block';
    updateRankingTable();
}

// Cerrar el modal del ranking
function closeRanking() {
    document.getElementById('rankingModal').style.display = 'none';
}

// Ordena el ranking por puntaje
function sortByScore() {
    currentSortOrder = 'score';
    updateRankingTable();
}

// Ordena el ranking por fecha
function sortByDate() {
    currentSortOrder = 'date';
    updateRankingTable();
}

// Limpia todo el ranking
function clearRanking() {
    if (confirm('¿Estás seguro de que quieres eliminar todo el ranking? Esta acción no se puede deshacer.')) {
        clearAllGames();
        updateRankingTable();
    }
}

// Actualiza la tabla del ranking
function updateRankingTable() {
    var games = currentSortOrder === 'score' ? getGamesSortedByScore() : getGamesSortedByDate();
    var tableContainer = document.getElementById('rankingTable');
    
    if (games.length === 0) {
        tableContainer.innerHTML = '<div class="no-games">No hay partidas guardadas aún. ¡Juega una partida para aparecer en el ranking!</div>';
        return;
    }
    
    var tableHTML = '<table class="ranking-table">';
    tableHTML += '<thead><tr>';
    tableHTML += '<th>#</th>';
    tableHTML += '<th>Jugador</th>';
    tableHTML += '<th>Puntaje</th>';
    tableHTML += '<th>Duración</th>';
    tableHTML += '<th>Fecha</th>';
    tableHTML += '<th>Hora</th>';
    tableHTML += '</tr></thead>';
    tableHTML += '<tbody>';
    
    games.forEach(function(game, index) {
        var rowClass = index < 3 ? 'top-player' : '';
        tableHTML += '<tr class="' + rowClass + '">';
        tableHTML += '<td>' + (index + 1) + '</td>';
        tableHTML += '<td>' + escapeHtml(game.playerName) + '</td>';
        tableHTML += '<td>' + game.score + '</td>';
        tableHTML += '<td>' + formatDuration(game.duration) + '</td>';
        tableHTML += '<td>' + game.date + '</td>';
        tableHTML += '<td>' + game.time + '</td>';
        tableHTML += '</tr>';
    });
    
    tableHTML += '</tbody></table>';
    tableContainer.innerHTML = tableHTML;
}

// Muestra el modal para ingresar el nombre del jugador
function showPlayerNameModal(score, duration) {
    pendingScore = score;
    pendingDuration = duration;
    document.getElementById('playerNameInput').value = '';
    document.getElementById('playerNameModal').style.display = 'block';
    document.getElementById('playerNameInput').focus();
}

// Cierra el modal del nombre del jugador
function closePlayerNameModal() {
    document.getElementById('playerNameModal').style.display = 'none';
    pendingScore = null;
    pendingDuration = null;
}

// Guarda la puntuación del jugador
function savePlayerScore() {
    var playerName = document.getElementById('playerNameInput').value.trim();
    
    if (playerName === '') {
        alert('Por favor ingresa tu nombre.');
        return;
    }
    
    if (pendingScore !== null && pendingDuration !== null) {
        saveGame(playerName, pendingScore, pendingDuration);
        closePlayerNameModal();
        alert('¡Puntuación guardada exitosamente!');
    }
}

// Escapa caracteres HTML para prevenir XSS
function escapeHtml(text) {
    var map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, function(m) { return map[m]; });
}

// Maneja la tecla Enter en el input del nombre
document.addEventListener('DOMContentLoaded', function() {
    var playerNameInput = document.getElementById('playerNameInput');
    if (playerNameInput) {
        playerNameInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                savePlayerScore();
            }
        });
    }
    
    // Cerrar modales al hacer clic fuera de ellos
    window.addEventListener('click', function(e) {
        var rankingModal = document.getElementById('rankingModal');
        var playerNameModal = document.getElementById('playerNameModal');
        
        if (e.target === rankingModal) {
            closeRanking();
        }
        
        if (e.target === playerNameModal) {
            closePlayerNameModal();
        }
    });
});
