// 테트리스 게임 설정
const COLS = 10;
const ROWS = 20;
const DROP_INTERVAL_MS = 800;

const LINE_SCORES = {
  1: 100,
  2: 300,
  3: 500,
  4: 800,
};

const PIECE_TYPES = ["I", "O", "T", "S", "Z", "J", "L"];

// 블록 정의: shape는 2차원 배열 (1 = 채워진 칸)
const PIECES = {
  I: {
    shape: [
      [1, 1, 1, 1],
    ],
    colorClass: "piece-i",
  },
  O: {
    shape: [
      [1, 1],
      [1, 1],
    ],
    colorClass: "piece-o",
  },
  T: {
    shape: [
      [0, 1, 0],
      [1, 1, 1],
    ],
    colorClass: "piece-t",
  },
  S: {
    shape: [
      [0, 1, 1],
      [1, 1, 0],
    ],
    colorClass: "piece-s",
  },
  Z: {
    shape: [
      [1, 1, 0],
      [0, 1, 1],
    ],
    colorClass: "piece-z",
  },
  J: {
    shape: [
      [1, 0, 0],
      [1, 1, 1],
    ],
    colorClass: "piece-j",
  },
  L: {
    shape: [
      [0, 0, 1],
      [1, 1, 1],
    ],
    colorClass: "piece-l",
  },
};

// DOM 요소
const boardElement = document.getElementById("game-board");
const scoreElement = document.getElementById("score");
const startBtn = document.getElementById("start-btn");
const restartBtn = document.getElementById("restart-btn");
const gameOverElement = document.getElementById("game-over");

// 게임 상태
let score = 0;
let cells = [];
let board = createEmptyBoard();
let currentPiece = null;
let isPlaying = false;
let isGameOver = false;
let dropTimer = null;

function createEmptyBoard() {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(null));
}

function initBoardGrid() {
  boardElement.innerHTML = "";
  cells = [];

  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const cell = document.createElement("div");
      cell.className = "cell";
      cell.dataset.row = row;
      cell.dataset.col = col;
      boardElement.appendChild(cell);
      cells.push(cell);
    }
  }
}

function getCell(row, col) {
  if (row < 0 || row >= ROWS || col < 0 || col >= COLS) {
    return null;
  }
  return cells[row * COLS + col];
}

function clearCellVisual(cell) {
  cell.className = "cell";
}

function fillCell(cell, colorClass) {
  if (cell) {
    cell.className = `cell filled ${colorClass}`;
  }
}

function forEachPieceBlock(piece, callback) {
  if (!piece) {
    return;
  }

  for (let shapeRow = 0; shapeRow < piece.shape.length; shapeRow++) {
    for (let shapeCol = 0; shapeCol < piece.shape[shapeRow].length; shapeCol++) {
      if (piece.shape[shapeRow][shapeCol] !== 1) {
        continue;
      }

      callback(shapeRow, shapeCol);
    }
  }
}

// 블록 생성
function createPiece(type) {
  const definition = PIECES[type];
  if (!definition) {
    throw new Error(`Unknown piece type: ${type}`);
  }

  return {
    type,
    shape: definition.shape.map((row) => [...row]),
    colorClass: definition.colorClass,
    row: 0,
    col: Math.floor((COLS - definition.shape[0].length) / 2),
  };
}

function createRandomPiece() {
  const type = PIECE_TYPES[Math.floor(Math.random() * PIECE_TYPES.length)];
  return createPiece(type);
}

// 충돌 판정: (dx, dy)만큼 이동했을 때 보드 안·빈 칸인지 확인
function canMove(piece, dx, dy, matrix) {
  if (!piece || !matrix) {
    return false;
  }

  let canPlace = true;

  forEachPieceBlock(piece, (shapeRow, shapeCol) => {
    if (!canPlace) {
      return;
    }

    const newRow = piece.row + shapeRow + dy;
    const newCol = piece.col + shapeCol + dx;

    if (newCol < 0 || newCol >= COLS || newRow >= ROWS || newRow < 0) {
      canPlace = false;
      return;
    }

    if (matrix[newRow][newCol]) {
      canPlace = false;
    }
  });

  return canPlace;
}

function movePiece(dx, dy) {
  if (!canMove(currentPiece, dx, dy, board)) {
    return false;
  }

  currentPiece.row += dy;
  currentPiece.col += dx;
  return true;
}

function rotateMatrix(matrix) {
  const rows = matrix.length;
  const cols = matrix[0].length;
  const rotated = Array.from({ length: cols }, () => Array(rows).fill(0));

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      rotated[col][rows - 1 - row] = matrix[row][col];
    }
  }

  return rotated;
}

function rotatePiece() {
  if (!currentPiece) {
    return false;
  }

  const previousShape = currentPiece.shape;
  currentPiece.shape = rotateMatrix(previousShape);

  if (!canMove(currentPiece, 0, 0, board)) {
    currentPiece.shape = previousShape;
    return false;
  }

  return true;
}

function moveDown() {
  if (!currentPiece) {
    return;
  }

  if (canMove(currentPiece, 0, 1, board)) {
    currentPiece.row += 1;
    renderBoard();
    return;
  }

  settleCurrentPiece();
  renderBoard();
}

function hardDrop() {
  if (!currentPiece) {
    return;
  }

  while (canMove(currentPiece, 0, 1, board)) {
    currentPiece.row += 1;
  }

  settleCurrentPiece();
  renderBoard();
}

function isRowFull(row) {
  const boardRow = board[row];

  if (!boardRow || boardRow.length !== COLS) {
    return false;
  }

  return boardRow.every((cell) => cell !== null);
}

function clearLines() {
  let linesCleared = 0;

  for (let row = ROWS - 1; row >= 0; row--) {
    if (!isRowFull(row)) {
      continue;
    }

    board.splice(row, 1);
    board.unshift(Array(COLS).fill(null));
    linesCleared += 1;
    row += 1;
  }

  return linesCleared;
}

function addScore(linesCleared) {
  if (linesCleared <= 0) {
    return;
  }

  if (linesCleared <= 4) {
    score += LINE_SCORES[linesCleared];
  } else {
    score += LINE_SCORES[4] + (linesCleared - 4) * LINE_SCORES[1];
  }

  updateScoreDisplay();
}

function lockPiece() {
  if (!currentPiece) {
    return false;
  }

  const placements = [];
  let canLock = true;

  forEachPieceBlock(currentPiece, (shapeRow, shapeCol) => {
    if (!canLock) {
      return;
    }

    const boardRow = currentPiece.row + shapeRow;
    const boardCol = currentPiece.col + shapeCol;

    if (boardRow < 0 || boardRow >= ROWS || boardCol < 0 || boardCol >= COLS) {
      canLock = false;
      return;
    }

    if (board[boardRow][boardCol]) {
      canLock = false;
      return;
    }

    placements.push({ boardRow, boardCol });
  });

  if (!canLock) {
    return false;
  }

  for (const { boardRow, boardCol } of placements) {
    board[boardRow][boardCol] = {
      type: currentPiece.type,
      colorClass: currentPiece.colorClass,
    };
  }

  return true;
}

function afterLock() {
  currentPiece = null;

  const linesCleared = clearLines();
  addScore(linesCleared);

  if (!spawnNewPiece()) {
    setGameOver();
  }
}

function settleCurrentPiece() {
  if (!lockPiece()) {
    currentPiece = null;
    setGameOver();
    return;
  }

  afterLock();
}

function spawnNewPiece() {
  const nextPiece = createRandomPiece();

  if (!canMove(nextPiece, 0, 0, board)) {
    currentPiece = null;
    return false;
  }

  currentPiece = nextPiece;
  return true;
}

function setGameOver() {
  isGameOver = true;
  currentPiece = null;
  stopGame();
  showGameOverOverlay();
}

function showGameOverOverlay() {
  if (gameOverElement) {
    gameOverElement.classList.remove("hidden");
  }
}

function hideGameOverOverlay() {
  if (gameOverElement) {
    gameOverElement.classList.add("hidden");
  }
}

function dropStep() {
  if (!isPlaying || !currentPiece) {
    return;
  }

  moveDown();
}

// 현재 블록을 보드 위에 그리기
function drawPiece(piece) {
  forEachPieceBlock(piece, (shapeRow, shapeCol) => {
    const boardRow = piece.row + shapeRow;
    const boardCol = piece.col + shapeCol;
    fillCell(getCell(boardRow, boardCol), piece.colorClass);
  });
}

// 보드 렌더링 (고정된 블록 + 현재 블록)
function renderBoard() {
  for (const cell of cells) {
    clearCellVisual(cell);
  }

  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const block = board[row][col];
      if (!block) {
        continue;
      }

      fillCell(getCell(row, col), block.colorClass);
    }
  }

  drawPiece(currentPiece);
}

function updateScoreDisplay() {
  if (scoreElement) {
    scoreElement.textContent = score;
  }
}

function startDropTimer() {
  stopDropTimer();
  dropTimer = setInterval(dropStep, DROP_INTERVAL_MS);
}

function stopDropTimer() {
  if (dropTimer) {
    clearInterval(dropTimer);
    dropTimer = null;
  }
}

function startGame() {
  if (isPlaying || isGameOver) {
    return;
  }

  if (!currentPiece && !spawnNewPiece()) {
    setGameOver();
    renderBoard();
    return;
  }

  isPlaying = true;
  startDropTimer();
  renderBoard();
}

function stopGame() {
  isPlaying = false;
  stopDropTimer();
}

function resetGame() {
  stopGame();
  isGameOver = false;
  hideGameOverOverlay();
  board = createEmptyBoard();
  score = 0;
  currentPiece = createRandomPiece();
  updateScoreDisplay();
  renderBoard();
}

let keyboardBound = false;

function handleKeyDown(event) {
  if (!isPlaying || !currentPiece || isGameOver) {
    return;
  }

  const actions = {
    ArrowLeft: () => movePiece(-1, 0),
    ArrowRight: () => movePiece(1, 0),
    ArrowDown: () => {
      moveDown();
      return false;
    },
    ArrowUp: () => rotatePiece(),
    " ": () => {
      hardDrop();
      return false;
    },
  };

  const action = actions[event.key];
  if (!action) {
    return;
  }

  event.preventDefault();

  const shouldRender = action();
  if (shouldRender !== false) {
    renderBoard();
  }
}

function initKeyboardControls() {
  if (keyboardBound) {
    return;
  }

  document.addEventListener("keydown", handleKeyDown);
  keyboardBound = true;
}

startBtn.addEventListener("click", () => {
  startGame();
});

restartBtn.addEventListener("click", () => {
  resetGame();
});

initBoardGrid();
initKeyboardControls();
resetGame();
