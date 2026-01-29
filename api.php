<?php
/**
 * Klotski Number Game - PHP Backend
 * Handles game logic, validation, and statistics
 */

header('Content-Type: application/json');

class KlotskiAPI {
    private $db;
    
    public function __construct() {
        // Initialize database connection if needed
        // $this->db = new PDO('...');
    }

    /**
     * Validate move
     */
    public function validateMove($gridSize, $tiles, $moveIndex) {
        if (!is_array($tiles) || count($tiles) !== $gridSize * $gridSize) {
            return ['valid' => false, 'error' => 'Invalid tiles array'];
        }

        $emptyIndex = array_search(0, $tiles);
        $movable = $this->getMovableTiles($emptyIndex, $gridSize);

        if (!in_array($moveIndex, $movable)) {
            return ['valid' => false, 'error' => 'Invalid move'];
        }

        return ['valid' => true];
    }

    /**
     * Get movable tiles
     */
    private function getMovableTiles($emptyIndex, $gridSize) {
        $movable = [];
        $row = floor($emptyIndex / $gridSize);
        $col = $emptyIndex % $gridSize;

        if ($row > 0) $movable[] = $emptyIndex - $gridSize;
        if ($row < $gridSize - 1) $movable[] = $emptyIndex + $gridSize;
        if ($col > 0) $movable[] = $emptyIndex - 1;
        if ($col < $gridSize - 1) $movable[] = $emptyIndex + 1;

        return $movable;
    }

    /**
     * Check if puzzle is solved
     */
    public function isSolved($tiles) {
        $size = count($tiles);
        for ($i = 0; $i < $size - 1; $i++) {
            if ($tiles[$i] !== $i + 1) return false;
        }
        return $tiles[$size - 1] === 0;
    }

    /**
     * Generate solvable puzzle using permutation algorithm
     */
    public function generatePuzzle($gridSize, $difficulty = 'medium') {
        $tiles = [];
        for ($i = 1; $i < $gridSize * $gridSize; $i++) {
            $tiles[] = $i;
        }
        $tiles[] = 0;

        // Shuffle with difficulty level
        $shuffleCount = [
            'easy' => 50,
            'medium' => 100,
            'hard' => 200,
            'expert' => 500
        ][$difficulty] ?? 100;

        for ($i = 0; $i < $shuffleCount; $i++) {
            $emptyIndex = array_search(0, $tiles);
            $movable = $this->getMovableTiles($emptyIndex, $gridSize);
            $randomIndex = $movable[array_rand($movable)];
            
            [$tiles[$emptyIndex], $tiles[$randomIndex]] = [$tiles[$randomIndex], $tiles[$emptyIndex]];
        }

        return $tiles;
    }

    /**
     * Calculate minimum moves (theoretical for larger puzzles)
     * Uses Manhattan distance heuristic
     */
    public function calculateMinMoves($tiles, $gridSize) {
        $distance = 0;
        $size = count($tiles);

        for ($i = 0; $i < $size; $i++) {
            if ($tiles[$i] === 0) continue;

            $targetIndex = $tiles[$i] - 1;
            $currentRow = floor($i / $gridSize);
            $currentCol = $i % $gridSize;
            $targetRow = floor($targetIndex / $gridSize);
            $targetCol = $targetIndex % $gridSize;

            $distance += abs($currentRow - $targetRow) + abs($currentCol - $targetCol);
        }

        return ceil($distance / 2); // Divided by 2 as approximation
    }

    /**
     * Get game statistics
     */
    public function getStatistics($gridSize) {
        $key = "stats_{$gridSize}x{$gridSize}";
        $stats = json_decode(file_get_contents("data/{$key}.json") ?? '[]', true);

        if (empty($stats)) {
            return [
                'totalGames' => 0,
                'bestTime' => null,
                'bestMoves' => null,
                'averageTime' => null,
                'averageMoves' => null
            ];
        }

        $times = array_column($stats, 'time');
        $moves = array_column($stats, 'moves');

        return [
            'totalGames' => count($stats),
            'bestTime' => min($times),
            'bestMoves' => min($moves),
            'averageTime' => array_sum($times) / count($times),
            'averageMoves' => array_sum($moves) / count($moves),
            'leaderboard' => array_slice($stats, 0, 10)
        ];
    }

    /**
     * Save game result
     */
    public function saveResult($gridSize, $time, $moves, $gameMode = 'classic') {
        $key = "stats_{$gridSize}x{$gridSize}";
        $dir = 'data';
        
        if (!is_dir($dir)) {
            mkdir($dir, 0755, true);
        }

        $file = "{$dir}/{$key}.json";
        $stats = json_decode(file_get_contents($file) ?? '[]', true);

        $stats[] = [
            'time' => $time,
            'moves' => $moves,
            'mode' => $gameMode,
            'date' => date('Y-m-d H:i:s'),
            'gridSize' => $gridSize
        ];

        usort($stats, fn($a, $b) => $a['time'] <=> $b['time']);
        $stats = array_slice($stats, 0, 100); // Keep top 100

        file_put_contents($file, json_encode($stats, JSON_PRETTY_PRINT));
        return ['success' => true];
    }

    /**
     * Handle API requests
     */
    public function handleRequest($action, $data) {
        switch ($action) {
            case 'generatePuzzle':
                return $this->generatePuzzle($data['gridSize'] ?? 3, $data['difficulty'] ?? 'medium');
            
            case 'validateMove':
                return $this->validateMove($data['gridSize'] ?? 3, $data['tiles'] ?? [], $data['moveIndex'] ?? 0);
            
            case 'isSolved':
                return ['solved' => $this->isSolved($data['tiles'] ?? [])];
            
            case 'getStats':
                return $this->getStatistics($data['gridSize'] ?? 3);
            
            case 'saveResult':
                return $this->saveResult(
                    $data['gridSize'] ?? 3,
                    $data['time'] ?? 0,
                    $data['moves'] ?? 0,
                    $data['mode'] ?? 'classic'
                );
            
            case 'calculateMinMoves':
                return ['minMoves' => $this->calculateMinMoves($data['tiles'] ?? [], $data['gridSize'] ?? 3)];
            
            default:
                return ['error' => 'Unknown action'];
        }
    }
}

// Handle requests
$request = json_decode(file_get_contents('php://input'), true);
$action = $_GET['action'] ?? $_POST['action'] ?? null;

if ($action) {
    $api = new KlotskiAPI();
    $response = $api->handleRequest($action, $request ?? []);
    echo json_encode($response);
} else {
    echo json_encode(['error' => 'No action specified']);
}
?>
