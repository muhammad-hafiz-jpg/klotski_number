/**
 * Utility Functions
 */

/**
 * Get game statistics
 */
function getGameStats(gridSize) {
    const key = `leaderboard_${gridSize}x${gridSize}`;
    const leaderboard = JSON.parse(localStorage.getItem(key) || '[]');
    
    if (leaderboard.length === 0) {
        return null;
    }

    const times = leaderboard.map(e => e.time);
    const moves = leaderboard.map(e => e.moves);

    return {
        totalGames: leaderboard.length,
        bestTime: Math.min(...times),
        bestMoves: Math.min(...moves),
        averageTime: Math.round(times.reduce((a, b) => a + b, 0) / times.length),
        averageMoves: Math.round(moves.reduce((a, b) => a + b, 0) / moves.length)
    };
}

/**
 * Clear all statistics
 */
function clearAllStats() {
    if (confirm('Are you sure you want to clear all statistics?')) {
        for (let size = 2; size <= 10; size++) {
            localStorage.removeItem(`leaderboard_${size}x${size}`);
        }
        alert('All statistics cleared!');
    }
}

/**
 * Export statistics as JSON
 */
function exportStats() {
    const stats = {};
    for (let size = 2; size <= 10; size++) {
        const key = `leaderboard_${size}x${size}`;
        const data = localStorage.getItem(key);
        if (data) {
            stats[`${size}x${size}`] = JSON.parse(data);
        }
    }

    const dataStr = JSON.stringify(stats, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'klotski_stats.json';
    link.click();
    URL.revokeObjectURL(url);
}

/**
 * Get hint - show a hint about possible next move
 */
function getHint() {
    if (!game.gameActive) {
        alert('Game is not active!');
        return;
    }

    const emptyIndex = game.tiles.indexOf(0);
    const movable = game.getMovableTiles(emptyIndex);

    if (movable.length > 0) {
        const hintIndex = movable[0];
        const tileValue = game.tiles[hintIndex];
        const messageBox = document.getElementById('messageBox');
        messageBox.className = 'message-box info';
        messageBox.textContent = `💡 Hint: Try moving tile ${tileValue}!`;
    }
}

/**
 * Validate if puzzle configuration is solvable
 * (For 8-puzzle and larger, not all configurations are solvable)
 */
function isSolvable(tiles, gridSize) {
    // Count inversions
    let inversions = 0;
    for (let i = 0; i < tiles.length - 1; i++) {
        for (let j = i + 1; j < tiles.length; j++) {
            if (tiles[i] !== 0 && tiles[j] !== 0 && tiles[i] > tiles[j]) {
                inversions++;
            }
        }
    }

    // For odd-sized grids, solvable if even inversions
    if (gridSize % 2 === 1) {
        return inversions % 2 === 0;
    }

    // For even-sized grids, check blank row position
    const blankRow = Math.floor(tiles.indexOf(0) / gridSize);
    return (inversions + blankRow) % 2 === 1;
}

/**
 * Generate solvable puzzle
 */
function generateSolvablePuzzle(gridSize) {
    let tiles = [];
    for (let i = 1; i <= gridSize * gridSize - 1; i++) {
        tiles.push(i);
    }
    tiles.push(0);

    // Fisher-Yates shuffle
    for (let i = tiles.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [tiles[i], tiles[j]] = [tiles[j], tiles[i]];
    }

    // Ensure solvable
    while (!isSolvable(tiles, gridSize)) {
        for (let i = tiles.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [tiles[i], tiles[j]] = [tiles[j], tiles[i]];
        }
    }

    return tiles;
}

/**
 * Get recommended difficulty based on grid size
 */
function getRecommendedDifficulty(gridSize) {
    if (gridSize <= 3) return 'easy';
    if (gridSize <= 5) return 'medium';
    if (gridSize <= 7) return 'hard';
    return 'expert';
}

/**
 * Format percentage
 */
function formatPercent(value) {
    return Math.round(value * 100) / 100;
}

/**
 * Get solver - returns minimum moves to solve (if available)
 */
function getSolverHint(gridSize) {
    const stats = getGameStats(gridSize);
    if (stats && stats.bestMoves) {
        const messageBox = document.getElementById('messageBox');
        messageBox.className = 'message-box info';
        messageBox.textContent = `📊 Best solution: ${stats.bestMoves} moves in ${formatTime(stats.bestTime)}`;
    }
}

/**
 * Format time helper
 */
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

/**
 * Undo last move (placeholder - requires move history)
 */
function undoMove() {
    if (game.moveHistory && game.moveHistory.length > 0) {
        game.tiles = game.moveHistory.pop();
        game.moves--;
        game.render();
    }
}

/**
 * Toggle fullscreen
 */
function toggleFullscreen() {
    const elem = document.documentElement;
    if (!document.fullscreenElement) {
        elem.requestFullscreen().catch(err => {
            alert(`Error attempting to enable fullscreen: ${err.message}`);
        });
    } else {
        document.exitFullscreen();
    }
}
