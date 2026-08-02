# Quarto

A lightweight Progressive Web App implementation of the strategy game Quarto.

## Current version: v0.0.4

The app now includes:

- Responsive black 4x4 board with white squares.
- All 16 pieces generated from data as SVG.
- Animated piece selection and Current Piece preview.
- Central game-state object ready for later placement and turn logic.
- New Game setup with player names.
- Random, alternating or fixed starting player.
- 30, 45, 60 second or unlimited timer setting.
- Customisable light and dark piece colours.
- Preferences saved in local storage.
- A4 printable board, rules and combined print pack under `docs/print`.

## Run locally

```powershell
npm install
npm start
```

Open `http://127.0.0.1:8080`.

## Next milestone

v0.0.5 will add placing the selected piece onto the board.
