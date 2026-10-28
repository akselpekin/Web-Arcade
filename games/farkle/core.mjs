export function scoreDice(dice) {
  if (!Array.isArray(dice) || dice.length === 0 || dice.length > 6 ||
      dice.some(d => !Number.isInteger(d) || d < 1 || d > 6)) return 0;
  const counts = Array(7).fill(0);
  dice.forEach(d => counts[d]++);
  if (dice.length === 6 && counts.slice(1).every(n => n === 1)) return 1500;
  if (dice.length === 5) {
    if (counts.slice(1, 6).every(n => n === 1)) return 500;
    if (counts.slice(2, 7).every(n => n === 1)) return 750;
  }
  let score = 0;
  for (let value = 1; value <= 6; value++) {
    const count = counts[value];
    if (count >= 3) score += (value === 1 ? 1000 : value * 100) * 2 ** (count - 3);
    else if (value === 1) score += count * 100;
    else if (value === 5) score += count * 50;
    else if (count > 0) return 0;
  }
  return score;
}

export function bestSelection(roll) {
  let best = { indices: [], score: 0 };
  for (let mask = 1; mask < 2 ** roll.length; mask++) {
    const indices = roll.flatMap((_, i) => mask & (1 << i) ? [i] : []);
    const score = scoreDice(indices.map(i => roll[i]));
    if (score > best.score || (score > 0 && score === best.score && indices.length > best.indices.length)) {
      best = { indices, score };
    }
  }
  return best;
}

export function cpuShouldBank(turnScore, remaining, keptCount) {
  return turnScore >= 1000 || remaining <= 2 || keptCount >= 5;
}

export class FarkleGame {
  constructor({ mode = 'cpu', target = 1000, random = Math.random } = {}) {
    this.mode = mode === 'local' ? 'local' : 'cpu';
    this.target = Number.isFinite(Number(target))
      ? Math.min(20000, Math.max(1000, Math.trunc(Number(target)))) : 1000;
    this.random = random;
    this.names = this.mode === 'cpu' ? ['You', 'CPU'] : ['Player 1', 'Player 2'];
    this.totals = [0, 0];
    this.current = 0;
    this.round = 1;
    this.turnScore = 0;
    this.remaining = 6;
    this.roll = [];
    this.phase = 'ready';
    this.winner = null;
    this.history = [];
    this.message = 'Ready to roll.';
  }

  get isCPU() { return this.mode === 'cpu' && this.current === 1; }

  record(message) {
    this.message = message;
    this.history.unshift(message);
    this.history = this.history.slice(0, 30);
  }

  startTurn() {
    if (this.phase !== 'ready') return false;
    this.rollDice();
    return true;
  }

  rollDice(hot = false) {
    this.roll = Array.from({ length: this.remaining }, () => Math.floor(this.random() * 6) + 1);
    const prefix = hot ? 'Hot dice! Six fresh dice. ' : '';
    if (bestSelection(this.roll).score === 0) {
      const lost = this.turnScore;
      this.turnScore = 0;
      this.phase = 'ended';
      this.record(`${prefix}${this.names[this.current]}: Farkle! ${lost} unbanked points lost.`);
    } else {
      this.phase = 'select';
      this.record(`${prefix}${this.names[this.current]} rolled ${this.roll.join(' · ')}. Select scoring dice.`);
    }
  }

  selectionScore(indices) {
    if (!Array.isArray(indices) || new Set(indices).size !== indices.length ||
        indices.some(i => !Number.isInteger(i) || i < 0 || i >= this.roll.length)) return 0;
    return scoreDice(indices.map(i => this.roll[i]));
  }

  act(indices, bank) {
    if (this.phase !== 'select') return false;
    const points = this.selectionScore(indices);
    if (!points) return false;
    this.turnScore += points;
    const name = this.names[this.current];
    this.record(`${name} kept ${indices.map(i => this.roll[i]).join(' · ')} for ${points} points.`);
    if (bank) {
      this.totals[this.current] += this.turnScore;
      this.record(`${name} banked ${this.turnScore} points.`);
      this.turnScore = 0;
      if (this.totals[this.current] >= this.target) {
        this.winner = this.current;
        this.phase = 'over';
        this.record(`${name} won with ${this.totals[this.current]} points!`);
      } else this.phase = 'ended';
    } else {
      this.remaining -= indices.length;
      const hot = this.remaining === 0;
      if (hot) this.remaining = 6;
      this.rollDice(hot);
    }
    return true;
  }

  advanceTurn() {
    if (this.phase !== 'ended') return false;
    if (this.current === 1) this.round++;
    this.current = 1 - this.current;
    this.turnScore = 0;
    this.remaining = 6;
    this.roll = [];
    this.phase = 'ready';
    this.record(`${this.names[this.current]}: ready to roll.`);
    return true;
  }

  cpuStep() {
    if (!this.isCPU) return false;
    if (this.phase === 'ready') return this.startTurn();
    if (this.phase !== 'select') return false;
    const best = bestSelection(this.roll);
    const remaining = this.roll.length - best.indices.length || 6;
    return this.act(best.indices, cpuShouldBank(this.turnScore + best.score, remaining, best.indices.length));
  }
}
