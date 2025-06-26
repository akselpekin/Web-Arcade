const games = [
  {
    id: "pong",
    title: "Pong",
    path: "games/pong/index.html",
    thumb: "games/pong/thumb.png?text=Pong"
  },
  {
    id: "snake",
    title: "Snake",
    path: "games/snake/index.html",
    thumb: "games/snake/thumb.png?text=Snake"
  },
  {
    id: "tic-tac-toe",
    title: "Tic Tac Toe",
    path: "games/tic-tac-toe/index.html",
    thumb: "games/tic-tac-toe/thumb.png?text=TTT"
  },
  {
    id: "rock-paper-scissors",
    title: "Rock Paper Scissors",
    path: "games/rock-paper-scissors/index.html",
    thumb: "games/rock-paper-scissors/thumb.png?text=RPS"
  },
  {
    id: "bj",
    title: "BlackJack",
    path: "games/bj/index.html",
    thumb: "games/bj/thumb.png?text=bj"
  },
  {
    id: "blind-chess",
    title: "Blind Chess",
    path: "games/blind-chess/index.html",
    thumb: "games/blind-chess/thumb.png?text=Chess"
  }
];

const menuEl = document.getElementById("menu");

function renderMenu(list) {
  menuEl.innerHTML = "";
  list.forEach((game, i) => {
    const card = document.createElement("div");
    card.className = "game-card";
    card.tabIndex = 0;
    card.dataset.path = game.path;

    const img = document.createElement("img");
    img.src = game.thumb;
    img.alt = `${game.title} thumbnail`;
    img.className = "game-thumb";

    const title = document.createElement("span");
    title.textContent = game.title;

    card.appendChild(img);
    card.appendChild(title);
    menuEl.appendChild(card);
  });
}

renderMenu(games);

let focusedIndex = 0;
function focusCard(idx) {
  const cards = [...document.querySelectorAll(".game-card")];
  if (cards.length === 0) return;
  cards[focusedIndex]?.blur();
  focusedIndex = (idx + cards.length) % cards.length;
  cards[focusedIndex].focus();
  cards[focusedIndex].scrollIntoView({ block: "center", behavior: "smooth" });
}

document.addEventListener("keydown", (e) => {
  const cards = document.querySelectorAll(".game-card");
  if (!cards.length) return;

  switch (e.key) {
    case "ArrowUp":
    case "w":
      focusCard(focusedIndex - 1);
      break;
    case "ArrowDown":
    case "s":
      focusCard(focusedIndex + 1);
      break;
    case "Enter":
    case " ":
      cards[focusedIndex].click();
      break;
  }
});

document.addEventListener("click", (e) => {
  const path = e.target.closest(".game-card")?.dataset.path;
  if (path) window.location.href = path;
});