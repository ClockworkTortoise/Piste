// Number of columns on each side of the board, not including the center column.
// For example, span of 4 means nine total columns (4 on the left, 1 in the center, 4 on the right).
const SPAN = 4;
// Number of initially uncontrolled spaces in the leftmost and rightmost columns.
// This is a total including both players and the neutral row, so the alignment of the neutral row will depend on whether this is odd or even.
const MID_HEIGHT = 6;

// Total number of columns is two lateral regions of width SPAN, plus one central column.
const NUM_COLS = 2 * SPAN + 1;
// Number of rows which contain at least one board space.
// A "row" consists of all spaces whose center has the same vertical coordinate.
// The math is due to the following count of rows:
// - One at the top, containing only the uppermost core space for the top player
// - Another SPAN rows where the board gets wider, with the outermost spaces in these rows being in the top player's core
// - MID_HEIGHT rows which occupy the outer edges of the board between the top and bottom core regions
// - MID_HEIGHT+1 rows of the other parity, in the notches between, before, and after the MID_HEIGHT rows in the intermediate space on the outer edges
// - SPAN rows whose outermost spaces are in the bottom player's core, where the board starts to narrow toward the bottom
// - One final row at the bottom, containing only the uppermost core space for the bottom player
const NUM_ROWS = 2 * (SPAN + MID_HEIGHT) + 3;
// Index of the middle row of the board
const MID_ROW = (NUM_ROWS - 1) / 2;

// Number of rows on each side of the center row that aren't controlled by either player at the start of the game.
const STARTING_UNCONTROLLED_DEPTH = 4;

// Number of cards each player draws up to at the start of the game and the end of each of their turns
const HAND_SIZE = 3;

// We'll need this a lot for calculating the centers of hexes, so let's just calculate it once
const SQRT3 = Math.sqrt(3);

// Data for the two players.
// "core" and "control" are the flags used to indicate the core spaces and other controlled spaces for each player.
var players = [
  // players[0] is the player that starts from the top of the board
  {
    core: 10,
    control: 0,
    coreFill: "#000080",
    fill: "#0000d0",
  },
  // players[1] is the player that starts from the bottom of the board
  {
    core: 11,
    control: 1,
    coreFill: "#800000",
    fill: "#d00000",
  }
];
// Marker and fill style for spaces not currently controlled by either player
const UNCONTROLLED = -1;
const UNCONTROLLED_FILL = "#404040";
// Marker for entries which appear in the array of board spaces just to make it rectangular but don't actually represent spaces on the board
const NOT_ON_BOARD = -99;

// Data regarding the set of cards that exist in the game.
var cards = [
  {
    name: "Jab",
  },
  {
    name: "Thrust",
  },
  {
    name: "Lunge",
  },
  {
    name: "Slice",
  },
  {
    name: "Slash",
  },
  {
    name: "Hack",
  },
  {
    name: "Chop",
  },
  {
    name: "Whack",
  },
  {
    name: "Bash",
  },
  {
    name: "Crush",
  },
  {
    name: "Feint",
  },
  {
    name: "Block",
  },
  {
    name: "Parry",
  },
  {
    name: "Brace",
  },
];

// We'll store a reference to the game canvas and its 2D drawing context in order to not have to call getElementById everywhere.
var canvas;
var ctx;

// Data relating to how the game state should be drawn
var graphics = {
  // Amount of empty space in the canvas around the outside of the board, and between different game elements
  margin: 15,
  // Length of the side of the area allocated for a board space INCLUDING its share of the border between spaces
  spacing: 35,
  // Length of the side of the area allocated for a board space EXCLUDING its share of the border between spaces
  // (i.e. only the region that's colored). This should be less than "spacing".
  hexSize: 32,
  // Font to use for labeling point values on board spaces
  boardLabelFont: "20px Arial",
  // Font to use for card titles
  cardTitleFont: "25px Arial",
  // Font to use for the "This player's turn" label
  activePlayerLabelFont: "40px Arial",
  // Horizontal offset from left side of board to left side of area indicating players' hands
  handLeftBorderX: 600,
  // Width of the space allocated for displaying each card in each player's hand
  cardSpaceWidth: 200,
  // Height of the space allocated for displaying each card in each player's hand
  cardSpaceHeight: 300,
  // Width that cards are displayed at when not actively selected
  unselectedCardWidth: 160,
  // Height that cards are displayed at when not actively selected
  unselectedCardHeight: 240,
  // Radius of the rounded corner used when displaying cards
  cardCornerRadius: 10,
  // Width of the black border displayed around each card
  cardBorderWidth: 2,
  // Height of the space allocated for the title at the top of each card
  cardTitleHeight: 40,
};

// All game state that's not specific to a particular player, including who controls what parts of the board, whose turn it is, etc.
var gameState = {
  // This will be initialized as a rectangular array where the column is the first coordinate
  // and the row is the second coordinate
  board: [],
  // The player whose turn it is (will be randomly set to 0 or 1 at the start of the game)
  activePlayer: -1,
  // Index of the card which the active player currently has selected in their hand (-1 for "no card selected")
  selectedCard: -1,
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
  // First, the players' core spaces and the rows containing them.
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
  // Now mark the intermediate area.
  for (let row = SPAN + 1; row < NUM_ROWS - SPAN - 1; row++) {
    // Check who owns this row at the start of the game.
    let distanceFromMiddleRow = row - MID_ROW;
    let owner = UNCONTROLLED;
    if (distanceFromMiddleRow < -STARTING_UNCONTROLLED_DEPTH) {
      owner = players[0].control;
    } else if (distanceFromMiddleRow > STARTING_UNCONTROLLED_DEPTH) {
      owner = players[1].control;
    }
    // Each row contains EITHER even-numbered OR odd-numbered columns.
    // Since column 0 starts at row number SPAN, and rows alternate between those that contain even-numbered columns
    // and those that contain odd-numbered columns, we can check which kind this row is by calculating the difference
    // between the current row number and SPAN, and taking the result mod 2.
    for (let col = (row - SPAN) % 2; col < NUM_COLS; col += 2) {
      gameState.board[col][row] = owner;
    }
  }

  // The board has now been initialized, so we can draw it here
  drawBoard();

  // Draw starting hands
  players[0].hand = [];
  players[1].hand = [];
  for (let i = 0; i < HAND_SIZE; i++) {
    players[0].hand[i] = getRandomCard();
    players[1].hand[i] = getRandomCard();
  }
  // Draw starting hands (in the other sense of "draw")
  drawHand(0);
  drawHand(1);

  // Choose the first player
  gameState.activePlayer = Math.floor(Math.random() * 2);
  markActivePlayer();
}

function handleClick(event) {
  // If the click was in a card space belonging to the active player, select or deselect that card
  // offsetX, offsetY
  let cardClicked = whichCard(event.offsetX, event.offsetY);
  if (cardClicked != null) {
    if (cardClicked.player === gameState.activePlayer) {
      let previouslySelectedCard = gameState.selectedCard;
      // If the player clicked a card they had previously selected, we'll deselect it.
      // If they clicked on a different card, we'll switch their selection to that card.
      // In either case, if they previously had a card selected, then we'll deselect it.
      if (previouslySelectedCard !== -1) {
        drawCard(players[gameState.activePlayer].hand[previouslySelectedCard],
                 gameState.activePlayer,
                 cardLeftBorderX(previouslySelectedCard),
                 handTopY(gameState.activePlayer));
        gameState.selectedCard = -1;
      }
      // We need to select a card only if the player didn't click on their previously selected card
      if (cardClicked.cardIndex != previouslySelectedCard) {
        drawCard(players[gameState.activePlayer].hand[cardClicked.cardIndex],
                 gameState.activePlayer,
                 cardLeftBorderX(cardClicked.cardIndex),
                 handTopY(gameState.activePlayer),
                 true);
        gameState.selectedCard = cardClicked.cardIndex;
      }
    }
    // If a card was clicked on, then we don't need to check if anything else was clicked on,
    // so we can just return out of the method here
    return;
  }
}

// Determines whether the given coordinates are in a card space.
// If so, returns an object indicating which player and card the coordinates belong to;
// otherwise, returns null.
function whichCard(x, y) {
  let player = Math.floor((y - graphics.margin) / (graphics.cardSpaceHeight + graphics.margin));
  if (player < 0 || player > 1) {
    return null;
  }
  let cardIndex = Math.floor((x - graphics.handLeftBorderX) / (graphics.cardSpaceWidth + graphics.margin));
  if (cardIndex < 0 || cardIndex >= HAND_SIZE) {
    return null;
  }

  return {player: player, cardIndex: cardIndex};
}

function drawBoard() {
  for (let col = 0; col < NUM_COLS; col++) {
    let x = colCenterX(col);
    for (let row = topRowForColumn(col); row < rowLimitForColumn(col); row += 2) {
      let y = rowCenterY(row);
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
        default:
          // In theory every board space should match one of the above.
          // If we somehow get a board space that doesn't, then we'll just
          // leave it as NOT_ON_BOARD.
      }
      if (fill !== NOT_ON_BOARD) {
        let label = "-";
        let scoreValue = getScoreValue(col, row);
        if (scoreValue > 0) {
          label = scoreValue + "↑";
        } else if (scoreValue < 0) {
          label = (-scoreValue) + "↓";
        }
        drawHex(x, y, graphics.hexSize, fill, label);
      }
    }
  }
}

// Returns index of the highest row on the board in the given column
function topRowForColumn(col) {
  return Math.abs(col - SPAN);
}

// Returns 1 plus the index of the lowest row on the board in the given column
// (so that the standard for loop paradigm "index < limit" can be used)
function rowLimitForColumn(col) {
  return NUM_ROWS - Math.abs(col - SPAN);
}

// Returns the score value associated with a particular board space.
// If the space scores for the player that starts from the bottom, the return value will be negative to indicate this.
function getScoreValue(col, row) {
  // Value for a non-core space is just how far it is from the center row.
  // Rows above that row (with lower index) score for the bottom player,
  // and rows below it (with higher index) score for the top player.
  let score = row - MID_ROW;
  // Core spaces score more points, especially the uppermost and lowermost peaks of the board,
  // so let's figure out if it's a core space.
  if (row === 0 || row === NUM_ROWS - 1) {
    // The only spaces in these rows are the extreme tips of the board
    score += (SPAN + 2) * (score > 0 ? 1 : -1);
  } else {
    // Other core spaces are those for which the horizontal distance from the column is equal to
    // the vertical distance from the top or bottom row.
    let laterality = Math.abs(col - SPAN);
    if (laterality === row || laterality === NUM_ROWS - 1 - row) {
      score += (SPAN + 1 - laterality) * (score > 0 ? 1 : -1);
    }
  }
  return score;
}

function colCenterX(col) {
  return graphics.margin + graphics.spacing + col * graphics.spacing * 3 / 2;
}

function rowCenterY(row) {
  return graphics.margin + (row + 1) * graphics.spacing * SQRT3 / 2;
}

function drawHex(centerX, centerY, sideLength, fill, label = "") {
  ctx.beginPath();
  ctx.moveTo(centerX + sideLength, centerY);
  for (let i = 1; i < 6; i++) {
    let angle = i * Math.PI / 3;
    ctx.lineTo(centerX + sideLength * Math.cos(angle), centerY + sideLength * Math.sin(angle));
  }
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();

  if (label !== "") {
    ctx.font = graphics.boardLabelFont;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "white";
    ctx.fillText(label, centerX, centerY);
  }
}

// Draws an indication of whose turn it is (and erases any previous indication of it being the other player's turn)
function markActivePlayer() {
  ctx.font = graphics.activePlayerLabelFont;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";

  let handRightBorderX = handRightX();

  // Mark active player
  ctx.fillStyle = players[gameState.activePlayer].coreFill;
  let handMidY = handTopY(gameState.activePlayer) + graphics.cardSpaceHeight / 2;
  ctx.fillText("← Your turn", handRightBorderX, handMidY);

  // Clear mark for inactive player
  ctx.clearRect(handRightBorderX, handTopY(1 - gameState.activePlayer), canvas.width - handRightBorderX, graphics.cardSpaceHeight);
}

// Draws the given player's hand (in the graphics sense of the word "draw")
function drawHand(playerNum) {
  let player = players[playerNum];
  let topY = handTopY(playerNum);
  for (let i = 0; i < player.hand.length; i++) {
    drawCard(player.hand[i], playerNum, cardLeftBorderX(i), topY);
  }
}

function cardLeftBorderX(cardIndex) {
  return graphics.handLeftBorderX + cardIndex * (graphics.cardSpaceWidth + graphics.margin);
}

function handRightX() {
  return cardLeftBorderX(HAND_SIZE);
}

function handTopY(playerNum) {
  return graphics.margin + playerNum * (graphics.cardSpaceHeight + graphics.margin);
}

// Draws (in the graphical sense) a specific card in a space whose upper-left corner is at the given coordinates.
// Player number is used to determine the orientation of the illustration of the card's effects.
function drawCard(card, playerNum, x, y, isSelected = false) {
  // Clear out anything that might have been in the card slot before
  ctx.clearRect(x, y, graphics.cardSpaceWidth, graphics.cardSpaceHeight);

  // Use a shorter name for this radius to make the code more readable
  let radius = graphics.cardCornerRadius;

  // Since lines are centered on the coordinates used, the card border will leak out of the card space slightly
  // unless we shift the coordinates to be slightly narrower than the card space.
  let width = graphics.cardSpaceWidth - graphics.cardBorderWidth;
  let height = graphics.cardSpaceHeight - graphics.cardBorderWidth;
  let leftX = x + graphics.cardBorderWidth / 2;
  let rightX = leftX + width;
  let topY = y + graphics.cardBorderWidth / 2;
  let bottomY = topY + height;

  if (!isSelected) {
    // Adjust width/height, and x/y coordinates of upper left corner of card display area,
    // so as to put an unselected card in the center of the space allocated for it
    width = graphics.unselectedCardWidth;
    height = graphics.unselectedCardHeight;

    let horizontalMargin = (graphics.cardSpaceWidth - graphics.unselectedCardWidth) / 2;
    leftX += horizontalMargin;
    rightX -= horizontalMargin;
    let verticalMargin = (graphics.cardSpaceHeight - graphics.unselectedCardHeight) / 2;
    topY += verticalMargin;
    bottomY -= verticalMargin;
  }

  // Fill in card and draw outer border
  ctx.beginPath();
  ctx.arc(leftX + radius, topY + radius, radius, Math.PI, Math.PI * 3 / 2);
  ctx.arc(rightX - radius, topY + radius, radius, Math.PI * 3 / 2, 0);
  ctx.arc(rightX - radius, bottomY - radius, radius, 0, Math.PI / 2);
  ctx.arc(leftX + radius, bottomY - radius, radius, Math.PI / 2, Math.PI);
  ctx.closePath();
  ctx.fillStyle = "white";
  ctx.fill();
  ctx.strokeStyle = "black";
  ctx.lineWidth = graphics.cardBorderWidth;
  ctx.stroke();

  // Add title
  ctx.beginPath();
  ctx.moveTo(leftX, topY + graphics.cardTitleHeight);
  ctx.lineTo(rightX, topY + graphics.cardTitleHeight);
  ctx.stroke();
  ctx.font = graphics.cardTitleFont;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "black";
  ctx.fillText(card.name, (leftX + rightX) / 2, topY + graphics.cardTitleHeight / 2);
}

// Creates and returns a random card.
// (This game doesn't use a deck; each card is equally likely to be generated
// regardless of how many of it are already in players' hands or were played recently.)
function getRandomCard() {
  let cardIndex = Math.floor(Math.random() * cards.length);
  return cards[cardIndex];
}
