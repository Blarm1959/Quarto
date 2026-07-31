# Quarto

A responsive Progressive Web App implementation of the Quarto board game.

## Current version: 0.0.2

This version establishes the finished-looking application shell:

- Responsive square 4x4 board.
- All 16 Quarto pieces generated from JavaScript data.
- Piece attributes use Tall/Short, Round/Square, Light/Dark and Solid/Hole.
- Player, timer, current-piece, status and available-piece panels.
- Default blue/red piece theme.
- Plain HTML, CSS and JavaScript with no framework or build process.
- Printable board, rules and combined print pack stored in `docs/print`.

Gameplay controls are deliberately not active yet. Selection, placement, turn handling and win detection follow in later versions.

## Run locally

Install once:

```powershell
npm install
```

Start the local server:

```powershell
npm start
```

Open `http://127.0.0.1:8080`.

## Repository structure

- `index.html` - application shell.
- `css/style.css` - responsive visual design.
- `js/board.js` - creates the 4x4 board.
- `js/pieces.js` - piece data and SVG renderer.
- `js/rules.js` - rule constants.
- `js/storage.js` - local settings storage.
- `js/app.js` - application startup coordinator.
- `docs/print` - printable PDFs.
- `tools/generate_printables.py` - recreates the printable PDFs.
