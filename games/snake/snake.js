    const canvas = document.getElementById('game');
    const ctx = canvas.getContext('2d');

    const grid = 20;
    const tileCount = canvas.width / grid;

    let snake = [{ x: 10, y: 10 }];
    let dx = 1, dy = 0;
    let food = { x: 15, y: 15 };
    let gameOver = false;

    function color(varName) {
    return getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
    }

    function placeFood() {
    food.x = Math.floor(Math.random() * tileCount);
    food.y = Math.floor(Math.random() * tileCount);
    if (snake.some(seg => seg.x === food.x && seg.y === food.y)) placeFood();
    }

    function draw() {
    ctx.fillStyle = color('--bg');
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = color('--fg');

    ctx.fillStyle = color('--accent');
    snake.forEach(seg =>
        ctx.fillRect(seg.x * grid, seg.y * grid, grid - 2, grid - 2)
    );

    ctx.fillStyle = color('--fg');
    ctx.fillRect(food.x * grid, food.y * grid, grid - 2, grid - 2);
    }

    function tick() {
    if (gameOver) return showGameOver();

    const head = { x: snake[0].x + dx, y: snake[0].y + dy };

    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
        gameOver = true;
    }

    if (snake.some(seg => seg.x === head.x && seg.y === head.y)) {
        gameOver = true;
    }

    snake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
        placeFood();
    } else {
        snake.pop();
    }

    draw();
    }

    function showGameOver() {
    ctx.fillStyle = color('--fg');
    ctx.font = '20px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2);
    ctx.fillText('Press R to restart', canvas.width / 2, canvas.height / 2 + 24);
    }

    document.addEventListener('keydown', e => {
    switch (e.key) {
        case 'ArrowUp':
        case 'w':
        if (dy === 0) { dx = 0; dy = -1; }
        break;
        case 'ArrowDown':
        case 's':
        if (dy === 0) { dx = 0; dy = 1; }
        break;
        case 'ArrowLeft':
        case 'a':
        if (dx === 0) { dx = -1; dy = 0; }
        break;
        case 'ArrowRight':
        case 'd':
        if (dx === 0) { dx = 1; dy = 0; }
        break;
        case 'r':
        case 'R':
        if (gameOver) restart();
        break;
        case 'Escape':
        window.location.href = '../../index.html';
        break;
    }
    });

    function restart() {
    snake = [{ x: 10, y: 10 }];
    dx = 1; dy = 0;
    gameOver = false;
    placeFood();
    }

    placeFood();
    setInterval(tick, 100);
    draw();