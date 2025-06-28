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

}