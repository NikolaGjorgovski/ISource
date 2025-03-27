document.addEventListener("DOMContentLoaded", function () {
  let gameConfig = {
    easy: { rows: 2, cols: 3, pairs: 3, time: 50 },
    normal: { rows: 3, cols: 4, pairs: 6, time: 50 },
    hard: { rows: 4, cols: 4, pairs: 8, time: 50 },
  };

  const cardImages = {
    front: [
      "images/bowen.jpeg",
      "images/haaland.jpeg",
      "images/jackson.jpeg",
      "images/kante.jpeg",
      "images/lingard.jpeg",
      "images/neymar.jpeg",
      "images/messi.jpeg",
      "images/ronaldo.jpeg",
    ],
    back: "images/back-card.jpeg",
  };

  function preloadImages() {
    const allImages = [...cardImages.front, cardImages.back];
    allImages.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }

  let selectedDifficulty = "normal";
  let timeRemaining = 0;
  let timer = null;
  let cards = [];
  let firstCard = null;
  let secondCard = null;
  let lockBoard = false;
  let matchedPairs = 0;
  let totalPairs = 0;

  const welcomeModal = new bootstrap.Modal(
    document.getElementById("welcomeModal"),
    {
      backdrop: "static",
      keyboard: false,
    }
  );
  const endGameModal = new bootstrap.Modal(
    document.getElementById("endGameModal"),
    {
      backdrop: "static",
      keyboard: false,
    }
  );
  const gameBoard = document.getElementById("game-board");
  const timerDisplay = document.getElementById("timer-display");
  const difficultyBtns = document.querySelectorAll("[data-difficulty]");
  const beginBtn = document.getElementById("beginBtn");
  const playAgainBtn = document.getElementById("playAgainBtn");
  const endGameMessage = document.getElementById("endGameMessage");

  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  function init() {
    preloadImages();

    welcomeModal.show();

    difficultyBtns.forEach((btn) => {
      if (btn.dataset.difficulty === "normal") {
        btn.classList.add("active");
      }

      btn.addEventListener("click", () => {
        difficultyBtns.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        selectedDifficulty = btn.dataset.difficulty;
      });
    });

    beginBtn.addEventListener("click", () => {
      welcomeModal.hide();
      startGame(selectedDifficulty);
    });

    playAgainBtn.addEventListener("click", () => {
      endGameModal.hide();
      welcomeModal.show();
      resetGame();
    });

    createInitialBoard("normal");
  }

  function createInitialBoard(difficulty) {
    gameBoard.innerHTML = "";

    gameBoard.className = `game-grid grid-${difficulty}`;

    const config = gameConfig[difficulty];
    const totalCards = config.rows * config.cols;

    for (let i = 0; i < totalCards; i++) {
      const cardContainer = document.createElement("div");
      cardContainer.className = "card-container";

      const card = document.createElement("div");
      card.className = "memory-card";

      const cardBack = document.createElement("div");
      cardBack.className = "card-face card-back";
      const backImg = document.createElement("img");
      backImg.src = cardImages.back;
      backImg.alt = "Card Back";
      cardBack.appendChild(backImg);

      const cardFront = document.createElement("div");
      cardFront.className = "card-face card-front";

      card.appendChild(cardFront);
      card.appendChild(cardBack);
      cardContainer.appendChild(card);
      gameBoard.appendChild(cardContainer);
    }
  }

  function startGame(difficulty) {
    const config = gameConfig[difficulty];
    totalPairs = config.pairs;
    timeRemaining = config.time;
    timerDisplay.textContent = timeRemaining;

    createBoard(difficulty);
    startTimer();
  }

  function createBoard(difficulty) {
    gameBoard.innerHTML = "";
    cards = [];
    matchedPairs = 0;
    firstCard = null;
    secondCard = null;
    lockBoard = false;

    gameBoard.className = `game-grid grid-${difficulty}`;

    const config = gameConfig[difficulty];
    const totalCards = config.rows * config.cols;

    const pairs = [];
    for (let i = 0; i < config.pairs; i++) {
      pairs.push(i);
      pairs.push(i);
    }

    const shuffledPairs = shuffleArray([...pairs]);

    for (let i = 0; i < totalCards; i++) {
      const cardContainer = document.createElement("div");
      cardContainer.className = "card-container";

      const card = document.createElement("div");
      card.className = "memory-card";
      card.dataset.value = shuffledPairs[i];

      const cardBack = document.createElement("div");
      cardBack.className = "card-face card-back";
      const backImg = document.createElement("img");
      backImg.src = cardImages.back;
      backImg.alt = "Card Back";
      cardBack.appendChild(backImg);

      const cardFront = document.createElement("div");
      cardFront.className = "card-face card-front";
      const frontImg = document.createElement("img");
      frontImg.src = cardImages.front[shuffledPairs[i]];
      frontImg.alt = `Card ${shuffledPairs[i] + 1}`;
      cardFront.appendChild(frontImg);

      card.appendChild(cardFront);
      card.appendChild(cardBack);
      cardContainer.appendChild(card);
      gameBoard.appendChild(cardContainer);

      card.addEventListener("click", flipCard);
      cards.push(card);
    }
  }

  function startTimer() {
    timer = setInterval(() => {
      timeRemaining--;
      timerDisplay.textContent = timeRemaining;

      if (timeRemaining <= 0) {
        endGame(false);
      }
    }, 1000);
  }

  function flipCard() {
    if (lockBoard) return;
    if (this === firstCard) {
      this.classList.remove("flipped");
      firstCard = null;
      return;
    }

    this.classList.add("flipped");

    if (!firstCard) {
      firstCard = this;
      return;
    }

    secondCard = this;
    lockBoard = true;

    checkForMatch();
  }

  function checkForMatch() {
    const isMatch = firstCard.dataset.value === secondCard.dataset.value;

    if (isMatch) {
      disableCards();
      matchedPairs++;

      if (matchedPairs === totalPairs) {
        endGame(true);
      }
    } else {
      unflipCards();
    }
  }

  function disableCards() {
    firstCard.removeEventListener("click", flipCard);
    secondCard.removeEventListener("click", flipCard);

    firstCard.classList.add("matched");
    secondCard.classList.add("matched");

    resetBoard();
  }

  function unflipCards() {
    setTimeout(() => {
      firstCard.classList.remove("flipped");
      secondCard.classList.remove("flipped");

      resetBoard();
    }, 1000);
  }

  function resetBoard() {
    [firstCard, secondCard] = [null, null];
    lockBoard = false;
  }

  function resetGame() {
    clearInterval(timer);
    createInitialBoard("normal");
  }

  function endGame(isWin) {
    clearInterval(timer);
    if (isWin) {
      endGameMessage.textContent = `Congratulations! You matched all the pairs with ${timeRemaining} seconds remaining.`;
    } else {
      endGameMessage.textContent = "Times up! Better luck next time.";
    }
    setTimeout(() => {
      endGameModal.show();
    }, 1000);
  }

  init();
});
