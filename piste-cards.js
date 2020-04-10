// Data regarding the set of cards that exist in the game.
// The "names" value is an array with either one or two values:
//   If it has one value, then that's just the name of the card.
//   If it has two values, then the card has two mirror-image variants, and one will be chosen at random if this card is created:
//     Either the first name with the card as listed,
//     or the second name with all column deltas in the "required" and "capture" lists multiplied by -1.
// The meaning of "required" and "capture" is:
//   To play a card, a player must choose a focus space such that all of the card's "required" spaces line up with spaces they already own;
//   they then take control of all of the card's "capture" spaces relative to that focus space (except for any which are off the board).
// The numbers in the "required" and "capture" lists work as follows:
//   Each entry is a two-element array where the first element is a column delta and the second element is a row delta.
//   [0, 0] represents the "focus" space, where the user hovers or clicks the mouse (and therefore it should usually be in the "required" list).
//   For other values, the deltas are added to the focus space's coordinates for the top player, and subtracted for the bottom player.
//   Thus, [0, 2] represents the next space "forward" from the focus space - downward if the top player is playing the card, upward for the bottom player.
//   (Keep in mind that adjacent spaces in the same column have row values differing by 2, to allow for the in-between spaces in the adjacent columns.)
//   [1, 1] represents an adjacent space down-and-to-the-right for the top player, or up-and-to-the-left for the bottom player.
var cards = [
  {
    names: ["Jab"],
    required: [
      [0, 0],
    ],
    capture: [
      [0, 2],
      [0, 4],
      [0, 6],
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
      [-1, 3],
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
      [1, -1],
    ],
    capture: [
      [0, 2],
      [1, 3],
      [1, 1],
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
    names: ["Crush L", "Crush R"],
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
      [3, -3],
      [2, -4],
      [1, -5],
      [0, -6],
      [-1, -5],
      [-2, -4],
      [-3, -3],
    ],
    capture: [
      [-3, 1],
      [-3, -1],
      [-2, 2],
      [-2, 0],
      [-1, 3],
      [-1, 1],
      [0, 4],
      [0, 2],
      [1, 5],
      [1, 3],
      [1, 1],
      [2, 6],
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
      [4, -2],
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
      [3, 1],
      [2, 0],
      [0, 0],
      [-2, 0],
      [-3, 1],
      [-4, 0],
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
      [0, 0],
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
//   "columnOffset": column index of the card's focus space (which would have coordinates [0, 0] in the "required" and "capture" lists)
//       relative to the leftmost edge of the effect, where the leftmost column used is 0, the rightmost is columnCount-1, etc
//   "rowOffset": row index of the focus space where the topmost row used is 0, the lowest is rowCount-1, etc
// The columnOffset and rowOffset values indicate the offset in the version of the card used by the top player.
// The card will be rotated 180 degrees for the bottom player, so if you want to use those values for that player,
// you'll need to use columnCount-1-columnOffset and rowCount-1-rowOffset (or else count from the lower-right instead of the upper-left).
function cardDimensions(card) {
  let spacesUsed = card.capture.concat(card.required);

  let leftEdge = spacesUsed[0][0];
  let rightEdge = leftEdge;
  let topEdge = spacesUsed[0][1];
  let bottomEdge = topEdge;
  for (const [col, row] of spacesUsed){
    if (col < leftEdge) {
      leftEdge = col;
    }
    if (col > rightEdge) {
      rightEdge = col;
    }

    if (row < topEdge) {
      topEdge = row;
    }
    if (row > bottomEdge) {
      bottomEdge = row;
    }
  }

  return {
    columnCount: rightEdge - leftEdge + 1,
    rowCount: bottomEdge - topEdge + 1,
    // This results in an offset of negative zero if the card doesn't use anything above or to the left of the focus space,
    // which seems a little weird but should be okay (since even strict equality considers -0 equal to +0)
    columnOffset: -leftEdge,
    rowOffset: -topEdge
  };
}
