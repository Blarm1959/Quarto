# Quarto

A responsive Progressive Web App implementation of the Quarto board game.

## Current version: 0.0.3

This version adds the first interaction to the finished-looking interface:

- Black square board with 16 white squares.
- All 16 Quarto pieces generated from JavaScript data.
- Click any available piece to select it for the opponent.
- The selected piece enlarges in the Current Piece panel.
- Selection can be changed before placement is implemented.
- New Game resets the interface.
- How to Play dialog included.
- Favicon and PWA icons included, removing the browser favicon 404.
- Printable board, rules and combined print pack remain in `docs/print`.

Piece placement, turn changes and win detection follow in later versions.

## Run locally

```powershell
npm install
npm start
```

Open `http://127.0.0.1:8080`.
