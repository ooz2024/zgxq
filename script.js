const chessboard = document.getElementById('chessboard');
let board = [
    ['r', 'n', 'm', 'g', 'k', 'g', 'm', 'n', 'r'],
    ['', '', '', '', '', '', '', '', ''],
    ['', 'c', '', '', '', '', '', 'c', ''],
    ['p', '', 'p', '', 'p', '', 'p', '', 'p'],
    ['', '', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', '', ''],
    ['P', '', 'P', '', 'P', '', 'P', '', 'P'],
    ['', 'C', '', '', '', '', '', 'C', ''],
    ['', '', '', '', '', '', '', '', ''],
    ['R', 'N', 'M', 'G', 'K', 'G', 'M', 'N', 'R']
];

let selectedPiece = null;
let currentPlayer = 'P'; // 'P' for red (player), 'p' for black (AI)

function createBoard() {
    chessboard.innerHTML = ''; // 清空棋盘
    for (let row = 0; row < 10; row++) {
        for (let col = 0; col < 9; col++) {
            const square = document.createElement('div');
            square.classList.add('square');
            square.classList.add((row + col) % 2 === 0 ? 'white' : 'black');
            square.textContent = board[row][col];
            square.dataset.row = row;
            square.dataset.col = col;
            square.addEventListener('click', () => handleSquareClick(row, col));
            chessboard.appendChild(square);
        }
    }
}

function handleSquareClick(row, col) {
    if (currentPlayer === 'P') {
        if (selectedPiece) {
            if (isValidMove(selectedPiece.row, selectedPiece.col, row, col)) {
                movePiece(selectedPiece.row, selectedPiece.col, row, col);
                selectedPiece = null;
                currentPlayer = 'p'; // 切换到AI
                setTimeout(aiMove, 500); // 让AI思考一段时间
            }
        } else if (board[row][col] !== '' && board[row][col] === board[row][col].toUpperCase()) {
            selectedPiece = { row, col };
        }
    }
}

function movePiece(fromRow, fromCol, toRow, toCol) {
    board[toRow][toCol] = board[fromRow][fromCol];
    board[fromRow][fromCol] = '';
    createBoard();
}

function aiMove() {
    const depth = 3; // AI搜索的深度，可以根据需要调整
    const bestMove = findBestMove('p', depth);
    if (bestMove) {
        movePiece(bestMove.fromRow, bestMove.fromCol, bestMove.toRow, bestMove.toCol);
    }
    currentPlayer = 'P'; // 切换回玩家
}

function findBestMove(player, depth) {
    let bestScore = player === 'p' ? -Infinity : Infinity;
    let bestMove = null;

    const moves = getPossibleMoves(player);
    for (const move of moves) {
        const boardCopy = JSON.parse(JSON.stringify(board)); // 复制当前棋盘状态
        movePiece(move.fromRow, move.fromCol, move.toRow, move.toCol);
        const score = minimax(depth - 1, player === 'p' ? 'P' : 'p', -Infinity, Infinity);
        board = boardCopy; // 还原棋盘状态

        if (player === 'p') {
            if (score > bestScore) {
                bestScore = score;
                bestMove = move;
            }
        } else {
            if (score < bestScore) {
                bestScore = score;
                bestMove = move;
            }
        }
    }
    return bestMove;
}

function minimax(depth, player, alpha, beta) {
    if (depth === 0) {
        return evaluateBoard();
    }

    const moves = getPossibleMoves(player);
    if (player === 'p') {
        let maxEval = -Infinity;
        for (const move of moves) {
            const boardCopy = JSON.parse(JSON.stringify(board)); // 复制当前棋盘状态
            movePiece(move.fromRow, move.fromCol, move.toRow, move.toCol);
            const eval = minimax(depth - 1, 'P', alpha, beta);
            board = boardCopy; // 还原棋盘状态
            maxEval = Math.max(maxEval, eval);
            alpha = Math.max(alpha, eval);
            if (beta <= alpha) {
                break; // 剪枝
            }
        }
        return maxEval;
    } else {
        let minEval = Infinity;
        for (const move of moves) {
            const boardCopy = JSON.parse(JSON.stringify(board)); // 复制当前棋盘状态
            movePiece(move.fromRow, move.fromCol, move.toRow, move.toCol);
            const eval = minimax(depth - 1, 'p', alpha, beta);
            board = boardCopy; // 还原棋盘状态
            minEval = Math.min(minEval, eval);
            beta = Math.min(beta, eval);
            if (beta <= alpha) {
                break; // 剪枝
            }
        }
        return minEval;
    }
}

function evaluateBoard() {
    const pieceValues = {
        'K': 1000, 'G': 5, 'M': 3, 'R': 9, 'N': 3, 'C': 4, 'P': 1,
        'k': -1000, 'g': -5, 'm': -3, 'r': -9, 'n': -3, 'c': -4, 'p': -1
    };

    let evaluation = 0;
    for (let row = 0; row < 10; row++) {
        for (let col = 0; col < 9; col++) {
            const piece = board[row][col];
            if (piece !== '') {
                evaluation += pieceValues[piece] || 0;
            }
        }
    }
    return evaluation;
}

function getPossibleMoves(player) {
    const moves = [];
    for (let row = 0; row < 10; row++) {
        for (let col = 0; col < 9; col++) {
            if (board[row][col] !== '' && board[row][col].toLowerCase() === player) {
                const potentialMoves = getValidMoves(row, col);
                for (const move of potentialMoves) {
                    moves.push({ fromRow: row, fromCol: col, toRow: move.row, toCol: move.col });
                }
            }
        }
    }
    return moves;
}

function getValidMoves(row, col) {
    const piece = board[row][col];
    const moves = [];

    const directions = {
        'P': [[-1, 0]], // 兵只能向前走一格
        'R': [[-1, 0], [1, 0], [0, -1], [0, 1]], // 车直线移动
        'N': [[-2, -1], [-2, 1], [2, -1], [2, 1], [-1, -2], [1, -2], [-1, 2], [1, 2]], // 马日字
        'M': [[-2, -2], [-2, 2], [2, -2], [2, 2]], // 象田字
        'G': [[-1, 0], [1, 0], [0, -1], [0, 1]], // 士对角移动
        'K': [[-1, 0], [1, 0], [0, -1], [0, 1]], // 将直线移动
        'C': [[-1, 0], [1, 0], [0, -1], [0, 1]], // 炮直线移动
    };

    if (directions[piece.toUpperCase()]) {
        for (const [dx, dy] of directions[piece.toUpperCase()]) {
            const newRow = row + dx;
            const newCol = col + dy;
            if (newRow >= 0 && newRow < 10 && newCol >= 0 && newCol < 9) {
                if (board[newRow][newCol] === '' || board[newRow][newCol].toLowerCase() !== board[newRow][newCol]) {
                    moves.push({ row: newRow, col: newCol });
                }
            }
        }
    }
    return moves;
}

function isValidMove(fromRow, fromCol, toRow, toCol) {
    const validMoves = getValidMoves(fromRow, fromCol);
    return validMoves.some(move => move.row === toRow && move.col === toCol);
}

createBoard();
