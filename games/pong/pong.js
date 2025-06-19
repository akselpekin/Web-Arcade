      const menuEl = document.getElementById('pongMenu');
      const canvas  = document.getElementById('game');
      const ctx     = canvas.getContext('2d');

      const KEY = { UP:'ArrowUp', DOWN:'ArrowDown', W:'w', S:'s', ESC:'Escape' };

      let paddleLeft, paddleRight, ball, mode, loopId, inGame = false, keys = {};

      const PADDLE_W = 12, PADDLE_H = 80, BALL_SIZE = 12, SPEED = 4, BOT_SPEED = 3;

      function resetObjects() {
        paddleLeft  = { x: 20, y: canvas.height/2 - PADDLE_H/2, dy: 0 };
        paddleRight = { x: canvas.width-20-PADDLE_W, y: canvas.height/2 - PADDLE_H/2, dy: 0 };
        ball        = { x: canvas.width/2, y: canvas.height/2, dx: SPEED * (Math.random()<0.5?-1:1), dy: SPEED * (Math.random()*2-1) };
      }

      function drawRect(r) { ctx.fillRect(r.x, r.y, r.w || PADDLE_W, r.h || PADDLE_H); }

      function draw() {
        ctx.fillStyle = getColor('--bg'); ctx.fillRect(0,0,canvas.width,canvas.height);

        ctx.fillStyle = getColor('--fg');
        for(let y=0; y<canvas.height; y+=30) ctx.fillRect(canvas.width/2-2, y, 4, 20);

        ctx.fillStyle = getColor('--fg');
        drawRect(paddleLeft);
        drawRect(paddleRight);
        ctx.fillRect(ball.x, ball.y, BALL_SIZE, BALL_SIZE);
      }

      function getColor(name){return getComputedStyle(document.documentElement).getPropertyValue(name).trim();}

      function step() {
        paddleLeft.dy  = (keys[KEY.W] ? -SPEED : keys[KEY.S] ? SPEED : 0);

        if (mode===2) {
          paddleRight.dy = (keys[KEY.UP] ? -SPEED : keys[KEY.DOWN] ? SPEED : 0);
        } else {
          const target = ball.y - PADDLE_H/2;
          if (Math.abs(target - paddleRight.y) > 4) paddleRight.dy = target > paddleRight.y ? BOT_SPEED : -BOT_SPEED;
          else paddleRight.dy = 0;
        }

        [paddleLeft, paddleRight].forEach(p=>{
          p.y += p.dy;
          if (p.y<0) p.y=0;
          if (p.y+PADDLE_H>canvas.height) p.y=canvas.height-PADDLE_H;
        });

        ball.x += ball.dx;
        ball.y += ball.dy;

        if (ball.y<=0 || ball.y+BALL_SIZE>=canvas.height) ball.dy *= -1;

        if (ball.x<=paddleLeft.x+PADDLE_W && ball.y+BALL_SIZE>paddleLeft.y && ball.y<paddleLeft.y+PADDLE_H) {
          ball.dx = Math.abs(ball.dx);
          adjustDY(paddleLeft);
        }
        if (ball.x+BALL_SIZE>=paddleRight.x && ball.y+BALL_SIZE>paddleRight.y && ball.y<paddleRight.y+PADDLE_H) {
          ball.dx = -Math.abs(ball.dx);
          adjustDY(paddleRight);
        }

        if (ball.x < -BALL_SIZE || ball.x > canvas.width+BALL_SIZE) {
          resetObjects();
        }
      }

      function adjustDY(paddle){
        const hitPos = (ball.y + BALL_SIZE/2) - (paddle.y + PADDLE_H/2);
        ball.dy = hitPos * 0.15;
      }

      function loop(){
        step();
        draw();
        loopId = requestAnimationFrame(loop);
      }

      menuEl.addEventListener('click', e=>{
        if (e.target.tagName!=='BUTTON') return;
        mode = Number(e.target.dataset.mode);
        startGame();
      });

      function startGame(){
        menuEl.classList.add('hidden');
        canvas.classList.remove('hidden');
        inGame = true;
        resetObjects();
        keys = {};
        loop();
      }

      document.addEventListener('keydown', e => {
        if (e.key === KEY.ESC) {
          if (inGame) {
            cancelAnimationFrame(loopId);
            canvas.classList.add('hidden');
            menuEl.classList.remove('hidden');
            inGame = false;
            keys = {};
            return;
          } else {
            window.location.href = '../../index.html';
            return;
          }
        }

        if (!inGame) return;

        keys[e.key] = true;
      });
      document.addEventListener('keyup', e=> {
        if (inGame) keys[e.key] = false;
      });

      function returnToArcade(){
        cancelAnimationFrame(loopId);
        window.location.href = '../../index.html';
      }