Piste
=====
A simple two-player game of board control, with a loose "hand-to-hand combat" theme.

To play the game, open [the game page](game.html) in any Javascript-enabled browser. To read about how to play, open [the instructions page](instructions.html).

This game is licensed under the MIT license. In plain language, this basically means you can do whatever you want with it, as long as you credit the author if you copy all or most of the software.

The name is a term which, among other things, refers to an area which is used for fencing matches.

Known Issues
------------
* The game relies on color to communicate a lot of information, most importantly the information regarding who controls what parts of the board. I've chosen colors at the opposite ends of the visible spectrum in the hopes that it will minimize the impact on the most common types of partial color-blindness, but people who can't distinguish red from blue may find the game unplayable unless they edit the code to change the color scheme or add non-color-based control indicators.
* The first player probably has a significant strategic advantage.
* It seems to be hard to stage even a partial comeback once your opponent gains control of too much of the board.
* It's at least theoretically possible to get into a state where the active player isn't able to play any of the cards in their hand because they don't have enough spaces in the right pattern to match the required spaces for any of their cards ... though if this happens, then that player was probably going to lose soon anyway.
