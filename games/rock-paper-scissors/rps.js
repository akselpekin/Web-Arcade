    const menu      = document.getElementById('rpsMenu');
    const gameWrap  = document.getElementById('game');
    const choicesEl = document.getElementById('choices');
    const statusEl  = document.getElementById('status');

    const symbols = { rock:'✊', paper:'✋', scissors:'✌️' };
    const keys    = Object.keys(symbols);
    let mode,inGame=false,step,choices=[null,null];

    keys.forEach(k=>{
      const btn=document.createElement('div');
      btn.className='choice';
      btn.dataset.choice=k;
      btn.textContent=symbols[k];
      btn.addEventListener('click',()=>select(k));
      choicesEl.appendChild(btn);
    });

    menu.addEventListener('click',e=>{
      if(e.target.tagName!=='BUTTON')return;
      startGame(Number(e.target.dataset.mode));
    });

    function startGame(selected){
      mode=selected;
      step=0;choices=[null,null];
      menu.classList.add('hidden');
      gameWrap.classList.remove('hidden');
      inGame=true;
      status('Player 1: choose');
      enableChoices(true);
    }

    function select(choice){
      if(step===0){                    
        choices[0]=choice;
        if(mode===2){ step=1; status('Player 2: choose'); enableChoices(true,true); }
        else { botMove(); showResult(); }
      }else if(step===1){                  
        choices[1]=choice;
        showResult();
      }
    }

    function botMove(){
      choices[1]= keys[Math.floor(Math.random()*3)];
    }

    function showResult(){
      enableChoices(false);
      const [p1,p2]=choices;
      const result =
        p1===p2 ? 'Draw!' :
        (p1==='rock'     && p2==='scissors')||
        (p1==='paper'    && p2==='rock')    ||
        (p1==='scissors' && p2==='paper')  ? 'Player 1 wins!' :
                                             (mode===2?'Player 2 wins!':'Bot wins!');
      status(`${symbols[p1]} vs ${symbols[p2]} → ${result}`);
      setTimeout(()=>startGame(mode),1500);
    }

    function status(msg){statusEl.textContent=msg;}
    function enableChoices(on,reset=false){
      document.querySelectorAll('.choice').forEach(btn=>{
        if(reset)btn.classList.remove('disabled');
        btn.classList.toggle('disabled',!on);
      });
    }

    document.addEventListener('keydown',e=>{
      if(e.key!=='Escape')return;
      if(inGame){
        gameWrap.classList.add('hidden');menu.classList.remove('hidden');
        inGame=false;
      }else window.location.href='../../index.html';
    });