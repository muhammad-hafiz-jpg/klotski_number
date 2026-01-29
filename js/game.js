/**
 * Main Game Logic
 * Handles game state, moves, and core mechanics
 */

class KlotskiGame {
    constructor() {
        this.gridSize = 3;
        this.tiles = [];
        this.moves = 0;
        this.gameActive = false;
        this.startTime = null;
        this.timerInterval = null;
        this.gameMode = 'classic';
        this.difficulty = 'medium';
        this.modeSettings = {
            classic: { limit: null, type: 'classic' },
            timed: { limit: 60, type: 'time', remaining: 60 },
            moves: { limit: 50, type: 'moves', remaining: 50 },
            zen: { limit: null, type: 'zen' }
        };
    }

    /**
     * Initialize a new game
     */
    initGame() {
        this.tiles = [];
        this.moves = 0;
        this.gameActive = true;
        this.startTime = Date.now();

        // Create solved puzzle
        for (let i = 1; i <= this.gridSize * this.gridSize - 1; i++) {
            this.tiles.push(i);
        }
        this.tiles.push(0); // 0 represents empty

        // Shuffle based on difficulty
        this.shuffleBoard();
        this.render();
        this.startTimer();
    }

    /**
     * Get difficulty settings
     */
    getDifficultySettings() {
        const settings = {
            easy: 50,
            medium: 100,
            hard: 200,
            expert: 500
        };
        return settings[this.difficulty] || 100;
    }

    /**
     * Shuffle the board
     */
    shuffleBoard() {
        const shuffleCount = this.getDifficultySettings();
        for (let i = 0; i < shuffleCount; i++) {
            const emptyIndex = this.tiles.indexOf(0);
            const movableTiles = this.getMovableTiles(emptyIndex);
            const randomIndex = movableTiles[Math.floor(Math.random() * movableTiles.length)];
            [this.tiles[emptyIndex], this.tiles[randomIndex]] = [this.tiles[randomIndex], this.tiles[emptyIndex]];
        }
    }

    /**
     * Get tiles that can move to the empty space
     */
    getMovableTiles(emptyIndex) {
        const movable = [];
        const row = Math.floor(emptyIndex / this.gridSize);
        const col = emptyIndex % this.gridSize;

        // Up
        if (row > 0) movable.push(emptyIndex - this.gridSize);
        // Down
        if (row < this.gridSize - 1) movable.push(emptyIndex + this.gridSize);
        // Left
        if (col > 0) movable.push(emptyIndex - 1);
        // Right
        if (col < this.gridSize - 1) movable.push(emptyIndex + 1);

        return movable;
    }

    /**
     * Handle tile click
     */
    tileClick(index) {
        if (!this.gameActive) return;

        const emptyIndex = this.tiles.indexOf(0);
        const movable = this.getMovableTiles(emptyIndex);

        if (movable.includes(index)) {
            [this.tiles[emptyIndex], this.tiles[index]] = [this.tiles[index], this.tiles[emptyIndex]];
            this.moves++;

            // Update mode-specific counters
            if (this.gameMode === 'timed') {
                // Timer is handled separately
            } else if (this.gameMode === 'moves') {
                this.modeSettings.moves.remaining = this.modeSettings.moves.limit - this.moves;
                if (this.modeSettings.moves.remaining <= 0 && !this.isSolved()) {
                    this.endGame(false, 'Out of moves!');
                }
            }

            this.render();

            if (this.isSolved()) {
                this.endGame(true);
            }
        }
    }

    /**
     * Check if puzzle is solved
     */
    isSolved() {
        for (let i = 0; i < this.tiles.length - 1; i++) {
            if (this.tiles[i] !== i + 1) return false;
        }
        return this.tiles[this.tiles.length - 1] === 0;
    }

    /**
     * Render the game board
     */
    render() {
        const board = document.getElementById('gameBoard');
        board.style.gridTemplateColumns = `repeat(${this.gridSize}, 1fr)`;
        board.innerHTML = '';

        this.tiles.forEach((tile, index) => {
            const tileElement = document.createElement('div');
            tileElement.className = 'tile';
            tileElement.textContent = tile || '';

            if (tile === 0) {
                tileElement.classList.add('empty');
            } else {
                tileElement.classList.add('movable');
                tileElement.onclick = () => this.tileClick(index);
            }

            board.appendChild(tileElement);
        });

        // Update stats
        document.getElementById('moveCount').textContent = this.moves;
    }

    /**
     * Start timer
     */
    startTimer() {
        if (this.timerInterval) clearInterval(this.timerInterval);

        this.timerInterval = setInterval(() => {
            if (!this.gameActive) {
                clearInterval(this.timerInterval);
                return;
            }

            const elapsed = Math.floor((Date.now() - this.startTime) / 1000);

            if (this.gameMode === 'timed') {
                const remaining = Math.max(0, 60 - elapsed);
                this.modeSettings.timed.remaining = remaining;
                document.getElementById('timeCount').textContent = this.formatTime(remaining);

                if (remaining === 0) {
                    this.endGame(false, 'Time\'s up!');
                }
            } else {
                document.getElementById('timeCount').textContent = this.formatTime(elapsed);
            }
        }, 100);
    }

    /**
     * Format time
     */
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }

    /**
     * End game
     */
    endGame(success, message = null) {
        this.gameActive = false;
        if (this.timerInterval) clearInterval(this.timerInterval);

        const messageBox = document.getElementById('messageBox');
        const elapsed = Math.floor((Date.now() - this.startTime) / 1000);

        if (success) {
            messageBox.className = 'message-box success';
            messageBox.textContent = `🎉 Puzzle Solved! Moves: ${this.moves}, Time: ${this.formatTime(elapsed)}`;

            // Save to leaderboard if zen mode
            if (this.gameMode === 'zen') {
                this.saveToLeaderboard(this.gridSize, elapsed);
                this.showLeaderboard();
            }
        } else {
            messageBox.className = 'message-box warning';
            messageBox.textContent = `❌ ${message || 'Game Over!'}`;
        }
    }

    /**
     * Reset game
     */
    reset() {
        if (this.timerInterval) clearInterval(this.timerInterval);
        this.gameActive = false;
        this.initGame();
    }

    /**
     * Save score to leaderboard
     */
    saveToLeaderboard(gridSize, time) {
        const key = `leaderboard_${gridSize}x${gridSize}`;
        let leaderboard = JSON.parse(localStorage.getItem(key) || '[]');

        leaderboard.push({
            time: time,
            moves: this.moves,
            date: new Date().toLocaleDateString(),
            gridSize: gridSize
        });

        // Keep only top 10
        leaderboard.sort((a, b) => a.time - b.time);
        leaderboard = leaderboard.slice(0, 10);

        localStorage.setItem(key, JSON.stringify(leaderboard));
    }

    /**
     * Show leaderboard
     */
    showLeaderboard() {
        const key = `leaderboard_${this.gridSize}x${this.gridSize}`;
        const leaderboard = JSON.parse(localStorage.getItem(key) || '[]');

        const panel = document.getElementById('leaderboardPanel');
        const list = document.getElementById('leaderboardList');

        list.innerHTML = '';
        leaderboard.slice(0, 10).forEach((entry, index) => {
            const item = document.createElement('div');
            item.className = 'leaderboard-item';
            item.innerHTML = `
                <span class="leaderboard-rank">#${index + 1}</span>
                <span>${entry.date} - ${entry.moves} moves</span>
                <span class="leaderboard-score">${this.formatTime(entry.time)}</span>
            `;
            list.appendChild(item);
        });

        panel.style.display = 'block';
    }

    /**
     * Set grid size
     */
    setGridSize(size) {
        this.gridSize = parseInt(size);
    }

    /**
     * Set game mode
     */
    setGameMode(mode) {
        this.gameMode = mode;
        const modeNames = {
            classic: 'Classic',
            timed: 'Timed (60s)',
            moves: 'Move Limited',
            zen: 'Zen Mode'
        };
        document.getElementById('modeDisplay').textContent = modeNames[mode] || 'Classic';
    }

    /**
     * Set difficulty
     */
    setDifficulty(difficulty) {
        this.difficulty = difficulty;
    }
}

// Initialize game
const game = new KlotskiGame();
game.setGridSize(3);
game.initGame();
