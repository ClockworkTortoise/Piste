// Number of columns on each side of the board, not including the center column.
// For example, span of 4 means nine total columns (4 on the left, 1 in the center, 4 on the right).
const SPAN = 4;
// Number of initially uncontrolled spaces in the leftmost and rightmost columns.
// This is a total including both players and the neutral row, so the alignment of the neutral row will depend on whether this is odd or even.
const SPACING = 6;

// Total number of columns is two lateral regions of width SPAN, plus one central column.
const NUM_COLS = 2 * SPAN + 1;
// Number of rows which contain at least one board space.
// A "row" consists of all spaces whose center has the same vertical coordinate.
// The math is due to the following count of rows:
// - One at the top, containing only the uppermost core space for the top player
// - Another SPAN rows where the board gets wider, with the outermost spaces in these rows being in the top player's core
// - SPACING rows which occupy the outer edges of the board between the top and bottom core regions
// - SPACING+1 rows of the other parity, in the notches between, before, and after the SPACING rows in the intermediate space on the outer edges
// - SPAN rows whose outermost spaces are in the bottom player's core, where the board starts to narrow toward the bottom
// - One final row at the bottom, containing only the uppermost core space for the bottom player
const NUM_ROWS = 2 * (SPAN + SPACING) + 3;

// We'll need this a lot for calculating the centers of hexes, so let's just calculate it once
const SQRT3 = Math.sqrt(3);

// Data for the two players.
// "core" and "control" are the flags used to indicate the core spaces and other controlled spaces for each player.
var players = [
  // players[0] is the player that starts from the top of the board
  {
    core: 10,
    control: 0,
    coreFill: "#000090",
    fill: "#0000ff",
  },
  // players[1] is the player that starts from the top of the board
  {
    core: 11,
    control: 1,
    coreFill: "#900000",
    fill: "#ff0000",
  }
]
// Marker and fill style for spaces not currently controlled by either player
const UNCONTROLLED = -1;
const UNCONTROLLED_FILL = "#404040";
// Marker for entries which appear in the array of board spaces just to make it rectangular but don't actually represent spaces on the board
const NOT_ON_BOARD = -99;

// We'll store a reference to the game canvas and its 2D drawing context in order to not have to call getElementById everywhere.
var canvas;
var ctx;

// Data relating to how the game state should be drawn
var graphics = {
  // Amount of empty space in the canvas around the outside of the board
  margin: 15,
  // Length of the side of the area allocated for a board space INCLUDING its share of the border between spaces
  spacing: 35,
  // Length of the side of the area allocated for a board space EXCLUDING its share of the border between spaces
  // (i.e. only the region that's colored). This should be less than "spacing".
  hexSize: 32,
};

// All game state, including who controls what parts of the board, cards in players' hands, whose turn it is, etc.
var gameState = {
  // This will be initialized as a rectangular array where the column is the horizontal coordinate
  // and the row is the vertical coordinate
  board: [],
};

// Creates the entire game for the first time, including initializing certain things.
function createGame() {
  canvas = document.getElementById("game-canvas");
  ctx = canvas.getContext("2d");

  // TODO: consider dynamically deciding how big to make the game components based on the size of the canvas
  // (ideally also determine how big to make the canvas based on the size of the screen)

  initializeGame();
}

// Wipes the game state and starts a new play of the game.
// Called by createGame() when the page is loaded, and again whenever the players want to start a new game.
function initializeGame() {
  gameState.board = [];
  // Initialize everything as "not on the board"
  for (let col = 0; col < NUM_COLS; col++) {
    gameState.board[col] = [];
    for (let row = 0; row < NUM_ROWS; row++) {
      gameState.board[col][row] = NOT_ON_BOARD;
    }
  }

  // Then mark the actual spaces with their owners or "no owner".
  // First, the players' starting zones.
  for (let offset = 0; offset <= SPAN; offset++) {
    // Left end of the upper player's row at this offset
    gameState.board[SPAN - offset][offset] = players[0].core;
    // Right end of the upper player's row (yes, this is redundant with the last line for the uppermost row)
    gameState.board[SPAN + offset][offset] = players[0].core;

    let lowerPlayerRow = NUM_ROWS - 1 - offset;
    // Left end of the lower player's row at this offset
    gameState.board[SPAN - offset][lowerPlayerRow] = players[1].core;
    // Right end of the lower player's row (yes, this is redundant with the last line for the lowest row)
    gameState.board[SPAN + offset][lowerPlayerRow] = players[1].core;

    // Fill in the middle of those two rows.
    // Note that each row contains only half of all columns, so we have to increment the column number by 2.
    for (let col = SPAN - offset + 2; col < SPAN + offset; col += 2) {
      gameState.board[col][offset] = players[0].control;
      gameState.board[col][lowerPlayerRow] = players[1].control;
    }
  }
  // Now mark the intermediate area as unowned
  for (let row = SPAN + 1; row < NUM_ROWS - SPAN - 1; row++) {
    // Each row contains EITHER even-numbered OR odd-numbered columns.
    // Since column 0 starts at row number SPAN, and rows alternate between those that contain even-numbered columns
    // and those that contain odd-numbered columns, we can check which kind this row is by calculating the difference
    // between the current row number and SPAN, and taking the result mod 2.
    for (let col = (row - SPAN) % 2; col < NUM_COLS; col += 2) {
      gameState.board[col][row] = UNCONTROLLED;
    }
  }

  // Now we're ready to display the game board!
  drawBoard();
}

function drawBoard() {
  let leftColCenterX = graphics.margin + graphics.spacing;
  let topRowCenterY = graphics.margin + graphics.spacing * SQRT3 / 2;
  for (let col = 0; col < NUM_COLS; col++) {
    console.log("leftColCenterX is " + leftColCenterX);
    let x = leftColCenterX + col * graphics.spacing * 3 / 2;
    console.log("x is " + x);
    // Slight optimization based on the shape of the top of the board so we don't have to look at every row value.
    // The board is "squeezed" inward from both ends by an amount equal to the distance from the center column.
    let squeeze = Math.abs(col - SPAN);
    for (let row = squeeze; row < NUM_ROWS - squeeze; row += 2) {
      let y = topRowCenterY + row * graphics.spacing * SQRT3 / 2;
      let fill = NOT_ON_BOARD;
      switch(gameState.board[col][row]) {
        case players[0].core:
          fill = players[0].coreFill;
          break;
        case players[0].control:
          fill = players[0].fill;
          break;
        case players[1].core:
          fill = players[1].coreFill;
          break;
        case players[1].control:
          fill = players[1].fill;
          break;
        case UNCONTROLLED:
          fill = UNCONTROLLED_FILL;
          break;
      }
      console.log("Drawing " + fill + " at (" + x + ", " + y + ")");
      if (fill !== NOT_ON_BOARD) {
        drawHex(x, y, graphics.hexSize, fill);
      }
    }
  }
}

function drawHex(centerX, centerY, sideLength, fill) {
  ctx.beginPath();
  ctx.moveTo(centerX + sideLength, centerY);
  for (let i = 1; i < 6; i++) {
    let angle = i * Math.PI / 3;
    ctx.lineTo(centerX + sideLength * Math.cos(angle), centerY + sideLength * Math.sin(angle));
  }
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
}
