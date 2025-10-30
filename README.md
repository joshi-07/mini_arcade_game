# Mini Game Arcade

A fun, mobile-friendly static web application featuring multiple mini-games with leaderboards and animations.

## Games Included

1. **Reaction Speed** - Test your reflexes by clicking when the box turns green
2. **Memory Matching** - Flip cards to find matching pairs (Easy: 4x4, Hard: 6x6)
3. **Puzzle Slider** - Slide tiles to complete the picture
4. **Trivia Quiz** - Answer questions quickly for points

## Features

- Responsive design that works on mobile and desktop
- Animated UI with smooth transitions
- Confetti effects for celebrations
- Local leaderboards for each game (stored in browser localStorage)
- Welcome modal and game instructions
- Touch-friendly interface
- No backend required - fully static

## Technologies Used

- **Frontend**: HTML, CSS, JavaScript
- **Styling**: Custom CSS with animations
- **Storage**: Browser localStorage for scores
- **Deployment**: Static hosting (GitHub Pages, Netlify, etc.)

## Local Development

1. Simply open `index.html` in your browser

## Deployment

This app can be deployed to any static hosting service:

- **GitHub Pages**: Upload files to a GitHub repository and enable Pages
- **Netlify**: Drag and drop the files or connect a Git repository
- **Vercel**: Connect a Git repository for automatic deployment

## File Structure

```
game/
├── index.html            # Home page
├── game1.html            # Reaction Speed game
├── memory.html           # Memory Matching game
├── puzzle.html           # Puzzle Slider game
├── trivia.html           # Trivia Quiz game
├── leaderboard.html      # Leaderboard page
├── README.md             # This file
├── LICENSE               # License
└── static/               # Static assets
    ├── css/
    │   └── style.css     # Stylesheets
    └── js/
        ├── game1.js      # Reaction Speed logic
        ├── memory.js     # Memory Matching logic
        ├── puzzle.js     # Puzzle Slider logic
        └── trivia.js     # Trivia Quiz logic
```

## Scoring System

- **Reaction Speed**: Points based on reaction time (faster = higher score)
- **Memory Matching**: Points based on attempts and time (fewer attempts + faster time = higher score)
- **Puzzle Slider**: Points based on moves and time (fewer moves + faster time = higher score)
- **Trivia Quiz**: Points for correct answers with time bonuses

## Contributing

Feel free to add more games or improve existing ones!
