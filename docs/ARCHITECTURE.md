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

## Configurable rules

`rules.js` owns the fixed Winning Features progression (Colour, Height, Shape, Hollow) and the optional 2×2 square patterns. The UI stores only `winningFeatures` (1–4) and `allow2x2`; both gameplay and AI use the same configured rule engine.


## Internationalisation

Quarto uses BCP 47 language tags and keeps its language resources under `src/i18n`.
`en-GB.json` is the master and default resource. `src/i18n/index.js` detects the saved/browser language, applies translated static text, exposes `t()`-style formatting to application code, and sets the document direction for future RTL languages.
The authoritative language configuration is held in `release.json`.
