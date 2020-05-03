// Creates illustrations on the instructions page,
// and dynamically fills in certain values (such as the target score)
// so that changes to basic parameters will be reflected in the instructions
// without needing to edit the instructions page.
function createInstructions() {
  // Initial illustration of the board
  canvas = document.getElementById("board-illus");
  ctx = canvas.getContext("2d");
  // We'll calculate how much space we need to draw the board
  canvas.width = colCenterX(NUM_COLS - 1) + graphics.spacing + graphics.margin;
  canvas.height = rowCenterY(NUM_ROWS) + graphics.margin;
  initializeBoard();

  // Illustration for what hands and player labels look like
  canvas = document.getElementById("hand-and-label-illus");
  ctx = canvas.getContext("2d");
  // We only want to draw the hand and labels, so we'll temporarily adjust the graphics settings accordingly.
  // (But we'll remember the old settings so we can use them later for illustrating the full game area.)
  let defaultHandLeftBorder = graphics.handLeftBorderX;
  graphics.handLeftBorderX = graphics.margin;
  canvas.width = handRightX() + 250;
  canvas.height = handTopY(2);
  initializeHands();
  gameState.activePlayer = Math.floor(Math.random() * 2);
  players[0].score = Math.floor(Math.random() * POINT_TARGET);
  players[1].score = Math.floor(Math.random() * POINT_TARGET);
  drawPlayerLabels();

  graphics.handLeftBorderX = defaultHandLeftBorder;
  players[0].score = 0;
  players[1].score = 0;

  // Illustration of an example card (always Stab because its effect is relatively easy to describe verbally)
  canvas = document.getElementById("card-illus");
  ctx = canvas.getContext("2d");
  // Make the canvas just big enough to show one selected card plus margin
  canvas.width = 3 * graphics.margin + 2 * graphics.cardSpaceWidth;
  canvas.height = 2 * graphics.margin + graphics.cardSpaceHeight;
  let card = {
    name: "Stab",
    required: [
      [0, 0],
      [0, -2],
    ],
    capture: [
      [0, 2],
      [0, 4],
      [0, 6],
      [0, 8],
      [0, 10],
    ],
  };
  card.dimensions = cardDimensions(card);
  drawCard(card, 0, graphics.margin, graphics.margin, true);
  drawCard(card, 1, 2 * graphics.margin + graphics.cardSpaceWidth, graphics.margin, true);

  // Demo of what happens when you move the mouse around while a card is selected.
  // The "randomize" method is used to both initialize it, and also to re-randomize it to allow players to see different cards.
  randomizeTargetingDemo();

  // Change "a certain target number of points" in the "Winning" section to indicate the actual target
  let targetPara = document.getElementById("point-target");
  targetPara.innerHTML = targetPara.innerHTML.replace("a certain target number of points", POINT_TARGET + " or more points");
}

function randomizeTargetingDemo() {
  canvas = document.getElementById("targeting-demo");
  ctx = canvas.getContext("2d");
  initializeGame();
  gameState.selectedCard = Math.floor(Math.random() * HAND_SIZE);
  let card = players[gameState.activePlayer].hand[gameState.selectedCard]
  drawCard(card, gameState.activePlayer, cardLeftBorderX(gameState.selectedCard), handTopY(gameState.activePlayer), true);
}
