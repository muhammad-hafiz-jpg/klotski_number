/**
 * Settings and UI Controls
 */

function handleGridSizeChange() {
    const size = document.getElementById('gridSize').value;
    game.setGridSize(size);
    document.getElementById('leaderboardPanel').style.display = 'none';
}

function handleGameModeChange() {
    const mode = document.getElementById('gameMode').value;
    game.setGameMode(mode);
    document.getElementById('leaderboardPanel').style.display = 'none';
}

function handleDifficultyChange() {
    const difficulty = document.getElementById('difficulty').value;
    game.setDifficulty(difficulty);
}

function handleBackgroundColorChange() {
    const color = document.getElementById('bgColor').value;
    const root = document.documentElement;
    const bgColor1 = color;
    const bgColor2 = adjustBrightness(color, -20);
    document.body.style.background = `linear-gradient(135deg, ${bgColor1} 0%, ${bgColor2} 100%)`;
}

function handleTileColorChange() {
    const color = document.getElementById('tileColor').value;
    const color1 = color;
    const color2 = adjustBrightness(color, -30);
    const tiles = document.querySelectorAll('.tile');
    const style = document.createElement('style');
    style.innerHTML = `
        .tile {
            background: linear-gradient(135deg, ${color1} 0%, ${color2} 100%) !important;
        }
        .tile.movable {
            background: linear-gradient(135deg, ${adjustBrightness(color1, 30)} 0%, ${adjustBrightness(color2, 20)} 100%) !important;
        }
    `;
    // Remove previous tile color style if exists
    const prevStyle = document.getElementById('tile-color-style');
    if (prevStyle) prevStyle.remove();
    style.id = 'tile-color-style';
    document.head.appendChild(style);
    
    // Update stat items color too
    const statItems = document.querySelectorAll('.stat-item');
    const statStyle = document.createElement('style');
    statStyle.innerHTML = `
        .stat-item {
            background: linear-gradient(135deg, ${color1} 0%, ${color2} 100%) !important;
        }
    `;
    const prevStatStyle = document.getElementById('stat-color-style');
    if (prevStatStyle) prevStatStyle.remove();
    statStyle.id = 'stat-color-style';
    document.head.appendChild(statStyle);
}

function handleFontFamilyChange() {
    const font = document.getElementById('fontFamily').value;
    document.body.style.fontFamily = font;
    localStorage.setItem('selectedFont', font);
}

function handleFontSizeChange() {
    const size = document.getElementById('fontSize').value;
    document.documentElement.style.fontSize = size + 'px';
    document.getElementById('fontSizeValue').textContent = size + 'px';
    localStorage.setItem('fontSize', size);
}

function adjustBrightness(color, percent) {
    const num = parseInt(color.replace("#",""), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.max(0, Math.min(255, (num >> 16) + amt));
    const G = Math.max(0, Math.min(255, (num >> 8 & 0x00FF) + amt));
    const B = Math.max(0, Math.min(255, (num & 0x0000FF) + amt));
    return "#" + (0x1000000 + (R < 16 ? 0 : 0) * 0x1000000 + 
            (R << 16) + (G < 16 ? 0 : 0) * 0x100000 + 
            (G << 8) + (B < 16 ? 0 : 0) * 0x1000 + B).toString(16).slice(1);
}

function loadSettings() {
    const savedFont = localStorage.getItem('selectedFont');
    const savedFontSize = localStorage.getItem('fontSize');
    const savedBgColor = localStorage.getItem('bgColor');
    const savedTileColor = localStorage.getItem('tileColor');
    
    if (savedFont) {
        document.getElementById('fontFamily').value = savedFont;
        document.body.style.fontFamily = savedFont;
    }
    
    if (savedFontSize) {
        document.getElementById('fontSize').value = savedFontSize;
        document.documentElement.style.fontSize = savedFontSize + 'px';
        document.getElementById('fontSizeValue').textContent = savedFontSize + 'px';
    }
    
    if (savedBgColor) {
        document.getElementById('bgColor').value = savedBgColor;
        handleBackgroundColorChange();
    }
    
    if (savedTileColor) {
        document.getElementById('tileColor').value = savedTileColor;
        handleTileColorChange();
    }
}

function saveCurrentSettings() {
    localStorage.setItem('bgColor', document.getElementById('bgColor').value);
    localStorage.setItem('tileColor', document.getElementById('tileColor').value);
}

function startNewGame() {
    game.reset();
    toggleSettings();
    clearMessage();
    document.getElementById('leaderboardPanel').style.display = 'none';
}

function resetGame() {
    game.reset();
    clearMessage();
}

function toggleSettings() {
    const panel = document.querySelector('.settings-panel');
    panel.classList.toggle('active');
    if (panel.classList.contains('active')) {
        saveCurrentSettings();
    }
}

function clearMessage() {
    const messageBox = document.getElementById('messageBox');
    messageBox.textContent = '';
    messageBox.className = 'message-box';
}

/**
 * Initialize game on page load
 */
document.addEventListener('DOMContentLoaded', function() {
    // Load saved settings
    loadSettings();
    
    // Settings panel starts closed
    const panel = document.querySelector('.settings-panel');
    panel.classList.remove('active');
    
    // Add keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Press 'S' to toggle settings
        if (e.key === 's' || e.key === 'S') {
            toggleSettings();
        }
        // Press 'R' to reset
        if (e.key === 'r' || e.key === 'R') {
            resetGame();
        }
        // Press 'N' for new game
        if (e.key === 'n' || e.key === 'N') {
            startNewGame();
        }
    });
});

/**
 * Keyboard navigation for tiles (Arrow keys)
 */
document.addEventListener('keydown', function(e) {
    if (!game.gameActive) return;

    const emptyIndex = game.tiles.indexOf(0);
    const row = Math.floor(emptyIndex / game.gridSize);
    const col = emptyIndex % game.gridSize;
    let targetIndex = null;

    // Arrow up - move tile from below
    if (e.key === 'ArrowUp' && row < game.gridSize - 1) {
        targetIndex = emptyIndex + game.gridSize;
    }
    // Arrow down - move tile from above
    if (e.key === 'ArrowDown' && row > 0) {
        targetIndex = emptyIndex - game.gridSize;
    }
    // Arrow left - move tile from right
    if (e.key === 'ArrowLeft' && col < game.gridSize - 1) {
        targetIndex = emptyIndex + 1;
    }
    // Arrow right - move tile from left
    if (e.key === 'ArrowRight' && col > 0) {
        targetIndex = emptyIndex - 1;
    }

    if (targetIndex !== null) {
        e.preventDefault();
        game.tileClick(targetIndex);
    }
});
