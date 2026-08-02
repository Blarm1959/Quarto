# Quarto Architecture

The app stays framework-free and data-driven.

- `app.js` coordinates startup.
- `board.js` creates the 16 board cells and stores their row, column and index as data attributes.
- `pieces.js` is the single source of truth for all 16 pieces and renders each piece as SVG.
- `rules.js` owns Quarto rule constants and will later contain win detection.
- `storage.js` owns browser storage for settings and preferences.

Piece properties:

- `tall`: tall or short
- `round`: round or square
- `dark`: dark or light
- `hole`: hole or solid
