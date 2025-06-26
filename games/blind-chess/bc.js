import { Chess } from "https://cdn.jsdelivr.net/npm/chess.js@1.0.0/dist/esm/chess.js";

const boardEl = document.getElementById("board");
const statusEl = document.getElementById("status");

const SQUARES = [...Array(64).keys()].map(i => ({
  i,
  r: Math.floor(i / 8),
  c: i % 8,
  coord: String.fromCharCode(97 + (i % 8)) + (8 - Math.floor(i / 8))
}));
SQUARES.forEach(sq => {
  const div = document.createElement("div");
  div.className = "sq";
  boardEl.appendChild(div);
  sq.el = div;
  div.addEventListener("click", () => onSquareClick(sq));
});

const game = new Chess();
let selected = null;
initRandomPosition();

function initRandomPosition() {
  const whiteBack = shuffle("RNBQKBNR".split("")).join("");
  const blackBack = shuffle("RNBQKBNR".split("")).join("").toLowerCase();
  const fen = `${blackBack}/pppppppp/8/8/8/8/PPPPPPPP/${whiteBack} w - - 0 1`;
  game.load(fen);
  draw();
  status("Your move – pick a piece");
}

function onSquareClick(square) {
  if (game.isGameOver()) return;

  const coord = square.coord;

  if (selected) {
    const legal = game
      .moves({ square: selected, verbose: true })
      .find(m => m.to === coord);
    if (legal) {
      game.move({ from: selected, to: coord, promotion: "q" });
      selected = null;
      draw();
      if (game.isGameOver()) return showResult();
      status("Bot thinking…");
      setTimeout(botMove, 300);
      return;
    }
  }

    const piece = game.get(coord);
    if (!piece) {
      selected = null;
      draw();
      return;
    }
    
    if (piece.color !== game.turn()) {
      status("That's the bot's piece (black). Pick one of yours.");
      selected = null;
    } else {
      selected = coord;
    }
    
    draw();
}

function botMove() {
  const moves = game.moves();
  if (!moves.length) return showResult();
  const mv = moves[Math.floor(Math.random() * moves.length)];
  game.move(mv);
  draw();
  if (game.isGameOver()) return showResult();
  status("Your move – pick a piece");
}

function draw() {
  SQUARES.forEach(sq => {
    sq.el.classList.remove("highlight");
    sq.el.style.background = ""; 

    const piece = game.get(sq.coord);
    if (piece) {
      sq.el.textContent = piece.color === "w" ? "⬜" : "⬛";
    } else {
      sq.el.textContent = "";
    }
  });

  if (selected) {
    SQUARES.find(s => s.coord === selected)?.el.classList.add("highlight");

    game
      .moves({ square: selected, verbose: true })
      .map(m => m.to)
      .forEach(dest => {
        const d = SQUARES.find(s => s.coord === dest);
        if (d) {
          d.el.classList.add("highlight");
          d.el.style.background = "var(--accent)";
        }
    });
  }
}

function showResult() {
  if (game.isCheckmate()) status(game.turn() === "w" ? "Checkmate! Bot wins." : "Checkmate! You win!");
  else if (game.isStalemate()) status("Stalemate!");
  else if (game.isDraw()) status("Draw!");
  else status("Game over");
}

function status(msg) { statusEl.textContent = msg; }

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

document.addEventListener("keydown", e => {
  if (e.key === "Escape") {
    window.location.href = "../../index.html";
  }
});