# TODO List for Fixing Memory Game Start and Name Entry Bug

## Tasks
- [x] Edit `static/js/memory.js`: Modify `setDifficulty()` to start the game immediately on 4x4/6x6 click if name is entered, add name validation to prevent starting without name.
- [x] Edit `static/js/game1.js`: Add name validation in the box click handler before starting a round.
- [x] Edit `static/js/puzzle.js`: Add name validation in `startGame()` before initializing the game.
- [x] Edit `static/js/trivia.js`: Add name validation in `startGame()` before starting the quiz.
- [x] Test all games to ensure name is required and memory game starts on difficulty selection.
