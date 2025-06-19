const menu      = document.getElementById('tttMenu');
const gameWrap  = document.getElementById('game');
const boardEl   = document.getElementById('board');
const statusEl  = document.getElementById('status');

let board, turn, finished, mode, inGame = false;
let restartTimer = null;

for (let i = 0; i < 9; i++) {
    const cell = document.createElement('div');
    cell.className = 'cell';
    cell.dataset.idx = i;
    cell.addEventListener('click', () => move(i, cell));
    boardEl.appendChild(cell);
}

function resetBoard() {
    board    = Array(9).fill(null);
    turn     = 'X';
    finished = false;
    clearTimeout(restartTimer);
    [...document.querySelectorAll('.cell')].forEach(c => {
    c.textContent = '';
    c.classList.remove('disabled');
    });
    status('Player X’s turn');
}

function startGame(selectedMode) {
    mode = selectedMode;
    menu.classList.add('hidden');
    gameWrap.classList.remove('hidden');
    inGame = true;
    resetBoard();
}

menu.addEventListener('click', e => {
    if (e.target.tagName !== 'BUTTON') return;
    startGame(Number(e.target.dataset.mode));
});

function move(i, cell) {
    if (finished || board[i]) return;

    board[i] = turn;
    cell.textContent = turn;

    if (checkWin(turn)) {
    status(`${turn} wins!`);
    finished = true;
    } else if (board.every(Boolean)) {
    status('Draw!');
    finished = true;
    } else {
    turn = turn === 'X' ? 'O' : 'X';
    status(mode === 2 ? `Player ${turn}’s turn`
                        : (turn === 'O' ? 'Bot’s turn' : 'Player X’s turn'));
    }

    if (finished) {
    [...document.querySelectorAll('.cell')].forEach(c => c.classList.add('disabled'));
    restartTimer = setTimeout(resetBoard, 1000);
    return;
    }

    if (mode === 1 && turn === 'O') botMove();
}

function botMove() {
    const empty = board.map((v, idx) => v ? null : idx).filter(v => v !== null);
    if (!empty.length) return;
    const idx = empty[Math.floor(Math.random() * empty.length)];
    move(idx, boardEl.children[idx]);
}

function status(msg) { statusEl.textContent = msg; }

function checkWin(p) {
    const w = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
    return w.some(line => line.every(idx => board[idx] === p));
}

document.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;

    if (inGame) {
    gameWrap.classList.add('hidden');
    menu.classList.remove('hidden');
    inGame = false;
    clearTimeout(restartTimer);
    } else {
    window.location.href = '../../index.html';
    }
});