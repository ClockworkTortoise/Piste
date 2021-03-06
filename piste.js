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

// Number of points needed to win the game
const POINT_TARGET = 50;

// We'll need this a lot for calculating the centers of hexes, so let's just calculate it once
const SQRT3 = Math.sqrt(3);

// Data for the two players.
// "core" and "control" are the flags used to indicate the core spaces and other controlled spaces for each player.
// "coreFill" is the color used for the player's core spaces on the board.
// "fill" is the color used for the player's non-core spaces on the board, and most other things where we want to indicate a specific player via color.
// The following additional properties will be set when the game is started:
//   "hand": an array of cards in the player's hand
//   "score": number of points the player has earned
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
const UNCONTROLLED_FILL = "#5a5a5a";
// Marker for entries which appear in the array of board spaces just to make it rectangular but don't actually represent spaces on the board
const NOT_ON_BOARD = -99;

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
  // Fill style to use for labels on board spaces
  boardLabelFill: "white",
  // Font to use for card titles
  cardTitleFont: "25px Arial",
  // Font to use for player labels such as "Your turn" or the score counter
  playerLabelFont: "40px Arial",
  // General font class to use for card effect labels (the size will be determined by the size of the hexes in the effect)
  cardEffectLabelFontType: "Arial",
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
  // Minimum amount of space allowed between the border of a card and the visual depiction of its effect
  cardInternalMargin: 10,
};

// All game state that's not specific to a particular player, including who controls what parts of the board, whose turn it is, etc.
var gameState = {
  // This will be initialized as a rectangular array where the column is the first coordinate
  // and the row is the second coordinate. The game uses a "doubled" coordinate system, as described here:
  // https://www.redblobgames.com/grids/hexagons/#coordinates-doubled
  // The leftmost column is numbered 0, as is the row containing the space at the very top of the board.
  board: [],
  // The player whose turn it is (will be randomly set to 0 or 1 at the start of the game)
  activePlayer: -1,
  // Index of the card which the active player currently has selected in their hand (-1 for "no card selected")
  selectedCard: -1,
  // Column and row of the space which the user's mouse is currently aiming at (-1 for "not aiming at a space")
  focusCol: -1,
  focusRow: -1,
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
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  initializeBoard();
  initializeHands();

  ctx.font = graphics.playerLabelFont;
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillStyle = "black";
  ctx.fillText("Score to win: " + POINT_TARGET + " or greater", graphics.handLeftBorderX, handTopY(2));

  // Choose the first player
  gameState.activePlayer = Math.floor(Math.random() * 2);
  drawPlayerLabels();
}

function initializeBoard() {
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
}

function initializeHands() {
  // Now we move on to player setup - start by setting each player's score to zero
  players[0].score = 0;
  players[1].score = 0;

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
}

function handleClick(event) {
  // If the previous game has ended, then clicking anywhere will simply restart the game.
  if (gameState.activePlayer === -1) {
    initializeGame();
    return;
  }

  // If the click was in a card space belonging to the active player, select or deselect that card
  // offsetX, offsetY
  let cardClicked = whichCard(event.offsetX, event.offsetY);
  if (cardClicked !== null) {
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
      if (cardClicked.cardIndex !== previouslySelectedCard) {
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

  let spaceClicked = whichBoardSpace(event.offsetX, event.offsetY);
  if (spaceClicked !== null && gameState.selectedCard !== -1) {
    let cardOrientationMultiplier = (gameState.activePlayer === 0) ? 1 : -1;

    // Check whether the card can actually be played here.
    let player = players[gameState.activePlayer];
    let card = player.hand[gameState.selectedCard];
    for (const [colOffset, rowOffset] of card.required) {
      // TODO: Is there a good way to emphasize why the card can't be played here?
      // Currently we just fail to play the card, and hope that the player notices
      // the X through a missing requirement and the dotted ring in the spaces they would capture if it were a legal play.
      let col = spaceClicked.col + cardOrientationMultiplier * colOffset;
      if (col < 0 || col >= NUM_COLS) {
        return;
      }
      let row = spaceClicked.row + cardOrientationMultiplier * rowOffset;
      if (row < 0 || row >= NUM_ROWS) {
        return;
      }
      let controller = gameState.board[col][row];
      if (controller !== player.core && controller !== player.control) {
        return;
      }
    }

    // If the card CAN actually be played here, then perform the card's capture effects.
    let opponentCore = players[1 - gameState.activePlayer].core;
    let opponentControl = players[1 - gameState.activePlayer].control;
    for (const [colOffset, rowOffset] of card.capture) {
      let col = spaceClicked.col + cardOrientationMultiplier * colOffset;
      let row = spaceClicked.row + cardOrientationMultiplier * rowOffset;
      if (col >= 0 && col < NUM_COLS && row >= 0 && row < NUM_ROWS) {
        let controller = gameState.board[col][row];
        if (controller === opponentCore) {
          // If we capture an opponent's core space, we don't take control of it
          // (to ensure each player always has SOME spaces they can play from)
          // but we DO score points for it immediately without having to retain the space until our next turn.
          // (Math.abs accounts for the fact that getScoreValue returns a negative value if
          // the space can earn points for the bottom player.)
          player.score += Math.abs(getScoreValue(col, row));
        } else if (controller === opponentControl || controller === UNCONTROLLED) {
          // If we capture a neutral space or the opponent's non-core space,
          // then control of that space changes to us.
          gameState.board[col][row] = player.control;
        }
        // (It's also possible that the control marker is player.control, player.core, or NOT_ON_BOARD,
        // but in the first case there's no need to set the marker to the value it already has,
        // and in the latter two cases we should definitely NOT change the marker.)
      }
    }
    // After changing control of spaces, let's de-control any that aren't connected to their controller's core.
    clearDisconnectedSpaces();

    // Now we need to clean up the game and display state, then switch to the other player's turn.

    // Redraw board to account for changes in control
    drawBoard();

    // Check whether the active player got enough points by hitting core spaces to win the game
    if (checkForWin()) {
      // We want to mark "no selected card" here so that the mouse-move code
      // doesn't think it needs to draw anything on the board.
      // (Normally we need to do that after refreshing the player's hand,
      // but we don't do that when the game ends, in order to let the players see the winning card.)
      gameState.selectedCard = -1;
      return;
    }

    // Discard and get new cards (shifting kept cards to the left), then re-draw the graphics for the player's hand.
    // Note that the game discards both the card that was used AND the leftmost unused card,
    // in order to keep players' hands from getting clogged with weak or irrelevant cards.
    let shiftTo = 0;
    let shiftFrom = (gameState.selectedCard <= 1) ? 2 : 1;
    while (shiftTo < HAND_SIZE) {
      if (shiftFrom === gameState.selectedCard) {
        shiftFrom++;
      }
      if (shiftFrom < HAND_SIZE) {
        player.hand[shiftTo] = player.hand[shiftFrom];
      } else {
        player.hand[shiftTo] = getRandomCard();
      }
      shiftTo++;
      shiftFrom++;
    }
    // Indicate that no card is currently selected (note we need to do this AFTER shifting used cards)
    gameState.selectedCard = -1;
    drawHand(gameState.activePlayer);
    endTurn();

    // As with clicking on cards, if a board space was clicked on,
    // then there's no further need to determine whether something interesting was clicked on
    return;
  }
}

function handleMouseMove(event) {
  // Mouse movement only matters while a card is selected, so we don't need to do all the calculations if no card is selected
  if (gameState.selectedCard === -1) {
    return;
  }

  // Figure out which space the mouse is pointing at.
  // If it's the same as it was before (including if we're currently and previously pointing at no space)
  // then we don't need to bother redrawing anything.
  let newFocusSpace = whichBoardSpace(event.offsetX, event.offsetY);
  let focusCol = -1;
  let focusRow = -1;
  if (newFocusSpace !== null) {
    focusCol = newFocusSpace.col;
    focusRow = newFocusSpace.row;
  }
  if (focusCol === gameState.focusCol && focusRow === gameState.focusRow) {
    return;
  }

  // If the mouse was previously pointing at a space, we'll need to clear the board of the previous effect graphics
  if (gameState.focusCol !== -1) {
    drawBoard();
  }
  // If the mouse is now pointing at a space, we'll need to draw new graphics for the effect of playing the card there
  if (focusCol !== -1) {
    let player = players[gameState.activePlayer];
    let cardOrientationMultiplier = (gameState.activePlayer === 0) ? 1 : -1;
    let card = player.hand[gameState.selectedCard];
    let playable = true;

    for (const [colOffset, rowOffset] of card.required) {
      let col = focusCol + cardOrientationMultiplier * colOffset;
      let row = focusRow + cardOrientationMultiplier * rowOffset;
      // If the active player controls a required space, we'll mark it with a check.
      // Otherwise, we'll mark it with an X.
      if (col < 0 || col >= NUM_COLS || row < 0 || row >= NUM_ROWS || gameState.board[col][row] === NOT_ON_BOARD) {
        // If a required space isn't even on the board, then of course the player can't play the card here
        playable = false;
        // We'll put an X in an area off the nearest corner of the board,
        // so that the player has SOME visual indication of the fact that they can't play the card
        let errorMarkerCol = (col > SPAN) ? NUM_COLS - 1 : 0;
        let errorMarkerRow = gameState.activePlayer * (NUM_ROWS - 1);
        markMissingRequiredSpace(errorMarkerCol, errorMarkerRow, player.fill);
      } else if (gameState.board[col][row] === player.core) {
        drawHex(colCenterX(col), rowCenterY(row), graphics.hexSize, player.coreFill, "✓");
      } else if(gameState.board[col][row] === player.control) {
        drawHex(colCenterX(col), rowCenterY(row), graphics.hexSize, player.fill, "✓");
      } else { // space is on board, but not a core or control space for active player
        // The active player doesn't control this space, so they can't play the card here
        playable = false;
        markMissingRequiredSpace(col, row, player.fill);
      }
    } // end for (required space)

    // If the card is playable here, we'll mark capture spaces with a solid circle.
    // If not, we'll use a dotted circle.
    ctx.strokeStyle = player.fill;
    if (!playable) {
      ctx.setLineDash([6, 4]);
    }
    for (const [colOffset, rowOffset] of card.capture) {
      let col = focusCol + cardOrientationMultiplier * colOffset;
      let row = focusRow + cardOrientationMultiplier * rowOffset;
      // Only mark spaces that are actually on the board, and that aren't already controlled by the active player.
      // (Unlike for required spaces, capture spaces that aren't on the board don't matter at all.)
      if (col >= 0 && col < NUM_COLS && row >= 0 && row < NUM_ROWS
          && gameState.board[col][row] !== NOT_ON_BOARD
          && gameState.board[col][row] !== player.core && gameState.board[col][row] !== player.control) {
        ctx.beginPath();
        ctx.arc(colCenterX(col), rowCenterY(row), graphics.hexSize * 0.65, 0, 2 * Math.PI);
        ctx.stroke();
      }
    } // end for (capture space)
    // Set line dash back to default (so that we don't have to do it everywhere else we draw a line)
    ctx.setLineDash([]);
  }

  gameState.focusCol = focusCol;
  gameState.focusRow = focusRow;
}

// Used when drawing card effects on the board to put an X through a required space that the active player doesn't control
function markMissingRequiredSpace(col, row, playerColor) {
  let centerX = colCenterX(col);
  let centerY = rowCenterY(row);
  let markSpan = graphics.hexSize * 0.5;

  ctx.strokeStyle = playerColor;

  ctx.beginPath();
  ctx.moveTo(centerX + markSpan, centerY + markSpan);
  ctx.lineTo(centerX - markSpan, centerY - markSpan);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(centerX - markSpan, centerY + markSpan);
  ctx.lineTo(centerX + markSpan, centerY - markSpan);
  ctx.stroke();
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

// Determines whether the given coordinates are inside a board space.
// If so, returns an object indicating the space's row and column.
// Otherwise, returns null.
function whichBoardSpace(x, y) {
  // The "half-row" containing the given coordinates,
  // where half-row n contains the upper half of the spaces in row n
  // and the lower half of the spaces in row n-1
  let halfRow = Math.floor((y - graphics.margin) * 2 / (graphics.spacing * SQRT3));
  // The spaces in this half-row will look something like this:
  //  __    __    __    __    __    __    __
  // /  \__/  \__/  \__/  \__/  \__/  \__/  \
  // So we can divide the half-row into equally wide segments which follow a pattern of
  // "divided in half along an upward slope, lower row, lower row, divided along a downward slope, upper row, upper row"
  // (or it might start with a downward slope, depending on whether the index of our half-row is odd or even)
  // We'll call these segments "column fragments".
  let columnFragment = Math.floor((x - graphics.margin) * 2 / graphics.spacing);

  // We'll figure out which column contains the nearest space, but we'll store it in a variable rather than just returning,
  // so that we can determine whether the point is in the space itself rather than in the border between spaces.
  let col;

  // The column fragments which are divided along a diagonal line are the ones which are a multiple of 3.
  // So if the column fragment is NOT a multiple of 3, then the column is just the column fragment divided by 3 rounded down.
  if (columnFragment % 3 !== 0) {
    col = Math.floor(columnFragment / 3);
  } else {
    // If the column fragment is a multiple of 3, then two columns use that column fragment,
    // and that fragment is divided by a diagonal line.
    // Of the two columns using the fragment, the one that's farther right has index equal to one-third of the column fragment.
    let rightwardColumn = columnFragment / 3;
    // In even half-rows (such as the topmost one), the dividing line is from lower-left to upper-right when the rightward column is column SPAN
    // or has the same parity (odd/even), whereas the line is from upper-left to lower-right if the column has opposite parity to SPAN.
    // In odd half-rows, the opposite is true.
    let dividerGoesUpward = (halfRow + SPAN - rightwardColumn) % 2 === 0;
    // Now we'll calculate the x-coordinate of the dividing line at the target y-coordinate,
    // and compare it to our target x-coordinate to determine whether we're in the leftward or rightward column.
    let fragmentLeftX = colCenterX(rightwardColumn) - graphics.spacing;
    let fragmentRightX = fragmentLeftX + graphics.spacing / 2;
    let halfRowTopY = rowCenterY(halfRow - 1);
    let halfRowBottomY = rowCenterY(halfRow);
    let borderAtTop = dividerGoesUpward ? fragmentRightX : fragmentLeftX;
    let borderAtBottom = dividerGoesUpward ? fragmentLeftX : fragmentRightX;
    let borderAtTargetY = borderAtTop + (borderAtBottom - borderAtTop) * (y - halfRowTopY) / (halfRowBottomY - halfRowTopY);
    col = x < borderAtTargetY ? rightwardColumn - 1 : rightwardColumn;
  }

  if (col < 0 || col >= NUM_COLS) {
    return null;
  }

  // We know that the space's row is either the same as the half-row or one less than it.
  // Also, every board space has the same parity for the sum of the row number plus the column number.
  // (For example, if there's a board space at column 3 and row 8, then the sum of the row number plus the column number for that space is 11,
  // so the sum of the row and column for every board space is odd.)
  // We know there's a space at row 0 and column SPAN, so we'll compare parity to that.
  let netOffsetFromTopSpaceIfHalfRow = halfRow + col - SPAN;
  let parityMismatch = netOffsetFromTopSpaceIfHalfRow % 2;
  let row = halfRow - parityMismatch;

  if (row < topRowForColumn(col) || row >= rowLimitForColumn(col)) {
    return null;
  }

  // If we reach this point, then the target coordinates are EITHER in a board space at the given column and row,
  // OR they're in the border around that board space.
  encloseHex(colCenterX(col), rowCenterY(row), graphics.hexSize);
  if (ctx.isPointInPath(x, y)) {
    return {col: col, row: row};
  } else {
    return null;
  }
}

function drawBoard() {
  ctx.clearRect(0, 0, graphics.handLeftBorderX, canvas.height);

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

// Causes the drawing context object to trace the border of a hexagon with the given center and size
function encloseHex(centerX, centerY, sideLength) {
  ctx.beginPath();
  ctx.moveTo(centerX + sideLength, centerY);
  for (let i = 1; i < 6; i++) {
    let angle = i * Math.PI / 3;
    ctx.lineTo(centerX + sideLength * Math.cos(angle), centerY + sideLength * Math.sin(angle));
  }
  ctx.closePath();
}

// Draws a hexagon with the given center, size, fill style, and optional label
function drawHex(centerX, centerY, sideLength, fill, label = null, labelFont = graphics.boardLabelFont, labelFill = graphics.boardLabelFill) {
  encloseHex(centerX, centerY, sideLength);
  ctx.fillStyle = fill;
  ctx.fill();

  if (label !== null) {
    ctx.font = labelFont;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = labelFill;
    ctx.fillText(label, centerX, centerY);
  }
}

// Draws indicators next to the players' hands (and erases any labels that were there previously):
// 1. an indication of whose turn it is
// 2. a score counter for each player
function drawPlayerLabels() {
  ctx.font = graphics.playerLabelFont;
  ctx.textAlign = "left";

  let handRightBorderX = handRightX();

  // Clear previously existing labels
  ctx.clearRect(handRightBorderX, handTopY(0), canvas.width - handRightBorderX, 2 * graphics.cardSpaceHeight + graphics.margin);

  // Mark active player
  ctx.textBaseline = "middle";
  ctx.fillStyle = players[gameState.activePlayer].coreFill;
  let handMidY = handTopY(gameState.activePlayer) + graphics.cardSpaceHeight / 2;
  ctx.fillText("← Your turn", handRightBorderX, handMidY);

  // Add score indicators
  ctx.textBaseline = "bottom";
  ctx.fillStyle = players[0].coreFill;
  let topPlayerUnselectedCardBottom = handTopY(0) + 0.5 * graphics.cardSpaceHeight + 0.5 * graphics.unselectedCardHeight;
  ctx.fillText("Score: " + players[0].score, handRightBorderX, topPlayerUnselectedCardBottom);
  ctx.textBaseline = "top";
  ctx.fillStyle = players[1].coreFill;
  let bottomPlayerUnselectedCardTop = handTopY(1) + 0.5 * (graphics.cardSpaceHeight - graphics.unselectedCardHeight);
  ctx.fillText("Score: " + players[1].score, handRightBorderX, bottomPlayerUnselectedCardTop);
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
// Player number is used to determine the orientation and color of the illustration of the card's effects.
function drawCard(card, playerNum, x, y, isSelected = false) {
  // Clear out anything that might have been in the card slot before
  ctx.clearRect(x, y, graphics.cardSpaceWidth, graphics.cardSpaceHeight);

  // Use a shorter name for this radius to make the code more readable
  let radius = graphics.cardCornerRadius;

  // Since lines are centered on the coordinates used, the card border will leak out of the card space slightly
  // if we set the coordinates to be all the way at the outer edges of the space allocated for the card.
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

  // Fill in card background and draw outer border
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

  // Calculate the size of the space available for the card's effect, and draw that
  let effectWidth = width - 2 * graphics.cardInternalMargin;
  let effectHeight = height - graphics.cardTitleHeight - 2 * graphics.cardInternalMargin;
  drawCardEffect(card, playerNum, leftX + graphics.cardInternalMargin, topY + graphics.cardInternalMargin + graphics.cardTitleHeight, effectWidth, effectHeight);
}

// Creates a visual depiction of the effect of the given card, as played by the given player,
// such that this depiction is entirely contained within the given rectangle.
function drawCardEffect(card, playerNum, leftX, topY, width, height) {
  // First, determine how large we can draw each space in the card's effect,
  // by determining how many times the side length we need in width and height.
  let hexSpaceSideWidthsUsed = (3 * card.dimensions.columnCount + 1) / 2;
  let hexSpaceSideHeightsUsed = (card.dimensions.rowCount + 1) * SQRT3 / 2;
  // The spacing in the effect should be small enough to fit the effect both horizontally and vertically,
  // and shouldn't be larger than the spacing on the board.
  let hexSpaceSide = Math.min(width / hexSpaceSideWidthsUsed, height / hexSpaceSideHeightsUsed, graphics.spacing);
  // We'll make the gap between spaces in this graphic be the same size proportional to the spaces
  // as the gap between spaces on the board
  let hexGraphicSide = hexSpaceSide * graphics.hexSize / graphics.spacing;
  // Font should be large enough that the capture symbol is prominent in the hex, but small enough that it fits.
  // Since the diameter of the hex is larger than its side length, this can be significantly larger than the side length.
  let fontSize = hexGraphicSide * 1.5;
  let font = fontSize + "px " + graphics.cardEffectLabelFontType;

  // Calculate the horizontal distance between consecutive columns and the vertical distance between consecutive rows.
  // Note that if we're drawing the card for the top player, column offsets increase to the right and row offsets increase downward.
  // For the bottom player, the card is rotated 180 degrees, so the opposite is true.
  let cardOrientationMultiplier = playerNum === 0 ? 1 : -1;
  let perColumnDeltaX = cardOrientationMultiplier * hexSpaceSide * 3 / 2;
  let perRowDeltaY = cardOrientationMultiplier * hexSpaceSide * SQRT3 / 2;

  // Identify where the center of the focus space at [0, 0] should be,
  // accounting for which player is playing the card by using perColumnDeltaX and perRowDeltaY.
  // We also want to make sure that the graphic is centered in the space allocated for it.
  let colCenterNum = (card.dimensions.colMin + card.dimensions.colMax) / 2;
  let rowCenterNum = (card.dimensions.rowMin + card.dimensions.rowMax) / 2;
  let centerX = leftX + width / 2;
  let focusCenterX = centerX - perColumnDeltaX * colCenterNum;
  let centerY = topY + height / 2;
  let focusCenterY = centerY - perRowDeltaY * rowCenterNum;

  // We'll draw "capture" spaces before "required" spaces, so that just in case some card has the same space in both lists,
  // the "required" graphic will draw over the "capture" graphic (since the game will treat it as required, making it effectively a non-capture space)
  for (const [col, row] of card.capture) {
    drawHex(focusCenterX + col * perColumnDeltaX, focusCenterY + row * perRowDeltaY, hexGraphicSide, UNCONTROLLED_FILL, "+", font, players[playerNum].fill);
  }
  for (const [col, row] of card.required) {
    drawHex(focusCenterX + col * perColumnDeltaX, focusCenterY + row * perRowDeltaY, hexGraphicSide, players[playerNum].fill);
  }
}

// Creates and returns a random card.
// (This game doesn't use a deck; each card is equally likely to be generated
// regardless of how many of it are already in players' hands or were played recently.)
function getRandomCard() {
  let cardIndex = Math.floor(Math.random() * cards.length);
  return cards[cardIndex];
}

// Does everything that happens between completing one player's action
// and allowing the other player to take action
function endTurn() {
  gameState.activePlayer = 1 - gameState.activePlayer;
  scoreForActivePlayer();
  drawPlayerLabels();
  checkForWin();
}

// Gives the active player points for any spaces they control on their opponent's half of the board.
function scoreForActivePlayer() {
  let player = players[gameState.activePlayer];
  // Multiplier to adjust for the fact that getScore() returns negative values for spaces which earn points for the bottom player.
  let directionMultiplier = (gameState.activePlayer === 0) ? 1 : -1;

  for (let col = 0; col < NUM_COLS; col++) {
    for (let row = 0; row < NUM_ROWS; row++) {
      if (gameState.board[col][row] === player.control) {
        player.score += Math.max(0, getScoreValue(col, row) * directionMultiplier);
      }
    }
  }
}

// Checks whether the active player (or the given player) has enough points to win.
// If so, draws a graphical indicator of this and sets the active player number to -1 to indicate the game is over.
// Returns true if a win was detected, false otherwise.
function checkForWin(playerNum = gameState.activePlayer) {
  if (players[playerNum].score >= POINT_TARGET) {
    // Draw player labels in case the score has changed since they were last drawn.
    drawPlayerLabels();

    ctx.font = graphics.playerLabelFont;
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillStyle = players[playerNum].coreFill;
    let message = (playerNum === 0 ? "Top" : "Bottom") + " player wins! Click to start a new game.";
    // Erase the "point total" message in order to write the victory message
    let x = graphics.handLeftBorderX;
    let y = handTopY(2);
    ctx.clearRect(x, y, canvas.width - x, canvas.height - y);
    ctx.fillText(message, x, y);
    gameState.activePlayer = -1;
    return true;
  } else {
    return false;
  }
}

// Sets all spaces to uncontrolled except those which are contiguously connected to their controller's core spaces
// via spaces which that player controls.
// NOTE: This does not redraw the board, so if you aren't going to make any other changes to the board between doing this
// and allowing player actions, then you should call drawBoard() after this function.
function clearDisconnectedSpaces() {
  // Diagram indicating whether each space is 
  let connectionDiagram = [];
  // Queue will be used for filling in each player's contiguously controlled area in a manner similar to breadth-first search
  let queue = [];

  // Uncontrolled spaces and "not on board" coordinates can be set to the same value in the connection diagram.
  // Core spaces will be marked in the connection diagram with the ordinary control value of their controller for simplicity.
  // Non-core controlled spaces will be initialized to null to indicate that we haven't yet determined whether they're connected to something.
  for (let col = 0; col < NUM_COLS; col++) {
    connectionDiagram[col] = [];
    for (let row = 0; row < NUM_ROWS; row++) {
      let state = gameState.board[col][row];
      if (state === players[0].control || state === players[1].control) {
        connectionDiagram[col][row] = null;
      } else if (state === players[0].core || state === players[1].core) {
        connectionDiagram[col][row] = (state === players[0].core) ? players[0].control : players[1].control;
        // We might as well also note here that this is one of the starting spaces for the breadth-first traversal
        queue.push({col: col, row: row});
      } else {
        connectionDiagram[col][row] = state;
      }
    } // end for(row)
  } // end for(col) loop for connection diagram initialization

  // The change in column and row values between adjacent spaces in each possible direction,
  // in the form [colDelta, rowDelta]
  const directions = [[0, 2], [0, -2], [1, 1], [1, -1], [-1, 1], [-1, -1]];

  while (queue.length !== 0) {
    let coords = queue.shift();
    let marker = connectionDiagram[coords.col][coords.row];
    for (const [colDelta, rowDelta] of directions) {
      let neighborCol = coords.col + colDelta;
      let neighborRow = coords.row + rowDelta;
      // We only need to expand into spaces that are all of the following:
      // 1. on the board
      // 2. not yet known to be connected or disconnected
      // 3. controlled by the same player whose space we're expanding from
      if (neighborCol >= 0 && neighborCol < NUM_COLS && neighborRow >= 0 && neighborRow < NUM_ROWS
          && connectionDiagram[neighborCol][neighborRow] === null
          && gameState.board[neighborCol][neighborRow] === marker) {
        connectionDiagram[neighborCol][neighborRow] = marker;
        queue.push({col: neighborCol, row: neighborRow});
      }
    }
  } // end while (queue not empty)

  // We should now have marked each connected controlled space as such,
  // so we can go through and de-control each space marked with null in the connection diagram.
  for (let col = 0; col < NUM_COLS; col++) {
    for (let row = 0; row < NUM_ROWS; row++) {
      if (connectionDiagram[col][row] === null) {
        gameState.board[col][row] = UNCONTROLLED;
      }
    }
  }
}
