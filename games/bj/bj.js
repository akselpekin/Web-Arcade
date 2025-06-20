    const menu   = document.getElementById('aceMenu');
    const game   = document.getElementById('game');
    const dealer = document.getElementById('dealer');
    const status = document.getElementById('status');
    const hitBtn = document.getElementById('hit');
    const standBtn = document.getElementById('stand');

    let deck, dealerHand, playersHands = [], playersStood = [];
    let current = 0, playerCount = 1;
    let inGame = false, roundOver = false;

    const ranks = [2,3,4,5,6,7,8,9,10,'J','Q','K','A'];
    const suits = ['♠️','♥️','♦️','♣️'];

    function buildDeck(){
      return suits.flatMap(s => ranks.map(r => ({ r, s }))).sort(() => Math.random() - 0.5);
    }
    function drawCard(){ return deck.pop(); }

    function handValue(hand){
      let total = 0, aces = 0;
      for (const {r} of hand){
        if (r === 'A'){ total += 11; aces++; }
        else if (['K','Q','J'].includes(r)) total += 10;
        else total += r;
      }
      while (total > 21 && aces){ total -= 10; aces--; }
      return total;
    }

    function appendStatus(t){ status.textContent += (status.textContent?'\n':'') + t; }

    function createPlayerAreas() {
      const wrap = document.getElementById('players');
      wrap.innerHTML = '';
      playersHands = [];
      playersStood = [];
      for (let i = 0; i < playerCount; i++) {
        const div = document.createElement('div');
        div.className = 'hand';
        div.id = 'p' + i;
        wrap.appendChild(div);
        playersHands.push([drawCard(), drawCard()]);
        playersStood.push(false);
      }
    }

    document.getElementById('aceMenu').addEventListener('click', e => {
      if (e.target.tagName !== 'BUTTON') return;
      playerCount = Number(e.target.dataset.p);
      startRound();
    });
    hitBtn.onclick   = hit;
    standBtn.onclick = stand;

    function startRound(){
      deck = buildDeck();
      dealerHand = [drawCard(), drawCard()];
      createPlayerAreas();
      current = 0;

      roundOver   = false;
      inGame = true;

      menu.classList.add('hidden');
      game.classList.remove('hidden');

      refresh();
      checkNaturals();
    }

    function checkNaturals(){
      const dv = handValue(dealerHand);
      const dealerBJ = dv === 21 && dealerHand.length === 2;
      let anyPlayerBJ = false;
      for(let i=0; i<playerCount; i++){
        const hand = playersHands[i];
        const pv = handValue(hand);
        if(pv === 21 && hand.length === 2){
          anyPlayerBJ = true;
          appendStatus(`P${i+1}: Blackjack!`);
          playersStood[i] = true;
        }
      }
      if (anyPlayerBJ || dealerBJ){
        if (anyPlayerBJ && dealerBJ){
          appendStatus('Dealer: Blackjack! Push!');
        } else if (dealerBJ){
          appendStatus('Dealer: Blackjack! Dealer wins.');
        }
        roundOver = true;
        hitBtn.disabled = standBtn.disabled = true;
        setTimeout(startRound, 3500);
      }
    }

    function hit(){
      if (roundOver || playersStood[current]) return;
      playersHands[current].push(drawCard());
      const v = handValue(playersHands[current]);
      if (v >= 21) stand();
      refresh();
    }

    function stand(){
      if (roundOver || playersStood[current]) return;
      playersStood[current] = true;
      advanceTurn();
      refresh();
    }

    function advanceTurn(){
      while (current < playerCount && playersStood[current]) current++;
      if (current >= playerCount){
        dealerTurn();
        determineResults();
      }
    }

    function dealerTurn(){
      while (handValue(dealerHand) < 17) dealerHand.push(drawCard());
    }

    function determineResults(){
      const dv = handValue(dealerHand);
      playersHands.forEach((hand, idx) => {
        const pv = handValue(hand);
        let msg;
        if (pv > 21)            msg = `P${idx+1}: Bust`;
        else if (dv > 21)       msg = `P${idx+1}: Win (dealer bust)`;
        else if (pv === dv)     msg = `P${idx+1}: Push`;
        else if (pv > dv)       msg = `P${idx+1}: Win`;
        else                    msg = `P${idx+1}: Lose`;
        appendStatus(msg);
      });
      roundOver = true;
      hitBtn.disabled = standBtn.disabled = true;
      setTimeout(startRound, 3500);
    }

    function renderHand(el, label, hand){
      el.innerHTML = `<strong>${label}</strong>` + hand.map(c => ` ${c.r}${c.s}`).join('') +
                     ` <span>${handValue(hand)}</span>`;
    }

    function refresh(){
      renderHand(dealer, 'Dealer:', dealerHand);
      playersHands.forEach((h, i) => {
        const el = document.getElementById('p'+i);
        renderHand(el, `P${i+1}:`, h);
        if (i === current) el.style.borderColor = 'var(--accent)';
        else               el.style.borderColor = 'var(--fg)';
      });
      
      if (!roundOver) {
        if (current < playerCount) {
          status.textContent = `Player ${current + 1}'s turn – Hit or Stand`;
        } else {
          status.textContent = "Dealer's turn...";
        }
      }
      hitBtn.disabled   = roundOver || playersStood[current];
      standBtn.disabled = hitBtn.disabled;
    }

    document.addEventListener('keydown', e => {
      if (e.key !== 'Escape') return;
      if (inGame){
        game.classList.add('hidden');
        menu.classList.remove('hidden');
        inGame = false;
      } else {
        window.location.href = '../../index.html';
      }
    });