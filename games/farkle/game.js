import { FarkleGame } from './core.mjs';

const $ = id => document.getElementById(id);
const format = number => number.toLocaleString('en-US');
const pips = { 1: [5], 2: [1, 9], 3: [1, 5, 9], 4: [1, 3, 7, 9], 5: [1, 3, 5, 7, 9], 6: [1, 3, 4, 6, 7, 9] };
let game = null;
let selected = new Set();
let cpuTimer = null;

function cancelCPU() {
  clearTimeout(cpuTimer);
  cpuTimer = null;
}

function selectDie(index) {
  if (!game || game.isCPU || game.phase !== 'select') return;
  if (selected.has(index)) selected.delete(index);
  else selected.add(index);
  updateSelection();
}

function updateSelection() {
  const score = game.selectionScore([...selected]);
  const canAct = game.phase === 'select' && !game.isCPU;
  $('selected-score').textContent = format(score);
  $('bank-score').textContent = format(game.turnScore + score);
  $('keep').disabled = $('bank').disabled = !canAct || !score;
  $('selection-help').textContent = !canAct ? '' : !selected.size
    ? 'Select scoring dice to keep or bank.' : !score
      ? 'Every selected die must score. Try 1s, 5s, triples or a straight.'
      : `${format(score)} points selected. Keep to risk another roll, or bank to end your turn.`;
  [...$('dice').children].forEach((button, index) => button.setAttribute('aria-pressed', String(selected.has(index))));
}

function render() {
  selected.clear();
  $('round').textContent = `Round ${game.round} · First to ${format(game.target)}`;
  $('scoreboard').replaceChildren(...game.names.map((name, index) => {
    const player = document.createElement('div');
    player.className = `player${index === game.current ? ' active' : ''}`;
    const label = document.createElement('span');
    label.textContent = `${name}${index === game.current ? ' · ' + (game.phase === 'over' ? 'WINNER' : 'TURN') : ''}`;
    const total = document.createElement('strong');
    total.textContent = format(game.totals[index]);
    player.append(label, total);
    return player;
  }));
  $('turn-title').textContent = game.phase === 'over' ? `${game.names[game.winner]} won!` : `${game.names[game.current]} · turn`;
  $('phase-label').textContent = game.phase === 'over' ? 'Game over' : game.isCPU && game.phase !== 'ended' ? 'CPU playing' : game.phase === 'ended' ? 'Turn over' : game.phase === 'ready' ? 'Ready' : 'Select dice';
  $('status').textContent = game.message;
  $('turn-score').textContent = format(game.turnScore);
  $('dice').replaceChildren(...game.roll.map((value, index) => {
    const button = document.createElement('button');
    button.className = 'die';
    button.type = 'button';
    button.disabled = game.phase !== 'select' || game.isCPU;
    button.setAttribute('aria-label', `Die ${index + 1}: ${value}`);
    button.setAttribute('aria-pressed', 'false');
    pips[value].forEach(position => {
      const pip = document.createElement('span');
      pip.className = 'pip';
      pip.style.gridArea = `${Math.ceil(position / 3)} / ${(position - 1) % 3 + 1}`;
      button.append(pip);
    });
    button.addEventListener('click', () => selectDie(index));
    return button;
  }));
  const ended = game.phase === 'ended';
  $('next').hidden = !ended && game.phase !== 'ready';
  $('next').textContent = ended ? `${game.names[1 - game.current]}: next turn →` : 'Roll six dice →';
  $('next').disabled = game.phase === 'ready' && game.isCPU;
  $('keep').hidden = $('bank').hidden = game.phase !== 'select';
  $('history').replaceChildren(...game.history.map(message => {
    const item = document.createElement('li');
    item.textContent = message;
    return item;
  }));
  updateSelection();
  scheduleCPU();
}

function scheduleCPU() {
  cancelCPU();
  if (!game.isCPU || !['ready', 'select'].includes(game.phase)) return;
  cpuTimer = setTimeout(() => {
    game.cpuStep();
    render();
  }, 950);
}

function startGame(event) {
  event.preventDefault();
  cancelCPU();
  game = new FarkleGame({ mode: $('mode').value, target: Number($('target').value) });
  $('setup').hidden = true;
  $('game').hidden = false;
  game.startTurn();
  render();
  $('turn-title').tabIndex = -1;
  $('turn-title').focus();
}

function act(bank) {
  if (!game || game.isCPU || !game.act([...selected], bank)) return;
  render();
  if (game.phase === 'select') $('dice').firstElementChild?.focus();
  else if (game.phase === 'ended') $('next').focus();
  else $('new-game').focus();
}

$('setup-form').addEventListener('submit', startGame);
$('keep').addEventListener('click', () => act(false));
$('bank').addEventListener('click', () => act(true));
$('next').addEventListener('click', () => {
  if (game.phase === 'ended') game.advanceTurn();
  if (!game.isCPU) game.startTurn();
  render();
});
$('new-game').addEventListener('click', () => {
  cancelCPU();
  game = null;
  selected.clear();
  $('game').hidden = true;
  $('setup').hidden = false;
  $('mode').focus();
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    cancelCPU();
    window.location.href = '../../index.html';
    return;
  }
  if (event.repeat || /^(INPUT|SELECT|TEXTAREA)$/.test(event.target.tagName) || !game) return;
  if (/^[1-6]$/.test(event.key) && Number(event.key) <= game.roll.length) {
    event.preventDefault();
    selectDie(Number(event.key) - 1);
  } else if (event.key.toLowerCase() === 'k') act(false);
  else if (event.key.toLowerCase() === 'b') act(true);
});
window.addEventListener('pagehide', cancelCPU);
window.addEventListener('pageshow', () => { if (game) scheduleCPU(); });
