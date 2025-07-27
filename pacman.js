// board Setup
let board;
const rowCount = 21; // number of rows in grid
const columnCount = 19; // number of columns in grid
const tileSize = 32; // Each tile is 32*32 pixels
const boardWidth = columnCount * tileSize;
const boardHeight = rowCount * tileSize;
let context;

let powerMode = false;
let powerTimer = 0;

//images Declarations
// let wallImage;
let blueGhostImage;
let orangeGhostImage;
let pinkGhostImage;
let redGhostImage;
let pacmanUpImage;
let pacmanDownImage;
let pacmanLeftImage;
let pacmanRightImage;
let wall;

// Map Layout
const tileMap = [
  "XXXXXXXXXXXXXXXXXXX",
  "X        X        X",
  "X XX XXX X XXX XX X", // X is wall
  "X           @     X", // ' ' is food
  "X XX X XXXXX X XX X", // 'P' is Pac-Man
  "X  @  X       X   X", // 'b','o','p','r' are ghosts
  "XXXX XXXX XXXX XXXX",
  "OOOX X       X XOOO",
  "XXXX X XXrXX X XXXX",
  "O       bpo       O",
  "XXXX X XXXXX X XXXX",
  "OOOX X       X XOOO",
  "XXXX X XXXXX X XXXX",
  "X        X        X",
  "X XX XXX X XXX XX X",
  "X  X     P     X  X",
  "XX X X XXXXX X X XX",
  "X    X   X   X    X",
  "X XXXXXX X XXXXXX X",
  "X                 X",
  "XXXXXXXXXXXXXXXXXXX",
];

// Tile Containers
const walls = new Set(); //Set stores elements of wall, foods, ghosts, pacman
const foods = new Set();
const ghosts = new Set();
let pacman;

const directions = ["U", "D", "L", "R"];

let score = 0;
let lives = 3;
let gameOver = false;

// Window Load Event
window.onload = function () {
  // Special event that runs after entire page is loaded
  board = document.getElementById("board"); // Finds canvas with id board
  board.height = boardHeight;
  board.width = boardWidth;
  context = board.getContext("2d");

  loadImages();
  loadMap();
  update();
  for (let ghost of ghosts.values()) {
    const newDirection = directions[Math.floor(Math.random() * 4)];
    ghost.updateDirection(newDirection);
  }

  document.addEventListener("keyup", movePacman);
};

//LoadImages Function                  Loads images into respective variables
function loadImages() {
  //new Image() creates a new HTML <img> element in JavaScript (but not visible in the DOM).
  wallImage = new Image(); // it is equivalent to document.createElement("img");
  wallImage.src = "pacmanImages/wall.png";

  blueGhostImage = new Image();
  blueGhostImage.src = "pacmanImages/blueGhost.png";
  orangeGhostImage = new Image();
  orangeGhostImage.src = "pacmanImages/orangeGhost.png";
  pinkGhostImage = new Image();
  pinkGhostImage.src = "pacmanImages/pinkGhost.png";
  redGhostImage = new Image();
  redGhostImage.src = "pacmanImages/redGhost.png";

  pacmanUpImage = new Image();
  pacmanUpImage.src = "pacmanImages/pacmanUp.png";
  pacmanDownImage = new Image();
  pacmanDownImage.src = "pacmanImages/pacmanDown.png";
  pacmanLeftImage = new Image();
  pacmanLeftImage.src = "pacmanImages/pacmanLeft.png";
  pacmanRightImage = new Image();
  pacmanRightImage.src = "pacmanImages/pacmanRight.png";
}

// LoadMap Function
function loadMap() {
  walls.clear(); // clears all the previously loaded tiles
  foods.clear();
  ghosts.clear();

  for (let r = 0; r < rowCount; r++) {
    // Iterates over each row
    for (let c = 0; c < columnCount; c++) {
      // Iterates over each column

      const row = tileMap[r]; // Gets the row string like X XX XXX X XXX XX X
      const tileMapChar = row[c]; // Picks character at the column c like X for wall

      const x = c * tileSize; // Converts grid coordinates into pixel coordinates
      const y = r * tileSize;

      if (tileMapChar == "X") {
        const wall = new Block(wallImage, x, y, tileSize, tileSize);
        walls.add(wall);
      } else if (tileMapChar == "b") {
        const ghost = new Block(blueGhostImage, x, y, tileSize, tileSize);
        ghosts.add(ghost);
      } else if (tileMapChar == "o") {
        const ghost = new Block(orangeGhostImage, x, y, tileSize, tileSize);
        ghosts.add(ghost);
      } else if (tileMapChar == "p") {
        const ghost = new Block(pinkGhostImage, x, y, tileSize, tileSize);
        ghosts.add(ghost);
      } else if (tileMapChar == "r") {
        const ghost = new Block(redGhostImage, x, y, tileSize, tileSize);
        ghosts.add(ghost);
      } else if (tileMapChar == "P") {
        pacman = new Block(pacmanRightImage, x, y, tileSize, tileSize);
      } else if (tileMapChar == " ") {
        const food = new Block(null, x + 14, y + 14, 4, 4);
        food.type = "food";
        foods.add(food);
      } else if (tileMapChar == "@") {
        const powerPellet = new Block(null, x + 12, y + 12, 8, 8);
        powerPellet.type = "power";
        foods.add(powerPellet);
      }
    }
  }
}

function update() {
  if (gameOver) {
    return;
  }
  move();
  draw();
  setTimeout(update, 50); // after every 50ms this function calls itself again and again
} // pacman moves // screen gets cleared // Everything is redrawn in the new position // repeat

function draw() {
  // caalled after every 50ms by update
  context.clearRect(0, 0, boardWidth, boardHeight); // clears canvas
  context.drawImage(
    pacman.image, // shows updated pacman position
    pacman.x,
    pacman.y,
    pacman.width,
    pacman.height
  );
  for (let ghost of ghosts.values()) {
    context.drawImage(ghost.image, ghost.x, ghost.y, ghost.width, ghost.height); // show al ghosts
  }
  for (let wall of walls.values()) {
    context.drawImage(wall.image, wall.x, wall.y, wall.width, wall.height); // Redraw maze layout
  }
  context.fillStyle = "white";
  for (let food of foods.values()) {
    context.fillRect(food.x, food.y, food.width, food.height); // Shows remaining food pellets
  }

  // score
  context.fillStyle = "white";
  context.font = "14px sans-serif";
  if (gameOver) {
    context.fillText("Game Over: " + String(score), tileSize / 2, tileSize / 2);
  } else {
    context.fillText(
      "x" + String(lives) + " " + String(score),
      tileSize / 2,
      tileSize / 2
    );
  }
}

function move() {
  // called after every 50ms by update
  pacman.x += pacman.velocityX;
  pacman.y += pacman.velocityY;

  // ✅ Wrap Pac-Man horizontally
  if (pacman.x < -pacman.width) {
    pacman.x = boardWidth;
  } else if (pacman.x > boardWidth) {
    pacman.x = -pacman.width;
  }

  // check wall collisions
  for (let wall of walls.values()) {
    if (collision(pacman, wall)) {
      pacman.x -= pacman.velocityX; // if collision occurs pacman's move is undo i.e pushing it on its prev position
      pacman.y -= pacman.velocityY;
      break;
    }
  }
  for (let ghost of ghosts.values()) {
    if (collision(ghost, pacman)) {
      if (powerMode && ghost.inPowerMode) {
        score += 100;
        ghost.reset();
        const newDirection = directions[Math.floor(Math.random() * 4)];
        ghost.updateDirection(newDirection);
      } else {
        lives -= 1;
        if (lives == 0) {
          gameOver = true;
          return;
        }
        resetPositions();
        return;
      }
    }
    if (
      ghost.y == tileSize * 9 &&
      ghost.direction != "U" &&
      ghost.direction != "D"
    ) {
      ghost.updateDirection("U");
    }
    ghost.x += ghost.velocityX;
    ghost.y += ghost.velocityY;
    for (let wall of walls.values()) {
      if (
        collision(ghost, wall) ||
        ghost.x <= 0 ||
        ghost.x + ghost.width >= boardWidth
      ) {
        ghost.x -= ghost.velocityX;
        ghost.y -= ghost.velocityY;
        const newDirection = directions[Math.floor(Math.random() * 4)];
        ghost.updateDirection(newDirection);
      }
    }
  }

  // check food collision
  let foodEaten = null;
  for (let food of foods.values()) {
    if (collision(pacman, food)) {
      foodEaten = food;
      score += food.type === "power" ? 50 : 10;

      // Trigger power mode
      if (food.type === "power") {
        powerMode = true;
        powerTimer = 200; // lasts for 200 frames (~10 seconds)
        for (let ghost of ghosts.values()) {
          ghost.inPowerMode = true;
          ghost.image = blueGhostImage; // make all ghosts turn blue
        }
      }

      break;
    }
  }
  foods.delete(foodEaten);
  if (powerMode) {
    powerTimer--;
    if (powerTimer <= 0) {
      powerMode = false;
      for (let ghost of ghosts.values()) {
        ghost.inPowerMode = false;
        // restore ghost's original image
        if (ghost.image === blueGhostImage) {
          if (ghost.startX === 9 * tileSize) ghost.image = redGhostImage;
          else if (ghost.startX === 10 * tileSize) ghost.image = pinkGhostImage;
          else if (ghost.startX === 8 * tileSize)
            ghost.image = orangeGhostImage;
          else if (ghost.startX === 7 * tileSize) ghost.image = blueGhostImage;
        }
      }
    }
  }

  //next level
  if (foods.size == 0) {
    loadMap();
    resetPositions();
  }
}
function movePacman(e) {
  if (gameOver) {
    loadMap();
    resetPositions();
    lives = 3;
    score = 0;
    gameOver = false;
    update();
    return;
  }
  if (e.code == "ArrowUp" || e.code == "KeyW") {
    pacman.updateDirection("U");
  } else if (e.code == "ArrowDown" || e.code == "KeyS") {
    pacman.updateDirection("D");
  } else if (e.code == "ArrowRight" || e.code == "KeyD") {
    pacman.updateDirection("R");
  } else if (e.code == "ArrowLeft" || e.code == "KeyA") {
    pacman.updateDirection("L");
  }

  // update pacman images
  if (pacman.direction == "U") {
    pacman.image = pacmanUpImage;
  } else if (pacman.direction == "D") {
    pacman.image = pacmanDownImage;
  } else if (pacman.direction == "L") {
    pacman.image = pacmanLeftImage;
  } else if (pacman.direction == "R") {
    pacman.image = pacmanRightImage;
  }
}

function collision(a, b) {
  // checks if two rectangular objects a and b are overlapping called AXIS-ALIGNED BOUNDING BOX
  return (
    a.x < b.x + b.width && //is the left side of a to the left of right side of b
    a.x + a.width > b.x && // is the right side of a to the right of left side of  b
    a.y < b.y + b.height && //Is the top of a above the bottom of b
    a.y + a.height > b.y //Is the bottom of a below the top of b
  );
}

function resetPositions() {
  pacman.reset();
  pacman.velocityX = 0;
  pacman.velocityY = 0;
  for (let ghost of ghosts.values()) {
    ghost.reset();
    const newDirection = directions[Math.floor(Math.random() * 4)];
    ghost.updateDirection(newDirection);
  }
}

class Block {
  constructor(image, x, y, width, height) {
    this.image = image;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;

    this.startX = x;
    this.startY = y;

    this.direction = "R";
    this.velocityX = 0;
    this.velocityY = 0;
  }

  updateDirection(direction) {
    const prevDirection = this.direction;
    this.direction = direction;
    this.updateVelocity();
    this.x += this.velocityX;
    this.y += this.velocityY;

    for (let wall of walls.values()) {
      if (collision(this, wall)) {
        this.x -= this.velocityX;
        this.y -= this.velocityY;
        this.direction = prevDirection;
        this.updateVelocity();
        return;
      }
    }
  }

  updateVelocity() {
    if (this.direction == "U") {
      this.velocityX = 0;
      this.velocityY = -tileSize / 4;
    } else if (this.direction == "D") {
      this.velocityX = 0;
      this.velocityY = tileSize / 4;
    } else if (this.direction == "L") {
      this.velocityX = -tileSize / 4;
      this.velocityY = 0;
    } else if (this.direction == "R") {
      this.velocityX = tileSize / 4;
      this.velocityY = 0;
    }
  }

  reset() {
    this.x = this.startX;
    this.y = this.startY;
  }
}
