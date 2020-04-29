// Basic definitions of the cards that exist in the game.
// NOTE: Code outside this file should not use cardDefs, but the "cards" array created at the bottom of this file.
// The "names" value is an array with either one or two values:
//   If it has one value, then that's just the name of the card.
//   If it has two values, then the card has two mirror-image variants, and one will be chosen at random if this card is created:
//     Either the first name with the card as listed,
//     or the second name with all column deltas in the "required" and "capture" lists multiplied by -1.
// For "required" and "capture", see documentation on the "cards" array.
const cardDefs = [
  {
    names: ["Jab"],
    required: [
      [0, 0],
    ],
    capture: [
      [0, 2],
      [0, 4],
      [0, 6],
      [0, 8],
    ],
  },
  {
    names: ["Stab"],
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
  },
  {
    names: ["Thrust"],
    required: [
      [0, 0],
      [1, 1],
      [-1, 1],
    ],
    capture: [
      [0, 2],
      [0, 4],
      [0, 6],
      [0, 8],
      [0, 10],
      [1, 3],
      [-1, 3],
    ],
  },
  {
    names: ["Skewer"],
    required: [
      [0, 0],
      [1, 1],
      [-1, 1],
      [1, -1],
      [-1, -1],
      [0, -2],
      [0, -4],
      [0, -6],
    ],
    capture: [
      [0, 2],
      [0, 4],
      [0, 6],
      [0, 8],
      [0, 10],
      [0, 12],
      [1, 3],
      [2, 4],
      [3, 5],
      [-1, 3],
      [-2, 4],
      [-3, 5],
    ],
  },
  {
    names: ["Lunge"],
    required: [
      [0, 0],
      [0, -4],
      [0, -6],
    ],
    capture: [
      [0, 4],
      [0, 6],
      [0, 8],
      [0, 10],
      [0, 12],
      [0, 14],
    ],
  },
  {
    names: ["Cut L", "Cut R"],
    required: [
      [0, 0],
    ],
    capture: [
      [1, 1],
      [2, 2],
      [3, 3],
      [0, 2],
    ],
  },
  {
    names: ["Slice L", "Slice R"],
    required: [
      [0, 0],
      [-1, -1],
    ],
    capture: [
      [1, 1],
      [2, 2],
      [3, 3],
      [4, 4],
      [5, 5],
    ],
  },
  {
    names: ["Slash L", "Slash R"],
    required: [
      [0, 0],
      [0, -2],
      [0, -4],
    ],
    capture: [
      [1, 1],
      [2, 2],
      [3, 3],
      [4, 4],
      [5, 5],
      [6, 6],
    ],
  },
  {
    names: ["Hack L", "Hack R"],
    required: [
      [0, 0],
      [0, -2],
      [1, -1],
    ],
    capture: [
      [1, 1],
      [2, 2],
      [3, 3],
      [4, 4],
      [2, 0],
      [3, 1],
      [4, 2],
      [5, 3],
      [5, 1],
    ],
  },
  {
    names: ["Chop L", "Chop R"],
    required: [
      [0, 0],
      [0, -2],
      [-1, -1],
    ],
    capture: [
      [0, 2],
      [1, 1],
      [2, 0],
      [3, -1],
      [4, -2],
      [1, -1],
      [2, -2],
      [3, -3],
      [1, -3],
      [2, -4],
    ],
  },
  {
    names: ["Whack L", "Whack R"],
    required: [
      [0, 0],
      [-1, 1],
    ],
    capture: [
      [-1, 3],
      [0, 4],
      [0, 2],
      [1, 3],
      [1, 1],
      [1, -1],
      [2, 2],
      [2, 0],
    ],
  },
  {
    names: ["Bash L", "Bash R"],
    required: [
      [0, 0],
      [1, -1],
      [0, -2],
      [-1, -1],
    ],
    capture: [
      [0, 2],
      [1, 3],
      [1, 1],
      [2, 4],
      [2, 2],
      [2, 0],
      [3, 3],
      [3, 1],
    ],
  },
  {
    names: ["Smash L", "Smash R"],
    required: [
      [0, 0],
      [1, -1],
      [0, -2],
      [-1, -1],
      [2, -2],
      [1, -3],
      [0, -4],
      [-1, -3],
      [-2, -2],
    ],
    capture: [
      [0, 2],
      [1, 3],
      [1, 1],
      [2, 4],
      [2, 2],
      [2, 0],
      [3, 5],
      [3, 3],
      [3, 1],
      [3, -1],
      [4, 4],
      [4, 2],
      [4, 0],
    ],
  },
  {
    names: ["Block"],
    required: [
      [1, 1],
      [-1, 1],
    ],
    capture: [
      [4, 0],
      [4, -2],
      [3, 1],
      [3, -1],
      [2, 0],
      [2, -2],
      [1, -1],
      [0, 0],
      [0, -2],
      [-1, -1],
      [-2, 0],
      [-2, -2],
      [-3, 1],
      [-3, -1],
      [-4, 0],
      [-4, -2],
    ],
  },
  {
    names: ["Parry L", "Parry R"],
    required: [
      [1, 1],
      [-1, -1],
    ],
    capture: [
      [4, 2],
      [4, 0],
      [3, 3],
      [3, 1],
      [2, 2],
      [2, 0],
      [0, 2],
      [0, 0],
      [-1, 1],
    ],
  },
  {
    names: ["Brace"],
    required: [
      [0, 0],
    ],
    capture: [
      [1, -1],
      [-1, -1],
      [2, -2],
      [0, -2],
      [-2, -2],
      [3, -3],
      [1, -3],
      [-1, -3],
      [-3, -3],
      [4, -4],
      [2, -4],
      [0, -4],
      [-2, -4],
      [-4, -4],
      [5, -5],
      [3, -5],
      [1, -5],
      [-1, -5],
      [-3, -5],
      [-5, -5],
      [6, -6],
      [4, -6],
      [-4, -6],
      [-6, -6],
      [7, -7],
      [5, -7],
      [-5, -7],
      [-7, -7],
      [8, -8],
      [-8, -8],
    ],
  },
];

// Calculates some values relating to the size of the effect of the given card.
// Returns an object with the following properties:
//   "columnCount": number of columns needed to display the card (contained within or between the card's "required" or "capture" spaces)
//   "rowCount": number of rows needed in the same sense
//   "colMin": minimum (or most negative) column index
//   "colMax": maximum (or least negative) column index
//   "rowMin", "rowMax": minimum and maximum row indices in the same way
//   "columnOffset": column index of the focus space relative to the leftmost space in the effect
//   "rowOffset": row index of the focus space relative to the topmost space in the effect
//
// For columnOffset and rowOffset, the "focus space" means the space the player clicks on when they play the card.
// This space has coordinates [0, 0] in the card's "required" and "capture" lists (see comments on the "cards" array for more details).
//
// The columnOffset and rowOffset values indicate a zero-based offset for the card as used by the top player.
// The card will be rotated 180 degrees for the bottom player, so if you want to use those values for that player,
// you'll need to use columnCount-1-columnOffset and rowCount-1-rowOffset (or else count from the lower-right instead of the upper-left).
function cardDimensions(card) {
  let spacesUsed = card.capture.concat(card.required);

  let leftEdge = spacesUsed[0][0];
  let rightEdge = leftEdge;
  let forwardEdge = spacesUsed[0][1];
  let rearEdge = forwardEdge;
  for (const [col, row] of spacesUsed){
    if (col > leftEdge) {
      leftEdge = col;
    }
    if (col < rightEdge) {
      rightEdge = col;
    }

    if (row > forwardEdge) {
      forwardEdge = row;
    }
    if (row < rearEdge) {
      rearEdge = row;
    }
  }

  return {
    columnCount: leftEdge - rightEdge + 1,
    rowCount: forwardEdge - rearEdge + 1,
    colMin: rightEdge,
    colMax: leftEdge,
    rowMin: rearEdge,
    rowMax: forwardEdge,
    // This results in an offset of negative zero if the card doesn't use anything behind or to the right of the focus space,
    // which seems a little weird but should be okay (since even strict equality considers -0 equal to +0)
    columnOffset: -rightEdge,
    rowOffset: -rearEdge,
  };
}

// We'll do some pre-processing to make things easier to code and more efficient to run during the game.
// Any code outside this file should use the "cards" array rather than the "cardDefs" array.
// Each card in the "cards" array has the following properties:
//   name: Name of the card
//   required: Spaces which a player must control in order to play the card (see below for details)
//   capture: Spaces which the player gains control of when they play the card (see below for details)
//   dimensions: Size of the card's effect, and relative location of its focus space (see comments on the cardDimensions function for details)
//
// The meaning of "required" and "capture" is:
//   To play a card, a player must choose a focus space such that all of the card's "required" spaces line up with spaces they already control;
//   if they click on that space, they take control of all of the card's "capture" spaces relative to that focus space (except for any which are off the board).
// The numbers in the "required" and "capture" lists work as follows:
//   Each entry is a two-element array where the first element is a column delta and the second element is a row delta.
//   [0, 0] represents the "focus" space.
//   For other values, the deltas are added to the focus space's coordinates for the top player, and subtracted for the bottom player.
//   Thus, [0, 2] represents the next space "forward" from the focus space - downward if the top player is playing the card, upward for the bottom player.
//   (Keep in mind that adjacent spaces in the same column have row values differing by 2, to allow for the in-between spaces in the adjacent columns.)
//   Likewise, [1, 1] represents an adjacent space down-and-to-the-right for the top player, or up-and-to-the-left for the bottom player.
// Note that since the user has to click on the focus space, the "required" array should usually contain [0, 0].
// If it doesn't, then the user won't be able to play the card in a way that results in the focus space being outside the board,
// even if they control all the card's required spaces.
//
// The "cards" array is set up to contain the same number of copies of each base card.
// Since reflectable cards have two variations, non-reflectable cards get added to the array twice
// so that (for example) "Lunge" is as common as "Slice", not as common as "Slice L".
const cards = [];
for (const cardDef of cardDefs) {
  let baseCard = {
    name: cardDef.names[0],
    required: cardDef.required,
    capture: cardDef.capture,
    dimensions: cardDimensions(cardDef),
  };
  cards.push(baseCard);

  if (cardDef.names.length === 1) {
    // Add a second copy of a card with no variants (see item 2 in comment above this function)
    cards.push(baseCard);
  } else {
    // If the card can be reflected, create mirror-reflected "required" and "capture" lists
    let mirroredCard = {
      name: cardDef.names[1],
      required: [],
      capture: [],
    };
    for (const [col, row] of cardDef.required) {
      mirroredCard.required.push([-col, row]);
    }
    for (const [col, row] of cardDef.capture) {
      mirroredCard.capture.push([-col, row]);
    }
    // The card now contains enough data that we can perform the dimensions calculation on it
    mirroredCard.dimensions = cardDimensions(mirroredCard);

    cards.push(mirroredCard);
  }
}
