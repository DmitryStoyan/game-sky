"use strict";

const PLANE_IMG_URL = "../img/airplane.png";
const CLOUDS_IMG_URLS = [
  "../img/cloud1.png",
  "../img/cloud2.png",
  "../img/cloud3.png",
];

let date;

let intervalID = setInterval(() => {
  if (!gamePause) {
    secondsCounter++;

    date = new Date(0, 0, 0, 0, 0, secondsCounter);
  }
}, 1000);

let secondsCounter = 0;

function updateLeaderboard() {
  const leaderboardTable = document.getElementById("leaderboard-table");

  const leaderboard = JSON.parse(localStorage.getItem("leaderboard"));

  // Очистка тела таблицы рекордов
  leaderboardTable.tBodies[0].innerHTML = "";

  // Проверка на наличие рекордов
  if (leaderboard && leaderboard.length > 0) {
    // Перебор рекордов и добавление их в таблицу
    leaderboard.forEach((result, index) => {
      const row = leaderboardTable.tBodies[0].insertRow();
      if (result.name === playerName) {
        row.classList.add("current-player");
      }
      const rankCell = row.insertCell();
      rankCell.textContent = index + 1;
      const nameCell = row.insertCell();
      nameCell.textContent = result.name;
      const timeCell = row.insertCell();
      timeCell.textContent = formatTime(result.time);
      const rescuedCell = row.insertCell();
      rescuedCell.textContent = result.stars;
    });
  }
}

const playerNameElement = document.getElementById("player-name");
let playerName;

window.onload = function () {
  playerName = prompt("Введите ваше имя:");
  if (playerName === "") {
    location.reload();
  } else {
    document.getElementById("player-name").textContent = playerName;
    startGame(playerName);
  }
};

playerNameElement.textContent = playerName;

// Функция сохранения результата игры
function saveResult() {
  const result = {
    name: playerName,
    time: secondsCounter,
    stars: star.starsCounter,
  };

  // Получение ранее сохраненных результатов из локального хранилища
  let leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || [];

  // Добавление текущего результата в список рекордов
  leaderboard.push(result);

  // Сортировка списка рекордов по количеству спасенных
  leaderboard.sort((a, b) => b.stars - a.stars);

  // Сохранение списка рекордов в локальное хранилище
  localStorage.setItem("leaderboard", JSON.stringify(leaderboard));
}

function formatTime(time) {
  const minutes = Math.floor(time / 60);
  const seconds = time % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

// Функция отображения таблицы рекордов
let leaderboardTable = document.getElementById("leaderboard-table");
function showLeaderboard() {
  const leaderboardTable = document.getElementById("leaderboard-table");

  // Получение списка рекордов из локального хранилища
  const leaderboard = JSON.parse(localStorage.getItem("leaderboard"));
  // Очистка таблицы рекордов
  leaderboardTable.innerHTML = "";
  // Перебор рекордов и добавление их в таблицу
  leaderboard.forEach((result, index) => {
    const row = leaderboardTable.insertRow();

    // Добавление класса для текущего игрока
    if (result.name === playerName) {
      row.classList.add("current-player");
    }

    // Добавление данных в ячейки таблицы
    const rankCell = row.insertCell();
    rankCell.textContent = index + 1;

    const nameCell = row.insertCell();
    nameCell.textContent = result.name;

    const timeCell = row.insertCell();
    timeCell.textContent = formatTime(result.time);

    const rescuedCell = row.insertCell();
    rescuedCell.textContent = result.stars;
  });
}

const BIRDS_IMG = "../img/birds.png";
const EXPLOAD_IMG = "../img/expload.png";
const STAR_URL = "../img/parashute.png";
const DROP_OFF_URL = "../img/game-star.png";

const BACKGROUND_SND_URL = "../snd/background.mp3";
const FINISH_SND_URL = "../snd/finish.mp3";
const HIT_SND_URL = "../snd/hit.mp3";
const STAR_SND_URL = "../snd/star.mp3";

const KEYS = {
  w: {
    pressed: false,
  },
  a: {
    pressed: false,
  },
  s: {
    pressed: false,
  },
  d: {
    pressed: false,
  },
};

const CLOUDS_AMOUNT = 4;
const BIRDS_AMOUNT = 2;

const DEFAULT_FUEL = 30;

function getRandomIndex(arr) {
  return Math.floor(Math.random() * arr.length);
}

function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function createTheDate(date) {
  let time = "";
  const seconds = date.getSeconds();
  const minutes = date.getMinutes();

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
    2,
    "0"
  )}`;

  return time;
}

const optionsWrapper = document.querySelector(".environment__menu");

const backgroundSound = new Audio();
backgroundSound.src = BACKGROUND_SND_URL;

backgroundSound.addEventListener("ended", (event) => {
  backgroundSound.play();
});

const finishSound = new Audio();
finishSound.src = FINISH_SND_URL;

const hitSound = new Audio();
hitSound.src = HIT_SND_URL;

const starSound = new Audio();
starSound.src = STAR_SND_URL;

const pauseButton = document.querySelector(".options__button.pause__button");
const muteButton = document.querySelector(".options__button.sound__button");

function muteGame() {
  backgroundSound.muted = !backgroundSound.muted;
  finishSound.muted = !finishSound.muted;
  hitSound.muted = !hitSound.muted;
  starSound.muted = !starSound.muted;
}

muteButton.addEventListener("click", muteGame);

function mainMenuControl() {
  const mainMenuWrapper = document.querySelector(".main-menu");
  const startButton = mainMenuWrapper.querySelector(".main-menu__start-button");
  const gameWrapper = document.querySelector(".gaming-environment");

  function startButtonClickHandler(event) {
    event.preventDefault();
    backgroundSound.play();
    startGame();
    gameWrapper.classList.remove("hidden");
    mainMenuWrapper.classList.add("hidden");
  }

  startButton.addEventListener("click", startButtonClickHandler);
}

let previousResults = {};

function showTheFinishPopUp(date, stars, name) {
  updateLeaderboard();
  saveResult();
  // clearInterval(intervalID);

  const popup = document.querySelector(".finish-popup");
  const replayButton = popup.querySelector(".finish__button");
  const currentResultsList = popup.querySelectorAll(
    ".finish__list .finish__item"
  );
  const finishHeader = popup.querySelector(".finish__header");

  const resultDate = createTheDate(date);

  finishSound.play();
  backgroundSound.pause();

  for (const result of currentResultsList) {
    switch (result.dataset.type) {
      case "time":
        result.textContent = "Время: " + resultDate;
        break;
      case "stars":
        result.textContent = "Количество спасенных жизней: " + stars;
        break;
      case "name":
        result.textContent = "Имя игрока: " + playerName;
        break;
    }
  }

  previousResults.date = resultDate;
  previousResults.stars = stars;
  previousResults.name = name;

  popup.classList.remove("hidden");

  function replayButtonClickHandler(event) {
    event.preventDefault();

    popup.classList.add("hidden");

    startGame();

    replayButton.removeEventListener("click", replayButtonClickHandler);
    backgroundSound.play();
  }

  replayButton.addEventListener("click", replayButtonClickHandler);
}

const canvas = document.querySelector("canvas");
const c = canvas.getContext("2d");

canvas.width = 1022;
canvas.height = 614;

let tilesMap;
let clouds = [];
let birds = [];
let star;
let dropOff;
let plane;
let gameOver;
let gamePause;

const fuelShowDown = document.querySelector(".stats__item.fuel");
const starsShowDown = document.querySelector(".stats__item.stars");
const timerShowDown = document.querySelector(".stats__item.timer");

function startGame() {
  secondsCounter = 0;
  gamePause = false;
  gameOver = false;

  plane = new Plane({
    imageSrc: PLANE_IMG_URL,
    scale: 0.5,
    position: {
      x: 0,
      y: 0,
    },
  });

  tilesMap = new TilesMap(canvas.width, canvas.height, 10, 10);

  clouds = [];
  birds = [];

  for (let i = 0; i < CLOUDS_AMOUNT; i++) {
    clouds.push(new Cloud());
  }

  for (let i = 0; i < BIRDS_AMOUNT; i++) {
    birds.push(new Bird());
  }

  star = new Star();
  dropOff = new DropOff();

  function keyCheck(key, result) {
    switch (key) {
      case "w":
        KEYS.w.pressed = result;
        break;
      case "a":
        KEYS.a.pressed = result;
        break;
      case "s":
        KEYS.s.pressed = result;
        break;
      case "d":
        KEYS.d.pressed = result;
        break;
    }
  }

  function keyDownHandler(event) {
    event.preventDefault();

    keyCheck(event.key, true);

    if (event.key == " ") {
      pauseGame();
    }
  }

  function keyUpHandler(event) {
    keyCheck(event.key, false);
  }

  function pauseGame() {
    gamePause = !gamePause;

    if (gamePause) {
      pauseButton.classList.remove("pause__button");
      pauseButton.classList.add("play__button");
    } else {
      pauseButton.classList.remove("play__button");
      pauseButton.classList.add("pause__button");
    }
  }

  window.addEventListener("keydown", keyDownHandler);
  window.addEventListener("keyup", keyUpHandler);
  pauseButton.addEventListener("click", pauseGame);

  let date = new Date(0);

  // let intervalID = setInterval(() => {
  //   if (!gamePause) {
  //     secondsCounter++;

  //     date = new Date(0, 0, 0, 0, 0, secondsCounter);
  //   }
  // }, 1000);

  function animate() {
    if (!gameOver) {
      window.requestAnimationFrame(animate);

      fuelShowDown.textContent = dropOff.fuelCounter;
      starsShowDown.textContent = star.starsCounter;
      timerShowDown.textContent = secondsCounter;

      if (!gamePause) {
        c.fillStyle = "blue";
        c.fillRect(0, 0, canvas.width, canvas.height);

        clouds.forEach((cloud) => {
          cloud.update();
        });
        plane.update();
        star.update();
        dropOff.update();
        birds.forEach((bird) => {
          bird.update();
        });
      }
    } else {
      c.fillStyle = "white";
      c.fillRect(0, 0, canvas.width, canvas.height);

      window.removeEventListener("keydown", keyDownHandler);
      window.removeEventListener("keyup", keyUpHandler);
      pauseButton.removeEventListener("click", pauseGame);

      KEYS.a.pressed = false;
      KEYS.w.pressed = false;
      KEYS.s.pressed = false;
      KEYS.d.pressed = false;

      const date = new Date(0, 0, 0, 0, 0, secondsCounter);
      const stars = star.starsCounter;

      showTheFinishPopUp(date, stars, playerName);
    }
  }

  animate();
}

mainMenuControl();
