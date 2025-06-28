"use strict";

class Buscaminas {
    constructor() {
        // Configuración inicial del juego
        this.rows = 8;
        this.columns = 8;
        this.mines = 10;
        this.flags = 0;
        this.isPlaying = true;
        this.gameStarted = false;
        this.board = [];
        this.startTime = null;
        this.elapsedTime = 0;
        this.timer = null;
    }

    // Inicializa una nueva partida*/
    newGame() {
        this.resetVariables();
        this.generateBoard();
        this.placeMinesRandomly();
        this.calculateNumbers();
        this.startTimer();
        this.updateInterface();
    }

    // Reinicia todas las variables del juego
    resetVariables() {
        this.flags = 0;
        this.isPlaying = true;
        this.gameStarted = false;
        this.elapsedTime = 0;
        this.board = [];
        
        // Limpiar temporizador anterior si existe
        if (this.timer) {
            clearInterval(this.timer);
        }
    }

    // Genera la estructura del tablero vacío
    generateBoard() {
        for (let col = 0; col < this.columns; col++) {
            this.board[col] = [];
            for (let row = 0; row < this.rows; row++) {
                this.board[col][row] = {
                    value: 0,           // -1 = mina, 0-8 = número de minas adyacentes
                    state: "hidden",    // hidden, revealed, flagged
                    revealed: false
                };
            }
        }
    }

    // Coloca las minas en posiciones aleatorias del tablero
    placeMinesRandomly() {
        let minesPlaced = 0;
        
        while (minesPlaced < this.mines) {
            const col = Math.floor(Math.random() * this.columns);
            const row = Math.floor(Math.random() * this.rows);
            
            // Solo colocar mina si la celda está vacía
            if (this.board[col][row].value !== -1) {
                this.board[col][row].value = -1;
                minesPlaced++;
            }
        }
    }

    // Calcula los números para cada celda basándose en las minas adyacentes
    calculateNumbers() {
        for (let col = 0; col < this.columns; col++) {
            for (let row = 0; row < this.rows; row++) {
                // Solo calcular para celdas que no son minas
                if (this.board[col][row].value !== -1) {
                    this.board[col][row].value = this.countAdjacentMines(col, row);
                }
            }
        }
    }

    // Cuenta las minas en las celdas adyacentes a una posición dada
    countAdjacentMines(col, row) {
        let count = 0;
        
        // Revisar las 8 celdas adyacentes
        for (let dCol = -1; dCol <= 1; dCol++) {
            for (let dRow = -1; dRow <= 1; dRow++) {
                const newCol = col + dCol;
                const newRow = row + dRow;
                
                // Verificar que la posición esté dentro del tablero
                if (this.isValidPosition(newCol, newRow)) {
                    if (this.board[newCol][newRow].value === -1) {
                        count++;
                    }
                }
            }
        }
        
        return count;
    }

    // Verifica si una posición está dentro de los límites del tablero
 isValidPosition(col, row) {
    return col >= 0 && col < this.columns && row >= 0 && row < this.rows;
    }

    // Maneja el clic izquierdo en una celda
    handleClick(col, row) {
        if (!this.isPlaying || this.board[col][row].state === "flagged") {
            return;
        }

        // Marcar que el juego ha comenzado
        if (!this.gameStarted) {
            this.gameStarted = true;
        }

        // Si es una mina, perder
        if (this.board[col][row].value === -1) {
            this.loseGame();
            return;
        }

        // Revelar la celda
        this.revealCell(col, row);
        
        // Verificar si ganó
        if (this.checkWin()) {
            this.winGame();
        }
    }

    // Maneja el clic derecho para colocar/quitar bandera
    toggleFlag(col, row) {
        if (!this.isPlaying || this.board[col][row].state === "revealed") {
            return;
        }

        if (this.board[col][row].state === "flagged") {
            // Quitar bandera
            this.board[col][row].state = "hidden";
            this.flags--;
        } else {
            // Colocar bandera
            this.board[col][row].state = "flagged";
            this.flags++;
        }

        this.updateInterface();
    }

    // Revela una celda y sus adyacentes si es necesario
    revealCell(col, row) {
        // Si ya está revelada o tiene bandera, no hacer nada
        if (this.board[col][row].state === "revealed" || 
            this.board[col][row].state === "flagged") {
            return;
        }

        // Revelar la celda actual
        this.board[col][row].state = "revealed";
        this.board[col][row].revealed = true;

        // Si la celda no tiene minas adyacentes, revelar celdas vecinas
        if (this.board[col][row].value === 0) {
            this.revealAdjacentCells(col, row);
        }

        this.updateInterface();
    }

    // Revela todas las celdas adyacentes a una celda vacía
    revealAdjacentCells(col, row) {
        for (let dCol = -1; dCol <= 1; dCol++) {
            for (let dRow = -1; dRow <= 1; dRow++) {
                const newCol = col + dCol;
                const newRow = row + dRow;
                
                if (this.isValidPosition(newCol, newRow)) {
                    this.revealCell(newCol, newRow);
                }
            }
        }
}

    // Verifica si el jugador ha ganado
    checkWin() {
        for (let col = 0; col < this.columns; col++) {
            for (let row = 0; row < this.rows; row++) {
                // Si hay una celda no revelada que no es mina, aún no ganó
                if (this.board[col][row].state !== "revealed" && 
                    this.board[col][row].value !== -1) {
                    return false;
                }
            }
        }
        return true;
    }

    // Maneja la victoria del jugador
    winGame() {
        this.isPlaying = false;
        this.stopTimer();
        
        // Mostrar todas las minas con banderas
        this.showAllMines();
        
        // Guardar puntuación
        this.saveScore();
        
        // Notificar victoria
        this.showMessage("¡Felicidades! ¡Has ganado!");
    }

    // Maneja la derrota del jugador
    loseGame() {
        this.isPlaying = false;
        this.stopTimer();
        
        // Mostrar todas las minas
        this.showAllMines();
        
        // Notificar derrota
        this.showMessage("¡Game Over! Has perdido.");
    }

    // Muestra todas las minas en el tablero
    showAllMines() {
        for (let col = 0; col < this.columns; col++) {
            for (let row = 0; row < this.rows; row++) {
                if (this.board[col][row].value === -1) {
                    this.board[col][row].state = "revealed";
                }
            }
        }
        this.updateInterface();
    }

}